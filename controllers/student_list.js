const { collegePool } = require('../config/dbconfig');

const studentList = async (req, res) => {
  const { stand, division } = req.query;

  try {
    const query = `


       SELECT s.studentid, s.roll_no, s.std, s.Name, s.division, s.profile_img, c.college_code

      FROM Student s
      JOIN ${process.env.DB_NAME}.College c ON s.college_id = c.collegeID
      WHERE s.std = ? AND s.division = ?
    `;

    const [rows] = await req.collegePool.query(query, [stand, division]);

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