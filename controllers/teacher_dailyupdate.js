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

const getTeacherDailyUpdate=async (req, res) => {
    try {
        const query = `
            SELECT 
                tdu.update_id,
                tdu.stand,
                tdu.division,
                tdu.subject_code_prefixed,
                tdu.chapter_id,
                c.chapter_name,
                tdu.point_id,
                p.point_name,
                tdu.date,
                tdu.time
            FROM 
                Teacher_dailyUpdate tdu
            JOIN 
                syallabus.chapter c ON tdu.chapter_id = c.chapter_id
            JOIN 
                syallabus.Points p ON tdu.point_id = p.point_id;
        `;
        const [rows] = await req.collegePool.query(query);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'Error fetching data.' });
    }
};


module.exports = {
    DailyUpdates,
    getTeacherDailyUpdate
};
