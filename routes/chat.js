const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat/chatController');
const { sendSingleChat, sendAllChats } = chatController;
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
const {checkUserAuthentication}=require('../middleware/auth.js');

// Apply middleware to routes
router.post(
    '/send-single-chat',
    // Add authentication middleware here
    validateCollegeCode,
    setupDatabaseConnection,
    checkUserAuthentication,
    chatController.sendSingleChat,
    closeDatabaseConnection
  );
  router.get(
    '/send-all-chats',
    validateCollegeCode,
    setupDatabaseConnection,
    checkUserAuthentication,  // This should be before sendAllChats
    chatController.sendAllChats,
    closeDatabaseConnection
  );
  
module.exports = router;
