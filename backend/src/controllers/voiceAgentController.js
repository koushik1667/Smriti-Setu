const { generateWithFailover } = require('../services/geminiKeyManager');

const NORM_LANG_MAP = {
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
  as: 'as',
  'as-in': 'as',
  assamese: 'as',
  en: 'en',
  'en-in': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  english: 'en'
};

function normalizeLanguageCode(lang) {
  if (!lang || typeof lang !== 'string') return 'en';
  const clean = lang.toLowerCase().trim();
  const prefix = clean.split('-')[0].split('_')[0];
  return NORM_LANG_MAP[clean] || NORM_LANG_MAP[prefix] || 'en';
}

const LANG_MAP = {
  te: { name: 'Telugu', fallback: 'నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్‌ని. మీ ఆరోగ్యం, మందులు లేదా జ్ఞాపకశక్తి గురించి నన్ను ఏదైనా అడగవచ్చు.' },
  hi: { name: 'Hindi', fallback: 'नमस्ते! मैं आपका वॉइस असिस्टेंट हूँ। अपनी सेहत, दवाओं या स्मरण खेल के बारे में मुझसे कुछ भी पूछें।' },
  ta: { name: 'Tamil', fallback: 'வணக்கம்! நான் உங்கள் குரல் உதவியாளர். உங்கள் உடல்நலம், மருந்துகள் பற்றி என்னிடம் கேட்கலாம்.' },
  kn: { name: 'Kannada', fallback: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಆರೋಗ್ಯ, ಔಷಧಿಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಬಹುದು.' },
  bn: { name: 'Bengali', fallback: 'নমস্কার! আমি আপনার ভয়েস সহকারী। আপনার স্বাস্থ্য ও ওষুধের বিষয়ে আমাকে জিজ্ঞাসা করতে পারেন।' },
  as: { name: 'Assamese', fallback: 'নমস্কাৰ! মই আপোনাৰ মাত সহায়ক। আপোনাৰ স্বাস্থ্য আৰু ঔষধৰ বিষয়ে মোক সুধিব পাৰে।' },
  mr: { name: 'Marathi', fallback: 'नमस्कार! मी तुमचा व्हॉइस सहाय्यक आहे. तुमच्या आरोग्याबद्दल किंवा औषधांबद्दल मला काहीही विचारा.' },
  en: { name: 'English', fallback: 'Hello! I am your AI Voice Assistant. You can ask me about your medications, hydration, or health routines.' }
};

const DIRECT_SWITCH_RESPONSES = {
  te: 'నమస్కారం! నేను మీతో తెలుగులో మాట్లాడటానికి సిద్ధంగా ఉన్నాను. మీ ఆరోగ్యం, మంచినీళ్లు లేదా మందుల గురించి నన్ను ఏదైనా అడగండి.',
  hi: 'नमस्ते! मैं आपसे हिंदी में बात करने के लिए तैयार हूँ। अपनी सेहत या दवाओं के बारे में मुझसे कुछ भी पूछें।',
  ta: 'வணக்கம்! நான் உங்களுடன் தமிழில் பேச தயாராக உள்ளேன். உங்கள் உடல்நலம் பற்றி என்னிடம் கேளுங்கள்.',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.',
  bn: 'নমস্কার! আমি বাংলায় কথা বলতে প্রস্তুত। আপনার স্বাস্থ্য সম্পর্কে আমাকে জিজ্ঞাসা করুন।',
  mr: 'नमस्कार! मी तुमच्याशी मराठीत बोलायला तयार आहे. मला काहीही विचारा.',
  as: 'নমস্কাৰ! মই অসমীয়াত কথা পাতিবলৈ সাজু। মোক আপোনাৰ স্বাস্থ্যৰ বিষয়ে সোধক।',
  en: 'Hello! I am ready to speak with you in English. How can I assist you today?'
};

class VoiceAgentController {
  static async handleVoiceChat(req, res) {
    try {
      const { message, language = 'en', context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const trimmed = message.trim();
      const lower = trimmed.toLowerCase();

      // Normalize client-supplied language code
      let resolvedLang = normalizeLanguageCode(language);

      // ─── 1. Automatic Language Intent & Direct Switch ────────────────
      if (lower === 'te' || lower === 'telugu' || lower === 'in telugu' || lower === 'speak in telugu' || lower === 'talk in telugu' || lower === 'తెలుగు' || lower.includes('తెలుగులో')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.te,
          language: 'te',
          spokenLanguage: 'Telugu',
          switchedLanguage: 'te'
        });
      }

      if (lower === 'hi' || lower === 'hindi' || lower === 'in hindi' || lower === 'speak in hindi' || lower === 'talk in hindi' || lower === 'हिंदी' || lower === 'हिन्दी' || lower.includes('हिंदी में')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.hi,
          language: 'hi',
          spokenLanguage: 'Hindi',
          switchedLanguage: 'hi'
        });
      }

      if (lower === 'ta' || lower === 'tamil' || lower === 'in tamil' || lower === 'speak in tamil' || lower === 'talk in tamil' || lower === 'தமிழ்' || lower.includes('தமிழில்')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.ta,
          language: 'ta',
          spokenLanguage: 'Tamil',
          switchedLanguage: 'ta'
        });
      }

      if (lower === 'kn' || lower === 'kannada' || lower === 'in kannada' || lower === 'speak in kannada' || lower === 'talk in kannada' || lower === 'కನ್ನಡ' || lower.includes('కನ್ನಡದಲ್ಲಿ')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.kn,
          language: 'kn',
          spokenLanguage: 'Kannada',
          switchedLanguage: 'kn'
        });
      }

      if (lower === 'bn' || lower === 'bengali' || lower === 'in bengali' || lower === 'speak in bengali' || lower === 'talk in bengali' || lower === 'বাংলা' || lower.includes('বাংলায়')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.bn,
          language: 'bn',
          spokenLanguage: 'Bengali',
          switchedLanguage: 'bn'
        });
      }

      if (lower === 'mr' || lower === 'marathi' || lower === 'in marathi' || lower === 'speak in marathi' || lower === 'talk in marathi' || lower === 'मराठी' || lower.includes('मराठीत')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.mr,
          language: 'mr',
          spokenLanguage: 'Marathi',
          switchedLanguage: 'mr'
        });
      }

      if (lower === 'as' || lower === 'assamese' || lower === 'in assamese' || lower === 'speak in assamese' || lower === 'talk in assamese' || lower === 'অসমীয়া' || lower.includes('অসমীয়াত')) {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.as,
          language: 'as',
          spokenLanguage: 'Assamese',
          switchedLanguage: 'as'
        });
      }

      if (lower === 'en' || lower === 'english' || lower === 'in english' || lower === 'speak in english' || lower === 'talk in english') {
        return res.json({
          success: true,
          response: DIRECT_SWITCH_RESPONSES.en,
          language: 'en',
          spokenLanguage: 'English',
          switchedLanguage: 'en'
        });
      }

      // ─── 2. Script Detection (Respects Selected Language) ──────────────
      if (resolvedLang === 'en') {
        if (/[\u0C00-\u0C7F]/.test(message)) {
          resolvedLang = 'te';
        } else if (/[\u0B80-\u0BFF]/.test(message)) {
          resolvedLang = 'ta';
        } else if (/[\u0C80-\u0CFF]/.test(message)) {
          resolvedLang = 'kn';
        } else if (/[\u0980-\u09FF]/.test(message)) {
          if (/[\u09F0\u09F1]/.test(message) || /(নমস্কাৰ|আছোঁ|কেনে|খাওক|পানী|হ’ল|কি কি|আপোনাৰ|সহায়ক)/.test(message)) {
            resolvedLang = 'as';
          } else {
            resolvedLang = 'bn';
          }
        } else if (/[\u0900-\u097F]/.test(message)) {
          if (/[\u0933]/.test(message) || /(आहे|नाही|कसे|तुम्ही|काय|पाणी|औषध|नमस्कार|व्हॉइस|सहाय्यक)/.test(message)) {
            resolvedLang = 'mr';
          } else {
            resolvedLang = 'hi';
          }
        }
      }

      const langInfo = LANG_MAP[resolvedLang] || LANG_MAP.en;
      const targetLangName = langInfo.name;

      // ─── 3. AI Prompt with Multilingual & Romanized Transliteration Support ────────
      const systemPrompt = `You are "Sanjeevani AI" (సంజీవని / संजीवनी / சஞ்சீவனி / సంಜೀವಿನಿ / నాకు / সঞ্জীৱনী / संजीवनी), an extraordinarily empathetic, wise voice companion for elderly patients in India.

Selected Language: ${targetLangName}.
User Message: "${message}"

CRITICAL MANDATORY INSTRUCTIONS:
1. The user message may be written in native script OR Romanized transliteration (e.g. "naku emmi gurthundatledhu" = I don't remember anything, "nenu ipudu em cheyali" = What should I do now?, "kya karu" = What should I do?).
2. Understand the exact intent and emotional situation of the user, whether written in native script or English letters.
3. Respond 100% in pure ${targetLangName} native script (${targetLangName} language only).
4. Provide a direct, compassionate, highly helpful 2-sentence response addressing their exact question.
5. DO NOT use markdown asterisks (*, **), bullet points, numbers, or symbols.`;

      try {
        const aiResponse = await generateWithFailover({
          prompt: systemPrompt,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.6
          }
        });

        const raw = typeof aiResponse === 'string' ? aiResponse : (aiResponse.rawText || String(aiResponse.data || ''));
        const cleanResponse = raw
          .replace(/[*_#`~[\]]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanResponse && cleanResponse.length > 3) {
          return res.json({
            success: true,
            response: cleanResponse,
            language: resolvedLang,
            spokenLanguage: targetLangName,
            switchedLanguage: resolvedLang !== normalizeLanguageCode(language) ? resolvedLang : undefined
          });
        }
      } catch (aiErr) {
        console.warn('[VoiceAgentController] AI response fallback triggered:', aiErr.message);
      }

      // ─── 4. High-Precision Smart Intent Fallback Engine ────────────────
      const lowerMsg = message.toLowerCase();
      let fallbackMsg = '';

      // A. Memory Loss / Forgetting / "gurthundatledhu" / "gurthu" / "yaad" / "forget" / "marachi"
      if (
        lowerMsg.includes('gurthundatledhu') ||
        lowerMsg.includes('gurthu') ||
        lowerMsg.includes('marachi') ||
        lowerMsg.includes('forget') ||
        lowerMsg.includes('remember') ||
        lowerMsg.includes('yaad') ||
        lowerMsg.includes('bhool') ||
        lowerMsg.includes('జ్ఞాపక') ||
        lowerMsg.includes('గుర్తు') ||
        lowerMsg.includes('మరచి') ||
        lowerMsg.includes('याद') ||
        lowerMsg.includes('भूल')
      ) {
        if (resolvedLang === 'te') fallbackMsg = 'కంగారు పడకండి అండీ. ప్రశాంతంగా ఒక చోట కూర్చుని నిదానంగా ఆలోచించండి. మనస్సు ప్రశాంతంగా ఉండటానికి మన యాప్‌లోని మెమరీ ఆటలు ఆడటం లేదా మంచి సంగీతం వినడం చాలా సహాయపడుతుంది.';
        else if (resolvedLang === 'hi') fallbackMsg = 'घबराएं नहीं जी। शांत होकर एक जगह बैठें और गहरी सांस लें। दिमाग को शांत रखने के लिए हमारे स्मरण खेल खेलें और अपनों से बात करें।';
        else if (resolvedLang === 'ta') fallbackMsg = 'பதற்றமடைய வேண்டாம். அமைதியாக அமர்ந்து மெதுவாக மூச்சை உள்ளிழுக்கவும். நினைவாற்றலை அதிகரிக்க நமது நினைவு விளையாட்டுகளை விளையாடுங்கள்.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ಆತಂಕಪಡಬೇಡಿ. ಪ್ರಶಾಂತವಾಗಿ ಕುಳಿತು ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ. ಮನಸ್ಸು ಚುರುಕಾಗಿಸಲು ನಮ್ಮ ನೆನಪಿನ ಆಟಗಳನ್ನು ಆಡಿ.';
        else if (resolvedLang === 'bn') fallbackMsg = 'চিন্তা করবেন না। শান্ত হয়ে বসুন এবং ধীরে ধীরে শ্বাস নিন। আমাদের মেমোরি গেম খেলে মন সতেজ রাখুন।';
        else if (resolvedLang === 'as') fallbackMsg = 'চিন্তা নকৰিব। শান্ত হৈ বহক আৰু লাহে লাহে উশাহ লওক। স্মৃতিশক্তি চৰ্চাৰ বাবে মেম’ৰী গেম খেলক।';
        else if (resolvedLang === 'mr') fallbackMsg = 'घाबरू नका. शांत बसा आणि दीर्घ श्वास घ्या. स्मरणशक्ती ताजी ठेवण्यासाठी आमचे मेमरी खेळ खेळा.';
        else fallbackMsg = 'Do not worry at all. Sit back comfortably and take a slow, deep breath. Playing memory games can help gently relax and focus your mind.';
      }
      // B. What to do now? / "em cheyali" / "kya karu" / "what to do" / "what should i do"
      else if (
        lowerMsg.includes('em cheyali') ||
        lowerMsg.includes('em cheyyali') ||
        lowerMsg.includes('em cheyala') ||
        lowerMsg.includes('kya karu') ||
        lowerMsg.includes('kya kare') ||
        lowerMsg.includes('what to do') ||
        lowerMsg.includes('what should i do') ||
        lowerMsg.includes('ఏం చేయాలి') ||
        lowerMsg.includes('ఏమి చేయాలి') ||
        lowerMsg.includes('क्या करें')
      ) {
        if (resolvedLang === 'te') fallbackMsg = 'మీరు ప్రశాంతంగా కూర్చుని కొద్దిగా తాజా మంచినీళ్లు తాగండి. ఈరోజు మీ ఉదయపు మందులు వేసుకున్నారో లేదో సరిచూసుకోండి లేదా మనసు సాంత్వన కోసం మైండ్ గేమ్‌లు ఆడవచ్చు.';
        else if (resolvedLang === 'hi') fallbackMsg = 'आप आराम से बैठें और एक गिलास ताज़ा पानी पिएं। अपनी आज की दवाइयों की जाँच करें और मन को बहलाने के लिए दिमागी खेल खेलें।';
        else if (resolvedLang === 'ta') fallbackMsg = 'அமைதியாக அமர்ந்து சிறிது தண்ணீர் குடியுங்கள். இன்றைய மருந்துகளை சரிபார்த்துவிட்டு ஓய்வெடுங்கள்.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ನಿರಾಳವಾಗಿ ಕುಳಿತು ನೀರು ಕುಡಿಯಿರಿ. ನಿಮ್ಮ ಇಂದಿನ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.';
        else if (resolvedLang === 'bn') fallbackMsg = 'শান্ত হয়ে বসুন এবং এক গ্লাস জল খান। আজকের ওষুধ খেয়েছেন কিনা দেখে নিয়ে বিশ্রাম নিন।';
        else if (resolvedLang === 'as') fallbackMsg = 'শান্ত হৈ বহক আৰু পানী খাওক। আজিৰ ঔষধখিনি লৈ জিৰণি লওক।';
        else if (resolvedLang === 'mr') fallbackMsg = 'शांत बसा आणि ताजे पाणी प्या. आजची औषधे तपासून विश्रांती घ्या.';
        else fallbackMsg = 'Take a relaxed seat and sip a fresh glass of water. Check if you have taken your daily medications and play a soothing memory puzzle.';
      }
      // C. Water / Hydration
      else if (lowerMsg.includes('water') || lowerMsg.includes('drink') || lowerMsg.includes('నీళ్లు') || lowerMsg.includes('నీరు') || lowerMsg.includes('पानी') || lowerMsg.includes('తண்ணீர்') || lowerMsg.includes('জল') || lowerMsg.includes('পানী') || lowerMsg.includes('पाणी')) {
        if (resolvedLang === 'te') fallbackMsg = 'దయచేసి ఒక గ్లాసు మంచినీళ్లు తీరిగ్గా తాగండి. రోజంతా తగినంత నీరు తాగడం మీ ఆరోగ్యానికి చాలా మంచిది.';
        else if (resolvedLang === 'hi') fallbackMsg = 'कृपया एक गिलास ताज़ा पानी पिएं। दिन भर में भरपूर पानी पीना आपके स्वास्थ्य के लिए बहुत लाभदायक है।';
        else if (resolvedLang === 'ta') fallbackMsg = 'தயவுசெய்து ஒரு டம்ளர் தண்ணீர் குடியுங்கள். போதுமான தண்ணீர் குடிப்பது உடலுக்கு மிகவும் நல்லது.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ದಯವಿಟ್ಟು ಒಂದು ಲೋಟ ನೀರು ಕುಡಿಯಿರಿ. ದಿನವಿಡೀ ನೀರು ಕುಡಿಯುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಬಹಳ ಒಳ್ಳೆಯದು.';
        else if (resolvedLang === 'bn') fallbackMsg = 'অনুগ্রহ করে এক গ্লাস তাজা জল পান করুন। জল পান করা আপনার স্বাস্থ্যের পক্ষে খুব ভালো।';
        else if (resolvedLang === 'as') fallbackMsg = 'অনুগ্ৰহ কৰি এগিলাচ পানী খাওক। পৰ্যাপ্ত পানী খোৱাটো স্বাস্থ্যৰ বাবে খুবেই উপকাৰী।';
        else if (resolvedLang === 'mr') fallbackMsg = 'कृपया एक ग्लास ताजे पाणी प्या. भरपूर पाणी पिणे आरोग्यासाठी फायदेशीर आहे.';
        else fallbackMsg = 'Please drink a fresh glass of water. Staying well hydrated keeps your mind and body active.';
      }
      // D. Medicine / Tablets
      else if (lowerMsg.includes('medicine') || lowerMsg.includes('tablet') || lowerMsg.includes('pill') || lowerMsg.includes('మందులు') || lowerMsg.includes('మాత్రలు') || lowerMsg.includes('दवा') || lowerMsg.includes('मात्रा') || lowerMsg.includes('மாத்திரை') || lowerMsg.includes('ಮಾತ್ರೆ') || lowerMsg.includes('ওষুধ') || lowerMsg.includes('ঔষধ') || lowerMsg.includes('औषध')) {
        if (resolvedLang === 'te') fallbackMsg = 'మీరు సమయానికి మందులు వేసుకోవడం చాలా ముఖ్యం. మీ డాక్టర్ రాసిన ప్రిస్క్రిప్షన్ ప్రకారం వేసుకోండి.';
        else if (resolvedLang === 'hi') fallbackMsg = 'समय पर दवाइयाँ लेना बहुत ज़रूरी है। कृपया डॉक्टर के निर्देशानुसार पानी के साथ दवा लें।';
        else if (resolvedLang === 'ta') fallbackMsg = 'நேரத்திற்கு மருந்துகளை எடுத்துக்கொள்வது மிகவும் முக்கியம். மருத்துவரின் ஆலோசனைப்படி உட்கொள்ளுங்கள்.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವುದು ಬಹಳ ಮುಖ್ಯ. ವೈದ್ಯರ ಸಲಹೆಯಂತೆ ಮಾತ್ರೆಗಳನ್ನು ಸೇವಿಸಿ.';
        else if (resolvedLang === 'bn') fallbackMsg = 'ঠিক সময়ে ওষুধ নেওয়া অত্যন্ত জরুরি। ডাক্তারের পরামর্শ মতো নিয়মিত ওষুধ খান।';
        else if (resolvedLang === 'as') fallbackMsg = 'সময়মতে ঔষধ খোৱাটো অতি প্ৰয়োজনীয়। ডাক্তৰৰ পৰামৰ্শ মতে নিয়মীয়াকৈ ঔষধ লওক।';
        else if (resolvedLang === 'mr') fallbackMsg = 'वेळेवर औषध घेणे अत्यंत महत्त्वाचे आहे. कृपया डॉक्टरांच्या सल्ल्यानुसार औषधे घ्या.';
        else fallbackMsg = 'Please ensure you take your prescribed medications on time with a full glass of water.';
      }
      // E. Pain / Headache / Fever / Unwell
      else if (lowerMsg.includes('headache') || lowerMsg.includes('pain') || lowerMsg.includes('fever') || lowerMsg.includes('sick') || lowerMsg.includes('hurt') || lowerMsg.includes('తలనొప్పి') || lowerMsg.includes('నొప్పి') || lowerMsg.includes('दर्द') || lowerMsg.includes('सिरदर्द') || lowerMsg.includes('வலி') || lowerMsg.includes('தலைவலி') || lowerMsg.includes('ತಲೆನೋವು') || lowerMsg.includes('মাথা ব্যথা') || lowerMsg.includes('মূৰৰ বিষ') || lowerMsg.includes('डोकेदुखी')) {
        if (resolvedLang === 'te') fallbackMsg = 'మీకు బాధగా ఉంటే కాసేపు ప్రశాంతంగా విశ్రాంతి తీసుకోండి. అవసరమైతే మీ సంరక్షకులకు లేదా డాక్టర్‌కి తెలియజేయండి.';
        else if (resolvedLang === 'hi') fallbackMsg = 'यदि आपको दर्द या असहज महसूस हो रहा है, तो कृपया विश्राम करें और अपने डॉक्टर या देखभाल करने वाले को सूचित करें।';
        else if (resolvedLang === 'ta') fallbackMsg = 'உங்களுக்கு வலி இருந்தால் சிறிது நேரம் ஓய்வெடுங்கள். தேவைப்பட்டால் மருத்துவரை அணுகவும்.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ನಿಮಗೆ ಅಸ್ವಸ್ಥತೆ ಎನಿಸಿದರೆ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.';
        else if (resolvedLang === 'bn') fallbackMsg = 'আপনার কষ্ট হলে বিশ্রাম নিন। প্রয়োজনে আপনার ডাক্তার বা কেয়ারগিভারকে জানান।';
        else if (resolvedLang === 'as') fallbackMsg = 'আপোনাৰ বিষ হ’লে জিৰণি লওক। প্ৰয়োজন হ’লে ডাক্তৰক জনাওক।';
        else if (resolvedLang === 'mr') fallbackMsg = 'तुम्हाला त्रास होत असल्यास विश್ರಾंती घ्या आणि डॉक्टरांचा सल्ला घ्या.';
        else fallbackMsg = 'If you feel unwell or in pain, please rest comfortably and inform your caregiver or doctor.';
      }
      // F. How are you / Greeting / Identity
      else if (lowerMsg.includes('how are you') || lowerMsg.includes('who are you') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('ఎలా ఉన్నావు') || lowerMsg.includes('నువ్వు ఎవరు') || lowerMsg.includes('आप कैसे हैं') || lowerMsg.includes('आप कौन हैं') || lowerMsg.includes('எப்படி இருக்கிறீர்கள்') || lowerMsg.includes('ಹೇಗಿದ್ದೀರಾ') || lowerMsg.includes('কেমন আছেন') || lowerMsg.includes('কেনে আছে') || lowerMsg.includes('कसे आहात')) {
        if (resolvedLang === 'te') fallbackMsg = 'నేను చాలా బాగున్నాను! నేను మీ ఆరోగ్య వాయిస్ అసిస్టెంట్‌ని. ఈ రోజు మీకు ఎలా సహాయపడగలను?';
        else if (resolvedLang === 'hi') fallbackMsg = 'मैं बहुत अच्छी हूँ! मैं आपकी स्वास्थ्य वॉइस असिस्टेंट हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?';
        else if (resolvedLang === 'ta') fallbackMsg = 'நான் நலமாக இருக்கிறேன்! நான் உங்கள் சுகாதார குரல் உதவியாளர். உங்களுக்கு எப்படி உதவட்டும்?';
        else if (resolvedLang === 'kn') fallbackMsg = 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
        else if (resolvedLang === 'bn') fallbackMsg = 'আমি ভালো আছি! আমি আপনার স্বাস্থ্য ভয়েস সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?';
        else if (resolvedLang === 'as') fallbackMsg = 'মই ভালে আছোঁ! মই আপোনাৰ স্বাস্থ্য মাত সহায়ক। আপোনাক কি সহায় কৰিব পাৰোঁ?';
        else if (resolvedLang === 'mr') fallbackMsg = 'मी छान आहे! मी तुमची आरोग्य व्हॉइस सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकते?';
        else fallbackMsg = 'I am doing wonderfully! I am your AI health voice companion. How may I assist you today?';
      }
      // G. Context-Aware Smart Fallback
      else {
        if (resolvedLang === 'te') fallbackMsg = 'మీరు ప్రశాంతంగా కూర్చుని కొద్దిగా మంచినీళ్లు తాగండి. మీ జ్ఞాపకశక్తి లేదా ఆరోగ్యానికి సంబంధించిన ఏ సందేహమైనా నన్ను అడగవచ్చు.';
        else if (resolvedLang === 'hi') fallbackMsg = 'आप आराम से बैठें और पानी पिएं। अपनी सेहत या स्मरण शक्ति के बारे में मुझसे बेझिझक कुछ भी पूछें।';
        else if (resolvedLang === 'ta') fallbackMsg = 'அமைதியாக அமர்ந்து தண்ணீர் குடியுங்கள். உங்கள் உடல்நலம் பற்றி என்னிடம் கேளுங்கள்.';
        else if (resolvedLang === 'kn') fallbackMsg = 'ನಿರಾಳವಾಗಿ ಕುಳಿತು ನೀರು ಕುಡಿಯಿರಿ. ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.';
        else if (resolvedLang === 'bn') fallbackMsg = 'শান্ত হয়ে বসুন এবং জল খান। আপনার স্বাস্থ্য সম্পর্কে আমাকে জিজ্ঞাসা করুন।';
        else if (resolvedLang === 'as') fallbackMsg = 'শান্ত হৈ বহক আৰু পানী খাওক। আপোনাৰ স্বাস্থ্যৰ বিষয়ে মোক সোধক।';
        else if (resolvedLang === 'mr') fallbackMsg = 'शांत बसा आणि पाणी प्या. आरोग्याबद्दल मला काहीही विचारा.';
        else fallbackMsg = 'Please sit back comfortably and sip some water. You can ask me anything about your health or medications.';
      }

      return res.json({
        success: true,
        response: fallbackMsg,
        language: resolvedLang,
        spokenLanguage: targetLangName,
        switchedLanguage: resolvedLang !== normalizeLanguageCode(language) ? resolvedLang : undefined
      });
    } catch (err) {
      console.error('[VoiceAgentController] Error:', err);
      return res.status(500).json({ error: 'Voice agent error', details: err.message });
    }
  }
}

module.exports = VoiceAgentController;
