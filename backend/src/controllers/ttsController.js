const https = require('https');

// In-memory audio buffer cache for sub-millisecond audio playback
const audioCache = new Map();
const MAX_AUDIO_CACHE_SIZE = 500;

// Comprehensive language mapping to Google TTS language identifiers
const GOOGLE_TTS_LANG_MAP = {
  te: 'te',
  'te-in': 'te',
  telugu: 'te',
  hi: 'hi',
  'hi-in': 'hi',
  hindi: 'hi',
  ta: 'ta',
  'ta-in': 'ta',
  tamil: 'ta',
  kn: 'kn',
  'kn-in': 'kn',
  kannada: 'kn',
  bn: 'bn',
  'bn-in': 'bn',
  bengali: 'bn',
  bangla: 'bn',
  mr: 'mr',
  'mr-in': 'mr',
  marathi: 'mr',
  as: 'bn', // Assamese fallback to closest phonetic Bengali TTS on Google engine
  'as-in': 'bn',
  assamese: 'bn',
  gu: 'gu',
  'gu-in': 'gu',
  gujarati: 'gu',
  ml: 'ml',
  'ml-in': 'ml',
  malayalam: 'ml',
  pa: 'pa',
  'pa-in': 'pa',
  punjabi: 'pa',
  ur: 'ur',
  'ur-in': 'ur',
  urdu: 'ur',
  en: 'en',
  'en-in': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  english: 'en'
};

function fetchTTSBuffer(textChunk, targetLang) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(textChunk);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${targetLang}&client=tw-ob`;

    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      },
      timeout: 10000
    };

    const remoteReq = https.get(ttsUrl, requestOptions, (remoteRes) => {
      if (remoteRes.statusCode !== 200) {
        return reject(new Error(`TTS upstream HTTP status: ${remoteRes.statusCode}`));
      }

      const chunks = [];
      remoteRes.on('data', chunk => chunks.push(chunk));
      remoteRes.on('end', () => resolve(Buffer.concat(chunks)));
      remoteRes.on('error', reject);
    });

    remoteReq.on('error', reject);
    remoteReq.on('timeout', () => {
      remoteReq.destroy();
      reject(new Error('TTS upstream request timeout'));
    });
  });
}

function splitTextIntoTTSChunks(text, maxChunkLen = 160) {
  if (text.length <= maxChunkLen) return [text];

  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if (!word) continue;
    if ((currentChunk + ' ' + word).trim().length > maxChunkLen) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.substring(0, maxChunkLen)];
}

class TTSController {
  static async streamAudio(req, res) {
    try {
      const { text, lang = 'en' } = req.query;

      if (!text || typeof text !== 'string') {
        res.statusCode = 400;
        return (typeof res.send === 'function') ? res.send('Text parameter is required') : res.end('Text parameter is required');
      }

      // Clean out markdown characters, bullet points, asterisks, brackets
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText || /^[\s.,!?;:।\-–—]+$/.test(cleanText)) {
        res.statusCode = 400;
        return (typeof res.send === 'function') ? res.send('No valid spoken text provided') : res.end('No valid spoken text provided');
      }

      const normalizedLangKey = (lang || 'en').toLowerCase().trim();
      const prefix = normalizedLangKey.split('-')[0].split('_')[0];
      const targetLang = GOOGLE_TTS_LANG_MAP[normalizedLangKey] || GOOGLE_TTS_LANG_MAP[prefix] || 'en';

      const cacheKey = `${targetLang}:${cleanText}`;

      // Set CORS headers so audio can be streamed anywhere
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      // If cached in memory, return immediately
      if (audioCache.has(cacheKey)) {
        const cachedBuf = audioCache.get(cacheKey);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', cachedBuf.length);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return (typeof res.send === 'function') ? res.send(cachedBuf) : res.end(cachedBuf);
      }

      // Split text into sub-chunks if longer than 160 characters to bypass Google TTS query length limits
      const chunks = splitTextIntoTTSChunks(cleanText, 160);
      const audioBuffers = [];

      for (const chunk of chunks) {
        if (!chunk.trim() || /^[\s.,!?;:।\-–—]+$/.test(chunk.trim())) continue;
        const buf = await fetchTTSBuffer(chunk.trim(), targetLang);
        audioBuffers.push(buf);
      }

      if (audioBuffers.length === 0) {
        res.statusCode = 500;
        return (typeof res.send === 'function') ? res.send('Failed to generate audio') : res.end('Failed to generate audio');
      }

      const fullAudioBuffer = Buffer.concat(audioBuffers);

      // Store in cache
      if (audioCache.size >= MAX_AUDIO_CACHE_SIZE) {
        const firstKey = audioCache.keys().next().value;
        audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, fullAudioBuffer);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', fullAudioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return (typeof res.send === 'function') ? res.send(fullAudioBuffer) : res.end(fullAudioBuffer);
    } catch (e) {
      console.error('[TTSController] Handler error:', e.message);
      res.statusCode = 500;
      return (typeof res.send === 'function') ? res.send('Internal TTS error') : res.end('Internal TTS error');
    }
  }
}

module.exports = TTSController;
