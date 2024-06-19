const { collegesPool } = require('../config/dbconfig');
const { closeDatabaseConnection } = require('../middleware/database');

const approvalstatus = async (req, res) => {
    const { submitted_id, status, review } = req.body;

    if (!submitted_id || !status || !review) {
        return res.status(400).json({ error: 'submitted_id, review, and status are required parameters' });
    }

    // Determine approval status value
    let approvalStatus;
    if (status === 'accept') {
        approvalStatus = 1;
    } else if (status === 'reject') {
        approvalStatus = -1;
    } else {
        return res.status(400).json({ error: 'Invalid status value. Use "accept" or "reject"' });
    }

    // SQL query to update the approval status
    const sqlUpdate = `
        UPDATE homework_submitted
        SET approval_status = ?, review = ?
        WHERE homeworksubmitted_id = ?
    `;

    try {
        const [result] = await req.collegePool.query(sqlUpdate, [approvalStatus, review, submitted_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No record found with the provided submitted_id' });
        }

        return res.status(200).json({ success: true, message: 'Approval status updated successfully' });
    } catch (error) {
        console.error('Error updating approval status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { approvalstatus };
