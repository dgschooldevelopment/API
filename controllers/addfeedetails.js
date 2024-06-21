
const { closeDatabaseConnection } = require('../middleware/database');
const addfeedetails = async (req, res) => {
    const { studentid, class_id, fees_mode, current_due, current_due_date } = req.body;

    // Validate input data
    if (!studentid || !class_id || !fees_mode || current_due === undefined || !current_due_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Additional validation for non-whitespace input and data types
    if (typeof studentid !== 'string' || studentid.trim() === '' ||
        typeof class_id !== 'number' || typeof fees_mode !== 'string' || fees_mode.trim() === '' ||
        typeof current_due !== 'number' || typeof current_due_date !== 'string' || current_due_date.trim() === '') {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await req.collegePool.getConnection();

        // Insert data into student_fees_details
        const [result] = await connection.query(
            'INSERT INTO student_fees_details (studentid, class_id, fees_mode, current_due, current_due_date) VALUES (?, ?, ?, ?, ?)',
            [studentid, class_id, fees_mode, current_due, current_due_date]
        );

        res.status(200).json({ success: true, message: 'Data inserted successfully', insertId: result.insertId });

    } catch (error) {
        console.error('Failed to insert data:', error);
        res.status(500).json({ error: 'Failed to insert data' });

    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
        // Close the database connection
        closeDatabaseConnection(req, res, () => {});
    }
};

module.exports = { addfeedetails };