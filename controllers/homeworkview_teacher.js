const { collegesPool } = require('../config/dbconfig');

const viewhomework = async (req, res) => {
    const { teacher_code ,subject_id, Standard, Division } = req.query;

    if (!teacher_code || !Standard || !Division || !subject_id) {
        return res.status(400).json({ error: 'Need All Parameters' });
    }

    try {

        const sqlHomework = `
            SELECT 
                h.hid,
                h.homeworkp_id,
                h.subject_id,
                h.date_of_given,
                h.description,
                h.image,
                s.subject_name,
                h.standred,
                h.Division,
                h.date_of_creation
            FROM 
                homework_pending h
            JOIN 
                ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
            
            WHERE 
                h.teacher_id = ? AND h.subject_id = ? AND h.standred=? AND h.Division=?`;

        const [rowsHomework] = await req.collegePool.query(sqlHomework, [teacher_code,subject_id, Standard, Division ]);

        const homeworkData = rowsHomework.map(row => ({
            hid: row.hid,
            homeworkp_id: row.homeworkp_id,
            subject_id: row.subject_id,
            date_of_given: row.date_of_given,
            description: row.description,
            subject_name: row.subject_name,
            standard: row.standred,
            Division: row.Division,
            teacher_name: row.teacher_name,
            date_of_creation: row.date_of_creation,
            image: row.image ? `${row.image}` : null,

        }));

        res.json(homeworkData);


    } catch (error) {
        console.error('Error fetching homework pending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




module.exports = {
    viewhomework
};
