module.exports = {
    validateCollegeCode: (req, res, next) => {
      console.log('Request Body:', req.body); // Log the request body for debugging
  
      if (!req.body || !req.body.college_code ) {
        return res.status(400).json({ error: 'collegeCode is missing in the request body' });
      }
      next();
    }
  };
  
