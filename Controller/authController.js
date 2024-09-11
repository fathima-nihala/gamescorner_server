const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../middlewares/errorHandler");
const User = require('../Model/userModel');
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/email");
const crypto = require('crypto')


exports.register = catchAsyncError(async (req, res, next) => {
    const { email, password, profession, about_me, name, phone } = req.body;

    let profile, bg_image;
    if (req.file) {
        const filename = req.file.filename;
        profile = `${process.env.BACKEND_URL}/upload/${filename}`;
        bg_image = `${process.env.BACKEND_URL}/upload/${filename}`;
    }

    if (!email || !password || !name) {
        return next(new ErrorHandler('Please enter name, email and password', 400));
    }

    try {
        const user = await User.create({
            name,
            email,
            password,
            phone,
            profile,
            bg_image,
            profession,
            about_me
        });

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Registered Successfully!",
            user: {
                _id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(messages.join(', '), 400));
        }
        next(error);
    }
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }


    sendToken(user, 200, res);  
});



exports.logout = catchAsyncError(async (req, res, next) => {
   
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    .status(200)
    .json({
        success: true,
        message: "Logged out successfully!"
    });

});


exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler('Email is required', 400));
    }

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpires'); 

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const otp = user.generateOtp();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordOTPExpires = otpExpiry;

    user.save({ validateBeforeSave: false }).catch(err => {
        console.error('Error saving user document:', err);
        next(new ErrorHandler('Error saving user data', 500));
    });

    const message = `${otp}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            message
        });

        res.status(200).json({
            success: true,
            message: `OTP sent to ${user.email}`,
            email: user.email
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;

        user.save({ validateBeforeSave: false }).catch(err => {
            console.error('Error reverting OTP changes:', err);
        });

        return next(new ErrorHandler(`Error sending email: ${error.message}`, 500));
    }
});


exports.verifyOtp = catchAsyncError(async (req, res, next) => {
    const { email, resetPasswordOTP } = req.body;

    if (!email || !resetPasswordOTP) {
        return next(new ErrorHandler('Email and OTP are required', 400));
    }

    if (typeof resetPasswordOTP !== 'string') {
        return next(new ErrorHandler('OTP must be a string', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    console.log('Received OTP:', resetPasswordOTP);
    console.log('Stored OTP:', user.resetPasswordOTP);

    const hashedOtp = crypto.createHash('sha256').update(resetPasswordOTP).digest('hex');

    console.log('Hashed OTP:', hashedOtp);

    if (hashedOtp !== user.resetPasswordOTP || Date.now() > user.resetPasswordOTPExpires) {
        return next(new ErrorHandler('Invalid or expired OTP', 400));
    }

    res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
    });
});


exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const { email, resetPasswordOTP, password, confirmPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const hashedOtp = crypto.createHash('sha256').update(resetPasswordOTP).digest('hex');

    if (hashedOtp !== user.resetPasswordOTP || Date.now() > user.resetPasswordOTPExpires) {
        return next(new ErrorHandler('Invalid or expired OTP', 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.passwordChangedAt=Date.now();

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password Changed Successfully'
    });
});

//profile
exports.Profile = catchAsyncError(async(req, res, next)=>{
    try {
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return next(new ErrorHandler('User not found', 404));
        }
        res.status(200).json({ statusCode: 200, success: true, message: "admin Details", admin });
    } catch (error) {
        res.status(error)
    }
})


//edit profile
exports.editProfile = catchAsyncError(async (req, res, next) => {
    try {
        let newUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            profession: req.body.profession,
            about_me: req.body.about_me
        };

        if (req.files && req.files.profile) {
            const profile = `${process.env.BACKEND_URL}/upload/user/${req.files.profile[0].filename}`;
            newUserData = { ...newUserData, profile };
        }

        if (req.files && req.files.bg_image) {
            const bg_image = `${process.env.BACKEND_URL}/upload/user/${req.files.bg_image[0].filename}`;
            newUserData = { ...newUserData, bg_image };
        }

        const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
});
