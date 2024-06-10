const { closeDatabaseConnection } = require('../middleware/database');

const insertAttendance = async (req, res) => {
    try {
        const { student_id, teacher_id, date, status } = req.query;

        if (!student_id || !teacher_id || !date || !status) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Convert the date to the correct format "YYYY-MM-DD"
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Create the dynamic table name
        const tableName = `attendance_2024_3`;

        // Check if the attendance record for the student and date exists
        const checkAttendanceQuery = `
            SELECT \`${formattedDate}\` FROM ${tableName}
            WHERE student_id = ?;
        `;

        const [rows] = await req.collegePool.query(checkAttendanceQuery, [student_id]);

        if (rows.length > 0 && rows[0][formattedDate] !== null) {
            // If the attendance record already exists for the specified date, return a message
            return res.status(400).send(`Attendance record already exists for ${formattedDate}`);
        }

        if (rows.length > 0) {
            // If the attendance record exists but the specified date is null, update the existing row
            const updateAttendanceQuery = `
                UPDATE ${tableName}
                SET \`${formattedDate}\` = ?
                WHERE student_id = ?;
            `;
            await req.collegePool.query(updateAttendanceQuery, [status, student_id]);
        } else {
            // If the attendance record doesn't exist, insert a new row
            const insertAttendanceQuery = `
                INSERT INTO ${tableName} (student_id, teacher_id, \`${formattedDate}\`)
                VALUES (?, ?, ?);
            `;
            await req.collegePool.query(insertAttendanceQuery, [student_id, teacher_id, status]);
        }

        return res.status(200).send(`Attendance record inserted/updated successfully for ${formattedDate}`);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

const moment = require('moment');

const fetchStudentAttendance = async (req, res) => {
    try {
        const { student_id } = req.query;

        if (!student_id) {
            return res.status(400).json({ error: 'Missing student_id parameter' });
        }

        // Construct the SQL query to fetch attendance data for the specified student
        const fetchAttendanceQuery = `
            SELECT a.*, ar.date AS reason_date, ar.reason
            FROM attendance_2024_3 AS a
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




module.exports = { insertAttendance, fetchStudentAttendance };
