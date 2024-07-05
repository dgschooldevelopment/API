const { collegesPool } = require('../../config/dbconfig');

// Handler function to fetch notices
const fetchNotices = async (req, res) => {
    try {
        // Query to fetch all notices with image
        const query = `
            SELECT
                notice_id,
                image,
                description,
                created_date
            FROM
                notice
        `;
        
        // Execute query
        const [rows] = await req.collegePool.query(query);

        // Process each row to convert image to Base64
        const noticesWithBase64Image = rows.map(row => {
            // Convert image buffer to Base64
            const base64Image = row.image ? Buffer.from(row.image).toString('base64') : null;
            
            return {
                notice_id: row.notice_id,
                image: base64Image, // Base64 encoded image data
                description: row.description,
                created_date: row.created_date
            };
        });

        // Send response with fetched data
        res.status(200).json(noticesWithBase64Image);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    fetchNotices
};
