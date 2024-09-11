const router = require('express').Router();
const { register, login, logout, forgotPassword, verifyOtp, resetPassword } = require('../Controller/authController');
router.route('/reg').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/password_forgot').post(forgotPassword);
router.route('/verify_otp').post(verifyOtp);
router.route('/password_reset').post(resetPassword);



module.exports = router;