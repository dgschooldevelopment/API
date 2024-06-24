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

/*const insertUnitTestMarks = async (req, res) => {
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
*/
// controllers/unittest.js


const insertUnitTestMarks = async (req, res) => {
    try {
        // Assuming req.body is already an object containing studentsData
        const studentsData = req.body;

        // Extract query parameters from req.query
        const { stand, division, unit_test_id, subject_id } = req.query;
        const tableName = `unit_test_${stand}_${division}`;

        // Query to fetch subject name based on subject code
        const subjectQuery = `
            SELECT subject_name 
            FROM ${process.env.DB_NAME}.Subject
            WHERE subject_code_prefixed = ?
        `;
        const [subjectResult] = await req.collegePool.query(subjectQuery, [subject_id]);

        if (subjectResult.length === 0) {
            return res.status(404).json({
                message: `Subject with subject_id ${subject_id} not found`
            });
        }

        const subject_name = subjectResult[0].subject_name;

        // Validate the presence of required fields for each student
        for (const data of studentsData) {
            const { student_id, marks } = data;
            if (!student_id || !marks || isNaN(marks)) {
                return res.status(400).send(`Invalid data format for student ${student_id}`);
            }
        }

        // Check if the table exists for the given stand and division
        const tableExistsQuery = `SHOW TABLES LIKE '${tableName}'`;
        const [tableExistsResult] = await req.collegePool.query(tableExistsQuery);

        if (tableExistsResult.length === 0) {
            // Table does not exist, create it
            const createTableMessage = await createUnitTestTable(req, res, stand, division, [subject_name]);
            if (createTableMessage !== 'Table created successfully') {
                return res.status(500).send(createTableMessage); // Error in creating table
            }
        }

        // Initialize response object
        const response = {
            added: [],
            existing: []
        };

        // Loop through each student's data and process insertion
        for (const data of studentsData) {
            const { student_id, marks } = data;

            // Check if data already exists for student_id, unit_test_id, and subject_name
            const existingDataQuery = `
                SELECT * FROM ${tableName} 
                WHERE student_id = ? AND unit_test_id = ?
            `;
            const [existingRows] = await req.collegePool.query(existingDataQuery, [student_id, unit_test_id]);

            if (existingRows.length === 0) {
                // Insert new record
                const insertQuery = `
                    INSERT INTO ${tableName} (student_id, unit_test_id, ${subject_name})
                    VALUES (?, ?, ?)
                `;
                const insertValues = [student_id, unit_test_id, marks];
                await req.collegePool.query(insertQuery, insertValues);
                console.log(`Data inserted successfully for student ${student_id} in ${tableName}`);
                response.added.push(student_id);
            } else {
                // Record already exists
                response.existing.push(student_id);
            }
        }

        // Prepare final response message
        let message = 'All data processed successfully.';
        if (response.added.length > 0) {
            message += ` Added data for students: ${response.added.join(', ')}.`;
        }
        if (response.existing.length > 0) {
            message += ` Data already exists for students: ${response.existing.join(', ')}.`;
        }

        return res.status(200).json({ message });

    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};


const getUnitTestIds = async (req, res) => {
    

    try {
        const query = `
            SELECT unit_test_name
            FROM ${process.env.DB_NAME}.SelectUnitTest
        `;
        const [results] = await collegesPool.query(query);

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({
                message: 'No unit test IDs found'
            });
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};
const createUnitTestTable = async (req, res, stand, division, subjectNames) => {
    try {
        const tableName = `unit_test_${stand}_${division}`;

        const createUnitTestTableQuery = `
            CREATE TABLE ${tableName} (
                unit_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                student_id VARCHAR(30) NOT NULL,
                unit_test_id INT NOT NULL,
                ${subjectNames.map(subject => `\`${subject}\` VARCHAR(255)`).join(',\n')},
                FOREIGN KEY (student_id) REFERENCES Student(studentid),
                FOREIGN KEY (unit_test_id) REFERENCES ${process.env.DB_NAME}.SelectUnitTest(unit_test_id)
            )
        `;

        await req.collegePool.query(createUnitTestTableQuery);
        return 'Table created successfully';
    } catch (err) {
        console.error('Error occurred while creating table:', err);
        return 'Error creating table';
    }
};

module.exports = {
    unittest,
    insertUnitTestMarks,
    getUnitTestIds
};
