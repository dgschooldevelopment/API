const { closeDatabaseConnection } = require('../middleware/database');




/*const checkIfHoliday = async (date, pool) => {
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

*/
const checkIfHoliday = async (date, pool) => {
    const query = 'SELECT description FROM holidays WHERE date = ?';
    const [rows] = await pool.query(query, [date]);
    return rows.length > 0 ? rows[0].description : null;
};

const createAttendanceTable = async (pool, tableName) => {
    const year = tableName.split('_')[1];
    const month = tableName.split('_')[2];
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
            ${dateColumns.join(', ')},
            FOREIGN KEY (student_id) REFERENCES Student(studentid)
        )
    `;
    
    await pool.query(createAttendanceTableQuery);
};

const insertAttendance = async (req, res) => {
    try {
        const { college_code, teacher_id,date } = req.query; // Assuming teacher_id is passed as a query parameter

        if (!teacher_id) {
            return res.status(400).json({ error: 'Teacher ID is missing' });
        }

        const attendanceRecords = req.body.records; // Expecting an array of attendance records

        if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return res.status(400).json({ error: 'No attendance records provided' });
        }
        const currentDate = new Date().toISOString().split('T')[0];
        // Prepare queries for batch execution
        const insertOrUpdateAttendanceQueries = [];
        const insertOrUpdateDailyTeacherQuery = `
            INSERT INTO daily_teacher (date, teacher_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)
        `;

        for (const record of attendanceRecords) {
            const { student_id, status } = record;

            if (!student_id || !status || !date) {
                return res.status(400).json({ error: 'Missing required parameters in one or more records' });
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
                // Table does not exist, create it
                await createAttendanceTable(req.collegePool, tableName);
                console.log(`Created table ${tableName}`);
            }

            // Check if the daily teacher entry exists, if not, insert it
            await req.collegePool.query(insertOrUpdateDailyTeacherQuery, [formattedDate, teacher_id]);

            // Determine the attendance status value
            const attendanceStatus = holidayDescription ? 2 : (status === 'present' ? 1 : 0);

            // Check if the row for the student already exists
            const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

            if (existingRows.length > 0) {
                // Update the existing row for the specific date
                const updateAttendanceQuery = `
                    UPDATE ${tableName}
                    SET \`${formattedDate}\` = ?
                    WHERE student_id = ?
                `;
                insertOrUpdateAttendanceQueries.push(req.collegePool.format(updateAttendanceQuery, [attendanceStatus, student_id]));
            } else {
                // Insert a new row with the attendance record
                const daysInMonth = new Date(year, month, 0).getDate();
                const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1; // Start from day 1
                    return i === new Date(date).getDate() - 1 ? attendanceStatus : null;
                });

                const insertAttendanceQuery = `
                    INSERT INTO ${tableName} (student_id, ${Array.from({ length: daysInMonth }, (_, i) => `\`${year}-${month.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}\``).join(', ')})
                    VALUES (?, ${Array.from({ length: daysInMonth }, () => '?').join(', ')})
                `;
                insertOrUpdateAttendanceQueries.push(req.collegePool.format(insertAttendanceQuery, [student_id, ...dateColumns]));
            }
        }

        // Execute all attendance queries in a batch
        for (const query of insertOrUpdateAttendanceQueries) {
            await req.collegePool.query(query);
        }

        return res.status(200).json({
            message: 'Attendance records inserted/updated successfully'
        });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};


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
