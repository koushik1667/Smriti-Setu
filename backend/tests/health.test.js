const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

test('GET /health & /api/health return 200 with keepAlive diagnostics', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. Test /api/health
    const res1 = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.status, 'healthy');
    assert.ok('keepAlive' in data1);
    assert.ok('timestamp' in data1);
    assert.ok('uptimeSeconds' in data1);

    // 2. Test /health
    const res2 = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.status, 'healthy');
    assert.ok('keepAlive' in data2);
  } finally {
    server.close();
  }
});
