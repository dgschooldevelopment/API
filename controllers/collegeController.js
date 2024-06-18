/*
const { collegesPool } = require('../config/dbconfig');

const checkCollege = async (req, res) => {
<<<<<<< HEAD
    const { college_code  } = req.body;

    if (!college_code ) {
=======

    const { college_code } = req.body;

    if (!college_code) {

    const { college_code  } = req.body;

    if (!college_code ) {

>>>>>>> b718d5b17207077832f053fc6d902cec4a174425
        return res.status(400).json({ error: 'collegeCode is a required parameter' });
    }

    const sql = `SELECT * FROM College WHERE college_code = ?`;

    try {
<<<<<<< HEAD
=======

        const [results] = await collegesPool.query(sql, [college_code]);



        if (results.length === 0) {
            return res.status(404).json({ error: 'College code not found' });
        }

        const college = results[0];
        return res.status(200).json({ success: true, message: 'College code found', college });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkCollege
};*/
/*const { collegesPool } = require('../config/dbconfig');

const checkCollege = async (req, res) => {
    const { college_code  } = req.body;

    if (!college_code ) {
        return res.status(400).json({ error: 'collegeCode is a required parameter' });
    }

    const sql = `SELECT * FROM College WHERE college_code = ?`;

    try {
>>>>>>> b718d5b17207077832f053fc6d902cec4a174425
        const [results] = await collegesPool.query(sql, [college_code ]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'College code not found' });
        }

        const college = results[0];
        return res.status(200).json({ success: true, message: 'College code found', college });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkCollege
};
*/



const { collegesPool } = require('../config/dbconfig');

const checkCollege = async (req, res) => {
    const { college_code } = req.body;

    if (!college_code) {
        return res.status(400).json({ error: 'collegeCode is a required parameter' });
    }

    const sql = `SELECT * FROM College WHERE BINARY college_code = ?`;
    try {
        const [results] = await collegesPool.query(sql, [college_code]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'College code not found' });
        }

        const college = results[0];
        return res.status(200).json({ success: true, message: 'College code found', college });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkCollege
};

