const { collegePool } = require('../../config/dbconfig');
const jwt = require('jsonwebtoken');

const TeacherListChat = async (req, res) => {
    try {
        const student_id = req.studentId; // Ensure this matches the key set in the middleware

        if (!student_id) {
            return res.status(400).json({ error: 'Invalid token or student ID not found' });
        }

        const teacherSql = `
            SELECT 
                t.teacher_code,
                t.teacher_profile AS profile_img,
                t.tname
            FROM 
                teacher t
            JOIN 
                classteachers ct ON t.teacher_code = ct.teacher_id
            JOIN 
                Student s ON ct.standard = s.std AND ct.division = s.division
            WHERE 
                s.studentid = ?;
        `;

        const [teachers] = await req.collegePool.query(teacherSql, [student_id]);

        // Convert profile images to base64 if present
        const teachersWithBase64Images = teachers.map(teacher => {
            if (teacher.profile_img) {
                teacher.profile_img = teacher.profile_img.toString('base64').replace(/\n/g, '');
            }
            return teacher;
        });

        return res.status(200).json({ success: true, data: teachersWithBase64Images });
    } catch (error) {
        console.error('Error fetching teachers for student:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    TeacherListChat
};
