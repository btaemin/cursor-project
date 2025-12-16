const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const PORT = process.env.PORT || 8080;

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.username = username;
    
    // Notify all clients about the new user
    io.emit('userJoined', {
      username: username,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    });

    // Send current user list
    io.emit('userList', Array.from(users.values()));
  });

  // Handle chat messages
  socket.on('message', (data) => {
    io.emit('message', {
      username: socket.username || 'Anonymous',
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {
      username: socket.username || 'Anonymous',
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('userLeft', {
        username: username,
        message: `${username} left the chat`,
        timestamp: new Date().toISOString()
      });
      io.emit('userList', Array.from(users.values()));
    }
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

