const { closeDatabaseConnection } = require('../middleware/database');

const submitHomework = async (req, res) => {
    const { homeworkpending_id, subject_id, student_id, description, images } = req.body;

    if (!homeworkpending_id || !subject_id || !student_id || !description || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    // Get a connection from the pool
    const connection = await req.collegePool.getConnection();

    try {
        // Begin a database transaction
        await connection.beginTransaction();

        // Insert homework details into the database
        const [submissionResult] = await connection.query(
            'INSERT INTO homework_submitted (homeworkpending_id, subject_id, student_id, description) VALUES (?, ?, ?, ?)',
            [homeworkpending_id, subject_id, student_id, description]
        );

        // Fetch the last inserted ID from the database
        const submissionId = submissionResult.insertId;

        // Prepare values for batch insert
        const imageValues = images.map(imageData => [imageData, submissionId]);

        // Insert all images in a single query
        await connection.query(
            'INSERT INTO image_submit (image, homeworksubmitted_id) VALUES ?',
            [imageValues]
        );

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ success: true, message: 'Homework submitted successfully' });

    } catch (error) {
        // Rollback the transaction if an error occurs
        if (connection) await connection.rollback();

        console.error('Failed to submit homework:', error);
        res.status(500).json({ error: 'Failed to submit homework' });

    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
        // Close the database connection
        closeDatabaseConnection(req, res, () => {});
    }
};

module.exports = { submitHomework };
