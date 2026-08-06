const { GoogleGenerativeAI } = require('@google/generative-ai');
let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  OpenAI = null;
}

const ScanHistory = require('../models/ScanHistory');
const NcbiService = require('../services/ncbiService');

const LANGUAGE_INSTRUCTIONS = {
  en: 'Respond in clear, professional English.',
  hi: 'आप सभी स्पष्टीकरणों, प्राथमिक उपयोग, खुराक, चेतावनियों और दुष्प्रभावों के मानों को स्पष्ट हिंदी (Hindi) में प्रदान करें।',
  te: 'మీరు అన్ని వివరణలు, ప్రాథమిక ఉపయోగాలు, మోతాదు, హెచ్చరికలు మరియు దుష్ప్రభావాల విలువలను స్పష్టమైన తెలుగు (Telugu) లో అందించండి.'
};

const BASE_SYSTEM_PROMPT = `
You are PharmaVision AI, a high-precision medical packaging computer vision assistant.
Analyze the provided image of medication packaging (bottle, blister pack, ointment tube, box, or prescription label).

Examine the text, branding, active ingredients, dosage markings, and warning labels visible in the image.
You MUST reply with ONLY a valid, raw JSON object (no markdown code blocks, no preamble, no backticks).

JSON Structure:
{
  "medicationName": "Exact Brand and Generic Name identified",
  "drugClass": "Pharmacological class (e.g. Beta-blocker, NSAID, Antibiotic, Vitamin, etc.)",
  "mechanismOfAction": "Plain-language explanation of how this drug works in the body",
  "primaryUse": "Clear, plain-language description of what this medication treats",
  "detailedIndications": "Expanded clinical indications — list all conditions and diseases this treats",
  "patientProfile": {
    "typicalPatients": "Description of the typical patient population who use this medication",
    "ageGroups": ["List of suitable age groups e.g. Adults, Children, Elderly"],
    "contraindicated": ["Patient groups who should NOT use this drug"]
  },
  "dosageInstructions": "Standard usage instructions, frequency, and administration advice",
  "dosageForms": ["Available forms e.g. Tablet, Capsule, Syrup, Chewable Tablet"],
  "warnings": ["Array of critical warnings, side effects, precautions"],
  "sideEffects": {
    "common": ["Common side effects"],
    "serious": ["Serious or rare side effects requiring immediate medical attention"]
  },
  "drugInteractions": ["List of significant drug interactions"],
  "storageInstructions": "Storage conditions",
  "pregnancyAndLactation": "Safety information for pregnant or breastfeeding women",
  "activeIngredients": ["List of active pharmaceutical ingredients identified with strengths"],
  "confidenceScore": 0.95,
  "confidenceNotes": "Brief notes on label clarity"
}
`;

async function analyzeMedicine(req, res, next) {
  try {
    const { imageBase64, targetLanguage = 'en' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Base64 image string is required'
      });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const openaiApiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;
    const geminiApiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
    let analysisResult = null;
    let lastError = null;

    const langInstruction = LANGUAGE_INSTRUCTIONS[targetLanguage] || LANGUAGE_INSTRUCTIONS['en'];
    const DYNAMIC_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}\nLANGUAGE REQUIREMENT: ${langInstruction}\nImportant: Translate all text field values in the JSON (primaryUse, mechanismOfAction, detailedIndications, dosageInstructions, warnings, sideEffects, storageInstructions) into ${targetLanguage === 'hi' ? 'Hindi (हिंदी)' : targetLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English'}. Keep medicationName recognizable.`;

    // 1. Try OpenAI Vision API if configured
    if (OpenAI && openaiApiKey && openaiApiKey.trim() !== '') {
      const openaiModels = ['gpt-4o', 'gpt-4o-mini'];
      const openaiClient = new OpenAI({ apiKey: openaiApiKey.trim() });

      for (const modelName of openaiModels) {
        if (analysisResult) break;
        try {
          console.log(`[OpenAI Vision Request] Analyzing packaging (${targetLanguage}) with model: ${modelName}`);
          const response = await openaiClient.chat.completions.create({
            model: modelName,
            messages: [
              { role: 'system', content: DYNAMIC_SYSTEM_PROMPT },
              {
                role: 'user',
                content: [
                  { type: 'text', text: `Analyze this medication packaging image and return the JSON object in ${targetLanguage}.` },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          });

          const content = response.choices[0]?.message?.content;
          if (content) {
            analysisResult = JSON.parse(content);
            console.log(`[OpenAI Vision Success] Successfully analyzed using model: ${modelName}`);
          }
        } catch (openaiErr) {
          console.warn(`[OpenAI Model ${modelName} Warning]:`, openaiErr.message);
          lastError = openaiErr;
        }
      }
    }

    // 2. Dynamic Gemini Vision Processing (Gemini 3.5 & 2.5 Models)
    if (!analysisResult && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash'
      ];

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const imagePart = { inlineData: { data: base64Data, mimeType } };

      for (const modelName of candidateModels) {
        if (analysisResult) break;
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([DYNAMIC_SYSTEM_PROMPT, imagePart]);
          const textResponse = result.response.text();
          const jsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

          analysisResult = JSON.parse(jsonText);
          console.log(`[Gemini Vision AI Success] Analyzed packaging (${targetLanguage}) using model: ${modelName}`);
        } catch (geminiErr) {
          console.warn(`[Gemini Model ${modelName} Warning]:`, geminiErr.message);
          lastError = geminiErr;
        }
      }
    }

    if (!analysisResult) {
      const errMsg = lastError ? lastError.message : 'Gemini AI Vision API key invalid or quota exceeded.';
      return res.status(500).json({
        success: false,
        message: `Gemini AI Vision Analysis failed: ${errMsg}. Please check your GEMINI_API_KEY in backend/.env.`
      });
    }

    // NCBI / NIH PubChem Biomedical Verification & Enrichment
    try {
      const ncbiQuery = (analysisResult.activeIngredients && analysisResult.activeIngredients[0])
        ? analysisResult.activeIngredients[0]
        : analysisResult.medicationName;

      const ncbiData = await NcbiService.searchDrugNCBI(ncbiQuery);
      if (ncbiData) {
        analysisResult.ncbiData = ncbiData;
        console.log(`[NCBI Drug Lookup Success] Enriched biomedical data for: ${ncbiQuery}`);
      }
    } catch (ncbiErr) {
      console.warn('[NCBI Lookup Note]:', ncbiErr.message);
    }

    // Save valid base64 image data URI string for scan history thumbnail
    const thumbnail = `data:${mimeType};base64,${base64Data}`;

    // Save to Scan History
    const userId = req.user ? req.user.id : 'anonymous';
    const historyItem = await ScanHistory.create({
      userId,
      medicationName: analysisResult.medicationName || 'Scanned Medication',
      primaryUse: analysisResult.primaryUse || '',
      dosageInstructions: analysisResult.dosageInstructions || '',
      warnings: analysisResult.warnings || [],
      activeIngredients: analysisResult.activeIngredients || [],
      imageThumbnail: thumbnail,
      rawAnalysis: JSON.stringify(analysisResult)
    });

    return res.json({
      success: true,
      data: analysisResult,
      scanId: historyItem.id
    });
  } catch (error) {
    next(error);
  }
}

async function chatWithMedicineAI(req, res, next) {
  try {
    const { message, medicineContext, targetLanguage = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message string is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let aiResponse = '';

    const langInstruction = LANGUAGE_INSTRUCTIONS[targetLanguage] || LANGUAGE_INSTRUCTIONS['en'];

    const contextName = medicineContext?.medicationName || 'the scanned medication';
    const contextUse = medicineContext?.primaryUse || '';
    const contextDosage = medicineContext?.dosageInstructions || '';
    const contextWarnings = medicineContext?.warnings?.join('; ') || '';
    const activeIngStr = medicineContext?.activeIngredients?.join(', ') || '';

    const prompt = `SYSTEM INSTRUCTION: You are PharmaVision AI, a medical pharmacology assistant answering questions about the patient's scanned medication: "${contextName}".

LANGUAGE REQUIREMENT: ${langInstruction} (Respond to the user in ${targetLanguage === 'hi' ? 'Hindi (हिंदी)' : targetLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English'}).

CONSTRAINTS:
1. You MUST ONLY answer questions directly relevant to "${contextName}" (its usage, dosage: ${contextDosage}, active ingredients: ${activeIngStr}, warnings: ${contextWarnings}, side effects).
2. Keep answers concise (2-3 sentences max).

Patient Question: "${message}"`;

    // 1. Try OpenAI Chat API (gpt-4o-mini)
    if (OpenAI && openaiApiKey && openaiApiKey.trim() !== '') {
      try {
        const openaiClient = new OpenAI({ apiKey: openaiApiKey.trim() });
        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 250,
          temperature: 0.2
        });
        aiResponse = completion.choices[0]?.message?.content || '';
      } catch (openaiErr) {
        console.warn('[OpenAI Chat Warning]:', openaiErr.message);
      }
    }

    // 2. Try Gemini Chat API Fallback
    if (!aiResponse && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
      for (const modelName of candidateModels) {
        if (aiResponse) break;
        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
          });
          const r = await model.generateContent(prompt);
          aiResponse = r.response.text();
        } catch (err) {
          console.warn(`[Gemini Chat Model ${modelName} Warning]:`, err.message);
        }
      }
    }

    // 3. Fallback Response
    if (!aiResponse) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (targetLanguage === 'hi') {
        aiResponse = `आपकी दवा ${contextName} के संबंध में: ${contextUse ? contextUse + '. ' : ''}खुराक: ${contextDosage || 'लेबल देखें'}। यदि आपका कोई विशिष्ट प्रश्न है तो कृपया पूछें।`;
      } else if (targetLanguage === 'te') {
        aiResponse = `మీ మందు ${contextName} గురించి: ${contextUse ? contextUse + '. ' : ''}మోతాదు: ${contextDosage || 'లేబుల్ చూడండి'}. దయచేసి ఏదైనా నిర్దిష్ట ప్రశ్న ఉంటే అడగండి.`;
      } else {
        aiResponse = `Regarding your scanned medication ${contextName}: ${contextUse ? contextUse + '. ' : ''}Dosage advice: ${contextDosage || 'Refer to package label'}. Please ask any specific question about taking this drug safely.`;
      }
    }

    return res.json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeMedicine,
  chatWithMedicineAI
};
