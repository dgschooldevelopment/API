const mysql = require('mysql2/promise'); // Assuming you are using mysql2 for database connection

const parentlogin = async (req, res) => {
    const { parent_id, password } = req.body;

    if (!parent_id || !password) {
        return res.status(400).json({ error: 'Parent ID, password, and college code are required parameters' });
    }

    try {
        /*const parentQuery = `
            SELECT 
            p.parent_id,
                p.parentname,
                p.pmobile_no,
                p.profilephoto,
                p.address,
                p.password
            FROM Parents p
            JOIN Student s ON p.parent_id = s.parent_id
            WHERE p.parent_id = ?
              `;*/
              const parentQuery = `
              SELECT 
              p.parent_id,
                  p.parentname,
                                   
                  p.password
              FROM Parents p
                           WHERE p.parent_id = ?
                `;
        const [parentDetails] = await req.collegePool.query(parentQuery, [parent_id]);

        if (parentDetails.length === 0) {
            return res.status(404).json({ error: 'Parent not found or invalid credentials' });
        }

        const parent = parentDetails[0];

        // Check password
        if (parent.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Convert profilephoto to base64
       /* let base64ProfilePhoto = null;
        if (parent.profilephoto) {
            base64ProfilePhoto = parent.profilephoto.toString('base64').replace(/\n/g, '');
        }
*/
        const parentData = { 
            parent_id: parent.parent_id,
            parentname: parent.parentname,
           // pmobile_no: parent.pmobile_no,
           // profilephoto: base64ProfilePhoto,
            //address: parent.address,
        };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: parentData });
    } catch (error) {
        console.error('Error executing query:', error);

        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = {
    parentlogin
};
