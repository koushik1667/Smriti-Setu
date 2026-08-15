const test = require('node:test');
const assert = require('node:assert');
const { hashPassword, comparePassword, signToken, verifyToken } = require('../src/utils/cryptoUtils');

test('cryptoUtils - Password Hashing & Comparison', async () => {
  const plain = 'SafePassword2026!';
  const hash = await hashPassword(plain);

  assert.ok(hash);
  assert.notStrictEqual(hash, plain);

  const isMatch = await comparePassword(plain, hash);
  assert.strictEqual(isMatch, true);

  const isWrong = await comparePassword('WrongPassword', hash);
  assert.strictEqual(isWrong, false);
});

test('cryptoUtils - JWT Token Signing and Verification', () => {
  const payload = { id: 'usr_123', name: 'Dr. Test', email: 'test@pharmavision.ai' };
  const token = signToken(payload, '1h');

  assert.ok(token);
  assert.strictEqual(typeof token, 'string');
  assert.strictEqual(token.split('.').length, 3);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, payload.id);
  assert.strictEqual(decoded.name, payload.name);
  assert.strictEqual(decoded.email, payload.email);
});

test('cryptoUtils - Rejects Malformed or Tampered Token', () => {
  assert.throws(() => {
    verifyToken('malformed.token');
  });

  const validToken = signToken({ user: 'valid' });
  const tamperedToken = validToken.slice(0, -5) + 'xxxxx';

  assert.throws(() => {
    verifyToken(tamperedToken);
  });
});
