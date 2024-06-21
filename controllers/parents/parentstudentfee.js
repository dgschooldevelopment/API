

const parentstudentfee = async (req, res) => {
    const { studentid } = req.query; // Assuming studentid is passed as a query parameter

    try {
        // SQL query to fetch student details
        const studentDetailsQuery = `
            SELECT 
                s.Name AS student_name, 
                s.std,
                s.division,
                cf.total_fees,
                SUM(sfd.current_due) AS total_paid_fee
            FROM 
                Student s
            JOIN 
                student_fees_details sfd ON s.studentid = sfd.studentid
            JOIN 
                class_fees cf ON cf.class_id = sfd.class_id
            WHERE 
                s.studentid = ?
            GROUP BY 
                s.Name, s.std, s.division, cf.total_fees;
        `;

        // SQL query to fetch payment history
        const paymentHistoryQuery = `
            SELECT 
                sfd.current_due AS amount_paid,
                sfd.current_due_date AS date,
                sfd.fees_mode
            FROM 
                student_fees_details sfd
            WHERE 
                sfd.studentid = ?
        `;

        // Execute the queries with studentid as parameter
        const [studentDetailsRows] = await req.collegePool.query(studentDetailsQuery, [studentid]);
        const [paymentHistoryRows] = await req.collegePool.query(paymentHistoryQuery, [studentid]);

        // Combine the results
        if (studentDetailsRows.length > 0) {
            const studentDetails = studentDetailsRows[0];
            const total_paid_fee = parseFloat(studentDetails.total_paid_fee || 0); // Convert to float if needed
            const total_fees = parseFloat(studentDetails.total_fees || 0); // Convert to float if needed

            // Calculate total_due_fee
            const total_due_fee = total_fees - total_paid_fee;

            // Format total_due_fee to two decimal places
            studentDetails.total_due_fee = total_due_fee.toFixed(2);

            // Parse payment history JSON string into an array
            studentDetails.payment_history = paymentHistoryRows.map(row => ({
                amount_paid: typeof row.amount_paid === 'number' ? row.amount_paid.toFixed(2) : parseFloat(row.amount_paid).toFixed(2), // Format amount_paid to two decimal places
                date: row.date,
                fees_mode: row.fees_mode
            }));

            // Sending the response with fetched data
            res.json(studentDetails);
        } else {
            res.status(404).json({ error: 'No data found for the given student ID' });
        }
    } catch (error) {
        console.error('Error fetching parent student fees by studentid:', error);
        res.status(500).json({ error: 'Failed to fetch parent student fees' });
    }
};

module.exports = {
    parentstudentfee
};
