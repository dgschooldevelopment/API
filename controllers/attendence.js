// attendance.js

const mysql = require('mysql2/promise');
const { collegesPool } = require('../config/dbconfig');
const { closeDatabaseConnection } = require('../middleware/database');

const Attendance = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Missing required parameters: month and year' });
        }

        // Function to get the number of days in a month
        const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
        const daysInMonth = getDaysInMonth(month, year);

        // Generate column names for each date of the month
        const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month - 1, i + 1); // Note: month - 1 because month starts from 0
            const formattedDate = date.toISOString().split('T')[0]; // Get date in "YYYY-MM-DD" format
            return `\`${formattedDate}\` VARCHAR(255)`; // Enclose column name in backticks
        });

        // Create a dynamic table name
        const tableName = `attendance_${year}_${month}`;

        // Create the dynamic CREATE TABLE query for the attendance table
        const createAttendanceTableQuery = `
            CREATE TABLE ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                student_id VARCHAR(40) NOT NULL,
                 teacher_id VARCHAR(40) NOT NULL,
                ${dateColumns.join(', ')},
                FOREIGN KEY (student_id) REFERENCES Student(studentid),
                FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_code)
            )
        `;

        // Execute the CREATE TABLE query for the attendance table
        await req.collegePool.query(createAttendanceTableQuery);

        return res.status(200).send(`Table ${tableName} created successfully`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    } finally {
        await closeDatabaseConnection(req, res);
    }
};


module.exports = { Attendance };

/*const mysql = require('mysql2/promise');
const { collegesPool } = require('../config/dbconfig');

const Attendance = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Missing required parameters: month and year' });
        }

        // Function to get the number of days in a month
        const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
        const daysInMonth = getDaysInMonth(month, year);

        // Generate column names for each date of the month
        const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month - 1, i + 1); // Note: month - 1 because month starts from 0
            const formattedDate = date.toISOString().split('T')[0]; // Get date in "YYYY-MM-DD" format
            return `\`${formattedDate}\` VARCHAR(255)`; // Enclose column name in backticks
        });

        // Create a dynamic table name
        const tableName = `attendance_${year}_${month}`;

        // Create the dynamic CREATE TABLE query for the attendance table
        const createAttendanceTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(40) NOT NULL,
                teacher_id VARCHAR(40) NOT NULL,
                ${dateColumns.join(', ')},
                UNIQUE KEY student_date (student_id),
                FOREIGN KEY (student_id) REFERENCES Student(studentid),
                FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_code)
            )
        `;

        // Execute the CREATE TABLE query for the attendance table
        const [rows] = await collegesPool.query(createAttendanceTableQuery);

        return res.status(200).send(`Table ${tableName} created successfully`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = { Attendance };
*/