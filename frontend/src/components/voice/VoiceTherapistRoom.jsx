import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Heart,
  Flower2,
  Moon,
  Sun,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { speakText, stopSpeaking, playGentleTone } from '../../utils/speechUtils.js';

const THERAPY_LANGUAGES = [
  { code: 'te', label: 'తెలుగు (TE)', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी (HI)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (KN)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (BN)', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া (AS)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' },
  { code: 'en', label: 'English (EN)', flag: '🇬🇧' }
];

const STT_LANG_MAP = {
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  as: 'as-IN',
  mr: 'mr-IN',
  en: 'en-IN'
};

const THERAPY_FOCUS_MODES = [
  {
    id: 'calm',
    icon: '🌸',
    label: {
      te: 'ప్రశాంతత & ఆందోళన నివారణ',
      hi: 'शांति और चिंता से राहत',
      ta: 'அமைதி & பதற்றம் தணிப்பு',
      kn: 'ಶಾಂತಿ & ಆತಂಕ ನಿವಾರಣೆ',
      en: 'Calming & Anxiety Relief'
    }
  },
  {
    id: 'reminiscence',
    icon: '🏡',
    label: {
      te: 'మధుర బాల్య జ్ఞాపకాలు',
      hi: 'सुखद पुरानी यादें',
      ta: 'இனிய பழைய நினைவுகள்',
      kn: 'ಮಧುರ ಹಳೆಯ ನೆನಪುಗಳು',
      en: 'Cherished Reminiscence'
    }
  },
  {
    id: 'presence',
    icon: '☀️',
    label: {
      te: 'నేటి దినచర్య & ఆరోగ్యం',
      hi: 'आज की दिनचर्या व स्वास्थ्य',
      ta: 'இன்றைய நல்வாழ்வு',
      kn: 'ಇಂದಿನ ಕ್ಷೇಮ ಮತ್ತು ಆರೈಕೆ',
      en: 'Daily Presence & Health'
    }
  },
  {
    id: 'sleep',
    icon: '🌙',
    label: {
      te: 'గాఢ నిద్ర & విశ్రాంతి',
      hi: 'गहरी नींद और विश्राम',
      ta: 'ஆழ்ந்த தூக்கம் & ஓய்வு',
      kn: 'ಗಾಢ ನಿದ್ರೆ ಮತ್ತು ವಿಶ್ರಾಂತಿ',
      en: 'Sleep & Relaxation'
    }
  }
];

export const VoiceTherapistRoom = ({ isOpen, onClose }) => {
  const { lang, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(lang || 'te');
  const [focusMode, setFocusMode] = useState('calm');

  // Voice Loop States: 'idle' | 'therapist_speaking' | 'patient_speaking' | 'thinking'
  const [loopState, setLoopState] = useState('idle');
  const [lastTherapistSpeech, setLastTherapistSpeech] = useState('');
  const [patientTranscript, setPatientTranscript] = useState('');
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isVoiceLoopActive, setIsVoiceLoopActive] = useState(true);

  const recognitionRef = useRef(null);
  const isLoopActiveRef = useRef(isVoiceLoopActive);
  isLoopActiveRef.current = isVoiceLoopActive;

  // Sync language with context
  useEffect(() => {
    if (lang) setSelectedLang(lang);
  }, [lang]);

  // Clean exit
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = STT_LANG_MAP[selectedLang] || 'te-IN';

      recognition.onstart = () => {
        setLoopState('patient_speaking');
      };

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setPatientTranscript(current);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('[VoiceTherapist] STT error:', event.error);
        }
        if (isLoopActiveRef.current && loopState === 'patient_speaking') {
          // If silent, restart listening gently
          setTimeout(() => startPatientListening(), 500);
        }
      };

      recognition.onend = () => {
        setPatientTranscript(prev => {
          if (prev && prev.trim().length > 1) {
            handlePatientVoiceInput(prev.trim());
          } else if (isLoopActiveRef.current) {
            // Nothing spoken yet: keep listening gently
            setTimeout(() => {
              if (isLoopActiveRef.current && loopState === 'patient_speaking') {
                startPatientListening();
              }
            }, 600);
          }
          return '';
        });
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // Start Patient Listening
  const startPatientListening = () => {
    if (!recognitionRef.current || !isLoopActiveRef.current) return;
    try {
      recognitionRef.current.abort();
    } catch (e) {}

    try {
      recognitionRef.current.lang = STT_LANG_MAP[selectedLang] || 'te-IN';
      recognitionRef.current.start();
      setLoopState('patient_speaking');
    } catch (err) {
      console.warn('[VoiceTherapist] Start listen error:', err);
    }
  };

  // Start Therapist Voice
  const speakTherapistTurn = (text, onFinished = null) => {
    setLoopState('therapist_speaking');
    stopSpeaking();

    speakText(text, selectedLang, () => {
      if (onFinished) onFinished();
      // Hands-free voice turn-taking: automatically listen to patient!
      if (isLoopActiveRef.current) {
        setTimeout(() => {
          startPatientListening();
        }, 400);
      } else {
        setLoopState('idle');
      }
    }, 0.82);
  };

  // Initial greeting when room opens or language changes
  useEffect(() => {
    if (isOpen) {
      fetchInitialGreeting();
    } else {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      setLoopState('idle');
    }
  }, [isOpen, selectedLang, focusMode]);

  const fetchInitialGreeting = async () => {
    setLoopState('thinking');
    try {
      const res = await fetch(`/api/therapy/greeting?lang=${selectedLang}`);
      if (res.ok) {
        const data = await res.json();
        setLastTherapistSpeech(data.greeting);
        setSessionHistory([{ role: 'therapist', text: data.greeting }]);
        speakTherapistTurn(data.greeting);
      }
    } catch (e) {
      console.warn('[VoiceTherapist] Greeting fallback:', e);
      const fallback = selectedLang === 'te'
        ? 'నమస్కారం అండీ, నేను మీ థెరపిస్ట్ డాక్టర్ అనన్యను. ప్రశాంతంగా కూర్చుని నాతో మాట్లాడండి.'
        : 'Hello dear friend, I am Dr. Ananya. Sit comfortably and speak with me.';
      setLastTherapistSpeech(fallback);
      speakTherapistTurn(fallback);
    }
  };

  // Process Patient Voice Input
  const handlePatientVoiceInput = async (spokenText) => {
    if (!spokenText) return;

    setSessionHistory(prev => [...prev, { role: 'patient', text: spokenText }]);
    setLoopState('thinking');

    try {
      const res = await fetch('/api/therapy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: spokenText,
          language: selectedLang,
          focusMode,
          sessionHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response;
        setLastTherapistSpeech(reply);
        setSessionHistory(prev => [...prev, { role: 'therapist', text: reply }]);
        speakTherapistTurn(reply);
      } else {
        throw new Error('Therapy response failed');
      }
    } catch (e) {
      console.warn('[VoiceTherapist] Reply error:', e);
      const fallback = selectedLang === 'te'
        ? 'నేను మీ మాటలను శ్రద్ధగా వింటున్నాను అండీ. మీరు క్షేమంగా ఉన్నారు. నెమ్మదిగా ఊపిరి పీల్చుకోండి.'
        : 'I hear your voice softly and clearly. You are completely safe with me. Take a gentle breath.';
      setLastTherapistSpeech(fallback);
      speakTherapistTurn(fallback);
    }
  };

  const handleLanguageChange = (newCode) => {
    setSelectedLang(newCode);
    changeLanguage(newCode);
    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
  };

  const toggleLoopState = () => {
    if (isVoiceLoopActive) {
      setIsVoiceLoopActive(false);
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      setLoopState('idle');
    } else {
      setIsVoiceLoopActive(true);
      if (lastTherapistSpeech) {
        speakTherapistTurn(lastTherapistSpeech);
      } else {
        startPatientListening();
      }
    }
  };

  if (!isOpen) return null;

  const isTe = selectedLang === 'te';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(18, 14, 28, 0.96)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '94vh',
          backgroundColor: '#FCFAF8',
          borderRadius: '36px',
          border: '4px solid #7E57C2',
          boxShadow: '0 28px 72px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#F3EDF7',
            borderBottom: '2px solid #E7E0EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                backgroundColor: '#7E57C2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(126, 87, 194, 0.4)'
              }}
            >
              <Flower2 size={26} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1B1F', margin: 0 }}>
                {isTe ? 'డాక్టర్ అనన్య — వాయిస్ థెరపిస్ట్' : 'Dr. Ananya — Voice AI Therapist'}
              </h2>
              <span style={{ fontSize: '0.84rem', color: '#49454F', fontWeight: 700 }}>
                {isTe ? 'డిమెన్షియా & జ్ఞాపకశక్తి సాంత్వన గది' : 'Validation & Cognitive Reminiscence Therapy'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Room"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              border: '2px solid #CAC4D0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={22} color="#1C1B1F" />
          </button>
        </div>

        {/* 1-Click Language Switcher Bar */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#FAF5FF',
            borderBottom: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto'
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7E57C2', whiteSpace: 'nowrap', marginRight: '4px' }}>
            భాష / LANGUAGE:
          </span>
          {THERAPY_LANGUAGES.map(l => {
            const isSelected = selectedLang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #7E57C2' : '1px solid #CAC4D0',
                  backgroundColor: isSelected ? '#7E57C2' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#1C1B1F',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>

        {/* Therapy Focus Mode Pills */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E7E0EC',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {THERAPY_FOCUS_MODES.map(mode => {
            const isSelected = focusMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setFocusMode(mode.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #7E57C2' : '1px solid #CAC4D0',
                  backgroundColor: isSelected ? '#F3EDF7' : '#FFFFFF',
                  color: isSelected ? '#21005D' : '#49454F',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{mode.icon}</span>
                <span>{mode.label[selectedLang] || mode.label.en}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Breathing & Voice Wave Visualizer Center */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 24px',
            backgroundColor: '#FCFAF8',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Pulsing Breathing Circle */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px'
            }}
          >
            {/* Outer Organic Wave Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '-20px',
                borderRadius: '50%',
                backgroundColor: loopState === 'therapist_speaking'
                  ? 'rgba(126, 87, 194, 0.2)'
                  : loopState === 'patient_speaking'
                  ? 'rgba(30, 126, 52, 0.2)'
                  : 'rgba(234, 88, 12, 0.15)',
                animation: 'pulse 2.2s infinite ease-in-out',
                transform: loopState === 'therapist_speaking' ? 'scale(1.15)' : 'scale(1.0)'
              }}
            />

            {/* Inner Core Glow */}
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '70px',
                backgroundColor: loopState === 'therapist_speaking'
                  ? '#7E57C2'
                  : loopState === 'patient_speaking'
                  ? '#1E7E34'
                  : '#6750A4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                transition: 'all 0.4s ease'
              }}
            >
              {loopState === 'therapist_speaking' ? (
                <Volume2 size={64} color="#FFFFFF" />
              ) : loopState === 'patient_speaking' ? (
                <Mic size={64} color="#FFFFFF" className="pulse" />
              ) : loopState === 'thinking' ? (
                <Sparkles size={58} color="#FFFFFF" className="pulse" />
              ) : (
                <Heart size={64} color="#FFFFFF" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div
            style={{
              padding: '6px 18px',
              borderRadius: '16px',
              backgroundColor: loopState === 'therapist_speaking'
                ? '#F3EDF7'
                : loopState === 'patient_speaking'
                ? '#D1E7DD'
                : '#FEF3C7',
              color: loopState === 'therapist_speaking'
                ? '#21005D'
                : loopState === 'patient_speaking'
                ? '#0F5132'
                : '#92400E',
              fontWeight: 800,
              fontSize: '0.98rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: loopState === 'therapist_speaking'
                  ? '#7E57C2'
                  : loopState === 'patient_speaking'
                  ? '#1E7E34'
                  : '#D97706'
              }}
            />
            <span>
              {loopState === 'therapist_speaking'
                ? (isTe ? 'థెరపిస్ట్ డాక్టర్ అనన్య మాట్లాడుతున్నారు...' : 'Dr. Ananya is Speaking...')
                : loopState === 'patient_speaking'
                ? (isTe ? 'మీరు మాట్లాడండి, వింటున్నాను...' : 'Listening to your voice... Speak now')
                : loopState === 'thinking'
                ? (isTe ? 'ఆలోచిస్తున్నారు...' : 'Reflecting with care...')
                : (isTe ? 'స్టాండ్‌బై' : 'Voice Session Paused')}
            </span>
          </div>

          {/* Spoken Subtitles (High-Contrast Large Typography >= 1.25rem) */}
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              minHeight: '88px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #E7E0EC',
              padding: '16px 20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}
          >
            {loopState === 'patient_speaking' && patientTranscript ? (
              <p style={{ margin: 0, fontSize: '1.25rem', color: '#1E7E34', fontWeight: 700, fontStyle: 'italic' }}>
                "{patientTranscript}..."
              </p>
            ) : lastTherapistSpeech ? (
              <p style={{ margin: 0, fontSize: '1.25rem', color: '#1C1B1F', fontWeight: 600, lineHeight: 1.5 }}>
                {lastTherapistSpeech}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#79747E', fontWeight: 500 }}>
                {isTe ? 'సెషన్ ప్రారంభించడానికి మైక్ మాట్లాడండి...' : 'Session starting... Speak freely.'}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Hands-Free Controls */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#FFFFFF',
            borderTop: '2px solid #E7E0EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <button
            onClick={toggleLoopState}
            style={{
              flex: 1,
              minHeight: '52px',
              borderRadius: '18px',
              backgroundColor: isVoiceLoopActive ? '#7E57C2' : '#2B2930',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.02rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
            }}
          >
            {isVoiceLoopActive ? (
              <>
                <Mic size={22} color="#FFFFFF" />
                <span>{isTe ? 'వాయిస్-టు-వాయిస్ లూప్: ఆన్ (మాట్లాడండి)' : 'Voice-to-Voice: ACTIVE (Just speak)'}</span>
              </>
            ) : (
              <>
                <MicOff size={22} color="#CAC4D0" />
                <span>{isTe ? 'పాజ్ అయింది (ప్రారంభించడానికి నొక్కండి)' : 'Paused (Tap to resume talking)'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => speakTherapistTurn(lastTherapistSpeech)}
            title="Repeat therapist voice"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '26px',
              border: '2px solid #7E57C2',
              backgroundColor: '#F3EDF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={22} color="#7E57C2" />
          </button>
        </div>
      </div>
    </div>
  );
};
