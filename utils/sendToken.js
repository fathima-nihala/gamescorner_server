// const sendToken = (user, statusCode, res) => {
//     const token = user.getJWTtoken();

//     const options = {
//         expires: new Date(
//             Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true,
//     };

//     res.status(statusCode).cookie('token', token, options).json({
//         success: true,
//         token,
//         user
//     });
// };

// module.exports = sendToken;


const sendToken = (user, statusCode, res) => {
    const token = user.getJWTtoken();

    // Set expiration to 30 days
    const expiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    const options = {
        expires: new Date(Date.now() + expiresIn),
        httpOnly: true,
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};

module.exports = sendToken;