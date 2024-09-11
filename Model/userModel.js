const  mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,'Please enter email'],
        unique:true,
        validate:[validator.isEmail,'Please enter a valid email address']
    },
    password:{
        type:String,
        required:[true,'please enter password'],
        select:false,
        minlength:[6,'Password must be atleast 6 character']
    },
    passwordChangedAt:Date,
    resetPasswordOTP:String,
    resetPasswordOTPExpires:Date
})

userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema .methods.getJWTtoken = function() {
    return JWT.sign({ id: this._id }, process.env.JWT_SEC, {
        expiresIn: process.env.JWT_EXPIRES
    });
};


userSchema.methods.generateOtp = function() {
    const otp = Math.floor(0x100000 + Math.random() * 0xEFFFFF).toString(16).toUpperCase();
    return otp;
};

userSchema.methods.isValidPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema)