const { collegePool } = require("../config/dbconfig");

const classes=async (req, res) => {


    const sqlQuery = ` select * from Classes`;

    try {
        const [results] = await req.collegePool.query(sqlQuery);

        res.json(results);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } 
};

module.exports = {
    classes
};