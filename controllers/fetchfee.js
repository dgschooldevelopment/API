const fetchFee = async (req, res) => {
    // Extract studentid from req.body
    const { studentid } = req.query;

    // Check if studentid is provided
    if (!studentid) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        // Query to get fee types and their descriptions
        const feeTypeQuery = `
            SELECT COUNT(DISTINCT tf.fee_type) AS number_of_fee_types,
                   GROUP_CONCAT(DISTINCT tf.fee_type ORDER BY tf.fee_type SEPARATOR ', ') AS fee_types
            FROM fee_transactions ft
            JOIN types_of_fee tf ON ft.type_of_fee = tf.fee_id
            WHERE ft.studentid = ?`;

        // Execute the query
        const [feeTypesRows] = await req.collegePool.query(feeTypeQuery, [studentid]);
        console.log(feeTypesRows);

        // Query to get the total fee paid by fee type with description
        const totalFeeQuery = `
            SELECT tf.fee_type, SUM(ft.fee_paid) AS total_fee_paid
            FROM fee_transactions ft
            JOIN types_of_fee tf ON ft.type_of_fee = tf.fee_id
            WHERE ft.studentid = ?
            GROUP BY tf.fee_type`;

        // Execute the query
        const [totalFeeRows] = await req.collegePool.query(totalFeeQuery, [studentid]);

        // Send the response
        res.json({
            total_fee_details: totalFeeRows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { fetchFee };
