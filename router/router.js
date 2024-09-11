const router = require('express').Router();

const { register, login, logout, forgotPassword, verifyOtp, resetPassword, Profile, editProfile } = require('../Controller/authController');
const { authCheck } = require('../middlewares/authCheck');
const { upload } = require('../middlewares/multer');


router.route('/reg').post(upload.none(), register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/password_forgot').post(forgotPassword);
router.route('/verify_otp').post(verifyOtp);
router.route('/password_reset').post(resetPassword);
router.route('/profile').get(authCheck, Profile);
router.route('/profile/update').put(authCheck, upload.any([{name:'profile',maxCount: 1},{name:'bg_image', maxCount: 1}]), editProfile);


module.exports = router;