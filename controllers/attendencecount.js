// src/server/controllers/attendencecount.js

const attendencecount = async (req, res) => {
    try {
        const { std, division, date } = req.query; // Assuming these are passed as query parameters

        if (!std || !division || !date) {
            return res.status(400).json({ error: 'Missing required query parameters: std, division, or date' });
        }

        // Extract year and month from the date
        const year = new Date(date).getFullYear();
        const month = (new Date(date).getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed

        // Create the dynamic table name
        const tableName = `attendance_${year}_${month}`;

        // Get the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();

        // Construct the dynamic SUM CASE query for each day of the month
        let attendanceCountsQuery = `
            SELECT
                ${Array.from({ length: daysInMonth }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, '0');
                    const dateColumn = `${year}-${month}-${day}`;
                    return `
                        '${dateColumn}' AS date_${day},
                        SUM(CASE WHEN a.\`${dateColumn}\` = 1 THEN 1 ELSE 0 END) AS present_count_${day},
                        SUM(CASE WHEN a.\`${dateColumn}\` = 0 THEN 1 ELSE 0 END) AS absent_count_${day}
                    `;
                }).join(', ')}
            FROM 
                ${tableName} a
            JOIN 
                Student s ON a.student_id = s.studentid
            WHERE 
                s.std = ? AND s.division = ?
        `;

        const [rows] = await req.collegePool.query(attendanceCountsQuery, [std, division]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No attendance records found for the specified criteria' });
        }

        // Construct the result array
        const result = [];
        for (let i = 0; i < daysInMonth; i++) {
            const day = (i + 1).toString().padStart(2, '0');
            result.push({
                date: rows[0][`date_${day}`],
                present_count: rows[0][`present_count_${day}`],
                absent_count: rows[0][`absent_count_${day}`]
            });
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    attendencecount
};
