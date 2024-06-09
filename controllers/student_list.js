const { collegePool } = require('../config/dbconfig');

const studentList = async (req, res) => {
  const { stand, division } = req.body;

  try {
    const query = `
      SELECT studentid, roll_no, std, Name, division, profile_img 
      FROM Student
      WHERE std =? AND division =?
    `;

    const [rows] =await req.collegePool.query(query, [stand, division]);

    const studentData = rows.map(student => {
      let base64ProfileImg = null;
      if (student.profile_img) {
        base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
      }

      return {
       ...student,
        profile_img: base64ProfileImg
      };
    });

    res.json(studentData);

  } catch (error) {
    console.error('Error fetching student list:', error);
    res.status(500).json({ success: false, message: 'Error fetching student list.' });
  }
};

module.exports = {
  studentList
};