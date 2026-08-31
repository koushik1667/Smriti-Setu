const https = require('https');

// In-memory audio buffer cache for instant sub-millisecond audio playback
const audioCache = new Map();
const MAX_AUDIO_CACHE_SIZE = 500;

class TTSController {
  static async streamAudio(req, res) {
    try {
      const { text, lang = 'en' } = req.query;

      if (!text || typeof text !== 'string') {
        return res.status(400).send('Text parameter is required');
      }

      const trimmedText = text.trim();
      const cacheKey = `${lang}:${trimmedText}`;

      // If cached in memory, return immediately
      if (audioCache.has(cacheKey)) {
        const cachedBuf = audioCache.get(cacheKey);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', cachedBuf.length);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cachedBuf);
      }

      // Map language code to Google TTS supported language
      const langMap = {
        te: 'te',
        hi: 'hi',
        ta: 'ta',
        kn: 'kn',
        bn: 'bn',
        mr: 'mr',
        as: 'bn', // Assamese fallback to closest phonetic Bengali TTS if needed
        en: 'en'
      };

      const targetLang = langMap[lang] || 'en';
      const encodedText = encodeURIComponent(trimmedText.substring(0, 200));
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${targetLang}&client=tw-ob`;

      const requestOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      };

      https.get(ttsUrl, requestOptions, (remoteRes) => {
        if (remoteRes.statusCode !== 200) {
          console.warn('[TTSController] Remote status:', remoteRes.statusCode);
          return res.status(remoteRes.statusCode).send('TTS streaming failed');
        }

        const chunks = [];
        remoteRes.on('data', chunk => chunks.push(chunk));
        remoteRes.on('end', () => {
          const buffer = Buffer.concat(chunks);

          // Store in cache
          if (audioCache.size >= MAX_AUDIO_CACHE_SIZE) {
            const firstKey = audioCache.keys().next().value;
            audioCache.delete(firstKey);
          }
          audioCache.set(cacheKey, buffer);

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.send(buffer);
        });
      }).on('error', (err) => {
        console.error('[TTSController] Network error:', err.message);
        res.status(500).send('TTS streaming network error');
      });
    } catch (e) {
      console.error('[TTSController] Handler error:', e);
      res.status(500).send('Internal TTS error');
    }
  }
}

module.exports = TTSController;
