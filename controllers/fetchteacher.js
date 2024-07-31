const { collegePool, collegesPool } = require('../config/dbconfig');

const fetchTeacher = async (req, res) => {
    const { stand, division } = req.query;

    if (!stand || !division) {
        return res.status(400).json({ message: 'Standard and division are required' });
    }

    try {
        const [subjects] = await collegesPool.query(
            'SELECT subject_code_prefixed FROM Subject WHERE stand = ? AND division = ?',
            'SELECT subject_code_prefixed, subject_name FROM Subject WHERE stand = ? AND division = ?',
            [stand, division]
        );

        const subjectCodes = subjects.map(subject => subject.subject_code_prefixed);

        if (subjects.length === 0) {
            return res.status(404).json({ message: 'No subjects found for the given standard and division' });
        }

        const [teacherCodes] = await req.collegePool.query(
            'SELECT teacher_code FROM subject_teacher WHERE subject_code IN (?)',
        const subjectMap = subjects.reduce((acc, subject) => {
            acc[subject.subject_code_prefixed] = subject.subject_name;
            return acc;
        }, {});

        const [teacherCodes] = await req.collegePool.query(
            'SELECT teacher_code, subject_code FROM subject_teacher WHERE subject_code IN (?)',
            [subjectCodes]
        );

        if (teacherCodes.length === 0) {
            return res.status(404).json({ message: 'No teachers found for the given subjects' });
        }

        const teacherCodesList = teacherCodes.map(tc => tc.teacher_code);

        const [teachers] = await req.collegePool.query(
            'SELECT tname,teacher_code,teacher_profile FROM teacher WHERE teacher_code IN (?)',
            [teacherCodesList]
        );


        const teachersData = teachers.map(teacher => {
            let base64ProfileImg = null;
            if (teacher.teacher_profile) {
              base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
            }
      
            return {
             ...teacher,
             teacher_profile: base64ProfileImg
            };
          });

        res.json(teachersData);



        const subjectCodeMap = teacherCodes.reduce((acc, tc) => {
            acc[tc.teacher_code] = tc.subject_code;
            return acc;
        }, {});

        const [teachers] = await req.collegePool.query(
            'SELECT tname, teacher_code, teacher_profile FROM teacher WHERE teacher_code IN (?)',
            [teacherCodesList]
        );

        const teachersData = teachers.map(teacher => {
            let base64ProfileImg = null;
            if (teacher.teacher_profile) {
                base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
            }

            return {
                ...teacher,
                teacher_profile: base64ProfileImg,
                subject_name: subjectMap[subjectCodeMap[teacher.teacher_code]]
            };
        });

        res.json(teachersData);

    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { fetchTeacher };