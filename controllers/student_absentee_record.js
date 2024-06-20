/*const studentAttendance = (req, res) => {
    const { studentId } = req.query;

    // Query to fetch student attendance details by student_id
    const query = `
        SELECT *
        FROM MGVP.attendance_2024_1
        WHERE student_id = ?
    `;

    req.collegePool.query(query, [studentId], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'An internal server error occurred' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Assuming student_id is unique, otherwise, you might need to handle multiple records
        const studentDetails = results[0]; 
        res.json({ studentDetails });
    });
};

module.exports = {
    studentAttendance
};
*/
const studentAttendance = async (req, res) => {
    try {
        const { studentId } = req.query;

        // Query to fetch student attendance details by student_id
        const query = `
            SELECT *
            FROM  attendance_2024_1
            WHERE student_id = ? ;
        `;

        const [results] = await req.collegePool.query(query, [studentId]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Assuming student_id is unique, otherwise, you might need to handle multiple records
        const studentDetails = results[0];
        res.json({ studentDetails });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {
    studentAttendance
};
