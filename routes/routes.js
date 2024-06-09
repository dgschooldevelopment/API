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
const { Assignment } = require('../controllers/Assignment'); // Ensure Assignment controller is properly defined
const { Attendence } = require('../controllers/attendence'); // Ensure Assignment controller is properly defined
const { teacherLogin } = require('../controllers/teacherLogin');
const { teacherDashboard } = require('../controllers/teacher_dashboard');
const { teacherProfile } = require('../controllers/teacherProfile');
const { teacher_classList } = require('../controllers/teacher_classList');
const { chapterPoints } = require('../controllers/chapter_points');
const { DailyUpdates,  getTeacherDailyUpdate } = require('../controllers/teacher_dailyupdate');
const { studentList } = require('../controllers/student_list');


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

// Endpoint for assignment
router.get('/assignment', validateCollegeCode, setupDatabaseConnection, Assignment, closeDatabaseConnection);
//endpoint for attendence

// teacherAPI Endpoints

router.post('/loginteacher', validateCollegeCode, setupDatabaseConnection, teacherLogin,closeDatabaseConnection );
router.get('/teacher_dashboard', teacherDashboard);
router.get('/teacher_profile', validateCollegeCode, setupDatabaseConnection, teacherProfile, closeDatabaseConnection );
router.get('/teacher_classlist', validateCollegeCode, setupDatabaseConnection, teacher_classList, closeDatabaseConnection );
router.get('/chapter_points',chapterPoints);
router.post('/teacher_dailyupdate', validateCollegeCode, setupDatabaseConnection, DailyUpdates,closeDatabaseConnection  );  
router.get('/get_teacher_dailyupdate',validateCollegeCode, setupDatabaseConnection, getTeacherDailyUpdate,closeDatabaseConnection );
router.get('/student', validateCollegeCode, setupDatabaseConnection, studentList,closeDatabaseConnection );



module.exports = router;
