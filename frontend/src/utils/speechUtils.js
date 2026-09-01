/**
 * High-Efficiency Multilingual Speech Synthesis & Web Audio Engine
 * Supports ALL 8 Indian Regional Languages:
 * Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN), Kannada (kn-IN),
 * Bengali (bn-IN), Assamese (as-IN), Marathi (mr-IN), and Indian English (en-IN).
 *
 * Implements a resilient Triple-Tier Audio Failover Architecture:
 * - Tier 1: High-fidelity Server Streaming Audio (/api/tts)
 * - Tier 2: Direct Client Google TTS Audio Fallback
 * - Tier 3: Browser Web Speech API (window.speechSynthesis)
 */

import { getApiBaseUrl } from '../services/api';

export const LANG_CODE_MAP = {
  te: 'te-IN', // Telugu
  hi: 'hi-IN', // Hindi
  ta: 'ta-IN', // Tamil
  kn: 'kn-IN', // Kannada
  bn: 'bn-IN', // Bengali
  as: 'as-IN', // Assamese
  mr: 'mr-IN', // Marathi
  en: 'en-IN'  // Indian English
};

export const GOOGLE_TTS_LANG_MAP = {
  te: 'te',
  hi: 'hi',
  ta: 'ta',
  kn: 'kn',
  bn: 'bn',
  as: 'bn', // Bengali script phonetic fallback for Assamese on Google TTS engine
  mr: 'mr',
  en: 'en'
};

const LANG_ALIASES = {
  te: 'te', 'te-in': 'te', telugu: 'te',
  hi: 'hi', 'hi-in': 'hi', hindi: 'hi',
  ta: 'ta', 'ta-in': 'ta', tamil: 'ta',
  kn: 'kn', 'kn-in': 'kn', kannada: 'kn',
  bn: 'bn', 'bn-in': 'bn', bengali: 'bn', bangla: 'bn',
  as: 'as', 'as-in': 'as', assamese: 'as',
  mr: 'mr', 'mr-in': 'mr', marathi: 'mr',
  en: 'en', 'en-in': 'en', 'en-us': 'en', 'en-gb': 'en', english: 'en'
};

// Cached voices list & AudioContext state
let cachedVoices = [];
let sharedAudioCtx = null;
let activeAudioElement = null;
let activeUtterance = null;
let activeTimerId = null;
let isAudioUnlocked = false;

// ─── Eager Voice Cache Initialization ─────────────────────────────────────────
if (typeof window !== 'undefined') {
  const loadVoices = () => {
    try {
      if ('speechSynthesis' in window) {
        cachedVoices = window.speechSynthesis.getVoices() || [];
      }
    } catch (e) {}
  };

  loadVoices();
  if (typeof window.speechSynthesis !== 'undefined') {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
  }

  // Unlock Audio on first user interaction to bypass browser autoplay restrictions
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;
    try {
      const ctx = getSharedAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume?.();
      }
    } catch (e) {}
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * Normalizes any language code, BCP-47 tag, or alias to standard representations
 */
export function normalizeLanguage(langInput) {
  if (!langInput || typeof langInput !== 'string') {
    return { short: 'en', bcp47: 'en-IN', googleTl: 'en' };
  }
  const clean = langInput.toLowerCase().trim();
  const prefix = clean.split('-')[0].split('_')[0];

  const short = LANG_ALIASES[clean] || LANG_ALIASES[prefix] || 'en';
  const bcp47 = LANG_CODE_MAP[short] || 'en-IN';
  const googleTl = GOOGLE_TTS_LANG_MAP[short] || 'en';

  return { short, bcp47, googleTl };
}

/**
 * Singleton AudioContext getter
 */
export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Plays a warm, soothing dual chime tone
 */
export function playGentleTone(frequency1 = 659.25, frequency2 = 987.77) {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency1, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency2, now + 0.18);
    gain2.gain.setValueAtTime(0, now + 0.18);
    gain2.gain.linearRampToValueAtTime(0.28, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn('[speechUtils] Tone play failed:', e);
  }
}

/**
 * Finds the optimal native voice matching the language code
 */
function findBestVoice(targetLang) {
  if (!cachedVoices || cachedVoices.length === 0) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    }
  }

  const { short, bcp47 } = normalizeLanguage(targetLang);

  // 1. Exact match (e.g., 'te-IN' or 'hi-IN')
  let match = cachedVoices.find(v => v.lang.toLowerCase() === bcp47.toLowerCase());
  if (match) return match;

  // 2. Language prefix match (e.g., 'te', 'hi', 'ta', 'kn', 'bn', 'mr')
  match = cachedVoices.find(v => v.lang.toLowerCase().startsWith(short));
  if (match) return match;

  return null;
}

/**
 * Splits text into natural spoken phrases (~130 chars max), strictly filtering punctuation-only chunks
 */
export function splitIntoSpokenChunks(text) {
  if (!text || typeof text !== 'string') return [];

  // Remove markdown symbols and format extra whitespace
  const clean = text
    .replace(/[*_#`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || /^[\s.,!?;:।\-–—]+$/.test(clean)) return [];

  const rawSentences = clean
    .split(/([.,!?।\n;:]+)/)
    .filter(s => s.trim().length > 0);

  const chunks = [];
  let buffer = '';

  for (const seg of rawSentences) {
    // If it is pure punctuation, append it to the current buffer
    if (/^[.,!?।\n;: ]+$/.test(seg)) {
      buffer += seg;
      continue;
    }

    if ((buffer + ' ' + seg).length > 130) {
      const trimmedBuf = buffer.trim();
      if (trimmedBuf && !/^[.,!?।\n;: ]+$/.test(trimmedBuf)) {
        chunks.push(trimmedBuf);
      }
      buffer = seg;
    } else {
      buffer = buffer ? `${buffer} ${seg}` : seg;
    }
  }

  const finalTrimmed = buffer.trim();
  if (finalTrimmed && !/^[.,!?।\n;: ]+$/.test(finalTrimmed)) {
    chunks.push(finalTrimmed);
  }

  if (chunks.length === 0 && clean.length > 0 && !/^[.,!?।\n;: ]+$/.test(clean)) {
    chunks.push(clean.substring(0, 150));
  }

  return chunks;
}

/**
 * Tier 3 Fallback: Browser Web SpeechSynthesis API directly
 */
export function speakViaSpeechSynthesis(text, lang = 'en', onEndCallback = null, rate = 0.82) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const { bcp47, short } = normalizeLanguage(lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const matchedVoice = findBestVoice(short);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        activeUtterance = null;
        if (activeTimerId) {
          clearTimeout(activeTimerId);
          activeTimerId = null;
        }
        if (onEndCallback) onEndCallback();
      }
    };

    utterance.onend = finish;
    utterance.onerror = (err) => {
      console.warn('[speechUtils] SpeechSynthesis utterance error:', err);
      finish();
    };

    activeUtterance = utterance;

    // Workaround for Chrome paused SpeechSynthesis bug
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);

    // Timeout safety fallback in case onend never fires in background
    const approxDurationMs = Math.max(2500, (text.length / 10) * 1000);
    activeTimerId = setTimeout(() => {
      if (activeUtterance === utterance) {
        finish();
      }
    }, approxDurationMs + 3500);
  } catch (err) {
    console.warn('[speechUtils] SpeechSynthesis failed:', err);
    if (onEndCallback) onEndCallback();
  }
}

/**
 * Resilient Triple-Tier Multilingual Audio Engine:
 * Tier 1: Server TTS Audio Stream (/api/tts)
 * Tier 2: Direct Client Google TTS stream fallback
 * Tier 3: Browser Web Speech API fallback
 */
export function playStreamAudio(text, lang = 'te', onEndCallback = null, rate = 0.82) {
  stopSpeaking();

  if (!text || typeof text !== 'string') {
    if (onEndCallback) onEndCallback();
    return;
  }

  const { short, googleTl, bcp47 } = normalizeLanguage(lang);
  const chunks = splitIntoSpokenChunks(text);

  if (chunks.length === 0) {
    if (onEndCallback) onEndCallback();
    return;
  }

  let currentIndex = 0;

  function playNextChunk() {
    if (currentIndex >= chunks.length) {
      activeAudioElement = null;
      if (onEndCallback) onEndCallback();
      return;
    }

    const chunk = chunks[currentIndex++];
    const encoded = encodeURIComponent(chunk);

    // Tier 1 Primary Server URL
    const apiBase = getApiBaseUrl();
    const primaryUrl = `${apiBase}/tts?text=${encoded}&lang=${short}`;
    // Tier 2 Secondary Direct Fallback URL
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${googleTl}&client=tw-ob`;

    const audio = new Audio();
    audio.preload = 'auto';
    activeAudioElement = audio;

    let hasTriedFallback = false;
    let hasStarted = false;
    let fallbackTimeout = null;

    const cleanupListeners = () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
    };

    const tryTier2Or3 = () => {
      cleanupListeners();
      if (!hasTriedFallback) {
        hasTriedFallback = true;
        console.warn(`[speechUtils] Tier 1 server stream unavailable for "${short}". Switching to Tier 2 (Direct Client Google TTS)...`);
        
        const fallbackAudio = new Audio(fallbackUrl);
        activeAudioElement = fallbackAudio;

        let tier2Started = false;
        let tier2Timeout = setTimeout(() => {
          if (!tier2Started) {
            console.warn('[speechUtils] Tier 2 direct stream timed out. Switching to Tier 3 (Web Speech API)...');
            speakViaSpeechSynthesis(chunk, short, () => playNextChunk(), rate);
          }
        }, 3500);

        fallbackAudio.onplaying = () => {
          tier2Started = true;
          clearTimeout(tier2Timeout);
        };

        fallbackAudio.onended = () => {
          clearTimeout(tier2Timeout);
          playNextChunk();
        };

        fallbackAudio.onerror = () => {
          clearTimeout(tier2Timeout);
          console.warn('[speechUtils] Tier 2 direct stream failed. Switching to Tier 3 (Web Speech API)...');
          speakViaSpeechSynthesis(chunk, short, () => playNextChunk(), rate);
        };

        const fallbackPromise = fallbackAudio.play();
        if (fallbackPromise !== undefined) {
          fallbackPromise.catch((err) => {
            clearTimeout(tier2Timeout);
            console.warn('[speechUtils] Tier 2 playback rejected:', err);
            speakViaSpeechSynthesis(chunk, short, () => playNextChunk(), rate);
          });
        }
      } else {
        console.warn('[speechUtils] Streaming failed. Falling back to Tier 3 (Web Speech API)...');
        speakViaSpeechSynthesis(chunk, short, () => playNextChunk(), rate);
      }
    };

    // Auto-timeout for Tier 1: if server is slow / sleeping, failover within 3.5s
    fallbackTimeout = setTimeout(() => {
      if (!hasStarted) {
        console.warn(`[speechUtils] Tier 1 server stream timed out for "${short}". Initiating failover.`);
        tryTier2Or3();
      }
    }, 3500);

    audio.onplaying = () => {
      hasStarted = true;
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
    };

    audio.onended = () => {
      cleanupListeners();
      playNextChunk();
    };

    audio.onerror = () => {
      tryTier2Or3();
    };

    // Initiate Tier 1 playback
    audio.src = primaryUrl;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((playErr) => {
        console.warn('[speechUtils] Tier 1 audio play rejected (autoplay or network):', playErr);
        tryTier2Or3();
      });
    }
  }

  playNextChunk();
}

/**
 * Universal Multilingual Speech Output Function
 * Uses the resilient Triple-Tier Audio Engine with natural Indian voice pitch across all 8 languages.
 */
export function speakText(text, lang = 'en', onEndCallback = null, rate = 0.82) {
  if (!text || typeof text !== 'string') {
    if (onEndCallback) onEndCallback();
    return;
  }

  const { short } = normalizeLanguage(lang);
  playStreamAudio(text, short, onEndCallback, rate);
}

/**
 * Immediately stop any speaking voice (both SpeechSynthesis and streaming Audio)
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  if (activeTimerId) {
    clearTimeout(activeTimerId);
    activeTimerId = null;
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
      activeAudioElement.onended = null;
      activeAudioElement.onerror = null;
    } catch (e) {}
    activeAudioElement = null;
  }

  activeUtterance = null;
}

/**
 * Pre-compiled, culturally comforting voice prompts for all 8 Indian regional languages:
 * Telugu (te), Hindi (hi), Tamil (ta), Kannada (kn),
 * Bengali (bn), Assamese (as), Marathi (mr), and English (en).
 */
export const VOICE_PROMPTS = {
  hydration: {
    te: 'నమస్కారం. దయచేసి ఒక గ్లాసు తాజా మంచినీళ్లు తాగండి. నీరు తాగడం మీ జ్ఞాపకశక్తికి మరియు శరీరానికి ఎంతో మంచిది.',
    hi: 'नमस्ते। कृपया एक गिलास ताज़ा पानी पिएं। पानी पीना आपके दिमाग और शरीर के लिए बहुत फायदेमंद है।',
    ta: 'வணக்கம். தயவுசெய்து ஒரு டம்ளர் தண்ணீர் குடியுங்கள். இது உங்கள் உடலுக்கும் மனதுக்கும் நல்லது.',
    kn: 'ನಮಸ್ಕಾರ. ದಯವಿಟ್ಟು ಒಂದು ಲೋಟ ತಾಜಾ ನೀರು ಕುಡಿಯಿರಿ. ನೀರು ಕುಡಿಯುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಒಳ್ಳೆಯದು.',
    bn: 'নমস্কার। অনুগ্রহ করে এক গ্লাস তাজা জল পান করুন। জল পান করা আপনার স্বাস্থ্যের জন্য খুব উপকারী।',
    as: 'নমস্কাৰ। অনুগ্ৰহ কৰি এগিলাচ পানী খাওক। পানী খোৱাটো স্বাস্থ্যৰ পক্ষে খুবেই ভাল।',
    mr: 'नमस्कार. कृपया एक ग्लास ताजे पाणी प्या. पाणी पिणे आरोग्यासाठी फायदेशीर आहे.',
    en: 'Hello. Please take a gentle sip of fresh water. Staying hydrated keeps your mind active and healthy.'
  },
  medicationMorning: {
    te: 'ఉదయపు సమయం. మీ డాక్టర్ సూచించిన ఉదయపు మందులను మంచినీళ్లతో వేసుకోండి.',
    hi: 'सुबह का समय है। कृपया अपने डॉक्टर द्वारा बताई गई सुबह की दवाइयाँ पानी के साथ लें।',
    ta: 'காலை நேரம். உங்கள் மருத்துவர் பரிந்துரைத்த காலை மருந்துகளை தண்ணீருடன் எடுத்துக்கொள்ளவும்.',
    kn: 'ಮುಂಜಾನೆಯ ಸಮಯ. ವೈದ್ಯರು ಸೂಚಿಸಿದ ಮಾತ್ರೆಗಳನ್ನು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
    bn: 'সকালের সময়। ডাক্তারের পরামর্শ অনুযায়ী সকালের ওষুধগুলি জলের সাথে খেয়ে নিন।',
    as: 'ৰাতিপুৱাৰ সময়। ডাক্তৰে কোৱা মতে ঔষধখিনি পানীৰ লগত খাওক।',
    mr: 'सकाळची वेळ आहे. डॉक्टरांच्या सल्ल्यानुसार सकाळची औषधे पाण्यासोबत घ्या.',
    en: 'It is time for your morning routine. Please take your prescribed morning medications with water.'
  },
  medicationEvening: {
    te: 'సాయంత్రపు సమయం. దయచేసి మీ రాత్రి మందులను సమయానికి తీసుకోండి.',
    hi: 'शाम का समय है। कृपया अपनी रात की दवाइयाँ समय पर लें।',
    ta: 'மாலை நேரம். உங்கள் இரவு மருந்துகளை சரியான நேரத்தில் எடுத்துக்கொள்ளுங்கள்.',
    kn: 'ಸಂಜೆಯ ಸಮಯ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾತ್ರಿಯ ಮಾತ್ರೆಗಳನ್ನು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
    bn: 'সন্ধ্যার সময়। রাতের ওষুধগুলি ঠিক সময়ে খেয়ে নিন।',
    as: 'গধূলিৰ সময়। ৰাতিৰ ঔষধখিনি সময়ত খাওক।',
    mr: 'संध्याकाळची वेळ आहे. रात्रीची औषधे वेळेवर घ्या.',
    en: 'Evening reminder. Please ensure you have taken your scheduled evening medications.'
  },
  gameIntro: {
    te: 'సరిపోలే చిత్రాల జతలను కనుగొనండి. కార్డును తిప్పడానికి దానిపై నొక్కండి. మీ స్వంత సమయంలో నిదానంగా చేయండి.',
    hi: 'मिलते-जुलते चित्रों के जोड़े खोजें। कार्ड को पलटने के लिए उस पर टैप करें। आराम से खेलें।',
    ta: 'பொருந்தும் படங்களின் ஜோடியைக் கண்டறியவும். அட்டையைத் திருப்ப தட்டவும். நிதானமாக விளையாடுங்கள்.',
    kn: 'ಹೊಂದಾಣಿಕೆಯಾಗುವ ಚಿತ್ರಗಳ ಜೋಡಿಯನ್ನು ಹುಡುಕಿ. ಕಾರ್ಡ್ ತಿರುಗಿಸಲು ಸ್ಪರ್ಶಿಸಿ. ನಿಧಾನವಾಗಿ ಆಡಿ.',
    bn: 'একই ছবির জোড়া খুঁজে বের করুন। কার্ডটি উল্টাতে ট্যাপ করুন। ধীরে ধীরে খেলুন।',
    as: 'মিলা ছবিৰ জোৰা বিচাৰি উলিয়াওক। কাৰ্ড ওলোটাবলৈ টিপক। ধীৰে ধীৰে খেলক।',
    mr: 'जुळणाऱ्या चित्रांच्या जोड्या शोधा. कार्ड पलटण्यासाठी त्यावर टॅप करा. शांतपणे खेळा.',
    en: 'Find and match the pairs. Tap any card to turn it over. Take as much time as you like.'
  },
  gameMatchSuccess: {
    te: 'చాలా బాగుంది! మీరు ఒక సరైన జతను కలిపారు.',
    hi: 'बहुत बढ़िया! आपने एक सही जोड़ी मिलाई।',
    ta: 'அற்புதம்! நீங்கள் சரியான ஜோடியை இணைத்தீர்கள்.',
    kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು! ನೀವು ಸರಿಯಾದ ಜೋಡಿಯನ್ನು ಹೊಂದಿಸಿದ್ದೀರಿ.',
    bn: 'খুব সুন্দর! আপনি একটি সঠিক জোড়া মিলিয়েছেন।',
    as: 'বৰ ধুনীয়া! আপুনি শুদ্ধ জোৰা মিলালে।',
    mr: 'खूप छान! तुम्ही योग्य जोडी जुळवली.',
    en: 'Wonderful! You found a matching pair.'
  },
  gameAllCompleted: {
    te: 'అభినందనలు! మీరు అన్ని జతలను పూర్తి చేశారు. మీ జ్ఞాపకశక్తి అద్భుతంగా పనిచేస్తోంది.',
    hi: 'बधाई हो! आपने पूरा खेल समाप्त कर लिया। आपका स्मरण कौशल शानदार है।',
    ta: 'வாழ்த்துகள்! நீங்கள் அனைத்து ஜோடிகளையும் முடித்துவிட்டீர்கள்.',
    kn: 'ಅಭಿನಂದನೆಗಳು! ನೀವು ಎಲ್ಲಾ ಜೋಡಿಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ.',
    bn: 'অভিনন্দন! আপনি সম্পূর্ণ ধাঁধা সমাধান করেছেন।',
    as: 'অভিনন্দন! আপুনি সকলো কাৰ্ড মিলাই দিলে।',
    mr: 'अभिनंदन! तुम्ही सर्व जोड्या पूर्ण केल्या आहेत.',
    en: 'Congratulations! You finished the entire puzzle. Wonderful memory work!'
  },
  thankYouConfirmation: {
    te: 'ధన్యవాదాలు! మీ ఆరోగ్యాన్ని చక్కగా చూసుకుంటున్నారు.',
    hi: 'धन्यवाद! आप अपने स्वास्थ्य का बहुत अच्छा ध्यान रख रहे हैं।',
    ta: 'நன்றி! உங்கள் உடல்நலத்தை சிறப்பாக கவனித்துக்கொள்கிறீர்கள்.',
    kn: 'ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಚೆನ್ನಾಗಿ ನೋಡಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.',
    bn: 'ধন্যবাদ! আপনি নিজের যত্ন খুব ভালো নিচ্ছেন।',
    as: 'ধন্যবাদ! আপুনি নিজৰ স্বাস্থ্যৰ ভাল যত্ন লৈছে।',
    mr: 'धन्यवाद! तुम्ही स्वतःची खूप छान काळजी घेत आहात.',
    en: 'Thank you! Wonderful job taking care of yourself.'
  },
  snoozeConfirmation: {
    te: 'సరే, నేను మీకు పది నిమిషాల తర్వాత మళ్లీ గుర్తు చేస్తాను.',
    hi: 'ठीक है, मैं आपको दस मिनट बाद फिर से याद दिलाऊंगा।',
    ta: 'சரி, பத்து நிமிடங்களில் மீண்டும் நினைவூட்டுகிறேன்.',
    kn: 'ಸರಿ, ಹತ್ತು ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ನೆನಪಿಸುತ್ತೇನೆ.',
    bn: 'ঠিক আছে, আমি দশ মিনিট পর আপনাকে আবার মনে করিয়ে দেব।',
    as: 'ঠিক আছে, মই দহ মিনিট পিছত আকৌ মনত পেলাই দিম।',
    mr: 'ठीक आहे, मी दहा मिनिटांनी पुन्हा आठवण करून देईन.',
    en: 'Okay, I will remind you again in 10 minutes.'
  }
};
