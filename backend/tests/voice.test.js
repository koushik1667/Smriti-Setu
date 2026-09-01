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

test('POST /api/voice-agent/chat should return unique contextual responses for different questions', async () => {
  const questions = [
    { text: 'నేను ఇప్పుడు నీళ్లు తాగాలా?', lang: 'te' },
    { text: 'నాకు తలనొప్పిగా ఉంది, ఏమి చేయాలి?', lang: 'te' },
    { text: 'ज्ञापकशक्ति बढ़ाने के लिए क्या करें?', lang: 'hi' },
    { text: 'What is my medicine schedule for morning?', lang: 'en' }
  ];

  const responses = [];

  for (const q of questions) {
    const res = await fetch(`${baseUrl}/api/voice-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q.text, language: q.lang })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.response && data.response.length > 0);
    responses.push(data.response);
  }

  // Ensure responses are not all identical
  const uniqueResponses = new Set(responses);
  assert.ok(uniqueResponses.size > 1, 'Voice assistant should provide unique responses for different topics');
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
