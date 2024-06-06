const mysql = require('mysql2/promise');
const { closeDatabaseConnection } = require('../middleware/database');

// Function to get total pending assignments subject-wise
const getTotalPendingAssignments = async (pool, standard, division) => {
    // Query to get total pending assignments
    const query = `
        SELECT 
            p.subject_id,
            COUNT(*) AS total_pending
        FROM 
            homework_pending p
        WHERE 
            p.standred = ?
            AND p.division = ?
        GROUP BY 
            p.subject_id;
    `;
    const [results] = await pool.query(query, [standard, division]);
    return results;
};

// Function to get total submitted assignments subject-wise
const getTotalSubmittedAssignments = async (pool, student_id, standard, division) => {
    // Query to get total submitted assignments
    const query = `
        SELECT 
            p.subject_id,
            COUNT(*) AS total_submitted
        FROM 
            homework_submitted s
        JOIN 
            homework_pending p ON s.homeworkpending_id = p.homeworkp_id
        WHERE 
            s.student_id = ?
            AND p.standred = ?
            AND p.division = ?
        GROUP BY
            p.subject_id;
    `;
    const [results] = await pool.query(query, [student_id, standard, division]);
    return results;
};

// Main function to fetch assignments
const Assignment = async (req, res) => {
    const { student_id, standard, division } = req.query;

    // Check if required parameters are provided
    if (!student_id || !standard || !division) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const pool = req.collegePool;

    try {
        // Get total pending assignments subject-wise
        const pendingResults = await getTotalPendingAssignments(pool, standard, division);

        // Get total submitted assignments subject-wise for the given student
        const submittedResults = await getTotalSubmittedAssignments(pool, student_id, standard, division);

        // Combine pending and submitted assignment results
        const combinedResults = pendingResults.map(pending => {
            const submitted = submittedResults.find(s => s.subject_id === pending.subject_id) || { total_submitted: 0 };

            return {
                subject_id: pending.subject_id,
                total_pending: pending.total_pending,
                total_submitted: submitted.total_submitted
            };
        });

        // Send the combined assignment data as JSON response
        res.json(combinedResults);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Close the database connection
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { Assignment };
