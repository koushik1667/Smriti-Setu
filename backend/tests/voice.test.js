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

test('GET /api/tts should return HTTP 200 and audio buffer for regional languages (Telugu)', async () => {
  const res = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent('నమస్కారం! బాగున్నారా?')}&lang=te`);
  assert.strictEqual(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('audio/mpeg'));

  const arrayBuffer = await res.arrayBuffer();
  assert.ok(arrayBuffer.byteLength > 0, 'Audio buffer should not be empty');
});

test('POST /api/voice-agent/chat should return unique contextual responses for Romanized Indian queries', async () => {
  const romanizedQueries = [
    { text: 'naku emmi gurthundatledhu', lang: 'te' },
    { text: 'nenu ipudu em cheyali', lang: 'te' }
  ];

  const responses = [];

  for (const q of romanizedQueries) {
    const res = await fetch(`${baseUrl}/api/voice-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q.text, language: q.lang })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.response && data.response.length > 10);
    assert.strictEqual(data.response.includes(q.text), false, 'Response should not just repeat user query verbatim');
    responses.push(data.response);
  }

  assert.notStrictEqual(responses[0], responses[1], 'Different Romanized queries must receive distinct answers');
});

test('POST /api/therapy/chat should handle therapy session and return audioUrl', async () => {
  const res = await fetch(`${baseUrl}/api/therapy/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I feel a bit anxious today', language: 'en', focusMode: 'calm' })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.response);
  assert.ok(data.audioUrl.includes('/api/tts'));
});
