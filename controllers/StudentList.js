// const { collegePool } = require('../config/dbconfig');

// const StudentList = async (req, res) => {
//     const { teacher_code } = req.query;

//     try {
//         const studentSql = `
//             SELECT 
//                 s.studentid, 
//                 s.Name, 
//                 s.std, 
//                 s.roll_no, 
//                 s.division, 
//                 s.profile_img 
//             FROM 
//                 Student s
//             JOIN 
//                 classteachers ct ON s.std = ct.standard AND s.division = ct.division
//             JOIN 
//                 teacher t ON ct.teacher_id = t.teacher_code
//             WHERE 
//                 t.teacher_code = ?;
//         `;

//         const [students] = await req.collegePool.query(studentSql, [teacher_code]);

//         students.forEach(student => {
//             if (student.profile_img) {
//                 student.profile_img = student.profile_img.toString('base64').replace(/\n/g, '');
//             }
//         });

//         return res.status(200).json({ success: true, data: students });
//     } catch (error) {
//         console.error('Error fetching students for teacher:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// module.exports = {
//     StudentList
// };

const { collegePool } = require('../config/dbconfig'); // Ensure the path is correct

const StudentListchat = async (req, res) => {
    const { teacher_code } = req.query;

    // Validate that teacher_code is provided
    if (!teacher_code) {
        return res.status(400).json({ error: 'Teacher code is required' });
    }

    try {
        const studentSql = `
            SELECT 
                s.studentid, 
                s.Name, 
                s.std, 
                s.roll_no, 
                s.division, 
                s.profile_img 
            FROM 
                Student s
            JOIN 
                classteachers ct ON s.std = ct.standard AND s.division = ct.division
            JOIN 
                teacher t ON ct.teacher_id = t.teacher_code
            WHERE 
                t.teacher_code = ?;
        `;

        const [students] = await req.collegePool.query(studentSql, [teacher_code]);

        // Convert profile_img to base64
        students.forEach(student => {
            if (student.profile_img) {
                student.profile_img = student.profile_img.toString('base64').replace(/\n/g, '');
            }
        });

        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students for teacher:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    StudentListchat
};
