const { collegesPool } = require('../config/dbconfig');

const homeworkpending = async (req, res) => {
    const { subjectName, standard, division } = req.query; // Access parameters from req.query
  
    if (!subjectName || !standard || !division) {
      return res.status(400).json({ error: 'Missing required parameters (subjectName, standard, division)' });
    }
  
    try {
      const sqlHomework = `
        SELECT 
            h.hid,
            h.homeworkp_id,
            h.subject_id,
            h.date_of_given,
            h.description,
            h.image,
            s.subject_name,
            h.standred,
            h.Division,
            t.tname AS teacher_name,
            h.date_of_creation 
        FROM 
            homework_pending h
        JOIN 
            ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
        JOIN
            teacher t ON h.teacher_id = t.teacher_code
        LEFT JOIN
            homework_submitted hs ON h.homeworkp_id = hs.homeworkpending_id
        WHERE 
            s.subject_name = ? AND h.standred = ? AND h.Division = ? AND hs.homeworkpending_id IS NULL
      `;
  
      const [rowsHomework] = await req.collegePool.query(sqlHomework, [subjectName, standard, division]);

      const homeworkData = rowsHomework.map(row => ({
          hid: row.hid,
          homeworkp_id: row.homeworkp_id,
          subject_id: row.subject_id,
          date_of_given: row.date_of_given,
          description: row.description,
          subject_name: row.subject_name,
          standard: row.standred,
          Division: row.Division,
          teacher_name: row.teacher_name,
          date_of_creation: row.date_of_creation,
          image: `${row.image} `//? [`${row.image}`] : [] // Handle image within mapping
      }));

      res.json(homeworkData);

    } catch (error) {
      console.error('Error fetching homework pending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } 
};

module.exports.homeworkpending = homeworkpending;


/*const { collegesPool } = require('../config/dbconfig');
const { closeDatabaseConnection } = require('../middleware/database');

const homeworkpending = async (req, res) => {
    const { subjectName, standard, Division } = req.query; // Access parameters from req.query

    console.log("Received parameters:", { subjectName, standard, Division }); // Log the received parameters for debugging

    if (!subjectName || !standard || !Division) {
        return res.status(400).json({ error: 'Missing required parameters (subjectName, standard, Division)' });
    }

    try {
        const sqlHomework = `
            SELECT 
                h.hid,
                h.homeworkp_id,
                h.subject_id,
                h.date_of_given,
                h.description,
                h.image,
                s.subject_name,
                h.standred,
                h.Division,
                th.tname AS teacher_name,
                h.date_of_creation 
            FROM 
                homework_pending h
            JOIN 
                ${process.env.DB_NAME}.Subject s ON h.subject_id = s.subject_code_prefixed
            JOIN
                           
                teacher th ON h.teacher_id = th.teacher_code
            LEFT JOIN
                homework_submitted hs ON h.homeworkp_id = hs.homeworkpending_id
            WHERE 
                s.subject_name = ? AND h.standred = ? AND h.Division = ?     AND hs.homeworkpending_id IS NULL;
        `;

        const [results] = await req.collegePool.query(sqlHomework, [subjectName, standard, Division]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        const homeworkData = results.map(row => ({
            hid: row.hid,
            homeworkp_id: row.homeworkp_id,
            subject_id: row.subject_id,
            date_of_given: row.date_of_given,
            description: row.description,
            image: row.image ,
            subject_name: row.subjectName,
            standred: row.standard,
            Division: row.Division,
            teacher_name: row.teacher_name,
            date_of_creation: row.date_of_creation
        }));

        res.json(homeworkData);
    } catch (error) {
        console.error('Error fetching homework pending data:', error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await closeDatabaseConnection(req, res);
    }
};

module.exports = { homeworkpending };
*/


