const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; 

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = user; // Attach user info to request object
    next();
  });
};

// Export the function using CommonJS syntax
module.exports = authenticateToken ;