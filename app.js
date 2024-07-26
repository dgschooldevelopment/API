
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
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { initializeSocket } = require('./controllers/chat/chatController'); // Import

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

app.use('/', routes);

const server = http.createServer(app);
const io = socketIo(server);

// Initialize Socket.IO in your chat controller
initializeSocket(io);

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

  socket.on('message', (message) => {
    console.log('Received message:', message);
    io.emit('message', message); // Broadcast message to all clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server is running on port ${port}`));
