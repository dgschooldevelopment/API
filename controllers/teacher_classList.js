const teacher_classList = async (req, res) => {
    const { teacher_code } = req.query;
    try {
        const classListQuery = `
            SELECT stand, division, subject_name,  s.subject_code_prefixed
            FROM ${process.env.DB_NAME}.Subject s
            JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
            WHERE st.teacher_code =?
        `;
        const [classList] = await req.collegePool.query(classListQuery, [teacher_code]);

        return res.status(200).json({ classList });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    teacher_classList
};
