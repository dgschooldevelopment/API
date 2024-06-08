const { closeDatabaseConnection } = require('../middleware/database');

const DailyUpdates= async (req, res) => {
    const { stand, division, subject_code_prefixed, chapter_id, point_id,date,time} = req.body;
    
    if (!stand || !division || !subject_code_prefixed || !chapter_id || !point_id || !date || !time) {
        throw new Error('All fields are required.');
    }


    try {

        const result ='INSERT INTO  Teacher_dailyUpdate(stand, division, subject_code_prefixed, chapter_id, point_id, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values= [stand, division, subject_code_prefixed, chapter_id, point_id, date, time];
       
        await req.collegePool.query(result, values);

        res.json({ success: true, message: 'Data inserted successfully.' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ success: false, message: 'Error inserting data.' });
    }finally {
        closeDatabaseConnection(req, res);
    }
};

module.exports = {
    DailyUpdates
};