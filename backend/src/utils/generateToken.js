const crypto = require('crypto');

function generateToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

module.exports = { generateToken };