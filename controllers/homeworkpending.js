const { collegesPool } = require('../config/dbconfig');

const homeworkpending = async (req, res) => {
    const { student_id, subject_id, standard, division } = req.query;

    if (!subject_id || !standard || !division || !student_id) {
        return res.status(400).json({ error: 'Missing required parameters (subject_id, standard, division, student_id)' });
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
    t.tname AS teacher_name,
    h.date_of_creation,
    hs.approval_status
FROM 
    homework_pending h
JOIN 
    ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
JOIN 
    teacher t ON h.teacher_id = t.teacher_code
LEFT JOIN
    homework_submitted hs ON h.homeworkp_id = hs.homeworkpending_id  AND hs.student_id = ?
WHERE 
    h.subject_id = ? 
    AND h.standred = ?
    AND h.Division = ?
    AND (hs.homeworkpending_id IS NULL OR hs.approval_status = 0) `; 

    const [rowsHomework] = await req.collegePool.query(sqlHomework, [student_id, subject_id, standard, division]);


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
            review: row.review,
            approval_status: row.approval_status
        }));

        res.json(homeworkData);
    } catch (error) {
        console.error('Error fetching homework pending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.homeworkpending = homeworkpending;