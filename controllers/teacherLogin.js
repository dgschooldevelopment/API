// const teacherLogin= async (req, res) => {
//     const { teacher_code, tpassword } = req.body;

//     if (!teacher_code || !tpassword) {
//         return res.status(400).json({ error: 'teacherID and password are required parameters' });
//     }

//     try {

//         const teacherQuery=`SELECT 
//         teacher_code, tname, tpassword, mobileno, teacher_email, teacher_profile, date_of_birth, teacher_education, ct.standard, ct.division, t.college_code 
//     FROM 
//         teacher t
//         JOIN 
//         ${process.env.DB_NAME}.College c ON t.college_code= c.college_code
//         LEFT JOIN
//         classteachers ct ON t.teacher_code= ct.teacher_id
//     WHERE 
//         t.teacher_code =?
// ` 
//     ;
    

//     const subjectList = `
//     SELECT s.subject_name
//     FROM ${process.env.DB_NAME}.Subject s
//     JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
//     WHERE st.teacher_code = ?
// `;
//         const [teacherDetails] = await req.collegePool.query(teacherQuery,[teacher_code]);
//         const [subjects] = await req.collegePool.query(subjectList, [teacher_code]);

//         if (teacherDetails.length === 0) {
//             return res.status(404).json({ error: 'Teacher not found' });
//         }

//         const teacher = teacherDetails[0];

//         if (teacher.tpassword !== tpassword) {
//             return res.status(401).json({ error: 'Invalid password' });
//         }

//         let base64ProfileImg = null;
//         if (teacher.teacher_profile) {
//             base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
//         }
     
//         const teacherData = { 
//             ...teacher, 
//             teacher_profile: base64ProfileImg,
//             subjects: subjects.map(subject => subject.subject_name) 
//         };


//         return res.status(200).json({ success: true, message: 'Successfully logged in', data: teacherData});
//     } catch (error) {
//         console.error('Error executing query:', error);

//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// module.exports = {
//     teacherLogin
// };

const jwt = require('jsonwebtoken');
require('dotenv').config();

const teacherLogin = async (req, res) => {
    const { teacher_code, tpassword, fcm_token } = req.body;

    if (!teacher_code || !tpassword) {
        return res.status(400).json({ error: 'Teacher code and password are required parameters' });
    }

    try {
        const teacherQuery = `
            SELECT 
                teacher_code, tname, tpassword, mobileno, teacher_email, teacher_profile, date_of_birth, teacher_education, ct.standard, ct.division, t.college_code 
            FROM 
                teacher t
                JOIN 
                ${process.env.DB_NAME}.College c ON t.college_code = c.college_code
                LEFT JOIN
                classteachers ct ON t.teacher_code = ct.teacher_id
            WHERE 
                t.teacher_code = ?
        `;

        const subjectList = `
            SELECT s.subject_name
            FROM ${process.env.DB_NAME}.Subject s
            JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
            WHERE st.teacher_code = ?
        `;

        const [teacherDetails] = await req.collegePool.query(teacherQuery, [teacher_code]);
        const [subjects] = await req.collegePool.query(subjectList, [teacher_code]);

        if (teacherDetails.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacher = teacherDetails[0];

        if (teacher.tpassword !== tpassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (fcm_token) {
            await req.collegePool.query('UPDATE teacher SET fcm_token = ? WHERE teacher_code = ?', [fcm_token, teacher_code]);
        }

        let base64ProfileImg = null;
        if (teacher.teacher_profile) {
            base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
        }

        const teacherData = { 
            ...teacher, 
            teacher_profile: base64ProfileImg,
            subjects: subjects.map(subject => subject.subject_name) 
        };

        // Generate JWT token
        const token = jwt.sign({ teacherCode: teacher.teacher_code }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set JWT token in cookies
        res.cookie('auth_token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'Strict', // Helps prevent CSRF attacks
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: teacherData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    teacherLogin
};
