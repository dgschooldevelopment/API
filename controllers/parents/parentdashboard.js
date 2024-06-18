const { collegesPool } = require('../../config/dbconfig');
const bufferToBase64 = (buffer) => {
    return Buffer.from(buffer).toString('base64');
};

const  parentdashboard=async (req, res, next) => {
    try {
        const sql = `SELECT dashboard_id, dashboard_image, dashboard_title FROM ${process.env.DB_NAME}.parent_dashboard`;

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
    parentdashboard
};
