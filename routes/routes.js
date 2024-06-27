/*const express = require('express');
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

const { Attendance } = require('../controllers/attendence'); // Ensure Assignment controller is properly defined
const {insertAttendance,fetchStudentAttendance } = require('../controllers/insertfetchAttendance'); 

const { Attendence } = require('../controllers/attendence'); // Ensure Assignment controller is properly defined
const { teacherLogin } = require('../controllers/teacherLogin');
const { teacherDashboard } = require('../controllers/teacher_dashboard');
const { teacherProfile } = require('../controllers/teacherProfile');
const { teacher_classList } = require('../controllers/teacher_classList');
const { chapterPoints } = require('../controllers/chapter_points');
const { DailyUpdates,  getTeacherDailyUpdate } = require('../controllers/teacher_dailyupdate');
const { studentList } = require('../controllers/student_list');



// Endpoint to check the college code
const { addReason } = require('../controllers/addreason');
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
router.get('/attendance', validateCollegeCode, setupDatabaseConnection, Attendance, closeDatabaseConnection);

router.post('/insert',validateCollegeCode, setupDatabaseConnection, insertAttendance, closeDatabaseConnection);
router.get('/fetchattendance', validateCollegeCode, setupDatabaseConnection, fetchStudentAttendance, closeDatabaseConnection);
router.post('/add-reason', validateCollegeCode, setupDatabaseConnection,addReason,closeDatabaseConnection);

// teacherAPI Endpoints

router.post('/loginteacher', validateCollegeCode, setupDatabaseConnection, teacherLogin,closeDatabaseConnection );
router.get('/teacher_dashboard', teacherDashboard);
router.get('/teacher_profile', validateCollegeCode, setupDatabaseConnection, teacherProfile, closeDatabaseConnection );
router.get('/teacher_classlist', validateCollegeCode, setupDatabaseConnection, teacher_classList, closeDatabaseConnection );
router.get('/chapter_points',chapterPoints);
router.post('/teacher_dailyupdate', validateCollegeCode, setupDatabaseConnection, DailyUpdates,closeDatabaseConnection  );  
router.get('/get_teacher_dailyupdate',validateCollegeCode, setupDatabaseConnection, getTeacherDailyUpdate,closeDatabaseConnection );
router.get('/students', validateCollegeCode, setupDatabaseConnection, studentList,closeDatabaseConnection );



module.exports = router;
*/
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
const { unittest, insertUnitTestMarks,getUnitTestIds } = require('../controllers/unittest');
const { report } = require('../controllers/report');
const { submitHomework } = require('../controllers/submithomework');
const { Assignment } = require('../controllers/Assignment'); // Ensure Assignment controller is properly defined
const { Attendance } = require('../controllers/attendence'); // Ensure Assignment controller is properly defined
const { insertAttendance, fetchStudentAttendance } = require('../controllers/insertfetchAttendance');

const { teacherLogin } = require('../controllers/teacherLogin');
const { teacherDashboard } = require('../controllers/teacher_dashboard');
const { teacherProfile } = require('../controllers/teacherProfile');
const { teacher_classList } = require('../controllers/teacher_classList');
const { chapterPoints } = require('../controllers/chapter_points');
const { DailyUpdates, getTeacherDailyUpdate } = require('../controllers/teacher_dailyupdate');
const { studentList } = require('../controllers/student_list');
const { createHomework } = require('../controllers/createHomework');
// Endpoint to check the college code
const { addReason } = require('../controllers/addreason');

const { studentAttendance } = require('../controllers/student_absentee_record');
const { fetchReasonByDate } = require('../controllers/fetchreason');
const { approvalstatus } = require('../controllers/updateapprovalstatus');
const { attendencecount } = require('../controllers/attendencecount');

const { getsubmitted_homework } = require('../controllers/getsubmittedassignment');
const { teacher_pending } = require('../controllers/teacher_pending_approval');
const { viewhomework } = require('../controllers/homeworkview_teacher');
////parent module
const { parentdashboard } = require('../controllers/parents/parentdashboard');
const { parentlogin } = require('../controllers/parents/parentlogin');
const { parentprofile} = require('../controllers/parents/parentprofile');
const { parentstudentlist} = require('../controllers/parents/parentstudentlist');
const { classes } = require('../controllers/class');
const { parentstudentfee} = require('../controllers/parents/parentstudentfee');
const { addfeedetails } = require('../controllers/addfeedetails');
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
//postunittest
router.get('/insertunitmarks', validateCollegeCode, setupDatabaseConnection, fetchReasonByDate, closeDatabaseConnection);

// Endpoint for report
router.get('/report', validateCollegeCode, setupDatabaseConnection, report, closeDatabaseConnection);

// Endpoint for assignment
router.get('/assignment', validateCollegeCode, setupDatabaseConnection, Assignment, closeDatabaseConnection);
//endpoint for attendence
router.get('/attendance', validateCollegeCode, setupDatabaseConnection, Attendance, closeDatabaseConnection);

router.post('/insert', validateCollegeCode, setupDatabaseConnection, insertAttendance, closeDatabaseConnection);
router.get('/fetchattendance', validateCollegeCode, setupDatabaseConnection, fetchStudentAttendance, closeDatabaseConnection);
router.post('/add-reason', validateCollegeCode, setupDatabaseConnection, addReason, closeDatabaseConnection);

// teacherAPI Endpoints

router.post('/loginteacher', validateCollegeCode, setupDatabaseConnection, teacherLogin, closeDatabaseConnection);
router.get('/teacher_dashboard',validateCollegeCode, setupDatabaseConnection, teacherDashboard,  closeDatabaseConnection);
router.get('/teacher_profile', validateCollegeCode, setupDatabaseConnection, teacherProfile, closeDatabaseConnection);
router.get('/teacher_classlist', validateCollegeCode, setupDatabaseConnection, teacher_classList, closeDatabaseConnection);
router.get('/chapter_points', chapterPoints);
router.post('/teacher_dailyupdate', validateCollegeCode, setupDatabaseConnection, DailyUpdates, closeDatabaseConnection);
router.get('/get_teacher_dailyupdate', validateCollegeCode, setupDatabaseConnection, getTeacherDailyUpdate, closeDatabaseConnection);
router.get('/students', validateCollegeCode, setupDatabaseConnection, studentList, closeDatabaseConnection);
router.get('/getsubmitted_homework', validateCollegeCode, setupDatabaseConnection, getsubmitted_homework, closeDatabaseConnection)
router.get('/studentattendence', validateCollegeCode, setupDatabaseConnection, studentAttendance, closeDatabaseConnection);
router.get('/teacher_pending', validateCollegeCode, setupDatabaseConnection, teacher_pending, closeDatabaseConnection);
router.post('/createHomework', validateCollegeCode, setupDatabaseConnection, createHomework, closeDatabaseConnection);
router.get('/viewhomework', validateCollegeCode, setupDatabaseConnection, viewhomework, closeDatabaseConnection);
router.get('/fetchreason', validateCollegeCode, setupDatabaseConnection, fetchReasonByDate, closeDatabaseConnection);
router.get('/fetchclasses', validateCollegeCode, setupDatabaseConnection, classes , closeDatabaseConnection);

router.post('/insertunitmarks', validateCollegeCode, setupDatabaseConnection, insertUnitTestMarks, closeDatabaseConnection);

router.post('/createHomework', validateCollegeCode, setupDatabaseConnection, createHomework, closeDatabaseConnection);

router.post('/approvalstatus', validateCollegeCode, setupDatabaseConnection, approvalstatus, closeDatabaseConnection);
// fetch attendence count of the current date 
router.get('/attendencecount', validateCollegeCode, setupDatabaseConnection, attendencecount, closeDatabaseConnection);
router.post('/addfeedetails', validateCollegeCode, setupDatabaseConnection, addfeedetails, closeDatabaseConnection);
router.get('/getUnitTestname', getUnitTestIds);







///////////////////////////
////parent modeule api endpoint
router.get('/parentdashboard', validateCollegeCode, setupDatabaseConnection, parentdashboard, closeDatabaseConnection);

router.post('/parentlogin', validateCollegeCode, setupDatabaseConnection, parentlogin, closeDatabaseConnection);
router.get('/parentprofile', validateCollegeCode, setupDatabaseConnection, parentprofile, closeDatabaseConnection);
router.get('/parentstudentlist', validateCollegeCode, setupDatabaseConnection, parentstudentlist, closeDatabaseConnection);
router.get('/parentstudentfee', validateCollegeCode, setupDatabaseConnection, parentstudentfee, closeDatabaseConnection);

module.exports = router;

