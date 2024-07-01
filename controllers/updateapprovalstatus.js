
/*const { collegesPool } = require('../config/dbconfig');

const { closeDatabaseConnection } = require('../middleware/database');

const approvalstatus = async (req, res) => {
    const { submitted_id } = req.query;
    const { status, review } = req.body;

    // Validate input data
    if (!submitted_id || !status || !review) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await req.collegePool.getConnection();

        // Construct the SQL query
        const query = `
            UPDATE homework_submitted
            SET approval_status = ?, review = ?
            WHERE homeworksubmitted_id = ?
        `;

        // Execute the query with parameters
        const [result] = await connection.query(query, [status === 'accept' ? 1 : 0, review, submitted_id]);

        // Check if the row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No record found to update' });
        }

        res.status(200).json({ success: true, message: 'Approval status updated successfully' });

    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({ error: 'Failed to update approval status' });

    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
        // Close the database connection
        closeDatabaseConnection(req, res, () => {});
    }
};

module.exports = { approvalstatus };*/
const { closeDatabaseConnection } = require('../middleware/database');

const approvalstatus = async (req, res) => {
    const { submitted_id } = req.query;
    const { status, review } = req.body;

    // Validate input data
    if (!submitted_id || !status || !review) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await req.collegePool.getConnection();

        // Construct the SQL query
        const query = `
            UPDATE homework_submitted
            SET approval_status = ?, review = ?
            WHERE homeworksubmitted_id = ?
        `;

        // Execute the query with parameters
        const [result] = await connection.query(query, [status === 'accept' ? 1 : 0, review, submitted_id]);

        // Check if the row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No record found to update' });
        }

        res.status(200).json({ success: true, message: 'Approval status updated successfully' });

    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({ error: 'Failed to update approval status' });

    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
        // Close the database connection
        closeDatabaseConnection(req, res, () => {});
    }
};

module.exports = { approvalstatus };

