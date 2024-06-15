const { closeDatabaseConnection } = require('../middleware/database');

/*const insertAttendance = async (req, res) => {
    try {
        const { student_id, teacher_id, date, status } = req.body;

        if (!student_id || !teacher_id || !date || !status) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Convert the date to the correct format "YYYY-MM-DD"
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Extract year and month from the date
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1; // Month is zero-indexed

        // Get the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();

        // Create a dynamic table name
        const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

        // Check if the table already exists
        const [rows] = await req.collegePool.query(`SHOW TABLES LIKE ?`, [tableName]);

        if (rows.length === 0) {
            // If the table doesn't exist, create it and insert the attendance record
           // If the table doesn't exist, create it and insert the attendance record
// If the table doesn't exist, create it and insert the attendance record
const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1; // Start from day 1
    return `\`${year}-${month.toString().padStart(2, '0')}-${(day < 10 ? '0' : '') + day}\` BOOLEAN`;
});



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
            await req.collegePool.query(createAttendanceTableQuery);

            // Insert the attendance record into the newly created table
            const insertAttendanceQuery = `
                INSERT INTO ${tableName} (student_id, teacher_id, \`${formattedDate}\`)
                VALUES (?, ?, ?)
            `;
            const attendanceStatus = status === 'present' ? 1 : 0;
            await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, attendanceStatus]);

            return res.status(200).send(`Created table ${tableName} and inserted attendance record for ${formattedDate}`);
        }

        // Check if the data for the student and date combination is already inserted
        const [existingRows] = await req.collegePool.query(`
            SELECT * FROM ${tableName} WHERE student_id = ? AND \`${formattedDate}\` IS NOT NULL;
        `, [student_id]);

        if (existingRows.length > 0) {
            // If data is already inserted, return a message
            return res.status(400).send(`Attendance record already exists for ${formattedDate}`);
        }

        // Insert the attendance record into the existing table
        const insertAttendanceQuery = `
            INSERT INTO ${tableName} (student_id, teacher_id, \`${formattedDate}\`)
            VALUES (?, ?, ?)
        `;
        const attendanceStatus = status === 'present' ? 1 : 0;
        await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, attendanceStatus]);

        return res.status(200).send(`Attendance record inserted successfully for ${formattedDate}`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = { insertAttendance };
*/


// Sample holiday check function


const checkIfHoliday = async (date, pool) => {
    const query = 'SELECT description FROM holidays WHERE date = ?';
    const [rows] = await pool.query(query, [date]);
    return rows.length > 0 ? rows[0].description : null;
};

const insertAttendance = async (req, res) => {
    try {
        const { student_id, teacher_id, date, status } = req.body;

        if (!student_id || !teacher_id || !date || !status) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Convert the date to the correct format "YYYY-MM-DD"
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Check if the date is a holiday
        const holidayDescription = await checkIfHoliday(formattedDate, req.collegePool);

        // Extract year and month from the date
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1; // Month is zero-indexed

        // Create a dynamic table name
        const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

        // Check if the table already exists
        const [rows] = await req.collegePool.query(`SHOW TABLES LIKE ?`, [tableName]);

        if (rows.length === 0) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1; // Start from day 1
                return `\`${year}-${month.toString().padStart(2, '0')}-${(day < 10 ? '0' : '') + day}\` TINYINT DEFAULT NULL`;
            });

            // Create the dynamic CREATE TABLE query for the attendance table
            const createAttendanceTableQuery = `
                CREATE TABLE ${tableName} (
                    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                    student_id VARCHAR(40) NOT NULL UNIQUE,
                    teacher_id VARCHAR(40) NOT NULL,
                    ${dateColumns.join(', ')},
                    FOREIGN KEY (student_id) REFERENCES Student(studentid),
                    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_code)
                )
            `;
            await req.collegePool.query(createAttendanceTableQuery);
        }

        // Determine the attendance status value
        let attendanceStatus;
        if (holidayDescription) {
            attendanceStatus = 2;

            // Insert the holiday message into the database
            const insertHolidayQuery = `
                INSERT INTO ${tableName} (student_id, teacher_id, \`${formattedDate}\`)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE \`${formattedDate}\` = VALUES(\`${formattedDate}\`)
            `;
            await req.collegePool.query(insertHolidayQuery, [student_id, teacher_id, attendanceStatus]);

            return res.status(200).json({ 
                message: `Holiday: ${holidayDescription}`,
                'status entered': attendanceStatus 
            });
                 } else {
            attendanceStatus = status === 'present' ? 1 : 0;
        }

        // Check if the row for the student already exists
        const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

        if (existingRows.length > 0) {
            // Update the existing row for the specific date
            const updateAttendanceQuery = `
                UPDATE ${tableName}
                SET \`${formattedDate}\` = ?
                WHERE student_id = ?
            `;
            await req.collegePool.query(updateAttendanceQuery, [attendanceStatus, student_id]);
        } else {
            // Insert a new row with the attendance record
            const daysInMonth = new Date(year, month, 0).getDate();
            const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1; // Start from day 1
                return i === new Date(date).getDate() - 1 ? attendanceStatus : null;
            });

            const insertAttendanceQuery = `
                INSERT INTO ${tableName} (student_id, teacher_id, ${Array.from({ length: daysInMonth }, (_, i) => `\`${year}-${month.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}\``).join(', ')})
                VALUES (?, ?, ${Array.from({ length: daysInMonth }, () => '?').join(', ')})
            `;
            await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, ...dateColumns]);
        }

        return res.status(200).send(`Attendance record inserted/updated successfully for ${formattedDate}`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

/*const moment = require('moment');

const fetchStudentAttendance = async (req, res) => {
    try {
        const { student_id, year, month } = req.query;

        if (!student_id || !year || !month) {
            return res.status(400).json({ error: 'Missing student_id,year,month parameter' });
        }
        const tableName = `attendance_${year}_${month}`;
        // Construct the SQL query to fetch attendance data for the specified student
        const fetchAttendanceQuery = `
    SELECT a.*, ar.date AS reason_date, ar.reason
    FROM ${tableName} AS a
    LEFT JOIN addreason AS ar ON a.id = ar.attendance_id
    WHERE a.student_id = ?;
`;


        // Execute the query
        const [rows] = await req.collegePool.query(fetchAttendanceQuery, [student_id]);

        // Initialize an object to store attendance data
        const attendanceData = {};

        // Iterate through each row of the fetched data
        rows.forEach(row => {
            // Check if the student_id key exists in the attendanceData object, if not, initialize it
            if (!attendanceData[row.student_id]) {
                attendanceData[row.student_id] = [];
            }

            // Iterate through each column of the current row
            for (const [key, value] of Object.entries(row)) {
                // Check if the column represents a date and status and if the value is not null
                if (key !== 'id' && key !== 'student_id' && key !== 'teacher_id' && key !== 'reason' && key !== 'reason_date' && value !== null) {
                    // Initialize the date object if it doesn't exist
                    let dateRecord = attendanceData[row.student_id].find(record => record.date === key);
                    if (!dateRecord) {
                        dateRecord = { date: key, status: value };
                        attendanceData[row.student_id].push(dateRecord);
                    } else {
                        dateRecord.status = value;
                    }
                }
            }

            // Include the reason from addreason table
            if (row.reason && row.reason_date) {
                const formattedDate = moment(row.reason_date).format('YYYY-MM-DD'); // Format the reason date using Moment.js
                let dateRecord = attendanceData[row.student_id].find(record => record.date === formattedDate);
                if (!dateRecord) {
                    dateRecord = { date: formattedDate, status: null, reasons: [row.reason] };
                    attendanceData[row.student_id].push(dateRecord);
                } else {
                    if (!dateRecord.reasons) {
                        dateRecord.reasons = [];
                    }
                    dateRecord.reasons.push(row.reason);
                }
            }
        });

        // Filter out records with empty reasons
        Object.keys(attendanceData).forEach(studentId => {
            attendanceData[studentId] = attendanceData[studentId].map(record => {
                if (record.reasons && record.reasons.length === 0) {
                    delete record.reasons;
                }
                return record;
            });
        });

        // Send the formatted output as the response
        return res.status(200).json(attendanceData);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

*/
const moment = require('moment');
const fetchStudentAttendance = async (req, res) => {
    const { currentYear, currentMonth, student_id } = req.query;

    if (!currentYear || !currentMonth || !student_id) {
        return res.status(400).json({ error: 'Missing required query parameters: currentYear, currentMonth, student_id' });
    }

    function generateQuery(currentYear, currentMonth) {
        const monthStr = currentMonth.toString().padStart(2, '0'); // Ensure two-digit month
        let initialTable = `attendance_${currentYear}_${monthStr}`;
        let query = `SELECT * FROM ${initialTable}`;
        let previousTable = initialTable;

        for (let year = currentYear; year >= 2024; year--) {
            for (let month = currentMonth; month >= 1; month--) {
                const monthStr = month.toString().padStart(2, '0'); // Ensure two-digit month
                const tableName = `attendance_${year}_${monthStr}`;
                if (tableName === initialTable) {
                    continue;
                }

                query += ` LEFT JOIN ${tableName} ON ${previousTable}.student_id = ${tableName}.student_id`;
                previousTable = tableName;
            }
            currentMonth = 12;  // Reset to December after the first year
        }

        query += ` WHERE ${initialTable}.student_id = ?`;  // Add condition to query
        return query;
    }

    try {
        const query = generateQuery(Number(currentYear), Number(currentMonth));
        console.log(query);

        const [results] = await req.collegePool.query(query, [student_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const attendanceData = [];

        results.forEach(row => {
            // Iterate through each row's keys (which are dates in string format)
            Object.keys(row).forEach(key => {

            

                if (key !== 'student_id' /*&& row[key] !== null*/) {

                    const dateMoment = moment(key, 'YYYY-MM-DD', true);
                    if (dateMoment.isValid()) {
                        const formattedDate = dateMoment.format('YYYY-MM-DD');
                        attendanceData.push({ date: formattedDate, status: row[key] });
                    }
                }
            });
        });

        res.json({ attendanceData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = { insertAttendance, fetchStudentAttendance };
