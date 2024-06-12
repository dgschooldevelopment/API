const fetchReasonByDate = async (req, res) => {
    try {
        const { date, student_id } = req.query;

        if (!date || !student_id) {
            return res.status(400).json({ error: 'Missing required parameters: date and student_id' });
        }

        // Convert the date to the correct format "YYYY-MM-DD"
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Extract year and month from the date
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1; // Month is zero-indexed

        // Create the attendance table name
       // const tableName = `attendance_${year}_${month}`;
       const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

        // Check if the attendance table exists
        const [tableExists] = await req.collegePool.query(`SHOW TABLES LIKE ?`, [tableName]);

        if (tableExists.length === 0) {
            return res.status(404).json({ message: `Attendance table for ${year}-${month} does not exist` });
        }

        // Query to fetch the status for the selected date
        const checkStatusQuery = `
            SELECT \`${formattedDate}\` AS status
            FROM ${tableName}
            WHERE student_id = ?
        `;

        const [statusRows] = await req.collegePool.query(checkStatusQuery, [student_id]);

        if (statusRows.length === 0 || statusRows[0].status === null) {
            return res.status(200).json({ message: 'Data not entered for the selected date' });
        }

        const attendanceStatus = statusRows[0].status;

        if (attendanceStatus === '1') { // Assuming '1' indicates present
            return res.status(200).json({ message: 'Student was present on this date' });
        } else {
            // Fetch the reason for absence from the addreason table
            const fetchReasonQuery = `
                SELECT reason 
                FROM addreason 
                WHERE date = ? AND student_id = ?
            `;

            const [reasonRows] = await req.collegePool.query(fetchReasonQuery, [formattedDate, student_id]);

            if (reasonRows.length > 0) {
                return res.status(200).json({ reason: reasonRows[0].reason });
            } else {
                return res.status(200).json({ message: 'Student was absent on this date but no reason provided' });
            }
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = { fetchReasonByDate };
