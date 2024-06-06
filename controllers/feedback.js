const { closeDatabaseConnection } = require('../middleware/database');

const feedback = async (req, res, next) => {
    const { teacher_name, your_name, subject, explanation } = req.body;

    if (!teacher_name || !your_name || !subject || !explanation) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const sql = 'INSERT INTO Feedback (teacher_name, your_name, subject, explanation) VALUES (?, ?, ?, ?)';
        const values = [teacher_name, your_name, subject, explanation];

        // Execute the insert query
        await req.collegePool.query(sql, values);

        console.log('Feedback inserted successfully');
        res.status(200).json({ success: true, message: 'Feedback added successfully' });
    } catch (err) {
        console.error('Error inserting feedback:', err);
        res.status(500).json({ success: false, error: 'Failed to insert feedback' });
    } finally {
        closeDatabaseConnection(req, res, next);
    }
};

module.exports = { feedback };
