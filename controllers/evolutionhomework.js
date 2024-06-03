const { closeDatabaseConnection } = require('../middleware/database');

const evolutionhomework = async (req, res,next) => {
    const { subject_name, standred, division, student_id } = req.query;

    // Log received query parameters for debugging
    console.log('Received query parameters:', { subject_name, standred, division, student_id });

    if (!subject_name || !standred || !division || !student_id) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }

    // Ensure standred is a single value if it's an array
    const standredValue = Array.isArray(standred) ? standred[0] : standred;

    // Queries
    const queries = {
        totalHomework: `
            SELECT COUNT(*) AS total_homework
            FROM homework_pending hp
            JOIN ${process.env.DB_NAME}.Subject s ON hp.subject_id = s.subject_code_prefixed
            WHERE s.subject_name = ? AND hp.standred = ? AND hp.Division = ?
        `,
        approvedHomework: `
            SELECT COUNT(*) as count
            FROM MGVP.homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
            JOIN Student st ON hs.student_id = st.student_id -- Join with Students table to get student name
            WHERE hs.student_id = ? AND hs.approval_status = 1
        `,
        pendingHomework: `
            SELECT COUNT(*) as count
            FROM MGVP.homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
            JOIN Student st ON hs.student_id = st.student_id -- Join with Students table to get student name
            WHERE hs.student_id = ? AND hs.approval_status = 0
        `,
        studentName: `
            SELECT Name
            FROM Student
            WHERE studentid = ?;
        `
    };

    const params = {
        totalHomework: [subject_name, standredValue, division],
        approvedHomework: [student_id],
        pendingHomework: [student_id],
        studentName: [student_id]
    };

    try {
        // Execute all queries using async/await
        const [studentNameResults] = await req.collegePool.query(queries.studentName, params.studentName);

        // Log studentNameResults for debugging
        console.log('Student Name Results:', studentNameResults);

        if (!studentNameResults || studentNameResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const studentName = studentNameResults[0].Name; // Adjusted to 'Name' instead of 'student_name'
        const [totalHomeworkResults] = await req.collegePool.query(queries.totalHomework, params.totalHomework);
        const [approvedHomeworkResults] = await req.collegePool.query(queries.approvedHomework, params.approvedHomework);
        const [pendingHomeworkResults] = await req.collegePool.query(queries.pendingHomework, params.pendingHomework);

        // Combine all results into one response object
        const response = {
            student_name: studentName,
            totalHomework: totalHomeworkResults[0].total_homework,
            approvedHomework: approvedHomeworkResults[0].count,
            pendingHomework: pendingHomeworkResults[0].count
        };

        res.json(response);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        await closeDatabaseConnection(req);
    }
};

module.exports = { evolutionhomework };
