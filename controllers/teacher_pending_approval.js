
const teacher_pending=async (req, res) => {
    try {
        const { teacher_code ,subject_id, Standard, Division } = req.query;

  
        if (!teacher_code || !Standard || !Division || !subject_id) {
          return res.status(400).json({ error: 'Need All Parameters' });
      }
        const [rows] =await req.collegePool.query(
            `
      SELECT hs.*, s.stand , s.division
      FROM homework_submitted hs
      JOIN ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
      JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
      JOIN teacher t ON st.teacher_code = t.teacher_code
      WHERE t.teacher_code = ? AND hs.approval_status IS NULL AND  s.subject_code_prefixed =? AND s.stand=? AND s.division=?
      `,
      [teacher_code,subject_id, Standard, Division ]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    teacher_pending
};


