const crypto = require('crypto');

let bcrypt;
let jwt;

try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = null;
}

try {
  jwt = require('jsonwebtoken');
} catch (e) {
  jwt = null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'pharmavision_super_secret_jwt_key_2026';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[Security Notice] JWT_SECRET is not set in production environment variables! Please set a strong JWT_SECRET in production.');
}

/**
 * Hashes password using bcryptjs or native crypto pbkdf2
 */
async function hashPassword(password) {
  if (bcrypt) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  
  // Native Node.js crypto fallback
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`native:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Compares password against stored hash
 */
async function comparePassword(password, hash) {
  if (hash.startsWith('native:')) {
    const parts = hash.split(':');
    const salt = parts[1];
    const originalHex = parts[2];
    return new Promise((resolve) => {
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(derivedKey.toString('hex') === originalHex);
      });
    });
  }

  if (bcrypt) {
    return await bcrypt.compare(password, hash);
  }

  return false;
}

/**
 * Signs JWT payload using jsonwebtoken or native crypto HMAC-SHA256
 */
function signToken(payload, expiresIn = '7d') {
  if (jwt) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  // Native HMAC-SHA256 JWT generation
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  const fullPayload = { ...payload, exp };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Verifies JWT token
 */
function verifyToken(token) {
  if (jwt) {
    return jwt.verify(token, JWT_SECRET);
  }

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');

  const [b64Header, b64Payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) throw new Error('Invalid token signature');

  const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  JWT_SECRET
};
