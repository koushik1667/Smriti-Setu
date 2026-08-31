/**
 * Universal Background Voice Assistant & Voice Control Engine
 * Supports ALL 8 Languages:
 * Telugu (te), Hindi (hi), Tamil (ta), Kannada (kn),
 * Bengali (bn), Assamese (as), Marathi (mr), and English (en).
 */

import { speakText, playGentleTone, stopSpeaking } from '../utils/speechUtils.js';
import { syncManager } from './syncManager.js';

const STT_LANG_CODES = {
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  as: 'as-IN',
  mr: 'mr-IN',
  en: 'en-IN'
};

const FEEDBACK_STRINGS = {
  home: {
    te: 'హోమ్ పేజీకి వెళ్తున్నాను.',
    hi: 'होम पेज खोल रहा हूँ।',
    ta: 'முகப்புப் பக்கத்திற்கு செல்கிறேன்.',
    kn: 'ಮುಖಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'হোম পেজ খুলছি।',
    as: 'মূলপৃষ্ঠা খুলি আছোঁ।',
    mr: 'मुख्यपृष्ठ उघडत आहे.',
    en: 'Navigating to Home.'
  },
  game: {
    te: 'జ్ఞాపకశక్తి ఆట తెరుస్తున్నాను.',
    hi: 'स्मरण खेल खोल रहा हूँ।',
    ta: 'நினைவாற்றல் விளையாட்டைத் திறக்கிறேன்.',
    kn: 'ಸ್ಮರಣಶಕ್ತಿ ಆಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'স্মৃতিচর্চা খেলা খুলছি।',
    as: 'স্মৃতিশক্তিৰ খেল খুলি আছোঁ।',
    mr: 'स्मरणशक्ती खेळ उघडत आहे.',
    en: 'Opening Memory Match game.'
  },
  reminders: {
    te: 'రోజువారీ రిమైండర్ల పేజీ తెరుస్తున్నాను.',
    hi: 'दैनिक अनुस्मारक खोल रहा हूँ।',
    ta: 'நினைவூட்டல் பக்கத்தைத் திறக்கிறேன்.',
    kn: 'ದೈನಂದಿನ ಜ್ಞಾಪನೆಗಳು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'অনুস্মারক পৃষ্ঠা খুলছি।',
    as: 'সোঁৱৰণী পৃষ্ঠা খুলি আছোঁ।',
    mr: 'स्मरणपत्रे उघडत आहे.',
    en: 'Opening Daily Reminders.'
  },
  caregiver: {
    te: 'కేర్ గివర్ డ్యాష్‌బోర్డ్ తెరుస్తున్నాను.',
    hi: 'देखभालकर्ता हब खोल रहा हूँ।',
    ta: 'பராமரிப்பாளர் மையம் திறக்கிறேன்.',
    kn: 'ಪಾಲಕರ ಕೇಂದ್ರ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'কেয়ারগিভার হাব খুলছি।',
    as: 'যত্নকাৰী কেন্দ্ৰ খুলি আছোঁ।',
    mr: 'काळजीवाहू केंद्र उघडत आहे.',
    en: 'Opening Caregiver Hub.'
  },
  scanner: {
    te: 'మందుల స్కానర్ తెరుస్తున్నాను.',
    hi: 'दवा स्कैनर खोल रहा हूँ।',
    ta: 'மருந்து ஸ்கேனரைத் திறக்கிறேன்.',
    kn: 'ಔಷಧಿ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'ওষুধ স্ক্যানার খুলছি।',
    as: 'ঔষধ স্কেনাৰ খুলি আছোঁ।',
    mr: 'औषध स्कॅनर उघडत आहे.',
    en: 'Opening Medicine Scanner.'
  },
  cabinet: {
    te: 'మీ మెడిసిన్ క్యాబినెట్ తెరుస్తున్నాను.',
    hi: 'आपकी दवा अलमारी खोल रहा हूँ।',
    ta: 'மருந்து பெட்டகத்தைத் திறக்கிறேன்.',
    kn: 'ಔಷಧಿ ಪೆಟ್ಟಿಗೆ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'ওষুধের ক্যাবিনেট খুলছি।',
    as: 'ঔষধৰ বাকচ খুলি আছোঁ।',
    mr: 'औषध पेटी उघडत आहे.',
    en: 'Opening Medicine Cabinet.'
  },
  reports: {
    te: 'రిపోర్ట్‌ల విభాగం తెరుస్తున్నాను.',
    hi: 'रिपोर्ट विश्लेषण खोल रहा हूँ।',
    ta: 'அறிக்கைகள் பகுதியைத் திறக்கிறேன்.',
    kn: 'ವರದಿಗಳ ವಿಭಾಗ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    bn: 'রিপোর্ট বিভাগ খুলছি।',
    as: 'ৰিপৰ্টৰ অংশ খুলি আছোঁ।',
    mr: 'अहवाल विभाग उघडत आहे.',
    en: 'Opening Reports and Prescriptions.'
  },
  waterRecorded: {
    te: 'చాలా మంచిది! మీరు నీళ్లు తాగినట్టు నమోదు చేశాను.',
    hi: 'बहुत बढ़िया! आपका पानी पीना दर्ज कर लिया गया है।',
    ta: 'அற்புதம்! நீங்கள் தண்ணீர் குடித்தது பதிவு செய்யப்பட்டது.',
    kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು! ನೀವು ನೀರು ಕುಡಿದದ್ದು ದಾಖಲಾಗಿದೆ.',
    bn: 'খুব ভালো! আপনার জল খাওয়ার তথ্য নথিভুক্ত হয়েছে।',
    as: 'বৰ ভাল! আপুনি পানী খোৱাৰ তথ্য সংৰক্ষণ কৰা হ’ল।',
    mr: 'खूप छान! तुम्ही पाणी प्यायल्याची नोंद केली आहे.',
    en: 'Wonderful! Recorded your hydration intake.'
  },
  medicationRecorded: {
    te: 'ధన్యవాదాలు! మీ మందులు వేసుకున్నట్టు నమోదు చేశాను.',
    hi: 'धन्यवाद! आपकी दवा लेना दर्ज कर लिया गया है।',
    ta: 'நன்றி! நீங்கள் மருந்து உட்கொண்டது பதிவு செய்யப்பட்டது.',
    kn: 'ಧನ್ಯವಾದಗಳು! ನೀವು ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡದ್ದು ದಾಖಲಾಗಿದೆ.',
    bn: 'ধন্যবাদ! আপনার ওষুধ খাওয়ার তথ্য নথিভুক্ত হয়েছে।',
    as: 'ধন্যবাদ! আপোনাৰ ঔষধ খোৱাৰ তথ্য সংৰক্ষণ কৰা হ’ল।',
    mr: 'धन्यवाद! तुम्ही औषध घेतल्याची नोंद केली आहे.',
    en: 'Thank you! Recorded your medication dose.'
  }
};

class VoiceControlService {
  constructor() {
    this.recognition = null;
    this.isEnabled = false;
    this.isListening = false;
    this.listeners = new Set();
    this.navigateHandler = null;
    this.languageChangeHandler = null;
    this.currentLang = 'te';
    this.lastTranscript = '';
    this.lastFeedback = '';

    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('pharmavision_lang');
      if (savedLang) this.currentLang = savedLang;
      this.initRecognition();
    }
  }

  setNavigationHandler(handler) {
    this.navigateHandler = handler;
  }

  setLanguageChangeHandler(handler) {
    this.languageChangeHandler = handler;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({
      isEnabled: this.isEnabled,
      isListening: this.isListening,
      lastTranscript: this.lastTranscript,
      lastFeedback: this.lastFeedback,
      currentLang: this.currentLang
    });
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const l of this.listeners) {
      try {
        l({
          isEnabled: this.isEnabled,
          isListening: this.isListening,
          lastTranscript: this.lastTranscript,
          lastFeedback: this.lastFeedback,
          currentLang: this.currentLang
        });
      } catch (e) {}
    }
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[VoiceControl] SpeechRecognition not supported in browser');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = STT_LANG_CODES[this.currentLang] || 'te-IN';

      rec.onstart = () => {
        this.isListening = true;
        this.notify();
      };

      rec.onresult = (event) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.trim();
        if (transcript) {
          this.processVoiceCommand(transcript);
        }
      };

      rec.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.warn('[VoiceControl] Error:', e.error);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        this.notify();
        // If still enabled, automatically re-listen in background!
        if (this.isEnabled) {
          setTimeout(() => {
            if (this.isEnabled && !this.isListening) {
              try {
                this.recognition.lang = STT_LANG_CODES[this.currentLang] || 'te-IN';
                this.recognition.start();
              } catch (err) {}
            }
          }, 300);
        }
      };

      this.recognition = rec;
    } catch (err) {
      console.warn('[VoiceControl] Init failed:', err);
    }
  }

  start() {
    this.isEnabled = true;
    if (!this.recognition) this.initRecognition();
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = STT_LANG_CODES[this.currentLang] || 'te-IN';
        this.recognition.start();
        playGentleTone(523.25, 783.99);
      } catch (e) {
        console.warn('[VoiceControl] Start error:', e);
      }
    }
    this.notify();
  }

  stop() {
    this.isEnabled = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.notify();
  }

  toggle() {
    if (this.isEnabled) {
      this.stop();
    } else {
      this.start();
    }
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
    if (this.recognition) {
      this.recognition.lang = STT_LANG_CODES[langCode] || 'te-IN';
    }
    this.notify();
  }

  getFeedback(type) {
    const dict = FEEDBACK_STRINGS[type];
    if (!dict) return '';
    return dict[this.currentLang] || dict.en || '';
  }

  /**
   * Multilingual intent detection across all 8 languages
   */
  async processVoiceCommand(rawTranscript) {
    this.lastTranscript = rawTranscript;
    const text = rawTranscript.toLowerCase();
    console.log(`[VoiceControl] [${this.currentLang}] Command:`, rawTranscript);
    this.notify();

    // ─── 1. Navigation Commands across all 8 languages ────────────────────
    // Home / Dashboard
    if (
      text.includes('home') || text.includes('dashboard') ||
      text.includes('హోమ్') || text.includes('హోం') || text.includes('డాష్') ||
      text.includes('होम') || text.includes('डैशबोर्ड') ||
      text.includes('முகப்பு') ||
      text.includes('ಮುಖಪುಟ') ||
      text.includes('হোম') ||
      text.includes('মূলপৃষ্ঠা') ||
      text.includes('मुख्यपृष्ठ')
    ) {
      if (this.navigateHandler) this.navigateHandler('/dashboard');
      this.giveFeedback(this.getFeedback('home'));
      return;
    }

    // Cognitive Memory Match Game
    if (
      text.includes('game') || text.includes('match') ||
      text.includes('ఆట') || text.includes('జ్ఞాపకశక్తి') ||
      text.includes('खेल') || text.includes('स्मरण') ||
      text.includes('விளையாட்டு') || text.includes('நினைவாற்றல்') ||
      text.includes('ಆಟ') || text.includes('ಸ್ಮರಣ') ||
      text.includes('খেলা') || text.includes('স্মৃতি') ||
      text.includes('খেল') || text.includes('স্মৃতিশক্তি') ||
      text.includes('खेळ') || text.includes('स्मरणशक्ती')
    ) {
      if (this.navigateHandler) this.navigateHandler('/cognitive-game');
      this.giveFeedback(this.getFeedback('game'));
      return;
    }

    // Reminders / Alerts
    if (
      text.includes('reminder') || text.includes('alert') ||
      text.includes('రిమైండర్') || text.includes('మందుల సమయం') ||
      text.includes('अनुस्मारक') || text.includes('दवा का समय') ||
      text.includes('நினைவூட்டல்') ||
      text.includes('ಜ್ಞಾಪನೆ') ||
      text.includes('সোঁৱৰণী') ||
      text.includes('স্মরণপত্র')
    ) {
      if (this.navigateHandler) this.navigateHandler('/memory-assistance');
      this.giveFeedback(this.getFeedback('reminders'));
      return;
    }

    // Caregiver Hub
    if (
      text.includes('caregiver') || text.includes('analytics') ||
      text.includes('కేర్ గివర్') || text.includes('కేర్‌గివర్') ||
      text.includes('देखभालकर्ता') ||
      text.includes('பராமரிப்பாளர்') ||
      text.includes('ಪಾಲಕರು') ||
      text.includes('কেয়ারগিভার') ||
      text.includes('যত্নকাৰী') ||
      text.includes('काळजीवाहू')
    ) {
      if (this.navigateHandler) this.navigateHandler('/caregiver-dashboard');
      this.giveFeedback(this.getFeedback('caregiver'));
      return;
    }

    // Scanner
    if (
      text.includes('scanner') || text.includes('scan') ||
      text.includes('స్కానర్') || text.includes('స్కాన్') ||
      text.includes('स्कैनर') || text.includes('स्कैन') ||
      text.includes('ஸ்கேனர்') ||
      text.includes('ಸ್ಕ್ಯಾನರ್') ||
      text.includes('স্ক্যানার') ||
      text.includes('স্কেনাৰ') ||
      text.includes('स्कॅनर')
    ) {
      if (this.navigateHandler) this.navigateHandler('/scanner');
      this.giveFeedback(this.getFeedback('scanner'));
      return;
    }

    // Cabinet
    if (
      text.includes('cabinet') ||
      text.includes('క్యాబినెట్') || text.includes('నా మందులు') ||
      text.includes('अलमारी') ||
      text.includes('பெட்டகம்') ||
      text.includes('ಪೆಟ್ಟಿಗೆ') ||
      text.includes('ক্যাবিনেট') ||
      text.includes('বাকচ') ||
      text.includes('पेटी')
    ) {
      if (this.navigateHandler) this.navigateHandler('/cabinet');
      this.giveFeedback(this.getFeedback('cabinet'));
      return;
    }

    // Reports & Rx
    if (
      text.includes('report') || text.includes('prescription') ||
      text.includes('రిపోర్టు') || text.includes('ప్రిస్క్రిప్షన్') ||
      text.includes('रिपोर्ट') || text.includes('पर्ची') ||
      text.includes('அறிக்கை') ||
      text.includes('ವರದಿ') ||
      text.includes('ৰিপৰ্ট') ||
      text.includes('अहवाल')
    ) {
      if (this.navigateHandler) this.navigateHandler('/report-analyzer');
      this.giveFeedback(this.getFeedback('reports'));
      return;
    }

    // ─── 2. Action Commands: Hydration & Medication Adherence ─────────────
    if (
      text.includes('drank water') || text.includes('water done') ||
      text.includes('నీళ్లు తాగాను') || text.includes('నీరు తాగాను') || text.includes('తాగేశాను') ||
      text.includes('पानी पी लिया') || text.includes('पानी पी चुका') ||
      text.includes('தண்ணீர் குடித்தேன்') ||
      text.includes('ನೀರು ಕುಡಿದೆ') ||
      text.includes('জল খেয়েছি') ||
      text.includes('পানী খালোঁ') ||
      text.includes('पाणी प्यायलो') || text.includes('पाणी पिले')
    ) {
      await syncManager.recordAdherence({
        reminderId: 'hydration_voice_cmd',
        reminderType: 'hydration',
        scheduledTime: Date.now(),
        actionTaken: 'confirmed',
        actionTimestamp: Date.now()
      });
      playGentleTone(523.25, 659.25);
      this.giveFeedback(this.getFeedback('waterRecorded'));
      return;
    }

    if (
      text.includes('took medicine') || text.includes('medicine taken') ||
      text.includes('మందులు వేసుకున్నాను') || text.includes('మాత్రలు వేసుకున్నాను') ||
      text.includes('दवाई ले ली') || text.includes('दवा ले ली') ||
      text.includes('மருந்து சாப்பிட்டேன்') ||
      text.includes('ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡೆ') ||
      text.includes('ওষুধ খেয়েছি') ||
      text.includes('ঔষধ খালোঁ') ||
      text.includes('औषध घेतले')
    ) {
      await syncManager.recordAdherence({
        reminderId: 'medication_voice_cmd',
        reminderType: 'medication',
        scheduledTime: Date.now(),
        actionTaken: 'confirmed',
        actionTimestamp: Date.now()
      });
      playGentleTone(523.25, 659.25);
      this.giveFeedback(this.getFeedback('medicationRecorded'));
      return;
    }

    // ─── 3. Language Switching Voice Commands for all 8 Languages ─────────
    const langCommands = [
      { code: 'te', triggers: ['తెలుగు', 'telugu'], feedback: 'తెలుగు భాషకు మార్చబడింది.' },
      { code: 'hi', triggers: ['हिंदी', 'हिन्दी', 'hindi'], feedback: 'हिंदी भाषा सेट कर दी गई है।' },
      { code: 'ta', triggers: ['தமிழ்', 'tamil'], feedback: 'தமிழ் மொழி அமைக்கப்பட்டது.' },
      { code: 'kn', triggers: ['ಕನ್ನಡ', 'kannada'], feedback: 'ಕನ್ನಡ ಭಾಷೆ ಹೊಂದಿಸಲಾಗಿದೆ.' },
      { code: 'bn', triggers: ['বাংলা', 'bengali'], feedback: 'বাংলা ভাষা সেট করা হয়েছে।' },
      { code: 'as', triggers: ['অসমীয়া', 'assamese'], feedback: 'অসমীয়া ভাষা নিৰ্বাচিত হ’ল।' },
      { code: 'mr', triggers: ['मराठी', 'marathi'], feedback: 'मराठी भाषा सेट केली आहे.' },
      { code: 'en', triggers: ['english', 'ఇంగ్లీష్', 'अंग्रेजी'], feedback: 'Switched to English.' }
    ];

    for (const item of langCommands) {
      if (item.triggers.some(t => text.includes(t))) {
        if (this.languageChangeHandler) this.languageChangeHandler(item.code);
        this.setLanguage(item.code);
        this.giveFeedback(item.feedback, item.code);
        return;
      }
    }

    // ─── 4. Fallback: Health & General Conversation via Gemini AI ─────────
    try {
      const res = await fetch('/api/voice-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawTranscript,
          language: this.currentLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          this.giveFeedback(data.response, data.language || this.currentLang);
        }
      }
    } catch (err) {
      console.warn('[VoiceControl] Fallback query error:', err);
    }
  }

  giveFeedback(text, lang = this.currentLang) {
    this.lastFeedback = text;
    this.notify();
    speakText(text, lang, () => {}, 0.85);
  }
}

export const voiceControlService = new VoiceControlService();
