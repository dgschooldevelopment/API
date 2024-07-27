const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token:', err);
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }

        req.studentId = decoded.studentId; // Attach studentId to request object
        next();
    });
};

const authenticateTeacher = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token:', err);
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }

        req.teacherCode = decoded.teacherCode; // Attach teacher code to request object
        next();
    });
};

module.exports = { authenticateJWT, authenticateTeacher };
