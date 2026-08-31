/**
 * High-Efficiency Multilingual Speech Synthesis & Web Audio Engine
 * Supports Indian Languages: Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN),
 * Kannada (kn-IN), Bengali (bn-IN), Assamese (as-IN), Marathi (mr-IN), and Indian English (en-IN).
 * Seamlessly integrates /api/tts streaming fallback when OS lacks native regional voice packs.
 */

const LANG_CODE_MAP = {
  te: 'te-IN', // Telugu
  hi: 'hi-IN', // Hindi
  ta: 'ta-IN', // Tamil
  kn: 'kn-IN', // Kannada
  bn: 'bn-IN', // Bengali
  as: 'as-IN', // Assamese
  mr: 'mr-IN', // Marathi
  en: 'en-IN'  // Indian English
};

// Cached voices list & singleton AudioContext for maximum efficiency
let cachedVoices = [];
let sharedAudioCtx = null;
let activeAudioElement = null;

// Initialize voices eagerly and cache them
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {}
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

/**
 * Singleton AudioContext getter (prevents browser audio resource exhaustion)
 */
export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Plays a warm, soothing dual chime tone efficiently
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
 * Checks if the browser/OS has an authentic native voice for the given language
 */
function hasTrueNativeVoice(targetLang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  if (!cachedVoices || cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }

  const bcpCode = LANG_CODE_MAP[targetLang] || targetLang || 'en-IN';
  const prefix = bcpCode.split('-')[0].toLowerCase();
  if (prefix === 'en') return true;

  return cachedVoices.some(v => v.lang.toLowerCase().startsWith(prefix));
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

  const bcpCode = LANG_CODE_MAP[targetLang] || targetLang || 'en-IN';
  const prefix = bcpCode.split('-')[0].toLowerCase();

  // 1. Exact match (e.g., 'te-IN' or 'hi-IN')
  let match = cachedVoices.find(v => v.lang.toLowerCase() === bcpCode.toLowerCase());
  if (match) return match;

  // 2. Language prefix match (e.g., 'te', 'hi', 'ta', 'kn', 'bn')
  match = cachedVoices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (match) return match;

  return null;
}

/**
 * Plays high-fidelity streaming audio via /api/tts endpoint
 * Guarantees native Indian language audio playback even if Windows lacks voice packs!
 */
export function playStreamAudio(text, lang = 'te', onEndCallback = null) {
  stopSpeaking();

  if (!text || typeof text !== 'string') {
    if (onEndCallback) onEndCallback();
    return;
  }

  // Break text into natural spoken phrases (~120 chars max)
  const rawSentences = text
    .split(/([.,!?।\n]+)/)
    .filter(s => s.trim().length > 0);

  const chunks = [];
  let buffer = '';

  for (const seg of rawSentences) {
    if ((buffer + seg).length > 130) {
      if (buffer.trim()) chunks.push(buffer.trim());
      buffer = seg;
    } else {
      buffer += seg;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  if (chunks.length === 0) chunks.push(text);

  let currentIndex = 0;

  function playNextChunk() {
    if (currentIndex >= chunks.length) {
      activeAudioElement = null;
      if (onEndCallback) onEndCallback();
      return;
    }

    const chunk = chunks[currentIndex++];
    const url = `/api/tts?text=${encodeURIComponent(chunk)}&lang=${lang}`;
    const audio = new Audio(url);
    activeAudioElement = audio;

    audio.onended = () => {
      playNextChunk();
    };

    audio.onerror = (e) => {
      console.warn('[speechUtils] Stream audio error on chunk:', e);
      playNextChunk();
    };

    audio.play().catch(playErr => {
      console.warn('[speechUtils] Audio play failed (interaction needed):', playErr);
      if (onEndCallback) onEndCallback();
    });
  }

  playNextChunk();
}

/**
 * Multilingual speech synthesis with elderly pacing
 * Automatically uses high-fidelity streaming audio if OS lacks local Indian voice packs.
 */
export function speakText(text, lang = 'en', onEndCallback = null, rate = 0.82) {
  if (!text || typeof text !== 'string') {
    if (onEndCallback) onEndCallback();
    return;
  }

  // If language is not English and OS lacks native voice, use streaming audio immediately!
  if (lang !== 'en' && !hasTrueNativeVoice(lang)) {
    playStreamAudio(text, lang, onEndCallback);
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    playStreamAudio(text, lang, onEndCallback);
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bcp47 = LANG_CODE_MAP[lang] || lang || 'en-US';

    utterance.lang = bcp47;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const matchedVoice = findBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else if (lang !== 'en') {
      // No regional voice found, fallback to streaming audio
      playStreamAudio(text, lang, onEndCallback);
      return;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    utterance.onerror = (e) => {
      console.warn('[speechUtils] Native utterance failed, switching to streaming audio:', e);
      playStreamAudio(text, lang, onEndCallback);
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[speechUtils] speakText error, falling back to stream:', e);
    playStreamAudio(text, lang, onEndCallback);
  }
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

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {}
    activeAudioElement = null;
  }
}

/**
 * Pre-compiled, culturally comforting voice prompts for low-connectivity environments
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
