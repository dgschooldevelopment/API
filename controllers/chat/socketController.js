const handleSetup = (socket, db, io) => {
    console.log(`New client connected: ${socket.id}`);
  
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  };
  
  const handleJoinChat = (socket, db) => {
    socket.on('joinChat', async (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });
  };
  
  const handleMessage = (socket, db) => {
    socket.on('sendMessage', async (data) => {
      const { chatId, senderId, receiverId, message } = data;
  
      try {
        // Insert message into the database
        await db.query('INSERT INTO messages (chatId, senderId, receiverId, message, timestamp) VALUES (?, ?, ?, ?, NOW())', [chatId, senderId, receiverId, message]);
  
        // Emit message to the receiver
        io.to(receiverId).emit('receiveMessage', data);
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    });
  };
  
  const handleTyping = (socket) => {
    socket.on('typing', (data) => {
      socket.broadcast.to(data.chatId).emit('typing', data);
    });
  };
  
  module.exports = {
    handleSetup,
    handleJoinChat,
    handleMessage,
    handleTyping,
  };
  