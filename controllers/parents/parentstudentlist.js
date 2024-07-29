const parentstudentlist = async (req, res) => {
    const { parent_id } = req.query;

    if (!parent_id) {
        return res.status(400).json({ error: 'Parent ID is a required parameter' });
    }

    try {
        const studentQuery = `
            SELECT 
                studentid,
                roll_no,
                std,
                Name,
                email,
                division
            FROM Student
            WHERE parent_id = ?`;

        const [students] = await req.collegePool.query(studentQuery, [parent_id]);

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for the given parent ID' });
        }

        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { parentstudentlist };
  const { parent_id } = req.query;

  if (!parent_id) {
    return res.status(400).json({ error: 'Parent ID is a required parameter' });
  }

  try {
    // SQL query to fetch students including profile_img (assumed to be BLOB)
    const studentQuery = `
      SELECT 
        studentid,
        roll_no,
        std,
        Name,
        email,
        division,
        profile_img
      FROM Student
      WHERE parent_id = ?`;

    const [rows] = await req.collegePool.query(studentQuery, [parent_id]); // Corrected 'query' to 'studentQuery'

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
  parentstudentlist
};
