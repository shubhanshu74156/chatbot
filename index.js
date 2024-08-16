const express = require('express');
const bodyParser = require('body-parser');  
const sequelize = require('./database');
const http = require('http');
const cors = require('cors');
const path = require('path');
const auth = require("./controllers/authenticationApi")
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const JWTService = require('./JWTService');
const jwtService = new JWTService('your_secret_key', { expiresIn: '24h' });
app.use(cors());
app.use(bodyParser.json());
app.use("/apis", auth);
const {Message} = require("./models")

sequelize.sync();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'signup.html'));
});
app.get('/message', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'client.html'));
}); 

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for chat messages
  socket.on('chatMessage', async (token, msg) => {
    try {
      // Verify the JWT token
      const { valid, decoded } = jwtService.verifyToken(token);
      if (!valid) {
        throw new Error('Invalid token');
      }

      // Store the message in the database
      const newMessage = await Message.create({
        content: msg,
        userId: decoded.userId, // Assuming userId is stored in the token
      });

      // Emit the message to the sender with 'sent' flag
      socket.emit('message', {
        id: newMessage.id,
        content: msg,
        username: decoded.username,
        sent: true
      });
      
      // Broadcast the message to all other connected clients
      socket.broadcast.emit('message', {
        id: newMessage.id,
        content: msg,
        username: decoded.username,
        displayUsername: decoded.username,
        sent: false
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', 'Message could not be sent.');
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
