/**
 * Voice-to-Voice Geriatric AI Therapist Controller
 * Fine-tuned for Dementia & Alzheimer's Digital Therapeutics:
 * - Naomi Feil Validation Therapy (empathy & grounding without confrontation)
 * - Reminiscence & Nostalgia Stimulation
 * - Anxiety & Agitation De-escalation
 * - Somatic Calming & Breathing Guidance
 */

const { generateWithFailover } = require('../services/geminiKeyManager');
const Chat = require('../models/Chat');

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
  english: 'en'
};

function normalizeLanguageCode(lang) {
  if (!lang || typeof lang !== 'string') return 'te';
  const clean = lang.toLowerCase().trim();
  const prefix = clean.split('-')[0].split('_')[0];
  return NORM_LANG_MAP[clean] || NORM_LANG_MAP[prefix] || 'te';
}

const THERAPY_SYSTEM_PROMPT = `
You are Dr. Ananya, a deeply compassionate, gentle, and culturally attuned Geriatric Cognitive Therapist and Clinical Counselor in India.
Your mission is to provide soothing, therapeutic voice conversation for elderly individuals with early-to-moderate dementia, Alzheimer's, memory decline, or loneliness.

CLINICAL THERAPEUTIC GUIDELINES:
1. Validation Therapy (Naomi Feil Method):
   - Never contradict, argue with, or harshly correct confusion or altered reality.
   - Validate their emotions with deep respect: "I understand how you feel," "You are completely safe with me."
2. Reminiscence & Nostalgia:
   - Invite pleasant memories of youth, childhood homes, monsoon rains, morning chai, temple bells, and family warmth.
3. Anxiety De-escalation & Somatic Grounding:
   - If they sound anxious, confused, or lonely, offer gentle breathing: "Take a slow, deep breath with me... You are doing wonderfully."
4. Voice Pacing & Output Formatting:
   - THIS RESPONSE WILL BE SPOKEN ALOUD DIRECTLY INTO THE ELDERLY PATIENT'S EARS VIA TEXT-TO-SPEECH.
   - Keep answers comforting, concise (2 to 3 gentle sentences), and warm.
   - NEVER use markdown, asterisks (*), bullet points, hashtags, or numbered lists.
   - Use respectful honorifics: In Telugu use 'అండీ', in Hindi use 'जी', in Tamil use 'அம்மா/ஐயா', etc.
5. Regional Language Strictness:
   - ALWAYS write purely in the native script of the requested language.
`;

const INITIAL_THERAPIST_GREETINGS = {
  te: 'నమస్కారం అండీ, నేను మీ థెరపిస్ట్ డాక్టర్ అనన్యను. ప్రశాంతంగా కూర్చుని నాతో మాట్లాడండి. ఈరోజు మీ మనసు ఎలా ఉంది?',
  hi: 'नमस्ते जी, मैं आपकी थेरेपिस्ट डॉ. अनन्या हूँ। आराम से बैठिए और मुझसे बात कीजिए। आज आपका मन कैसा महसूस कर रहा है?',
  ta: 'வணக்கம், நான் உங்கள் சிகிச்சையாளர் டாக்டர் அனன்யா. அமைதியாக அமர்ந்து என்னுடன் பேசுங்கள். இன்று உங்கள் மனம் எப்படி இருக்கிறது?',
  kn: 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಥೆರಪಿಸ್ಟ್ ಡಾ. ಅನನ್ಯಾ. ನಿರಾಳವಾಗಿ ಕುಳಿತು ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡಿ. ಇಂದು ನಿಮ್ಮ ಮನಸ್ಸು ಹೇಗಿದೆ?',
  bn: 'নমস্কার, আমি আপনার থেরাপিস্ট ডক্টর অনন্যা। শান্ত হয়ে বসুন এবং আমার সাথে কথা বলুন। আজ আপনার মন কেমন আছে?',
  as: 'নমস্কাৰ, মই আপোনাৰ থেৰাপিষ্ট ডাঃ অনন্যা। শান্ত হৈ বহক আৰু মোৰ লগত কথা পাতক। আজি আপোনাৰ মনটো কেনে আছে?',
  mr: 'नमस्कार, मी तुमची थेरपिस्ट डॉ. अनन्या आहे. शांत बसा आणि माझ्याशी बोला. आज तुमचे मन कसे आहे?',
  en: 'Hello my dear friend, I am your therapist Dr. Ananya. Sit back comfortably and talk with me. How are you feeling today?'
};

const THERAPY_FALLBACKS = {
  te: 'నేను మీ మాటలను శ్రద్ధగా వింటున్నాను అండీ. మీరు నాతో క్షేమంగా ఉన్నారు. కాసేపు ప్రశాంతంగా కళ్ళు మూసుకుని గాలి పీల్చుకోండి.',
  hi: 'मैं आपकी बात बहुत ध्यान से सुन रही हूँ जी। आप मेरे साथ बिल्कुल सुरक्षित हैं। शांति से एक गहरी सांस लीजिए।',
  ta: 'நான் உங்கள் குரலை கனிவுடன் கேட்கிறேன் அம்மா/ஐயா. நீங்கள் என்னுடன் பாதுகாப்பாக உள்ளீர்கள். மெதுவாக மூச்சை உள்ளிழுத்து வெளிவிடுங்கள்.',
  kn: 'ನಾನು ನಿಮ್ಮ ಮಾತನ್ನು ಪ್ರೀತಿಯಿಂದ ಕೇಳುತ್ತಿದ್ದೇನೆ. ನೀವು ನನ್ನೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ. ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ.',
  bn: 'আমি আপনার কথা মনোযোগ দিয়ে শুনছি। আপনি আমার কাছে সম্পূর্ণ নিরাপদ। শান্ত হয়ে ধীরে ধীরে শ্বাস নিন।',
  as: 'মই আপোনাৰ কথা মৰমেৰে শুনি আছোঁ। আপুনি মোৰ ওচৰত সম্পূৰ্ণ নিৰাপদ। শান্ত হৈ লাহে লাহে উশাহ লওক।',
  mr: 'मी तुमचे बोलणे अगदी शांतपणे ऐकत आहे. तुम्ही माझ्यासोबत पूर्णपणे सुरक्षित आहात. एक दीर्घ श्वास घ्या.',
  en: 'I hear you softly and clearly. You are completely safe with me. Let us take a peaceful, gentle breath together.'
};

class TherapyController {
  static async handleTherapySession(req, res) {
    try {
      const { message, language = 'te', sessionHistory = [], focusMode = 'calm' } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Patient voice text is required' });
      }

      const normLang = normalizeLanguageCode(language);
      const trimmed = message.trim();
      const lower = trimmed.toLowerCase();

      // Greeting checks across languages
      const greetingTriggers = ['start', 'hello', 'hi', 'నమస్కారం', 'नमस्ते', 'வணக்கம்', 'ನಮಸ್ಕಾರ', 'নমস্কার', 'নমস্কাৰ', 'नमस्कार'];
      if (greetingTriggers.some(g => lower === g || lower.startsWith(g))) {
        const greeting = INITIAL_THERAPIST_GREETINGS[normLang] || INITIAL_THERAPIST_GREETINGS.en;
        return res.json({
          success: true,
          response: greeting,
          language: normLang,
          emotion: 'welcoming',
          audioUrl: `/api/tts?text=${encodeURIComponent(greeting)}&lang=${normLang}`
        });
      }

      // Build context from previous conversation turns
      let contextString = '';
      if (Array.isArray(sessionHistory) && sessionHistory.length > 0) {
        contextString = 'RECENT CONVERSATION HISTORY:\n' +
          sessionHistory.slice(-4).map(turn => `${turn.role === 'patient' ? 'Elderly Patient' : 'Therapist'}: ${turn.text}`).join('\n') + '\n\n';
      }

      const languageNames = {
        te: 'Telugu (తెలుగు script)',
        hi: 'Hindi (हिंदी script)',
        ta: 'Tamil (தமிழ் script)',
        kn: 'Kannada (ಕನ್ನಡ script)',
        bn: 'Bengali (বাংলা script)',
        as: 'Assamese (অসমীয়া script)',
        mr: 'Marathi (मराठी script)',
        en: 'English'
      };

      const targetLangName = languageNames[normLang] || 'Telugu';

      const prompt = `
${THERAPY_SYSTEM_PROMPT}

CURRENT THERAPY FOCUS: ${focusMode.toUpperCase()}
TARGET SPOKEN LANGUAGE: ${targetLangName}

${contextString}
The elderly patient just spoke: "${trimmed}"

Respond directly to the patient in pure ${targetLangName}.
Be deeply comforting, respectful, and therapeutic. 2 to 3 sentences maximum. No markdown formatting.
`;

      let replyText = '';
      try {
        const geminiRes = await generateWithFailover({
          prompt,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 1200
          }
        });

        const raw = typeof geminiRes === 'string'
          ? geminiRes
          : (geminiRes.rawText || (typeof geminiRes.data === 'string' ? geminiRes.data : JSON.stringify(geminiRes.data || '')));

        replyText = raw.replace(/[*_#`~[\]]/g, '').trim();
      } catch (geminiErr) {
        console.warn('[TherapyController] Gemini fallback:', geminiErr.message);

        if (focusMode === 'sleep') {
          if (normLang === 'te') replyText = 'ప్రశాంతంగా కళ్ళు మూసుకుని మెల్లగా గాలి తీసుకోండి. రాత్రి సమయం మీ శరీరం, మనస్సుకు విశ్రాంతినిస్తుంది.';
          else if (normLang === 'hi') replyText = 'धीरे-धीरे एक गहरी सांस लें। रात का समय आपके शरीर और दिमाग को विश्राम देने के लिए है।';
          else replyText = 'Close your eyes gently and take a slow, relaxing breath. You are safe and peaceful tonight.';
        } else if (focusMode === 'reminiscence') {
          if (normLang === 'te') replyText = 'మీ సుందర జ్ఞాపకాలు ఎంతో మధురమైనవి. మీ చిన్ననాటి విషయాలు నాతో పంచుకున్నందుకు ధన్యవాదాలు.';
          else if (normLang === 'hi') replyText = 'आपकी सुंदर यादें बहुत सुखद हैं। अपनी पुरानी यादें साझा करने के लिए धन्यवाद।';
          else replyText = 'Your memories are precious and wonderful. Thank you for sharing these moments with me.';
        } else {
          if (normLang === 'te') replyText = `నేను మీ మాటలని శ్రద్ధగా వింటున్నాను అండీ. "${trimmed}" గురించి మీరు చెప్పిన విధానం చాలా బాగుంది. మీరు నా వద్ద సురక్షితంగా ఉన్నారు.`;
          else if (normLang === 'hi') replyText = `मैं आपकी बात बहुत ध्यान से सुन रही हूँ जी। "${trimmed}" के बारे में आपकी बात बहुत अच्छी लगी। आप बिल्कुल सुरक्षित हैं।`;
          else if (normLang === 'ta') replyText = `நான் உங்கள் குரலை கனிவுடன் கேட்கிறேன். நீங்கள் என்னுடன் பாதுகாப்பாக உள்ளீர்கள்.`;
          else if (normLang === 'kn') replyText = `ನಾನು ನಿಮ್ಮ ಮಾತನ್ನು ಪ್ರೀತಿಯಿಂದ ಕೇಳುತ್ತಿದ್ದೇನೆ. ನೀವು ನನ್ನೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ.`;
          else if (normLang === 'bn') replyText = `আমি আপনার কথা মনোযোগ দিয়ে শুনছি। আপনি আমার কাছে সম্পূর্ণ নিরাপদ।`;
          else if (normLang === 'as') replyText = `মই আপোনাৰ কথা মৰমেৰে শুনি আছোঁ। আপুনি মোৰ ওচৰত নিৰাপদ।`;
          else if (normLang === 'mr') replyText = `मी तुमचे बोलणे अगदी शांतपणे ऐकत आहे. तुम्ही माझ्यासोबत सुरक्षित आहात.`;
          else replyText = `I hear you softly and clearly regarding "${trimmed}". You are completely safe with me. Let us take a gentle breath together.`;
        }
      }

      // Persist conversation turns to durable Chat database
      const userId = req.user ? req.user.id : (req.body.userId || 'anonymous');
      const sessionId = req.body.sessionId || 'voice_therapist_default';
      try {
        await Chat.createMessage({
          userId,
          sessionId,
          chatType: 'voice_therapist',
          role: 'user',
          text: trimmed,
          language: normLang
        });
        await Chat.createMessage({
          userId,
          sessionId,
          chatType: 'voice_therapist',
          role: 'assistant',
          text: replyText,
          language: normLang
        });
      } catch (chatErr) {
        console.warn('[Therapy Chat Save Warning]:', chatErr.message);
      }

      return res.json({
        success: true,
        response: replyText,
        language: normLang,
        sessionId,
        audioUrl: `/api/tts?text=${encodeURIComponent(replyText.substring(0, 180))}&lang=${normLang}`
      });
    } catch (err) {
      console.error('[TherapyController] Exception:', err);
      res.status(500).json({ error: 'Therapy assistant unavailable' });
    }
  }

  static getInitialGreeting(req, res) {
    const { lang = 'te' } = req.query;
    const normLang = normalizeLanguageCode(lang);
    const greeting = INITIAL_THERAPIST_GREETINGS[normLang] || INITIAL_THERAPIST_GREETINGS.en;
    res.json({
      success: true,
      greeting,
      language: normLang,
      audioUrl: `/api/tts?text=${encodeURIComponent(greeting)}&lang=${normLang}`
    });
  }
}

module.exports = TherapyController;
