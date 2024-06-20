const { closeDatabaseConnection } = require('../middleware/database');

const addReason = async (req, res) => {
    const { student_id, date, reason } = req.body;

    if (!student_id || !date || !reason) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    // Extract year and month from the date
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1; // Month is zero-indexed

    // Create a dynamic table name
    const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

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

        // Format the date to match the table column format
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Check the attendance status for the given date
        const checkStatusQuery = `
            SELECT \`${formattedDate}\` AS status
            FROM ${tableName}
            WHERE student_id = ?
        `;

        const [statusRows] = await connection.query(checkStatusQuery, [student_id]);

        if (statusRows.length === 0 || statusRows[0].status === null) {
            return res.status(400).json({ message: 'Data not entered for the selected date' });
        }

        const attendanceStatus = statusRows[0].status;

        if (attendanceStatus === 1) { // Assuming '1' indicates present
            return res.status(400).json({ message: 'Student was present on this date' });
        } else if (attendanceStatus === 0) { // Assuming '0' indicates absent
            // Insert the reason into the addreason table
            await connection.query(
                'INSERT INTO addreason (date, reason, student_id) VALUES (?, ?, ?)',
                [date, reason, student_id]
            );

            res.status(200).json({ success: true, message: 'Reason added successfully' });
        } else if (attendanceStatus === 2) { // Assuming '2' indicates holiday
            // Query the holidays table for the description
            const query = 'SELECT description FROM holidays WHERE date = ?';
            const [holidayRows] = await connection.query(query, [date]);

            const holidayDescription = holidayRows.length > 0 ? holidayRows[0].description : 'No description available';
            return res.status(400).json({ error: `Holiday: ${holidayDescription}` });
        } else {
            return res.status(400).json({ error: 'Invalid attendance status' });
        }

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
