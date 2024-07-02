


 

 /* const { collegesPool } = require('../config/dbconfig');

  const loginStudent = async (req, res) => {
      const { studentId, password } = req.body;
  
      if (!studentId || !password) {
          return res.status(400).json({ error: 'studentId and password are required parameters' });
      }
  
      try {
          const studentSql = `
              SELECT 
                  s.studentid, 
                  s.Name, 
                  s.std, 
                  s.roll_no, 
                  s.division, 
                  s.stud_dob, 
                  s.mobile, 
                  s.password, 
                  c.college_code,
                  s.profile_img 
               
          
              FROM 
               Student s
                  JOIN 
                  ${process.env.DB_NAME}.College c ON s.college_id = c.CollegeID
              WHERE 
                  s.studentid = ?
          `;
  
          const [studentResults] = await req.collegePool.query(studentSql, [studentId]);
  
          if (studentResults.length === 0) {
              return res.status(404).json({ error: 'Student not found' });
          }
  
          const student = studentResults[0];
  
          if (student.password !== password) {
              return res.status(401).json({ error: 'Invalid password' });
          }
  
          let base64ProfileImg = null;
          if (student.profile_img) {
              base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
          }
       
          const studentData = { ...student, profile_img: base64ProfileImg };
  
          return res.status(200).json({ success: true, message: 'Successfully logged in', data: studentData });
      } catch (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }
  };
  
  module.exports = {
      loginStudent
  };
*/
/*const { collegesPool } = require('../config/dbconfig');

const loginStudent = async (req, res) => {
    const { studentId, password } = req.query;

    if (!studentId || !password) {
        return res.status(400).json({ error: 'studentId and password are required parameters' });
    }

    try {
        const studentSql = `
            SELECT 
                s.studentid, 
                s.Name, 
                s.std, 
                s.roll_no, 
                s.division, 
                s.stud_dob, 
                s.mobile, 
                s.password, 

                c.college_code,
                s.profile_img 
             
        

              s.profile_img

            FROM 
             Student s
                JOIN 
                ${process.env.DB_NAME}.College c ON s.college_id = c.CollegeID
            WHERE 
                s.studentid = ?
        `;

        const [studentResults] = await req.collegePool.query(studentSql, [studentId]);

        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentResults[0];

        if (student.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let base64ProfileImg = null;
        if (student.profile_img) {
            base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
        }


        const studentData = { ...student, profile_img: base64ProfileImg };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: studentData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    loginStudent
};*/


  const { collegesPool } = require('../config/dbconfig');

const loginStudent = async (req, res) => {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
        return res.status(400).json({ error: 'studentId and password are required parameters' });
    }

    try {
        const studentSql = `
            SELECT 
                s.studentid, 
                s.Name, 
                s.std, 
                s.roll_no, 
                s.division, 
                s.stud_dob, 
                s.mobile,
                s.email, 
                s.password, 
                c.college_code,
                s.profile_img 
             
        
            FROM 
             Student s
                JOIN 
                ${process.env.DB_NAME}.College c ON s.college_id = c.CollegeID
            WHERE 



                 BINARY s.studentid = BINARY ?

 


   




        `;


        const [studentResults] = await req.collegePool.query(studentSql, [studentId]);

        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentResults[0];

        if (student.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let base64ProfileImg = null;
        if (student.profile_img) {
            base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
        }
     
        const studentData = { ...student, profile_img: base64ProfileImg };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: studentData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    loginStudent
};

