
// const express = require('express');
// const dotenv = require('dotenv');
// const routes = require('./routes/routes');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// dotenv.config();

// app.use(cors());
// app.use(express.json({ limit: '300mb' }));
// app.use(bodyParser.json({ limit: '300mb' }));
// app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

// app.use('/', routes);

// const port = process.env.PORT || 3001;
// app.listen(port, () => console.log(`Server is running on port ${port}`));
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');
const chat = require('./routes/chat');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { handleSetup, handleJoinChat, handleMessage, handleTyping } = require('./controllers/chat/chatController'); // Import Socket.IO handlers

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

app.use(cookieParser()); // Parse cookies before routing
app.use('/', routes);
app.use('/', chat);

const server = http.createServer(app);
const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// Middleware to verify JWT for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user = decoded; // Save the decoded user data in the socket object
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.user);

  handleSetup(socket, io);
  handleJoinChat(socket);
  handleMessage(socket, io);
  handleTyping(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server is running on port ${port}`));
