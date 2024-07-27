const { collegePool } = require('../../config/dbconfig'); // Ensure the path is correct
const jwt = require('jsonwebtoken'); // Make sure to install and import jsonwebtoken

const TeacherListChat = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    // Validate that token is provided
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student_id = decoded.studentId;

        // Validate that student_id is decoded correctly
        if (!student_id) {
            return res.status(400).json({ error: 'Invalid token or student ID not found' });
        }

        // SQL query to fetch teachers
        const teacherSql = `
            SELECT 
                t.teacher_code,
                t.teacher_profile AS profile_img, // Ensure this matches your schema
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

        // Query the database
        const [teachers] = await collegePool.query(teacherSql, [student_id]);

        // Return the teacher list
        return res.status(200).json({ success: true, data: teachers });
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
