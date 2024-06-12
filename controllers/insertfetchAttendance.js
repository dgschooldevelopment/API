const { closeDatabaseConnection } = require('../middleware/database');


/*const insertAttendance = async (req, res) => {
    try {
        const { student_id, teacher_id, date, status } = req.query;

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
        const tableName = `attendance_${year}_${month}`;

        // Check if the table already exists
        const [rows] = await req.collegePool.query(`SHOW TABLES LIKE '${tableName}'`);

        if (rows.length === 0) {
            // If the table doesn't exist, create it and insert the attendance record
            const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1; // Start from day 1
                const currentDay = new Date(year, month - 1, day).getDate();
                const currentDate = new Date(year, month - 1, currentDay);
                const formattedDate = currentDate.toISOString().split('T')[0];
                return `\`${formattedDate}\` VARCHAR(40)`;
            });

            // Create the dynamic CREATE TABLE query for the attendance table
            const createAttendanceTableQuery = `
                CREATE TABLE ${tableName} (
                       id  INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
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
            await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, status]);

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
        await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, status]);

        return res.status(200).send(`Attendance record inserted successfully for ${formattedDate}`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};*/

const insertAttendance = async (req, res) => {
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
    try {
        const { student_id } = req.query;

        if (!student_id) {
            return res.status(400).json({ error: 'Missing student_id parameter' });
        }

        const todayDateString = moment().format('YYYY-MM-DD');
        const currentYear = moment().year();
        const startDateString = `${currentYear}-01-01`; // Start date of the current year

        const attendanceDataForAllMonths = {};

        // Iterate over each month from January to the current month
        for (let month = 1; month <= moment().month() + 1; month++) {
        //const tableName = `attendance_${currentYear}_${month}`;
          const tableName = `attendance_2024_4`
            const idField = `${tableName}_id`;

            const fetchAttendanceQuery = `
                SELECT a.*
                FROM ${tableName} AS a
             
                WHERE a.student_id = ? AND  BETWEEN '${startDateString}' AND '${todayDateString}';
            `;

            const [rows] = await req.collegePool.query(fetchAttendanceQuery, [student_id]);

            const attendanceDataForCurrentMonth = {};

            rows.forEach(row => {
                if (!attendanceDataForCurrentMonth[row.student_id]) {
                    attendanceDataForCurrentMonth[row.student_id] = [];
                }

                for (const [key, value] of Object.entries(row)) {
                    if (key !== 'id' && key !== 'student_id' && key !== 'teacher_id' && key !== 'reason' && key !== 'reason_date' && value !== null) {
                        let dateRecord = attendanceDataForCurrentMonth[row.student_id].find(record => record.date === key);
                        if (!dateRecord) {
                            dateRecord = { date: key, status: value };
                            attendanceDataForCurrentMonth[row.student_id].push(dateRecord);
                        } else {
                            dateRecord.status = value;
                        }
                    }
                }

                if (row.reason && row.reason_date) {
                    const formattedDate = moment(row.reason_date).format('YYYY-MM-DD');
                    let dateRecord = attendanceDataForCurrentMonth[row.student_id].find(record => record.date === formattedDate);
                    if (!dateRecord) {
                        dateRecord = { date: formattedDate, status: null, reasons: [row.reason] };
                        attendanceDataForCurrentMonth[row.student_id].push(dateRecord);
                    } else {
                        if (!dateRecord.reasons) {
                            dateRecord.reasons = [];
                        }
                        dateRecord.reasons.push(row.reason);
                    }
                }
            });

            Object.keys(attendanceDataForCurrentMonth).forEach(studentId => {
                attendanceDataForCurrentMonth[studentId] = attendanceDataForCurrentMonth[studentId].map(record => {
                    if (record.reasons && record.reasons.length === 0) {
                        delete record.reasons;
                    }
                    return record;
                });
            });

            attendanceDataForAllMonths[`month_${month}`] = attendanceDataForCurrentMonth;
        }

        return res.status(200).json(attendanceDataForAllMonths);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};







module.exports = { insertAttendance, fetchStudentAttendance };
