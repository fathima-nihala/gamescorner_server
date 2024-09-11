// const jwt = require('jsonwebtoken');
// const User = require('../Model/userModel');
// const ErrorHandler = require('../middlewares/errorHandler');
// const catchAsyncError = require('../middlewares/catchAsyncError');

// exports.authCheck = catchAsyncError(async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies.token) {
//         token = req.cookies.token;
//     }

//     if (!token) {
//         return next(new ErrorHandler('Authentication failed. Please log in.', 401));
//     }

//     try {
//         const decodedToken = jwt.verify(token, process.env.JWT_SEC);
//         const user = await User.findById(decodedToken.id).select('-password');

//         if (!user) {
//             return next(new ErrorHandler('User not found. Please log in again.', 401));
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         if (error.name === 'TokenExpiredError') {
//             return next(new ErrorHandler('Token has expired. Please log in again.', 401));
//         } else {
//             return next(new ErrorHandler('Authentication failed. Please log in again.', 401));
//         }
//     }
// });

const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');
const ErrorHandler = require('../middlewares/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');

exports.authCheck = catchAsyncError(async (req, res, next) => {
    let token;

    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token from Authorization header:', token);
    } else if (req.cookies.token) {
        token = req.cookies.token;
        console.log('Token from cookie:', token);
    }

    if (!token) {
        console.log('No token found');
        return next(new ErrorHandler('Authentication failed. Please log in.', 401));
    }

    try {
        console.log('JWT_SEC:', process.env.JWT_SEC);
        const decodedToken = jwt.verify(token, process.env.JWT_SEC);
        console.log('Decoded token:', decodedToken);

        const user = await User.findById(decodedToken.id).select('-password');
        console.log('User found:', user);

        if (!user) {
            console.log('No user found for token');
            return next(new ErrorHandler('User not found. Please log in again.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler('Token has expired. Please log in again.', 401));
        } else {
            return next(new ErrorHandler('Authentication failed. Please log in again.', 401));
        }
    }
});