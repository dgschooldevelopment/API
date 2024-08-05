const { collegePool, collegesPool } = require('../config/dbconfig');

const fetchfee = async (req, res) => {
    const studentid = req.body.studentid; // Assuming studentid is sent in the request body

    const sql = `SELECT remaining_fee, total_fee FROM fee_details WHERE student_id = ?`;

    try {
        const [results] = await req.collegePool.query(sql, [studentid]);
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

module.exports = {
    fetchfee
};