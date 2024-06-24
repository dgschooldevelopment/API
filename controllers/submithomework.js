

/*const { closeDatabaseConnection } = require('../middleware/database');

const submitHomework = async (req, res) => {
    const { homeworkpending_id, subject_id, student_id, description, images } = req.body;
  // Validate input data
  if (!homeworkpending_id || !subject_id || !student_id || !description || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'All fields are required and images must be an array with at least one image' });
}

// Ensure fields are not just whitespace
if (typeof description !== 'string' || description.trim() === '' || typeof student_id !== 'string' || student_id.trim() === '') {
    return res.status(400).json({ error: 'Description and student ID cannot be empty or just whitespace' });
}
if (images.some(image => typeof image !== 'string' || image.trim() === '')) {
    return res.status(400).json({ error: 'Each image must be a non-empty string' });
}
    // Get a connection from the pool
    const connection = await req.collegePool.getConnection();

    try {
        // Check if homework already submitted
        const [existingSubmissions] = await connection.query(
            'SELECT homeworkpending_id FROM homework_submitted WHERE homeworkpending_id = ? AND student_id = ?',
            [homeworkpending_id, student_id]
        );

        if (existingSubmissions.length > 0) {
            return res.status(400).json({ error: 'Homework already submitted' });
        }

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
*/


const { closeDatabaseConnection } = require('../middleware/database');

const submitHomework = async (req, res) => {
    const { homeworkpending_id, subject_id, student_id, description, images } = req.body;

    // Validate input data
    if (!homeworkpending_id || !subject_id || !student_id || !description || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'All fields are required and images must be an array with at least one image' });
    }

    // Ensure fields are not just whitespace
    if (typeof description !== 'string' || description.trim() === '' || typeof student_id !== 'string' || student_id.trim() === '') {
        return res.status(400).json({ error: 'Description and student ID cannot be empty or just whitespace' });
    }
    if (images.some(image => typeof image !== 'string' || image.trim() === '')) {
        return res.status(400).json({ error: 'Each image must be a non-empty string' });
    }

    // Get a connection from the pool
    const connection = await req.collegePool.getConnection();

    try {
        // Begin a database transaction
        await connection.beginTransaction();

        // Check if homework already submitted with approval_status 0
        const [existingSubmissions] = await connection.query(
            'SELECT submitted_id FROM homework_submitted WHERE homeworkpending_id = ? AND student_id = ? AND approval_status = 0',
            [homeworkpending_id, student_id]
        );

        let submissionId;
        if (existingSubmissions.length > 0) {
            // Homework already submitted with approval_status 0, update the existing record
            submissionId = existingSubmissions[0].submitted_id;
            await connection.query(
                'UPDATE homework_submitted SET description = ? WHERE submitted_id = ?',
                [description, submissionId]
            );

            // Delete existing images for this submission
            await connection.query(
                'DELETE FROM image_submit WHERE homeworksubmitted_id = ?',
                [submissionId]
            );

            // Prepare values for batch insert
            const imageValues = images.map(imageData => [imageData, submissionId]);

            // Insert all images in a single query
            await connection.query(
                'INSERT INTO image_submit (image, homeworksubmitted_id) VALUES ?',
                [imageValues]
            );

            // Set approval_status to null
            await connection.query(

              //  'UPDATE homework_submitted SET approval_status = NULL ,review = NULL WHERE submitted_id = ?',

                'UPDATE homework_submitted SET approval_status = NULL,review = NULL  WHERE submitted_id = ?',

                [submissionId]
            );

            // Commit the transaction
            await connection.commit();

            res.status(200).json({ success: true, message: 'Homework updated successfully' });
        } else {
            // Homework not submitted with approval_status 0, check if it's already submitted
            const [existingSubmissionsAll] = await connection.query(
                'SELECT submitted_id FROM homework_submitted WHERE homeworkpending_id = ? AND student_id = ?',
                [homeworkpending_id, student_id]
            );

            if (existingSubmissionsAll.length > 0) {
                // Homework already submitted with other approval_status, return error
                res.status(400).json({ error: 'Homework already submitted' });
            } else {
                // Insert new homework submission
                const [submissionResult] = await connection.query(
                    'INSERT INTO homework_submitted (homeworkpending_id, subject_id, student_id, description) VALUES (?, ?, ?, ?)',
                    [homeworkpending_id, subject_id, student_id, description]
                );
                submissionId = submissionResult.insertId;

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
            }
        }

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
