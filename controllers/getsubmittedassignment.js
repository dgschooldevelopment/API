const { collegePool } = require('../config/dbconfig');
const { closeDatabaseConnection } = require('../middleware/database');

const getsubmitted_homework = async (req, res) => {
  const { teacher_code ,subject_id, Standard, Division } = req.query;

  
  if (!teacher_code || !Standard || !Division || !subject_id) {
    return res.status(400).json({ error: 'Need All Parameters' });
}


  const que = `
    SELECT hs.*, s.subject_name, s.stand , s.division, t.tname
    FROM homework_submitted hs
    INNER JOIN subject_teacher st ON hs.subject_id = st.subject_code
    INNER JOIN ${process.env.DB_NAME}.Subject s ON st.subject_code = s.subject_code_prefixed
    INNER JOIN teacher t ON st.teacher_code = t.teacher_code
    WHERE st.teacher_code = ? AND hs.approval_status = 1 AND s.subject_code_prefixed =? AND s.stand=? AND s.division=?`;

  try {
    const [results] = await req.collegePool.query(que, [teacher_code,subject_id, Standard, Division ]);
    
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getsubmitted_homework
};