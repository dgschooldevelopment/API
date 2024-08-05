const postnotice = async (req, res) => {
    const { image, description, created_date, teacher_code } = req.body;
  
    if (!image || !description || !created_date || !teacher_code) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const query = "INSERT INTO notice (image, description, created_date, teacher_code) VALUES (?, ?, ?, ?)";
      const values = [image, description, created_date, teacher_code];
  
      const [result] = await req.collegePool.query(query, values);
   
      res.status(201).json({ message: 'Notice created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create notice', details: error.message });
    }
  };
  
  
  module.exports = { postnotice };