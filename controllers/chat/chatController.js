const { collegePool } = require('../../config/dbconfig'); // Correct import
const CatchAsyncErrors = require('../../middleware/CatchAsyncErrors');
const ErrorHandler = require('../../middleware/ErrorHandler');

const sendSingleChat = CatchAsyncErrors(async (req, res, next) => {
    const { senderId, receiverId } = req.body;
    const user = req.user; // Assuming user is set from some authentication middleware

    if (!senderId || !receiverId) {
        return next(new ErrorHandler('Missing fields', 400));
    }

    const connection = await req.collegePool.getConnection(); // Correct usage of collegePool

    try {
        // Check for existing chat
        const [existingChat] = await connection.query(`
            SELECT * FROM Chats
            WHERE isGroupChat = false
            AND id IN (
                SELECT chatId FROM ChatUsers WHERE userId = ?
            )
            AND id IN (
                SELECT chatId FROM ChatUsers WHERE userId = ?
            )
        `, [senderId, receiverId]);

        if (existingChat.length > 0) {
            res.status(200).json({
                success: true,
                data: existingChat[0],
            });
        } else {
            // Create new chat
            const [result] = await connection.query(`
                INSERT INTO Chats (chatName, isGroupChat, groupAdminId)
                VALUES (?, ?, ?)
            `, ['sender', false, null]);

            const chatId = result.insertId;

            await connection.query(`
                INSERT INTO ChatUsers (chatId, userId, userType)
                VALUES (?, ?, 'sender'), (?, ?, 'receiver')
            `, [chatId, senderId, chatId, receiverId]);

            const [fullChat] = await connection.query(`
                SELECT * FROM Chats WHERE id = ?
            `, [chatId]);

            res.status(200).json({
                success: true,
                data: fullChat[0],
            });
        }
    } catch (error) {
        next(error);
    } finally {
        connection.release();
    }
});

const sendAllChats = CatchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  console.log('User in sendAllChats:', user);  // Debug log

  if (!user || !user.id) {
      return next(new ErrorHandler('User not authenticated', 401));
  }

  const connection = await req.collegePool.getConnection();

  try {
      const [chats] = await connection.query(`
          SELECT c.*, u.username AS groupAdmin
          FROM Chats c
          LEFT JOIN Users u ON c.groupAdminId = u.id
          WHERE c.id IN (
              SELECT chatId FROM ChatUsers WHERE userId = ?
          )
          ORDER BY c.updatedAt DESC
      `, [user.id]);

      if (!chats || chats.length === 0) {
          return res.status(200).json({
              success: true,
              data: [],
              message: 'No chats found for the user'
          });
      }

      res.status(200).json({
          success: true,
          data: chats,
      });
  } catch (error) {
      next(error);
  } finally {
      connection.release();
  }
});

// Send a message
const sendMessage = CatchAsyncErrors(async (req, res, next) => {
  const { student_id, message } = req.body;
  const teacher_code = req.teacherCode; // Get teacher_code from the token

  if (!student_id || !message) {
    return res.status(400).json({ error: 'Student ID and message are required' });
  }

  try {
    // Validate teacher_code and student_id exist
    const validateQuery = `
      SELECT 1 FROM Student WHERE studentid = ? LIMIT 1
    `;
    const [studentExists] = await req.collegePool.query(validateQuery, [student_id]);

    if (studentExists.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Insert message into the chat database
    const insertQuery = `
      INSERT INTO chats (sender_id, receiver_id, message, timestamp)
      VALUES (?, ?, ?, NOW())
    `;
    const [result] = await collegePool.query(insertQuery, [student_id, teacher_code, message]);

    // Emit the message via Socket.IO
    if (req.io) {
      req.io.to(student_id).emit('receiveMessage', {
        senderId: student_id,
        receiverId: teacher_code,
        message,
        timestamp: new Date()
      });
    } else {
      console.error('Socket.IO instance not initialized');
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get message history
const getMessageHistory = CatchAsyncErrors(async (req, res, next) => {
  const { sender_id, receiver_id } = req.query;

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: 'Sender ID and Receiver ID are required' });
  }

  try {
    // Query to get message history between sender_id and receiver_id
    const query = `
      SELECT sender_id, receiver_id, message, timestamp
      FROM chats
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC
    `;

    const [messages] = await req.collegePool.query(query, [sender_id, receiver_id, receiver_id, sender_id]);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = {
  sendMessage,
  getMessageHistory,
 sendAllChats,sendSingleChat
};
