/*const mysql = require('mysql2/promise');

const report = async (req, res) => {
    try {
        const { standard, division, student_id } = req.query;

        // Fetch the subjects for the given standard and division
        const query = `
            SELECT subject_name 
            FROM ${process.env.DB_NAME}.Subject
            WHERE stand = ? AND division = ?
        `;
        const [subjectResults] = await req.collegePool.query(query, [standard, division]);

        if (subjectResults.length > 0) {
            // Extract the subject names
            const subjects = subjectResults.map(result => result.subject_name);

            // Create a dynamic table name
            const tableName = `unit_test_${standard}_${division}`;

            // Construct dynamic SQL query for percentages
            const totalSubjects = subjects.length;
            const percentageFields = subjects.map(subject => `(SUM(${subject}) / (COUNT(unit_test_id) * 100)) * 100 AS ${subject}`).join(', ');

            const dynamicQuery = `
                SELECT 
                    student_id,
                    ${percentageFields},
                    ((${subjects.map(subject => `SUM(${subject})`).join(' + ')}) / (${totalSubjects} * COUNT(unit_test_id))) AS overall_percentage
                FROM 
                    ${tableName}
                WHERE 
                    student_id = ?
                GROUP BY 
                    student_id
            `;

            // Execute the dynamic query
            const [results] = await req.collegePool.query(dynamicQuery, [student_id]);

            if (results.length > 0) {
                const result = results[0];
                const response = subjects.map(subject => ({
                    subjectname: subject,
                    percentage: parseFloat(result[subject]).toFixed(2)
                }));

                // Add overall percentage to the response
                response.push({
                    subjectname: 'Overall',
                    percentage: parseFloat(result.overall_percentage).toFixed(2)
                });

                return res.status(200).json(response);
            } else {
                return res.status(404).send('No records found for the given student ID');
            }
        } else {
            return res.status(404).send('No subjects found for the given standard and division');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    report
};*/
const mysql = require('mysql2/promise');

const report = async (req, res) => {
    try {
        const { standard, division, student_id } = req.query;

        // Create a dynamic table name
        const tableName = `unit_test_${standard}_${division}`;

        // Get the columns (subjects) from the table
        const [columnsResults] = await req.collegePool.query(`
            SHOW COLUMNS FROM ${tableName}
        `);

        // Filter out non-subject columns
        const subjects = columnsResults
            .map(column => column.Field)
            .filter(field => !['unit_id', 'student_id', 'unit_test_id'].includes(field));

        // Construct dynamic SQL query for percentages
        const totalSubjects = subjects.length;
        const percentageFields = subjects.map(subject => `(SUM(${subject}) / (COUNT(unit_test_id) * 100)) * 100 AS ${subject}`).join(', ');

        const dynamicQuery = `
         

        if (results.length > 0) {
            const result = results[0];
            const response = subjects.map(subject => ({
                subjectname: subject,
                percentage: parseFloat(result[subject]).toFixed(2)
            }));

            // Add overall percentage to the response
            response.push({
                subjectname: 'Overall',
                percentage: parseFloat(result.overall_percentage).toFixed(2)
            });

    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    report
};

