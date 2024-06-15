
/*const mysql = require('mysql2/promise');
const { closeDatabaseConnection } = require('../middleware/database');

// Function to get total pending assignments subject-wise
const getTotalPendingAssignments = async (pool, standard, division) => {
    const query = `
        SELECT 
            p.subject_id,
            s.subject_name,
            COUNT(*) AS total_pending
        FROM 
            homework_pending p
        JOIN
            ${process.env.DB_NAME}.Subject s ON p.subject_id = s.subject_code_prefixed
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
    const query = `
        SELECT 
            p.subject_id,
            s.subject_name,
            COUNT(*) AS total_submitted
        FROM 
            homework_submitted hs
        JOIN 
            homework_pending p ON hs.homeworkpending_id = p.homeworkp_id
        JOIN
            ${process.env.DB_NAME}.Subject s ON p.subject_id = s.subject_code_prefixed
        WHERE 
            hs.student_id = ?
            AND p.standred = ?
            AND p.division = ?
        GROUP BY
            p.subject_id, s.subject_name;
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
                subject_name: pending.subject_name,
                total_pending: pending.total_pending,
                total_submitted: submitted.total_submitted
            };
        });

        // Calculate total pending assignments for all subjects
        const totalPending = combinedResults.reduce((total, assignment) => total + assignment.total_pending, 0);

        // Calculate total submitted assignments for all subjects
        const totalSubmitted = combinedResults.reduce((total, assignment) => total + assignment.total_submitted, 0);

        // Send the combined assignment data along with total pending and total submitted assignments
        res.json({
            assignments: combinedResults,
            total_pending: totalPending,
            total_submitted: totalSubmitted
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Close the database connection
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { Assignment };
*/
const moment = require('moment');
const { closeDatabaseConnection } = require('../middleware/database');

// Function to get total pending assignments subject-wise
const getTotalPendingAssignments = async (pool, standard, division) => {
    const query = `
        SELECT 
            p.subject_id,
            s.subject_name,
            COUNT(*) AS total_pending
        FROM 
            homework_pending p
        JOIN
            ${process.env.DB_NAME}.Subject s ON p.subject_id = s.subject_code_prefixed
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
    const query = `
        SELECT 
            p.subject_id,
            s.subject_name,
            COUNT(*) AS total_submitted
        FROM 
            homework_submitted hs
        JOIN 
            homework_pending p ON hs.homeworkpending_id = p.homeworkp_id
        JOIN
            ${process.env.DB_NAME}.Subject s ON p.subject_id = s.subject_code_prefixed
        WHERE 
            hs.student_id = ?
            AND p.standred = ?
            AND p.division = ?
        GROUP BY
            p.subject_id, s.subject_name;
    `;
    const [results] = await pool.query(query, [student_id, standard, division]);
    return results;
};

// Function to fetch and count attendance status for a specific student
const getStudentAttendanceCount = async (pool, currentYear, currentMonth, student_id) => {
    function generateQuery(currentYear, currentMonth) {
        const monthStr = currentMonth.toString().padStart(2, '0'); // Ensure two-digit month
        let initialTable = `attendance_${currentYear}_${monthStr}`;
        let query = `SELECT * FROM ${initialTable}`;
        let previousTable = initialTable;

        for (let year = currentYear; year >= 2024; year--) {
            for (let month = (year === currentYear ? currentMonth - 1 : 12); month >= 1; month--) {
                const monthStr = month.toString().padStart(2, '0'); // Ensure two-digit month
                const tableName = `attendance_${year}_${monthStr}`;

                query += ` LEFT JOIN ${tableName} ON ${previousTable}.student_id = ${tableName}.student_id`;
                previousTable = tableName;
            }
        }

        query += ` WHERE ${initialTable}.student_id = ?`; // Add condition to query
        return query;
    }

    const query = generateQuery(currentYear, currentMonth);
    const [results] = await pool.query(query, [student_id]);

    if (results.length === 0) {
        return { countPresent: 0, countAbsent: 0, countNull: 0 };
    }

    let countPresent = 0;
    let countAbsent = 0;
    let countNull = 0;

    results.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== 'student_id') {
                const dateMoment = moment(key, 'YYYY-MM-DD', true);
                if (dateMoment.isValid()) {
                    const status = row[key];
                    if (status === 1) countPresent++;
                    else if (status === 0) countAbsent++;
                    else if (status === null) countNull++;
                }
            }
        });
    });

    return { countPresent, countAbsent, countNull };
};

// Main function to fetch assignments and attendance
const Assignment = async (req, res) => {
    const { student_id, standard, division, currentYear, currentMonth } = req.query;

    // Check if required parameters are provided
    if (!student_id || !standard || !division || !currentYear || !currentMonth) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const pool = req.collegePool;

    try {
        // Get total pending assignments subject-wise
        const pendingResults = await getTotalPendingAssignments(pool, standard, division);

        // Get total submitted assignments subject-wise for the given student
        const submittedResults = await getTotalSubmittedAssignments(pool, student_id, standard, division);

        // Get attendance count for the given student
        const attendanceCount = await getStudentAttendanceCount(pool, Number(currentYear), Number(currentMonth), student_id);

        // Combine pending and submitted assignment results
        const combinedResults = pendingResults.map(pending => {
            const submitted = submittedResults.find(s => s.subject_id === pending.subject_id) || { total_submitted: 0 };

            return {
                subject_name: pending.subject_name,
                total_pending: pending.total_pending,
                total_submitted: submitted.total_submitted
            };
        });

        // Calculate total pending assignments for all subjects
        const totalPending = combinedResults.reduce((total, assignment) => total + assignment.total_pending, 0);

        // Calculate total submitted assignments for all subjects
        const totalSubmitted = combinedResults.reduce((total, assignment) => total + assignment.total_submitted, 0);

        // Send the combined assignment data along with total pending and total submitted assignments
        res.json({
            assignments: combinedResults,
            total_pending: totalPending,
            total_submitted: totalSubmitted,
            attendance: attendanceCount
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Close the database connection
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { Assignment };
