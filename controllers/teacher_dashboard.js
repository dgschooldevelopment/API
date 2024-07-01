const { collegesPool } = require('../config/dbconfig');
const bufferToBase64 = (buffer) => {
    return Buffer.from(buffer).toString('base64');
};

const teacherDashboard=async (req, res, next) => {
    const {teacher_code} = req.query;

    try {
        let sql = `SELECT dashboard_id, dashboard_image, dashboard_title FROM ${process.env.DB_NAME}.teacher_dashboard `;
        
        const temp= 'select classteachers_id from classteachers where teacher_id=?';
        
        const [teacherIsPresent] = await req.collegePool.query(temp, [teacher_code]);

        if (teacherIsPresent.length==0) {
            sql += ` WHERE dashboard_id NOT IN (11, 16)`;
        }
        const [rows, fields] = await collegesPool.query(sql);

        const rowsWithBase64Image = rows.map(row => ({
            id: row.dashboard_id,
            title: row.dashboard_title,
            image: row.dashboard_image ? `${bufferToBase64(row.dashboard_image)}` : null
        }));

        res.json(rowsWithBase64Image);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
module.exports = {
    teacherDashboard
};
