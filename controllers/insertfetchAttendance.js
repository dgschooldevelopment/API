const admin = require('../config/Firebase');

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
        const date = new Date(year, month - 1, day);
        if (date.getDay() !== 0) { // Exclude Sundays
            return `\`${year}-${month.toString().padStart(2, '0')}-${(day < 10 ? '0' : '') + day}\` TINYINT DEFAULT NULL`;
        }
        return null;
    }).filter(column => column !== null); // Remove null entries

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
        const { college_code, teacher_id, date } = req.query; // Assuming teacher_id is passed as a query parameter

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

        const skippedUpdates = []; // Array to store messages for skipped updates
const insertAttendance = async (req, res) => {
    try {
        const { college_code, teacher_id, date } = req.query;

        const attendanceRecords = req.body.records; // Expecting an array of attendance records

        if (!teacher_id || !date || !attendanceRecords) {
            return res.status(400).json({ error: 'Required data missing' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];
        const currentDate = new Date().toISOString().split('T')[0];

        const insertOrUpdateAttendanceQueries = [];
        const notifications = []; // Store notifications to send later

        for (const record of attendanceRecords) {
            const { student_id, status } = record;

            if (!student_id || !status || !date) {
                return res.status(400).json({ error: 'Missing required parameters in one or more records' });
            }

            // Convert the date to the correct format "YYYY-MM-DD"
            const formattedDate = new Date(date).toISOString().split('T')[0];

            // Check if the daily teacher entry exists, if not, insert it
            await req.collegePool.query(insertOrUpdateDailyTeacherQuery, [formattedDate, teacher_id]);

            // Determine the attendance status value
            const attendanceStatus = status === 'present' ? 1 : 0;

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

            // Check if the row for the student already exists
            const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

            if (existingRows.length > 0) {
                // Update the existing row for the specific date if current value is null
            if (!student_id || !status) {
                return res.status(400).json({ error: 'Missing required parameters in one or more records' });
            }

            const attendanceStatus = status === 'present' ? 1 : 0;
            const year = new Date(date).getFullYear();
            const month = new Date(date).getMonth() + 1;
            const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

            const [rows] = await req.collegePool.query(`SHOW TABLES LIKE ?`, [tableName]);

            if (rows.length === 0) {
                await createAttendanceTable(req.collegePool, tableName);
            }

            const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

            if (existingRows.length > 0) {
                const existingValue = existingRows[0][formattedDate];
                if (existingValue === null) {
                    const updateAttendanceQuery = `
                        UPDATE ${tableName}
                        SET \`${formattedDate}\` = ?
                        WHERE student_id = ?
                    `;
                    insertOrUpdateAttendanceQueries.push(req.collegePool.format(updateAttendanceQuery, [attendanceStatus, student_id]));
                } else {
                    skippedUpdates.push(`Skipped updating for student ${student_id} on ${formattedDate} as value exists: ${existingValue}`);
                }
            } else {
                // Insert a new row with the attendance record

                    if (status === 'absent') {
                        notifications.push(student_id);
                    }
                }
            } else {
                const daysInMonth = new Date(year, month, 0).getDate();
                const dateColumns = [];
                const dateValues = [];

                for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(year, month - 1, day);
                    if (currentDate.getDay() !== 0) { // Exclude Sundays
                    if (currentDate.getDay() !== 0) {
                        const formattedDay = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        dateColumns.push(`\`${formattedDay}\``);
                        dateValues.push(formattedDay === formattedDate ? attendanceStatus : null);
                    }
                }

                const insertAttendanceQuery = `
                    INSERT INTO ${tableName} (student_id, ${dateColumns.join(', ')})
                    VALUES (?, ${dateValues.map(() => '?').join(', ')})
                `;
                insertOrUpdateAttendanceQueries.push(req.collegePool.format(insertAttendanceQuery, [student_id, ...dateValues]));
            }
        }

        // Execute all attendance queries in a batch
        for (const query of insertOrUpdateAttendanceQueries) {
            await req.collegePool.query(query);
        }

        // Prepare response
        const response = {
            message: 'Attendance records inserted/updated successfully'
        };

        if (skippedUpdates.length > 0) {
            response.skippedUpdates = skippedUpdates;
        }

        return res.status(200).json(response);

                if (attendanceStatus === 0) {
                    notifications.push(student_id);
                }
            }
        }

        await req.collegePool.getConnection(async (conn) => {
            try {
                await conn.beginTransaction();

                for (const query of insertOrUpdateAttendanceQueries) {
                    await conn.query(query);
                }

                await conn.commit();
            } catch (err) {
                await conn.rollback();
                throw err;
            } finally {
                conn.release();
            }
        });

        for (const studentId of notifications) {
            const [parentTokens] = await req.collegePool.query(`
                SELECT p.fcm_token
                FROM Parents p
                JOIN Student s ON p.parent_id = s.parent_id
                WHERE s.studentid = ?
            `, [studentId]);

            for (const { fcm_token } of parentTokens) {
                await sendNotificationToParent(`Your child with student ID: ${studentId} was marked absent on ${formattedDate}.`, fcm_token);
            }
        }

        return res.status(200).json({ message: 'Attendance records inserted/updated successfully and notifications sent' });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};


const sendNotificationToParent = async (message, fcmToken) => {
    if (fcmToken === 'dummyFcmToken') {
        console.log('Sending notification to dummy token');
        return;
    }

    const messagePayload = {
        notification: {
            title: 'Attendance Notification',
            body: message,
        },
        token: fcmToken,
    };

    try {
        await admin.messaging().send(messagePayload);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = {
    insertAttendance,
};



//////////////////////////////////
// const checkIfHoliday = async (date, pool) => {
//     const query = 'SELECT description FROM holidays WHERE date = ?';
//     const [rows] = await pool.query(query, [date]);
//     return rows.length > 0 ? rows[0].description : null;
// };

// const createAttendanceTable = async (pool, tableName) => {
//     const year = tableName.split('_')[1];
//     const month = tableName.split('_')[2];
//     const daysInMonth = new Date(year, month, 0).getDate();

//     const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
//         const day = i + 1; // Start from day 1
//         const date = new Date(year, month - 1, day);
//         if (date.getDay() !== 0) { // Exclude Sundays
//             return `\`${year}-${month.toString().padStart(2, '0')}-${(day < 10 ? '0' : '') + day}\` TINYINT DEFAULT NULL`;
//         }
//         return null;
//     }).filter(column => column !== null); // Remove null entries

//     // Create the dynamic CREATE TABLE query for the attendance table
//     const createAttendanceTableQuery = `
//         CREATE TABLE ${tableName} (
//             id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
//             student_id VARCHAR(40) NOT NULL UNIQUE,
//             ${dateColumns.join(', ')},
//             FOREIGN KEY (student_id) REFERENCES Student(studentid)
//         )
//     `;

//     await pool.query(createAttendanceTableQuery);
// };

// const insertAttendance = async (req, res) => {
//     try {
//         const { college_code, teacher_id, date } = req.query; // Assuming teacher_id is passed as a query parameter

//         if (!teacher_id) {
//             return res.status(400).json({ error: 'Teacher ID is missing' });
//         }

//         const attendanceRecords = req.body.records; // Expecting an array of attendance records

//         if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
//             return res.status(400).json({ error: 'No attendance records provided' });
//         }

//         const currentDate = new Date().toISOString().split('T')[0];

//         // Prepare queries for batch execution
//         const insertOrUpdateAttendanceQueries = [];
//         const insertOrUpdateDailyTeacherQuery = `
//             INSERT INTO daily_teacher (date, teacher_id)
//             VALUES (?, ?)
//             ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)
//         `;

//         const skippedUpdates = []; // Array to store messages for skipped updates

//         for (const record of attendanceRecords) {
//             const { student_id, status } = record;

//             if (!student_id || !status || !date) {
//                 return res.status(400).json({ error: 'Missing required parameters in one or more records' });
//             }

//             // Convert the date to the correct format "YYYY-MM-DD"
//             const formattedDate = new Date(date).toISOString().split('T')[0];

//             // Check if the daily teacher entry exists, if not, insert it
//             await req.collegePool.query(insertOrUpdateDailyTeacherQuery, [formattedDate, teacher_id]);

//             // Determine the attendance status value
//             const attendanceStatus = status === 'present' ? 1 : 0;

//             // Extract year and month from the date
//             const year = new Date(date).getFullYear();
//             const month = new Date(date).getMonth() + 1; // Month is zero-indexed

//             // Create a dynamic table name
//             const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

//             // Check if the table already exists
//             const [rows] = await req.collegePool.query(`SHOW TABLES LIKE ?`, [tableName]);

//             if (rows.length === 0) {
//                 // Table does not exist, create it
//                 await createAttendanceTable(req.collegePool, tableName);
//                 console.log(`Created table ${tableName}`);
//             }

//             // Check if the row for the student already exists
//             const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

//             if (existingRows.length > 0) {
//                 // Update the existing row for the specific date if current value is null
//                 const existingValue = existingRows[0][formattedDate];
//                 if (existingValue === null) {
//                     const updateAttendanceQuery = `
//                         UPDATE ${tableName}
//                         SET \`${formattedDate}\` = ?
//                         WHERE student_id = ?
//                     `;
//                     insertOrUpdateAttendanceQueries.push(req.collegePool.format(updateAttendanceQuery, [attendanceStatus, student_id]));
//                 } else {
//                     skippedUpdates.push(`Skipped updating for student ${student_id} on ${formattedDate} as value exists: ${existingValue}`);
//                 }
//             } else {
//                 // Insert a new row with the attendance record
//                 const daysInMonth = new Date(year, month, 0).getDate();
//                 const dateColumns = [];
//                 const dateValues = [];

//                 for (let day = 1; day <= daysInMonth; day++) {
//                     const currentDate = new Date(year, month - 1, day);
//                     if (currentDate.getDay() !== 0) { // Exclude Sundays
//                         const formattedDay = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
//                         dateColumns.push(`\`${formattedDay}\``);
//                         dateValues.push(formattedDay === formattedDate ? attendanceStatus : null);
//                     }
//                 }

//                 const insertAttendanceQuery = `
//                     INSERT INTO ${tableName} (student_id, ${dateColumns.join(', ')})
//                     VALUES (?, ${dateValues.map(() => '?').join(', ')})
//                 `;
//                 insertOrUpdateAttendanceQueries.push(req.collegePool.format(insertAttendanceQuery, [student_id, ...dateValues]));
//             }
//         }

//         // Execute all attendance queries in a batch
//         for (const query of insertOrUpdateAttendanceQueries) {
//             await req.collegePool.query(query);
//         }

//         // Prepare response
//         const response = {
//             message: 'Attendance records inserted/updated successfully'
//         };

//         if (skippedUpdates.length > 0) {
//             response.skippedUpdates = skippedUpdates;
//         }

//         return res.status(200).json(response);
//     } catch (err) {
//         console.error('Error occurred:', err);
//         return res.status(500).send('Internal server error');
//     }
// };

//////////////////////////////////////////////////////

/*const checkIfHoliday = async (date, pool) => {
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
        const { college_code, teacher_id, date } = req.query; // Assuming teacher_id is passed as a query parameter

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

        const skippedUpdates = []; // Array to store messages for skipped updates

        for (const record of attendanceRecords) {
            const { student_id, status } = record;

            if (!student_id || !status || !date) {
                return res.status(400).json({ error: 'Missing required parameters in one or more records' });
            }

            // Convert the date to the correct format "YYYY-MM-DD"
            const formattedDate = new Date(date).toISOString().split('T')[0];

            // Check if the daily teacher entry exists, if not, insert it
            await req.collegePool.query(insertOrUpdateDailyTeacherQuery, [formattedDate, teacher_id]);

            // Determine the attendance status value
            const attendanceStatus = status === 'present' ? 1 : 0;

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

            // Check if the row for the student already exists
            const [existingRows] = await req.collegePool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

            if (existingRows.length > 0) {
                // Update the existing row for the specific date if current value is null
                const existingValue = existingRows[0][formattedDate];
                if (existingValue === null) {
                    const updateAttendanceQuery = `
                        UPDATE ${tableName}
                        SET \`${formattedDate}\` = ?
                        WHERE student_id = ?
                    `;
                    insertOrUpdateAttendanceQueries.push(req.collegePool.format(updateAttendanceQuery, [attendanceStatus, student_id]));
                } else {
                    skippedUpdates.push(`Skipped updating for student ${student_id} on ${formattedDate} as value exists: ${existingValue}`);
                }
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

        // Prepare response
        const response = {
            message: 'Attendance records inserted/updated successfully'
        };

        if (skippedUpdates.length > 0) {
            response.skippedUpdates = skippedUpdates;
        }

        return res.status(200).json(response);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};*/
////////////////////////////////////////////////////////////////////
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