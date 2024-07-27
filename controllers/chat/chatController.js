const { collegePool } = require('../../config/dbconfig');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (socketIo) => {
    io = socketIo;
};

const sendMessage = async (req, res) => {
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
        const [result] = await req.collegePool.query(insertQuery, [ student_id,teacher_code, message]);

        // Emit the message via Socket.IO
        if (io) {
            io.to(student_id).emit('receiveMessage', {
                senderId: student_id,
                receiverId:  teacher_code,
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
};
const getMessageHistory = async (req, res) => {
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
};


module.exports = {
    sendMessage,
    initializeSocket, getMessageHistory // Export the function to initialize Socket.IO
};
