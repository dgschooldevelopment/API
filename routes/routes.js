// Define routes using router.get and router.post
/*const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
const { checkCollege } = require('../controllers/collegeController');
const { loginStudent } = require('../controllers/studentController');
const {homeworkpending} = require('../controllers/homeworkpending');
 const {homeworksubmitted}= require('../controllers/homeworksubmitted');
const { evolutionhomework } = require('../controllers/evolutionhomework'); 
const { feedback } = require('../controllers/feedback');  // Ensure this is imported
const { Chapters, ChapterContent } = require('../controllers/chapters');  // Import new controllers
const { subjects, dashboard } = require('../controllers/subdash'); // Import other controllers here
<<<<<<< HEAD
const { profile } = require('../controllers/profile');
const { unittest } = require('../controllers/unittest');
const { report } = require('../controllers/report');
=======
const { profile } = require('../controllers/profile'); // Import other controllers here
// Endpoint to check the college code
router.post('/check', checkCollege);
>>>>>>> b718d5b17207077832f053fc6d902cec4a174425
const { submitHomework } = require('../controllers/submithomework');  
  // Import other controllers here
// Endpoint to check the college code
router.post('/check',checkCollege);
  
// Endpoint for student login
router.post('/login', validateCollegeCode, setupDatabaseConnection , loginStudent,closeDatabaseConnection);
<<<<<<< HEAD
=======

>>>>>>> b718d5b17207077832f053fc6d902cec4a174425
// Endpoint for homework pending
router.get('/homework_pending', validateCollegeCode, setupDatabaseConnection, (req, res, next) => {
    homeworkpending(req, res, next);
  }, closeDatabaseConnection);

  router.get('/evolution-homework', validateCollegeCode, setupDatabaseConnection, evolutionhomework, closeDatabaseConnection);
  router.get('/homework_submitted', validateCollegeCode, setupDatabaseConnection, homeworksubmitted, closeDatabaseConnection);
//post the homework
router.post('/submit_homework', validateCollegeCode, setupDatabaseConnection, submitHomework, closeDatabaseConnection);
 //feeedback
 router.post('/feedback', validateCollegeCode, setupDatabaseConnection, feedback, closeDatabaseConnection);
// for chapters
router.get('/chapters',Chapters);

// Endpoint for chapter content
router.get('/chaptercontaint',  ChapterContent);
//chapters
router.get('/subjects', subjects);

// Endpoint for dashboard
router.get('/dashboard',  dashboard);
// endpoint for profile

router.get('/profile', validateCollegeCode, setupDatabaseConnection, profile, closeDatabaseConnection);
 // for add new unit test table

router.post('/unittest',setupDatabaseConnection,unittest,closeDatabaseConnection,validateCollegeCode,);
router.get('/report',validateCollegeCode,setupDatabaseConnection,report,closeDatabaseConnection);

module.exports = router;*/
const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
const { checkCollege } = require('../controllers/collegeController');
const { loginStudent } = require('../controllers/studentController');
const { homeworkpending } = require('../controllers/homeworkpending');
const { homeworksubmitted } = require('../controllers/homeworksubmitted');
const { evolutionhomework } = require('../controllers/evolutionhomework'); 
const { feedback } = require('../controllers/feedback');
const { Chapters, ChapterContent } = require('../controllers/chapters');
const { subjects, dashboard } = require('../controllers/subdash');
const { profile } = require('../controllers/profile');
const { unittest } = require('../controllers/unittest');
const { report } = require('../controllers/report');
const { submitHomework } = require('../controllers/submithomework');

// Endpoint to check the college code
router.post('/check', checkCollege);

// Endpoint for student login
router.post('/login', validateCollegeCode, setupDatabaseConnection, loginStudent, closeDatabaseConnection);

// Endpoint for homework pending
router.get('/homework_pending', validateCollegeCode, setupDatabaseConnection, homeworkpending, closeDatabaseConnection);

// Endpoint for homework submitted
router.get('/homework_submitted', validateCollegeCode, setupDatabaseConnection, homeworksubmitted, closeDatabaseConnection);

// Endpoint for evolution homework
router.get('/evolution-homework', validateCollegeCode, setupDatabaseConnection, evolutionhomework, closeDatabaseConnection);

// Endpoint to submit homework
router.post('/submit_homework', validateCollegeCode, setupDatabaseConnection, submitHomework, closeDatabaseConnection);

// Endpoint for feedback
router.post('/feedback', validateCollegeCode, setupDatabaseConnection, feedback, closeDatabaseConnection);

// Endpoint for chapters
router.get('/chapters', Chapters);

// Endpoint for chapter content
router.get('/chaptercontent', ChapterContent);

// Endpoint for subjects
router.get('/subjects', subjects);

// Endpoint for dashboard
router.get('/dashboard', dashboard);

// Endpoint for profile
router.get('/profile', validateCollegeCode, setupDatabaseConnection, profile, closeDatabaseConnection);

// Endpoint for adding new unit test table
router.post('/unittest', validateCollegeCode, setupDatabaseConnection, unittest, closeDatabaseConnection);

// Endpoint for report
router.get('/report', validateCollegeCode, setupDatabaseConnection, report, closeDatabaseConnection);

module.exports = router;

