
const teacher_pending = async (req, res) => {
    
        const { teacher_code, subject_id, Standard, Division } = req.query;


        if (!teacher_code || !Standard || !Division || !subject_id) {
            return res.status(400).json({ error: 'Need All Parameters' });
        }
        const sqlQuery = 
            `
       SELECT
            hs.submitted_id,
            hs.homeworksubmitted_id,
            hs.homeworkpending_id,
            hs.subject_id,
            hs.student_id AS studentid,
            hs.date_of_given_submitted,
            hs.description AS submitted_description,
            hp.date_of_given AS date_of_to_submit,
            hp.description AS pending_description,
            s.subject_name,
            hp.image,
            hs.approval_status,
               hs.review,
            isub.image AS image_data
         
        FROM
           homework_submitted hs
        JOIN
            homework_pending hp ON hs.homeworkpending_id = hp.homeworkp_id
        JOIN
        ${process.env.DB_NAME}.Subject s ON hs.subject_id = s.subject_code_prefixed
        LEFT JOIN
           image_submit isub ON hs.submitted_id = isub.homeworksubmitted_id
        WHERE hp.teacher_id = ? AND hs.approval_status IS NULL AND  s.subject_code_prefixed =? AND s.stand=? AND s.division=?
      `;
      try {
        const [results] = await req.collegePool.query(sqlQuery, [teacher_code,subject_id, Standard, Division ]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        const submissions = {};

        results.forEach(row => {
            if (!submissions[row.submitted_id]) {
                submissions[row.submitted_id] = {
                    submitted_id: row.submitted_id,
                    homeworksubmitted_id: row.homeworksubmitted_id,
                    homeworkpending_id: row.homeworkpending_id,
                    subject_id: row.subject_id,
                    studentid: row.studentid,
                    date_of_given_submitted: row.date_of_given_submitted,
                    submitted_description: row.submitted_description,
                    date_of_to_submit: row.date_of_to_submit,
                    pending_description: row.pending_description,
                    subject_name: row.subject_name,
                    approval_status: row.approval_status,
                    review:row.review,
                    hpimage: row.image ? `${row.image}` : null,
                    hsimages: []
                };
            }

            if (row.image_data) {
                submissions[row.submitted_id].hsimages.push(`${row.image_data}`);
            }
        });

        res.json(Object.values(submissions));
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    } 
};



module.exports = {
    teacher_pending
};


