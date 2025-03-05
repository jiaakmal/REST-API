
const {signUp,login} = require('../controllers/authController.js');

const router = require('express').Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
module.exports = router; 