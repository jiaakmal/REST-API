require('dotenv').config();
const user = require('../db/models/user.js');
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}
const signUp = async (req, res, next) => {
    try {
        const body = req.body;
        if (!['1', '2'].includes(body.userType)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user type'
            });
        }
        const newUser = await user.create({
            userType: body.userType,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            confirmPassword: body.confirmPassword,
        });
        const result = newUser.toJSON();       
        delete result.password;
        delete result.deletedAt;
        result.token = generateToken({
            id: result.id,
        }); 
        if(!result){
            return res.status(400).json({
                status: 'error',
                message: 'Failed to create user'
            });
        }
        return res.status(201).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            status: 'fail',
            message: 'must provide email or password'
        });
    }
    try {
        const result = await user.findOne({ where: { email } });
        if (!result || !bcrypt.compareSync(password, result.password)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }
        const token = generateToken({
            id: result.id
        });
        return res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}
const authentication = catchAsync(async (req, res, next) => {
    // 1. get the token from headers
    let idToken = '';
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Bearer asfdasdfhjasdflkkasdf
        idToken = req.headers.authorization.split(' ')[1];
    }
    if (!idToken) {
        return next(new AppError('Please login to get access', 401));
    }
    // 2. token verification
    const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET);
    // 3. get the user detail from db and add to req object
    const freshUser = await user.findByPk(tokenDetail.id);

    if (!freshUser) {
        return next(new AppError('User no longer exists', 400));
    }
    req.user = freshUser;
    return next();
});
const restrictTo = (...userType) => {
    const checkPermission = (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
            return next(
                new AppError(
                    "You don't have permission to perform this action",
                    403
                )
            );
        }
        return next();
    };

    return checkPermission;
};

module.exports = { signUp, login, authentication, restrictTo };
