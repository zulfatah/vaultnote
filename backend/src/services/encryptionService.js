const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

function getSecretKey() {
  const raw = process.env.ENCRYPTION_KEY || '';
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY. Expected 64-char hex (32 bytes).');
  }
  return key;
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedText: encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}

function decrypt({ encryptedText, iv, authTag }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };