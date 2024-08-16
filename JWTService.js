// JWTService.js
const jwt = require('jsonwebtoken');

class JWTService {
  constructor(secretKey, options = {}) {
    this.secretKey = secretKey;
    this.options = options;
  }

  // Method to generate a token
  generateToken(payload) {
    return jwt.sign(payload, this.secretKey, { ...this.options });
  }

  // Method to verify a token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return { valid: true, expired: false, decoded };
    } catch (err) {
      return {
        valid: false,
        expired: err.message === 'jwt expired',
        decoded: null,
      };
    }
  }

  // Method to decode a token without verification
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTService;
