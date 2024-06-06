// controllers/unittest.js
/*const unittest = async (req, res) => {
    try {
        const query = `SELECT subject_name FROM ${process.env.DB_NAME}.Subject WHERE stand='10' AND division='A'`;
        const [results] = await req.collegePool.query(query);

        if (results.length > 0) {
            const subjects = results.map(result => result.subject_name);
            const createTableQuery = `CREATE TABLE unit_test (
                unit_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                student_id VARCHAR(40) NOT NULL,
                ${subjects.map(subject => `\`${subject}\` VARCHAR(255)`).join(',\n')},
                FOREIGN KEY (student_id) REFERENCES Student(studentid)
            )`;
            

            await req.collegePool.query(createTableQuery);
            return res.status(200).send('Table created successfully');
        } else {
            return res.status(404).send('No subjects found for the given stand and division');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    unittest
};*/
// controllers/unittest.jsconst { collegesPool } = require('../config/dbconfig');
const mysql = require('mysql2/promise');

const { collegesPool } = require('../config/dbconfig');

const unittest = async (req, res) => {
    try {
        const { stand, division } = req.query;

        // Fetch the subjects for the given standard and division from the Subject table in the selected college's database
        const query = `
            SELECT subject_name 
            FROM ${process.env.DB_NAME}.Subject
            WHERE stand = ? AND division = ?
        `;
        const [results] = await collegesPool.query(query, [stand, division]);

        if (results.length > 0) {
            // Extract the subject names
            const subjects = results.map(result => result.subject_name);

            // Create a dynamic table name
            const tableName = `unit_test_${stand}_${division}`;

            // Create the dynamic CREATE TABLE query for the unit test table
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

            // Execute the CREATE TABLE query for the unit test table
            await req.collegePool.query(createUnitTestTableQuery);

            return res.status(200).send(`Table ${tableName} created successfully`);
        } else {
            return res.status(404).send('No subjects found for the given standard and division');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    unittest
};

/*const mysql = require('mysql2/promise');
const { collegesPool } = require('../config/dbconfig');

const unittest = async (req, res) => {
    try {
        const { stand, division } = req.query;

        // Fetch the subjects for the given standard and division from the Subject table in the selected college's database
        const query = `
            SELECT subject_name 
            FROM ${process.env.DB_NAME}.Subject
            WHERE stand = ? AND division = ?
        `;
        const [results] = await collegesPool.query(query, [stand, division]);

        if (results.length > 0) {
            // Extract the subject names
            const subjects = results.map(result => result.subject_name);

            // Proceed with further actions or return the subjects
            return res.status(200).json({ subjects });
        } else {
            return res.status(404).send('No subjects found for the given standard and division');
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    unittest
};*/
