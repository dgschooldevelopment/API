// const mysql = require('mysql2/promise'); // Assuming you are using mysql2 for database connection
// const { collegesPool } = require('../../config/dbconfig');

// const parentlogin = async (req, res) => {
//     const { parent_id, password, college_code } = req.body;

//     if (!parent_id || !password || !college_code) {
//         return res.status(400).json({ error: 'Parent ID, password, and college code are required parameters' });
//     }

//     try {
//         const parentQuery = `
//             SELECT 
//                 p.parent_id,
//                 p.parentname,
//                 p.password,
//                 p.address,
//                 p.pmobile_no,
//                 p.email,
//                 p.profilephoto,
//                 c.college_code
//             FROM Parents p
//             JOIN College c ON p.college_id = c.collegeID
//             WHERE p.parent_id = ? AND c.college_code = ?
//         `;

//         const [parentDetails] = await collegesPool.query(parentQuery, [parent_id, college_code]);

//         if (parentDetails.length === 0) {
//             return res.status(404).json({ error: 'Parent not found or invalid credentials' });
//         }

//         const parent = parentDetails[0];

//         // Check password
//         if (parent.password !== password) {
//             return res.status(401).json({ error: 'Invalid password' });
//         }

//         let base64ProfilePhoto = null;
//         if (parent.profilephoto) {
//             base64ProfilePhoto = parent.profilephoto.toString('base64').replace(/\n/g, '');
//         }

//         const parentData = { 
//             parent_id: parent.parent_id,
//             parentname: parent.parentname,
//             pmobile_no: parent.pmobile_no,
//             profilephoto: base64ProfilePhoto,
//             address: parent.address
//         };

//         return res.status(200).json({ success: true, message: 'Successfully logged in', data: parentData });
//     } catch (error) {
//         console.error('Error executing query:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// module.exports = {
//     parentlogin
// };
const { collegesPool } = require('../../config/dbconfig');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; // Correctly access JWT_SECRET from environment variables

const parentlogin = async (req, res) => {
    const { parent_id, password, college_code, fcm_token } = req.body;

    if (!parent_id || !password ) {
        return res.status(400).json({ error: 'Parent ID, password, and college code are required parameters' });
    }

    try {
        const parentQuery = `
            SELECT 
                p.parent_id,
                p.parentname,
                p.password,
                p.address,
                p.pmobile_no,
                p.email,
                p.profilephoto,
                c.college_code
            FROM Parents p
            JOIN ${process.env.DB_NAME}.College c ON p.collegeId = c.collegeID
            WHERE p.parent_id = ? AND c.college_code = ?
        `;

        const [parentDetails] = await req.collegePool.query(parentQuery, [parent_id, college_code]);

        if (parentDetails.length === 0) {
            return res.status(404).json({ error: 'Parent not found or invalid credentials' });
        }

        const parent = parentDetails[0];

        // Check password
        if (parent.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update FCM token
        if (fcm_token) {
            await req.collegePool.query('UPDATE Parents SET fcm_token = ? WHERE parent_id = ?', [fcm_token, parent_id]);
        }

        // Generate JWT token
        const token = jwt.sign(
            { parent_id: parent.parent_id, college_code: parent.college_code },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expiration time
        );

        let base64ProfilePhoto = null;
        if (parent.profilephoto) {
            base64ProfilePhoto = parent.profilephoto.toString('base64').replace(/\n/g, '');
        }

        const parentData = { 
            parent_id: parent.parent_id,
            parentname: parent.parentname,
            pmobile_no: parent.pmobile_no,
            profilephoto: base64ProfilePhoto,
            address: parent.address
        };

        // Set JWT token in cookies
        res.cookie('auth_token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'Strict', // Helps prevent CSRF attacks
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: parentData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    parentlogin
};
