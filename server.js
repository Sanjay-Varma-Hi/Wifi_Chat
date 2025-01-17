const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ username, avatar }) => {
    users.push({ id: socket.id, username, avatar });
    socket.username = username;
    socket.avatar = avatar;
    const timestamp = new Date().toLocaleTimeString();
    io.emit('message', { username: 'System', text: `${username} joined the chat`, timestamp });
  });
  
  socket.on('chatMessage', (text) => {
    const timestamp = new Date().toLocaleTimeString();
    io.emit('message', { username: socket.username, text, avatar: socket.avatar, timestamp });
  });
  
  socket.on('typing', () => {
    socket.broadcast.emit('typing');
  });
  
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });
  

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      io.emit('message', { username: 'System', text: `${user.username} has left the chat` });
      users = users.filter((u) => u.id !== socket.id);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
