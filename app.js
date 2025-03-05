const express = require("express");
const app = express();
const appError = require('./utils/appError.js');
require('dotenv').config();
const catchAsync = require('./utils/catchAsync.js');
const authRoute = require('./routes/authRoute.js');
const projectRoute = require('./routes/projectRoute.js');
const globalErrorHandler = require('./controllers/errorController.js');

app.use(express.json());
app.use('/auth', authRoute);
app.use('/projects', projectRoute);
app.use('*',
    catchAsync(async (req, res,next) => {
     throw new appError('Page not found','404');

    }))

app.use(globalErrorHandler);
app.listen(process.env.PORT, () => console.log("Server started at port " + process.env.PORT));
