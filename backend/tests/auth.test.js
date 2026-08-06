const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

let server;
let baseUrl;

test.before((t, done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

test.after((t, done) => {
  server.close(done);
});

async function postJson(urlPath, body, headers = {}) {
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getJson(urlPath, headers = {}) {
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers }
  });
  const data = await res.json();
  return { status: res.status, data };
}

test('POST /api/auth/register should create a new user and return JWT token', async () => {
  const payload = {
    name: 'Dr. Jane Smith',
    email: `jane.smith.${Date.now()}@pharmavision.ai`,
    password: 'securePassword123'
  };

  const { status, data } = await postJson('/api/auth/register', payload);

  assert.strictEqual(status, 201);
  assert.strictEqual(data.success, true);
  assert.ok(data.token);
  assert.strictEqual(data.user.name, payload.name);
});

test('POST /api/auth/register should fail on short password', async () => {
  const payload = {
    name: 'Short Pass User',
    email: 'shortpass@example.com',
    password: '123'
  };

  const { status, data } = await postJson('/api/auth/register', payload);

  assert.strictEqual(status, 400);
  assert.strictEqual(data.success, false);
  assert.ok(data.errors.some(e => e.includes('6 characters')));
});

test('POST /api/auth/login should authenticate user and return token', async () => {
  const email = `testlogin.${Date.now()}@example.com`;
  const password = 'mySecretPassword';

  // Register first
  await postJson('/api/auth/register', { name: 'Test User', email, password });

  // Login
  const { status, data } = await postJson('/api/auth/login', { email, password });

  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.token);

  // Test profile endpoint with token
  const profileRes = await getJson('/api/auth/profile', {
    Authorization: `Bearer ${data.token}`
  });

  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileRes.data.user.email, email);
});
