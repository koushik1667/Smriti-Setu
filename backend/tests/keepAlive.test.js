const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const {
  startKeepAlive,
  stopKeepAlive,
  getKeepAliveStatus,
  resolveTargetUrl,
  ping
} = require('../src/services/keepAliveService');

test('keepAliveService - resolveTargetUrl priority test', () => {
  const origKeepAlive = process.env.KEEP_ALIVE_URL;
  const origRenderExt = process.env.RENDER_EXTERNAL_URL;
  const origBackend = process.env.BACKEND_URL;
  const origRender = process.env.RENDER;

  try {
    // 1. Explicit KEEP_ALIVE_URL
    process.env.KEEP_ALIVE_URL = 'https://custom-domain.com/health';
    assert.equal(resolveTargetUrl(), 'https://custom-domain.com/health');

    // 2. RENDER_EXTERNAL_URL
    delete process.env.KEEP_ALIVE_URL;
    process.env.RENDER_EXTERNAL_URL = 'https://my-app.onrender.com';
    assert.equal(resolveTargetUrl(), 'https://my-app.onrender.com/api/health');

    // 3. BACKEND_URL
    delete process.env.RENDER_EXTERNAL_URL;
    process.env.BACKEND_URL = 'https://backend.example.com';
    assert.equal(resolveTargetUrl(), 'https://backend.example.com/api/health');

    // 4. Render environment flag
    delete process.env.BACKEND_URL;
    process.env.RENDER = 'true';
    assert.equal(resolveTargetUrl(), 'https://pharmavision-backend.onrender.com/api/health');
  } finally {
    if (origKeepAlive) process.env.KEEP_ALIVE_URL = origKeepAlive; else delete process.env.KEEP_ALIVE_URL;
    if (origRenderExt) process.env.RENDER_EXTERNAL_URL = origRenderExt; else delete process.env.RENDER_EXTERNAL_URL;
    if (origBackend) process.env.BACKEND_URL = origBackend; else delete process.env.BACKEND_URL;
    if (origRender) process.env.RENDER = origRender; else delete process.env.RENDER;
  }
});

test('keepAliveService - ping success against local HTTP server', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const targetUrl = `http://127.0.0.1:${port}/api/health`;

  try {
    const res = await ping(targetUrl);
    assert.equal(res.statusCode, 200);
    assert.ok(typeof res.latencyMs === 'number');
    assert.ok(res.latencyMs >= 0);
  } finally {
    server.close();
  }
});

test('keepAliveService - ping error gracefully caught and rejected without crash', async () => {
  const invalidUrl = 'http://127.0.0.1:59999/api/health'; // Non-existent port
  await assert.rejects(async () => {
    await ping(invalidUrl);
  });
});

test('keepAliveService - getKeepAliveStatus schema validation', () => {
  const status = getKeepAliveStatus();
  assert.ok(typeof status === 'object');
  assert.ok('enabled' in status);
  assert.ok('totalPings' in status);
  assert.ok('successfulPings' in status);
  assert.ok('failedPings' in status);
  assert.ok('uptimeSeconds' in status);
});
