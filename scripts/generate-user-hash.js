import crypto from 'node:crypto';

// Extract password argument or fallback to default
const password = process.argv[2] || 'password';
const saltHex = crypto.randomBytes(16).toString('hex');
const hashHex = crypto
  .pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), 100000, 32, 'sha256')
  .toString('hex');

console.log(JSON.stringify({ saltHex, hashHex }, null, 2));
