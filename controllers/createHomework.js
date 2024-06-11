
const { collegePool } = require("../config/dbconfig");

const createHomework=async (req, res) => {
  const { subject_id, Division, date_of_given, description, image, homework_content, standred, date_of_creation } = req.body;
const{teacher_id}=req.query;
  try {
    
    const que = `
      INSERT INTO homework_pending (subject_id, Division, date_of_given, teacher_id, description, image, homework_content, standred, date_of_creation)
      VALUES (?,?,?,?,?,?,?,?,?)
    `;

    const [result] = await req.collegePool.query(que, [subject_id, Division, date_of_given, teacher_id, description, image, homework_content, standred, date_of_creation]);

    res.status(201).json({ success: true, message: 'Homework posted successfully', homework_id: result.insertId });
  } catch (error) {
    console.error('Error posting homework:', error);
    res.status(500).json({ success: false, message: 'Error posting homework.' });
  }
};

module.exports = {
    createHomework
};
