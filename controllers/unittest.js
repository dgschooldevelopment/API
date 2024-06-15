const mysql = require('mysql2/promise');
const { collegesPool } = require('../config/dbconfig');

const unittest = async (req, res) => {
    try {
        const { stand, division } = req.query;

        const query = `
            SELECT subject_name 
            FROM ${process.env.DB_NAME}.Subject
            WHERE stand = ? AND division = ?
        `;
        const [results] = await collegesPool.query(query, [stand, division]);

        if (results.length > 0) {
            const subjects = results.map(result => result.subject_name);
            const tableName = `unit_test_${stand}_${division}`;

            const createUnitTestTableQuery = `
                CREATE TABLE ${tableName} (
                    unit_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                    student_id VARCHAR(30) NOT NULL,
                    unit_test_id INT NOT NULL,
                    ${subjects.map(subject => `\`${subject}\` VARCHAR(255)`).join(',\n')},
                    FOREIGN KEY (student_id) REFERENCES Student(studentid),
                    FOREIGN KEY (unit_test_id) REFERENCES ${process.env.DB_NAME}.SelectUnitTest(unit_test_id)
                )
            `;

            try {
                await req.collegePool.query(createUnitTestTableQuery);
                return res.status(200).json({
                    message: `Table ${tableName} created successfully`,
                    subjects: subjects
                });
            } catch (createTableError) {
                if (createTableError.sqlState === '42S01') { // Table already exists
                    return res.status(200).json({
                        message: `Table ${tableName} already exists`,
                        subjects: subjects
                    });
                } else {
                    throw createTableError;
                }
            }
        } else {
            return res.status(404).json({
                message: 'Subjects not available for the given standard and division',
                subjects: []
            });
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

const insertUnitTestMarks = async (req, res) => {
    try {
        const { stand, division, student_id, unit_test_id, marks } = req.body;

        // Validate the presence of required fields
        if (!stand || !division || !student_id || !unit_test_id || !marks) {
            return res.status(400).send('Missing required fields');
        }

        const tableName = `unit_test_${stand}_${division}`;
        const [existingRows] = await req.collegePool.query(`
            SELECT * FROM ${tableName} WHERE student_id = ? AND unit_test_id = ? LIMIT 1
        `, [student_id, unit_test_id]);

        if (existingRows.length > 0) {
            // If data already exists, update the existing record instead of inserting
            const updateQuery = `
                UPDATE ${tableName} SET ${Object.keys(marks).map(column => `${column} = ?`).join(', ')}
                WHERE student_id = ? AND unit_test_id = ?
            `;
            const updateValues = [...Object.values(marks), student_id, unit_test_id];
            await req.collegePool.query(updateQuery, updateValues);
            return res.status(200).send(`Data updated successfully in ${tableName}`);
        }

        
        // Construct the columns and values dynamically
        const columns = Object.keys(marks).join(', ');
        const values = Object.values(marks);

        const insertQuery = `
            INSERT INTO ${tableName} (student_id, unit_test_id, ${columns})
            VALUES (?, ?, ${values.map(() => '?').join(', ')})
        `;

        await req.collegePool.query(insertQuery, [student_id, unit_test_id, ...values]);
        return res.status(200).send(`Data inserted successfully into ${tableName}`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    unittest,
    insertUnitTestMarks
};
