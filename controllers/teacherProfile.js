const teacherProfile= async (req, res) => {
    const { teacher_code, college_code } = req.query;
    try {

        const teacherQuery=`SELECT 
        teacher_code, tname, tpassword, mobileno, teacher_email, teacher_profile, date_of_birth, teacher_education 
    FROM 
        teacher t
        JOIN 
        ${process.env.DB_NAME}.College c ON t.college_code= c.college_code
    WHERE 
        t.teacher_code = ?` 
    ;
    

    const subjectList = `
    SELECT s.subject_name
    FROM colleges.Subject s
    JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
    WHERE st.teacher_code = ?
`;
        const [teacherDetails] = await req.collegePool.query(teacherQuery,[teacher_code]);
        const [subjects] = await req.collegePool.query(subjectList, [teacher_code]);

        if (teacherDetails.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacher = teacherDetails[0];

        let base64ProfileImg = null;
        if (teacher.teacher_profile) {
            base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
        }
     
        const teacherData = { 
            ...teacher, 
            teacher_profile: base64ProfileImg,
            subjects: subjects.map(subject => subject.subject_name) 
        };


        return res.status(200).json({teacherData});
    } catch (error) {
        console.error('Error executing query:', error);

        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    teacherProfile
};
