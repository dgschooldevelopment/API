const { collegePool } = require('../../config/dbconfig'); // Ensure the path is correct

const TeacherListChat = async (req, res) => {
    const { student_id } = req.query;

    // Validate that student_id is provided
    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const teacherSql = `
            SELECT 
                t.teacher_code, 
                t.Name,  t.profile_img 
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

        // Convert profile_img to base64
        teachers.forEach(teacher => {
            if (teacher.profile_img) {
                teacher.profile_img = teacher.profile_img.toString('base64').replace(/\n/g, '');
            }
        });

        return res.status(200).json({ success: true, data: teachers });
    } catch (error) {
        console.error('Error fetching teachers for student:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    TeacherListChat
};
