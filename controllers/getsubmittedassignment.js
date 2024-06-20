const { collegePool } = require('../config/dbconfig');
const { closeDatabaseConnection } = require('../middleware/database');

const getsubmitted_homework = async (req, res) => {
  const teacherId = req.query.teacherId;

  const que = `
    SELECT hs.*, s.subject_name, t.tname
    FROM homework_submitted hs
    INNER JOIN subject_teacher st ON hs.subject_id = st.subject_code
    INNER JOIN colleges.Subject s ON st.subject_code = s.subject_code_prefixed
    INNER JOIN teacher t ON st.teacher_code = t.teacher_code
    WHERE st.teacher_code = ? AND hs.approval_status = 1`;

  try {
    const [results] = await req.collegePool.query(que, [teacherId]);
    
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getsubmitted_homework
};