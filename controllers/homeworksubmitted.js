
const { closeDatabaseConnection } = require('../middleware/database');

const homeworksubmitted = async (req, res) => {
    const { student_id, subject_id } = req.query;

    if (!student_id || !subject_id) {
        return res.status(400).json({ error: 'studentId and subjectid are required parameters' });
    }

    
    // Queries
    const sqlQuery = `
        SELECT
            hs.submitted_id,
            hs.homeworksubmitted_id,
            hs.homeworkpending_id,
            hs.subject_id,
            hs.student_id AS studentid,
            hs.date_of_given_submitted,
            hs.description AS submitted_description,
            hp.date_of_given AS date_of_to_submit,
            hp.description AS pending_description,
            s.subject_name,
            hs.approval_status,
               hs.review,
            isub.image AS image_data
         
        FROM
           homework_submitted hs
        JOIN
            homework_pending hp ON hs.homeworkpending_id = hp.homeworkp_id
        JOIN
        ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
        LEFT JOIN
           image_submit isub ON hs.submitted_id = isub.homeworksubmitted_id
        WHERE
            hs.student_id = ? AND
            hs.subject_id = ? /*AND
            hs.approval_status = -1*/
    `;

    try {
        const [results] = await req.collegePool.query(sqlQuery, [student_id, subject_id]);


      /*  if (results.length === 0) {

        /*if (results.length === 0) {

            return res.status(404).json({ error: 'No data found' });
        }*/

        const submissions = {};

        results.forEach(row => {
            if (!submissions[row.submitted_id]) {
                submissions[row.submitted_id] = {
                    submitted_id: row.submitted_id,
                    homeworksubmitted_id: row.homeworksubmitted_id,
                    homeworkpending_id: row.homeworkpending_id,
                    subject_id: row.subject_id,
                    studentid: row.studentid,
                    date_of_given_submitted: row.date_of_given_submitted,
                    submitted_description: row.submitted_description,
                    date_of_to_submit: row.date_of_to_submit,
                    pending_description: row.pending_description,
                    subject_name: row.subject_name,
                    approval_status: row.approval_status,
                    review:row.review,
                    images: []
                };
            }

            if (row.image_data) {
                submissions[row.submitted_id].images.push(`${row.image_data}`);
            }
        });

        res.json(Object.values(submissions));
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { homeworksubmitted };


/*const mysql = require('mysql2/promise'); // Ensure you're using the mysql2 library

const homeworksubmitted = async (req, res) => {
    const { student_id, subject_id } = req.query;

    if (!student_id || !subject_id) {
        return res.status(400).json({ error: 'studentId and subjectId are required parameters' });
    }

    // SQL Queries
    /*const deleteImageSubmitQuery = `
        DELETE FROM image_submit
        WHERE homeworksubmitted_id IN (
            SELECT submitted_id FROM homework_submitted
            WHERE student_id = ? AND subject_id = ? AND approval_status = -1
        )
    `;

    const deleteHomeworkSubmittedQuery = `
        DELETE FROM homework_submitted
        WHERE student_id = ? AND subject_id = ? AND approval_status = -1
    `;

    const selectQuery = `
        SELECT
            hs.submitted_id,
            hs.homeworksubmitted_id,
            hs.homeworkpending_id,
            hs.subject_id,
            hs.student_id AS studentid,
            hs.date_of_given_submitted,
            hs.description AS submitted_description,
            hp.date_of_given AS date_of_to_submit,
            hp.description AS pending_description,
            s.subject_name,
            hs.approval_status,
            isub.image AS image_data
        FROM
            homework_submitted hs
        JOIN
            homework_pending hp ON hs.homeworkpending_id = hp.homeworkp_id
        JOIN
            ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
        LEFT JOIN
            image_submit isub ON hs.submitted_id = isub.homeworksubmitted_id
        WHERE
            hs.student_id = ? AND
            hs.subject_id = ? 
            
    `;

    let connection;

    try {
        // Ensure req.collegePool provides a valid connection pool
        if (!req.collegePool || typeof req.collegePool.getConnection !== 'function') {
            throw new Error('Invalid database connection pool');
        }

        // Acquire a connection from the pool
        connection = await req.collegePool.getConnection();

        // Start a transaction
        await connection.beginTransaction();

        // Delete related records from image_submit
        await connection.query(deleteImageSubmitQuery, [student_id, subject_id]);

        // Delete assignments with approval_status = -1
        await connection.query(deleteHomeworkSubmittedQuery, [student_id, subject_id]);

        // Commit the transaction
        await connection.commit();

        // Fetch the remaining homework submissions
        const [results] = await connection.query(selectQuery, [student_id, subject_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        const submissions = {};

        results.forEach(row => {
            if (!submissions[row.submitted_id]) {
                submissions[row.submitted_id] = {
                    submitted_id: row.submitted_id,
                    homeworksubmitted_id: row.homeworksubmitted_id,
                    homeworkpending_id: row.homeworkpending_id,
                    subject_id: row.subject_id,
                    studentid: row.studentid,
                    date_of_given_submitted: row.date_of_given_submitted,
                    submitted_description: row.submitted_description,
                    date_of_to_submit: row.date_of_to_submit,
                    pending_description: row.pending_description,
                    subject_name: row.subject_name,
                    approval_status: row.approval_status,
                    images: []
                };
            }

            if (row.image_data) {
                submissions[row.submitted_id].images.push(`${row.image_data}`);
            }
        });

        res.json(Object.values(submissions));
    } catch (error) {
        console.error('Database query failed:', error);

        // Rollback the transaction in case of error
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
            }
        }

        res.status(500).json({ error: 'Database query failed' });
    } finally {
        if (connection) {
            connection.release(); // Ensure the connection is released back to the pool
        }
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { homeworksubmitted };
*/
