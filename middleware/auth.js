const jwt = require('jsonwebtoken');
const { collegePool } = require('../config/dbconfig');
const ErrorHandler = require('./ErrorHandler');
const catchAsyncErrors = require('./CatchAsyncErrors');

 const checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {
    console.log('Cookies:', req.cookies);

    const token = req.cookies.auth_token;

    if (!token) {
        return next(new ErrorHandler('Please login again to access this resource', 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Data:', decodedData); // Debug log for decoded token data

        // Ensure that the token contains teacherCode
        if (!decodedData.teacherCode) {
            return next(new ErrorHandler('Token does not contain teacherCode', 401));
        }

        // Query the user from the MySQL database
        const [user] = await req.collegePool.query('SELECT * FROM teacher WHERE teacher_code = ?', [decodedData.teacherCode]);
        console.log('Database Query Result:', user); // Debug log for database query result

        if (!user || user.length === 0) {
            return next(new ErrorHandler('User not found', 401));
        }

        req.user = user[0]; // Assign the user to req.user
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error); // Debug log for JWT verification error
        return next(new ErrorHandler('Not authorized', 401));
    }
});
module.exports = { checkUserAuthentication };