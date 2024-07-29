const { closeDatabaseConnection } = require('../middleware/database');

const evolutionhomework = async (req, res, next) => {
    const { subject_id, standred, division, student_id } = req.query;

    // Log received query parameters for debugging
    console.log('Received query parameters:', { subject_id, standred, division, student_id });

    if (!subject_id || !standred || !division || !student_id) {
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
            WHERE hp.subject_id = ? AND hp.standred = ? AND hp.division = ?
        `,
        approvedHomework: `
            SELECT COUNT(*) as count
            FROM homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
            WHERE hs.student_id = ? AND hs.subject_id = ? AND hs.approval_status = 1
        `,
        pendingHomework: `
            SELECT COUNT(*) as count
            FROM homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed

            WHERE hs.student_id = ? AND hs.subject_id = ? AND hs.approval_status = 0

            WHERE hs.student_id = ? AND hs.subject_id = ? AND (hs.approval_status IS NULL)

        `,
        studentName: `
            SELECT Name
            FROM Student
            WHERE studentid = ?;
        `
    };

    const params = {
        totalHomework: [subject_id, standredValue, division],
        approvedHomework: [student_id, subject_id],
        pendingHomework: [student_id, subject_id],
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

        const total = response.totalHomework;
        const approved = response.approvedHomework;
        const pending = response.pendingHomework;
        const incomplete = total - (approved + pending);

        console.log(incomplete,pending,approved,total);
        console.log(response);
        
        const ApprovedPercentage = (approved / total) * 100;
        const PendingPercentage = (pending / total) * 100;
        const incompletePercentage = (incomplete / total) * 100;


        const perRes = {
            ApprovedPercentage,
            PendingPercentage,
            incompletePercentage
        }


        res.json(perRes);

    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { evolutionhomework };
/*
const { closeDatabaseConnection } = require('../middleware/database');

const evolutionhomework = async (req, res, next) => {
    const { subject_id, standred, division, student_id } = req.query;

    // Log received query parameters for debugging
    console.log('Received query parameters:', { subject_id, standred, division, student_id });

    if (!subject_id || !standred || !division || !student_id) {
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
            WHERE hp.subject_id = ? AND hp.standred = ? AND hp.division = ?
        `,
        approvedHomework: `
            SELECT COUNT(*) as count
            FROM homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
            WHERE hs.student_id = ? AND hs.subject_id = ? AND hs.approval_status = 1
        `,
        pendingHomework: `
            SELECT COUNT(*) as count
            FROM homework_submitted hs
            JOIN homework_pending hp ON hp.homeworkp_id = hs.homeworkpending_id
            JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
            WHERE hs.student_id = ? AND hs.subject_id = ? AND hs.approval_status IS NULL
        `,
        studentName: `
            SELECT Name
            FROM Student
            WHERE studentid = ?;
        `
    };

    const params = {
        totalHomework: [subject_id, standredValue, division],
        approvedHomework: [student_id, subject_id],
        pendingHomework: [student_id, subject_id],
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

        const totalHomeworkCount = totalHomeworkResults[0].total_homework;
        const approvedHomeworkCount = approvedHomeworkResults[0].count;
        const pendingHomeworkCount = pendingHomeworkResults[0].count;

        // Calculate percentages
        const totalHomeworkPercentage = calculatePercentage(totalHomeworkCount, totalHomeworkCount);
        const approvedHomeworkPercentage = calculatePercentage(approvedHomeworkCount, totalHomeworkCount);
        const pendingHomeworkPercentage = calculatePercentage(pendingHomeworkCount, totalHomeworkCount);
        const incompleteHomeworkPercentage = calculatePercentage((pendingHomeworkCount+approvedHomeworkCount)- totalHomeworkCount, totalHomeworkCount);

        function calculatePercentage(count, total) {
            return total > 0 ? (count / total) * 100 : 0;
        }

        // Combine all results into one response object
        const response = {
            student_name: studentName,
            totalHomework: totalHomeworkCount,
            totalHomeworkPercentage,
            approvedHomework: approvedHomeworkCount,
            approvedHomeworkPercentage,
            pendingHomework: pendingHomeworkCount,
            pendingHomeworkPercentage,
            incompleteHomeworkPercentage
        };

        // Adjust percentages to sum up to 100% if they don't already
        const percentageSum = approvedHomeworkPercentage + pendingHomeworkPercentage + incompleteHomeworkPercentage;
        if (percentageSum !== 100) {
            const scale = 100 / percentageSum;
            response.approvedHomeworkPercentage *= scale;
            response.pendingHomeworkPercentage *= scale;
            response.incompleteHomeworkPercentage *= scale;
        }

        res.json(response);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { evolutionhomework };
*/

module.exports = { evolutionhomework };

