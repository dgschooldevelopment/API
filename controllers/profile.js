const { collegesPool } = require('../config/dbconfig');

const profile = async (req, res) => {
  const { studentid } = req.query;

  if (!studentid) {
    return res.status(400).json({ error: 'studentid parameter is required' });
  }

  try {
    const sql = `
      SELECT 
        s.studentid, 
        s.Name AS fullname, 
        s.std AS standard, 
        s.roll_no AS rollnumber, 
        s.division, 
        s.stud_dob AS dob, 
        s.mobile, 
        s.email,
        s.profile_img AS profilephoto
      FROM 
        Student s
      WHERE 
        s.studentid = ?
    `;
    const [results] = await req.collegePool.query(sql, [studentid]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Profile not found for the provided studentid' });
    }

    const profile = results[0];
    const profileData = {
      studentid: profile.studentid,
      fullname: profile.fullname,
      standard: profile.standard,
      rollnumber: profile.rollnumber,
      division: profile.division,
      dob: profile.dob,
      mobile: profile.mobile,
      email:profile.email,
      profilephoto: profile.profilephoto ? profile.profilephoto.toString('base64') : null
    };

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).json({ error: 'Error fetching profile data' });
  }
};

module.exports = {
  profile
};
