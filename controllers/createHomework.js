
const { collegePool } = require("../config/dbconfig");

const createHomework=async (req, res) => {
  const { subject_id, Division, date_of_given, description, standred, date_of_creation, image} = req.body;
const{teacher_id}=req.query;
if (!subject_id || !Division || !date_of_given || !description  || !standred || !date_of_creation || !image || !teacher_id) {
  return res.status(400).json({ success: false, message: 'Missing required fields: subject_id, Division, date_of_given, description, homework_content, standred, date_of_creation, image, teacher_id' });
}
  try {
    
    const que = `
      INSERT INTO homework_pending (subject_id, Division, date_of_given, teacher_id, description, standred, date_of_creation, image)
      VALUES (?,?,?,?,?,?,?,?)
    `;

    const [result] = await req.collegePool.query(que, [subject_id, Division, date_of_given, teacher_id, description,  standred, date_of_creation, image]);

    res.status(200).json({ success: true, message: 'Homework posted successfully', homework_id: result.insertId });
  } catch (error) {
    console.error('Error posting homework:', error);
    res.status(500).json({ success: false, message: 'Error posting homework.' });
  }
};

module.exports = {
    createHomework
};
