const { generateWithFailover } = require('../services/geminiKeyManager');

const LANG_NAMES = {
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  kn: 'Kannada',
  bn: 'Bengali',
  as: 'Assamese',
  mr: 'Marathi',
  en: 'English'
};

// In-memory LRU-style cache for instant sub-millisecond repeated translations
const translationCache = new Map();
const MAX_CACHE_SIZE = 2000;

class TranslationController {
  static async translateText(req, res) {
    try {
      const { text, targetLang = 'te' } = req.body;

      if (!text || (typeof text !== 'string' && !Array.isArray(text))) {
        return res.status(400).json({ error: 'Text string or array of strings is required' });
      }

      const targetLangName = LANG_NAMES[targetLang] || targetLang;

      // Handle single string
      if (typeof text === 'string') {
        const cacheKey = `${targetLang}:${text.trim()}`;
        if (translationCache.has(cacheKey)) {
          return res.json({
            success: true,
            translatedText: translationCache.get(cacheKey),
            targetLang,
            cached: true
          });
        }

        // If target is English and input looks ASCII, return directly
        if (targetLang === 'en' && /^[\x00-\x7F]*$/.test(text)) {
          return res.json({
            success: true,
            translatedText: text,
            targetLang
          });
        }

        const prompt = `Translate the following medical, pharmaceutical, or everyday health text into natural, accurate ${targetLangName} script. Maintain medical and dosage clarity. Output ONLY the translated text without any explanation, markdown backticks, or extra commentary:
"${text}"`;

        try {
          const result = await generateWithFailover({ prompt });
          const raw = typeof result === 'string' ? result : (result.rawText || String(result.data || ''));
          const cleaned = raw.trim().replace(/^["']|["']$/g, '');

          if (translationCache.size >= MAX_CACHE_SIZE) {
            const firstKey = translationCache.keys().next().value;
            translationCache.delete(firstKey);
          }
          translationCache.set(cacheKey, cleaned);

          return res.json({
            success: true,
            translatedText: cleaned,
            targetLang,
            cached: false
          });
        } catch (aiErr) {
          console.warn('[TranslationController] AI failover error:', aiErr.message);
          return res.json({
            success: true,
            translatedText: text,
            targetLang,
            fallback: true
          });
        }
      }

      // Handle array of strings
      if (Array.isArray(text)) {
        const results = [];
        const toTranslate = [];
        const toTranslateIndices = [];

        text.forEach((item, idx) => {
          const cacheKey = `${targetLang}:${String(item).trim()}`;
          if (translationCache.has(cacheKey)) {
            results[idx] = translationCache.get(cacheKey);
          } else {
            toTranslate.push(String(item));
            toTranslateIndices.push(idx);
          }
        });

        if (toTranslate.length > 0) {
          const prompt = `Translate each item in the following JSON array into natural, accurate ${targetLangName} script. Output ONLY a valid JSON array of translated strings matching the exact same length:
${JSON.stringify(toTranslate)}`;

          try {
            const result = await generateWithFailover({ prompt });
            const raw = typeof result === 'string' ? result : (result.rawText || JSON.stringify(result.data || []));
            const cleanedJson = raw.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanedJson);

            toTranslateIndices.forEach((origIdx, i) => {
              const trans = parsed[i] || toTranslate[i];
              results[origIdx] = trans;
              translationCache.set(`${targetLang}:${toTranslate[i].trim()}`, trans);
            });
          } catch (e) {
            toTranslateIndices.forEach((origIdx, i) => {
              results[origIdx] = toTranslate[i];
            });
          }
        }

        return res.json({
          success: true,
          translatedTexts: results,
          targetLang
        });
      }
    } catch (err) {
      console.error('[TranslationController] Error:', err);
      return res.status(500).json({ error: 'Live translation failed', details: err.message });
    }
  }
}

module.exports = TranslationController;
