const { closeDatabaseConnection } = require('../middleware/database');

const addReason = async (req, res) => {
    const { student_id, date, reason } = req.body;

    if (!student_id || !date || !reason) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    // Get a connection from the pool
    const connection = await req.collegePool.getConnection();

    try {
        // Check if a reason already exists for the given date and student
        const [existingReason] = await connection.query(
            'SELECT * FROM addreason WHERE student_id = ? AND date = ?',
            [student_id, date]
        );

        if (existingReason.length > 0) {
            return res.status(400).json({ error: 'Reason already exists for this date and student' });
        }

        // Check if the student was absent on the given date
        const [attendanceRecord] = await connection.query(
            'SELECT ??, id FROM attendance_2024_3 WHERE student_id = ?',
            [date, student_id]
        );

        if (attendanceRecord.length === 0 || attendanceRecord[0][date] !== 'absent') {
            return res.status(400).json({ error: 'Student was not absent on the given date' });
        }

        // Insert the reason into the addreason table
        await connection.query(
            'INSERT INTO addreason (date, reason, attendance_id, student_id) VALUES (?, ?, ?, ?)',
            [date, reason, attendanceRecord[0].id, student_id]
        );

        res.status(200).json({ success: true, message: 'Reason added successfully' });

    } catch (error) {
        console.error('Failed to add reason:', error);
        res.status(500).json({ error: 'Failed to add reason' });

    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
        // Close the database connection
        closeDatabaseConnection(req, res, () => {});
    }
};

module.exports = { addReason };
