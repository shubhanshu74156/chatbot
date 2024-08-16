const express = require('express');
const { User, Message } = require('../models'); // Import the User model
const bcrypt = require('bcrypt');
const JWTService = require('../JWTService'); // Import JWTService
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtService = new JWTService('your_secret_key', { expiresIn: '1h' });

// User Registration Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    // Create a new user
    const newUser = await User.create({ username, password });
    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token and respond
    const token = jwtService.generateToken({ userId: user.id, username });

    // Fetch all messages from the dat

    return res.json({ token }); // Send token and messages back to the client
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'your_secret_key');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const authenticatedUsername = decodedToken.username;

    const messages = await Message.findAll({
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });

    const processedMessages = messages.map(message => {
      const messageData = message.toJSON();
      const isSent = messageData.user.username === authenticatedUsername;
      return {
        ...messageData,
        sent: isSent,
        displayUsername: isSent ? null : messageData.user.username // Set username to null for sent messages
      };
    });

    res.json(processedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'An error occurred while fetching messages.' });
  }
});

module.exports = router;
