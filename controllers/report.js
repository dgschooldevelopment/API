
/*const mysql = require('mysql2/promise');

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

        // Add overall percentage calculation
        const overallPercentage = `(${subjects.map(subject => `SUM(${subject})`).join(' + ')} / (COUNT(unit_test_id) * ${totalSubjects} * 100)) * 100 AS overall_percentage`;

        // Final dynamic SQL query
        const dynamicQuery = `
            SELECT ${percentageFields}, ${overallPercentage}
            FROM ${tableName}
            WHERE student_id = ?
            GROUP BY student_id
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
            return res.status(404).send('Student not found');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    report
};
*/
const mysql = require('mysql2/promise');

const report = async (req, res) => {
    try {
        const { standard, division, student_id } = req.query;

        // Validate input (standard and division should be alphanumeric)
        if (!/^[a-zA-Z0-9]+$/.test(standard) || !/^[a-zA-Z0-9]+$/.test(division)) {
            return res.status(400).send('Invalid input');
        }

        // Create a dynamic table name
        const tableName = `unit_test_${standard}_${division}`;

        // Get the columns (subjects) from the table
        const [columnsResults] = await req.collegePool.query(`
            SHOW COLUMNS FROM ${mysql.escapeId(tableName)}
        `);

        // Filter out non-subject columns
        const subjects = columnsResults
            .map(column => column.Field)
            .filter(field => !['unit_id', 'student_id', 'unit_test_id'].includes(field));

        // If no subjects found, return with an error
        if (subjects.length === 0) {
            return res.status(404).send('No subjects found for the specified criteria');
        }

        // Construct dynamic SQL query for percentages
        const percentageFields = subjects.map(subject => {
            return `IFNULL((SUM(${mysql.escapeId(subject)}) / (SUM(CASE WHEN ${mysql.escapeId(subject)} IS NOT NULL THEN 1 ELSE 0 END) * 100)) * 100, 0) AS \`${subject}_percentage\``;
        }).join(', ');

        // Add overall percentage calculation
        const overallPercentage = `IFNULL(((SUM(${subjects.map(subject => `IFNULL(${mysql.escapeId(subject)}, 0)`).join(' + ')}) / (SUM(${subjects.map(subject => `CASE WHEN ${mysql.escapeId(subject)} IS NOT NULL THEN 1 ELSE 0 END`).join(' + ')}) * 100)) * 100), 0) AS overall_percentage`;

        // Final dynamic SQL query
        const dynamicQuery = `
            SELECT ${percentageFields}, ${overallPercentage}
            FROM ${mysql.escapeId(tableName)}
            WHERE student_id = ?
            GROUP BY student_id
        `;

        // Execute the dynamic query
        const [results] = await req.collegePool.query(dynamicQuery, [student_id]);

        if (results.length > 0) {
            const result = results[0];
            const response = subjects.map(subject => ({
                subjectname: subject,
                percentage: parseFloat(result[`${subject}_percentage`]).toFixed(2)
            }));

            // Add overall percentage to the response
          /*  response.push({
                subjectname: 'Overall',
                percentage: parseFloat(result.overall_percentage).toFixed(2)
            });*/

            return res.status(200).json(response);
        } else {
            return res.status(404).send('Student not found');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    report
};
