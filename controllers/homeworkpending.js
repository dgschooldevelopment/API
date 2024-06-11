/*const { collegesPool } = require('../config/dbconfig');

const homeworkpending = async (req, res) => {
    const { subjectName, standard, division } = req.query; // Access parameters from req.query
  
    if (!subjectName || !standard || !division) {
      return res.status(400).json({ error: 'Missing required parameters (subjectName, standard, division)' });
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
            h.date_of_creation 
        FROM 
            homework_pending h
        JOIN 
            ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
        JOIN
            teacher t ON h.teacher_id = t.teacher_code
        LEFT JOIN
            homework_submitted hs ON h.homeworkp_id = hs.homeworkpending_id
        WHERE 
            s.subject_name = ? AND h.standred = ? AND h.Division = ? AND hs.homeworkpending_id IS NULL
      `;
  
      const [rowsHomework] = await req.collegePool.query(sqlHomework, [subjectName, standard, division]);
  
      const rowsWithBase64ImageHomework = rowsHomework.map(row => ({
        ...row,
        image: row.image ? row.image.toString('base64') : null
      }));
  
      res.json(rowsWithBase64ImageHomework);
    } catch (error) {
      console.error('Error fetching homework pending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } 
};

module.exports.homeworkpending = homeworkpending;*/

const { collegesPool } = require('../config/dbconfig');

const homeworkpending = async (req, res) => {
    const { subjectName, standard, division } = req.query; // Access parameters from req.query
  
    if (!subjectName || !standard || !division) {
      return res.status(400).json({ error: 'Missing required parameters (subjectName, standard, division)' });
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
            th.tname AS teacher_name,
            h.date_of_creation 
        FROM 
            homework_pending h
        JOIN 
            ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
        JOIN
            teacher th ON h.teacher_id = th.teacher_code
             JOIN
            subject_teacher t ON h.teacher_id = t.teacher_code
        LEFT JOIN
            homework_submitted hs ON h.homeworkp_id = hs.homeworkpending_id
        WHERE 
            s.subject_name = ? AND h.standred = ? AND h.Division = ? AND hs.homeworkpending_id IS NULL
      `;
  
      const [rowsHomework] = await req.collegePool.query(sqlHomework, [subjectName, standard, division]);
  
      const rowsWithBase64ImageHomework = rowsHomework.map(row => ({
        ...row,
        image: row.image ? row.image : null
      }));
  
      res.json(rowsWithBase64ImageHomework);
    } catch (error) {
      console.error('Error fetching homework pending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } 
};

module.exports.homeworkpending = homeworkpending;

