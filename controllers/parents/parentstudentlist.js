const parentstudentlist = async (req, res) => {
    const { parent_id } = req.query;

    if (!parent_id) {
        return res.status(400).json({ error: 'Parent ID is a required parameter' });
    }

    try {
        const studentQuery = `
            SELECT 
                studentid,
                roll_no,
                std,
                Name,
                email,
                division
            FROM Student
            WHERE parent_id = ?`;

        const [students] = await req.collegePool.query(studentQuery, [parent_id]);

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for the given parent ID' });
        }

        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { parentstudentlist };