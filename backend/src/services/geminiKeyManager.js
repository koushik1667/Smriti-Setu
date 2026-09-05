const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Extracts and sanitizes an array of Gemini API keys from .env or headers.
 * Supports comma-separated keys (e.g. GEMINI_API_KEY=key1,key2,key3)
 */
function getGeminiApiKeys(overrideKey = null) {
  const raw = overrideKey || process.env.GEMINI_API_KEY || '';
  if (!raw || raw === 'your_gemini_api_key_here') return [];

  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0 && k !== 'your_gemini_api_key_here');
}

/**
 * Executes a Gemini request with automatic Multi-Key Pooling and Multi-Model Failover.
 * If Key 1 hits a 429 (Quota Exceeded / Rate Limit), Key 2 automatically kicks in seamlessly.
 */
async function generateWithFailover({ prompt, parts = [], overrideKey = null, generationConfig = {} }) {
  const keys = getGeminiApiKeys(overrideKey);
  if (keys.length === 0) {
    throw new Error('No valid GEMINI_API_KEY configured in backend/.env.');
  }

  const customModel = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL.trim()] : [];
  const candidateModels = [
    ...customModel,
    'gemini-3.6-flash',
    'gemini-3.6',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  // Deduplicate in case customModel matches one of the defaults
  const uniqueModels = [...new Set(candidateModels)];


  let lastError = null;

  // Key Pool Loop: Tries Key 1 -> Key 2 -> Key 3...
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const currentKey = keys[keyIdx];
    const genAI = new GoogleGenerativeAI(currentKey);

    // Model Loop: Tries available candidate models on this key
    for (const modelName of uniqueModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig
        });

        const contents = parts.length > 0 ? [prompt, ...parts] : prompt;
        const result = await model.generateContent(contents);
        const textResponse = result.response.text();
        const jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData = null;
        try {
          parsedData = JSON.parse(jsonText);
        } catch (e) {
          parsedData = textResponse;
        }

        console.log(`[Gemini Multi-Key Success] Request fulfilled with Key #${keyIdx + 1} (${modelName})`);
        return {
          data: parsedData,
          rawText: textResponse,
          modelUsed: modelName,
          keyIndexUsed: keyIdx + 1
        };
      } catch (err) {
        console.warn(`[Gemini Failover Alert] Key #${keyIdx + 1} / Model ${modelName} notice: ${err.message}`);
        lastError = err;

        // If rate limit / quota exceeded, immediately rotate to next API key in the pool!
        if (
          err.message.includes('429') ||
          err.message.includes('quota') ||
          err.message.includes('ResourceExhausted') ||
          err.message.includes('RESOURCE_EXHAUSTED')
        ) {
          console.log(`[Key Pool Rotation] Key #${keyIdx + 1} quota limit reached. Automatically rotating to Key #${keyIdx + 2}...`);
          break; // Break model loop, jump immediately to next key
        }
      }
    }
  }

  throw lastError || new Error('All Gemini API keys in the key pool exhausted.');
}

module.exports = {
  getGeminiApiKeys,
  generateWithFailover
};
