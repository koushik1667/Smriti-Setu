import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  Heart,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { speakText, stopSpeaking, playGentleTone } from '../../utils/speechUtils.js';

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

const VOICE_LANGUAGES = [
  { code: 'te', label: 'తెలుగు (TE)', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी (HI)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (KN)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (BN)', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া (AS)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' },
  { code: 'en', label: 'English (EN)', flag: '🇬🇧' }
];

const SUGGESTED_QUERIES = {
  te: [
    'నేను ఇప్పుడు నీళ్లు తాగాలా?',
    'నా ఉదయపు మందులు ఏమిటి?',
    'జ్ఞాపకశక్తిని ఎలా పెంచుకోవాలి?',
    'నాకు తలనొప్పిగా ఉంది, ఏమి చేయాలి?'
  ],
  hi: [
    'क्या मुझे अभी पानी पीना चाहिए?',
    'मेरी सुबह की दवाइयाँ क्या हैं?',
    'स्मरण खेल कैसे खेलें?',
    'मुझे सिरदर्द है, क्या करना चाहिए?'
  ],
  ta: [
    'நான் இப்போது தண்ணீர் குடிக்க வேண்டுமா?',
    'என் காலை மருந்துகள் என்ன?',
    'நினைவாற்றலை எவ்வாறு அதிகரிப்பது?'
  ],
  kn: [
    'ನಾನು ಈಗ ನೀರು ಕುಡಿಯಬೇಕೇ?',
    'ನನ್ನ ಮುಂಜಾನೆಯ ಮಾತ್ರೆಗಳು ಯಾವುವು?',
    'ಸ್ಮರಣಶಕ್ತಿ ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ?'
  ],
  bn: [
    'আমার কি এখন জল খাওয়া উচিত?',
    'আমার সকালের ওষুধগুলি কী কী?',
    'স্মৃতিশক্তি কীভাবে বাড়াব?'
  ],
  as: [
    'মই এতিয়া পানী খাব লাগে নেকি?',
    'মোৰ ৰাতিপুৱাৰ ঔষধ কি কি?'
  ],
  mr: [
    'मी आता पाणी प्यावे का?',
    'माझी सकाळची औषधे कोणती आहेत?',
    'स्मरणशक्ती कशी वाढवावी?'
  ],
  en: [
    'Should I drink a glass of water now?',
    'What are my morning medications?',
    'How can I improve my memory score?',
    'I have a headache, what should I do?'
  ]
};

const AGENT_GREETINGS = {
  te: 'నమస్కారం! నేను మీ లైవ్ వాయిస్ అసిస్టెంట్‌ని. నాతో తెలుగులో మాట్లాడటానికి మైక్ నొక్కండి.',
  hi: 'नमस्ते! मैं आपका लाइव वॉइस असिस्टेंट हूँ। हिंदी में बात करने के लिए माइक दबाएं।',
  ta: 'வணக்கம்! நான் உங்கள் நேரடி குரல் உதவியாளர். தமிழில் பேச மைக் அழுத்தவும்.',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ನೇರ ಧ್ವನಿ ಸಹಾಯಕ. ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ.',
  bn: 'নমস্কার! আমি আপনার লাইভ ভয়েস সহকারী। বাংলায় কথা বলতে মাইক টিপুন।',
  as: 'নমস্কাৰ! মই আপোনাৰ লাইভ মাত সহায়ক। অসমীয়াত কথা ক’বলৈ মাইক টিপক।',
  mr: 'नमस्कार! मी तुमचा थेट व्हॉइस सहाय्यक आहे. मराठीत बोलण्यासाठी माइक दाबा.',
  en: 'Hello! I am your Live Voice Assistant. Tap the microphone to talk to me.'
};

export const LiveVoiceAgentModal = ({ isOpen, onClose }) => {
  const { lang, changeLanguage } = useLanguage();
  const [selectedVoiceLang, setSelectedVoiceLang] = useState(lang || 'te');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Sync state if context lang changes
  useEffect(() => {
    if (lang) setSelectedVoiceLang(lang);
  }, [lang]);

  // Switch voice language
  const handleSelectLanguage = (newLangCode) => {
    setSelectedVoiceLang(newLangCode);
    changeLanguage(newLangCode);
    stopSpeaking();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current.lang = STT_LANG_MAP[newLangCode] || 'en-IN';
    }

    const greeting = AGENT_GREETINGS[newLangCode] || AGENT_GREETINGS.en;
    setLastResponse(greeting);
    setChatHistory(prev => [
      ...prev,
      { role: 'agent', text: greeting, timestamp: Date.now(), lang: newLangCode }
    ]);
    speakAgentResponse(greeting, newLangCode);
  };

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = STT_LANG_MAP[selectedVoiceLang] || 'te-IN';

      recognition.onstart = () => {
        setIsListening(true);
        playGentleTone(659.25, 880.0);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('[LiveVoiceAgent] Recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript(prev => {
          if (prev.trim()) {
            handleSendMessage(prev.trim());
          }
          return '';
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, [selectedVoiceLang]);

  // Greet user on open
  useEffect(() => {
    if (isOpen) {
      const greeting = AGENT_GREETINGS[selectedVoiceLang] || AGENT_GREETINGS.en;
      setLastResponse(greeting);
      setChatHistory([
        { role: 'agent', text: greeting, timestamp: Date.now(), lang: selectedVoiceLang }
      ]);
      speakAgentResponse(greeting, selectedVoiceLang);
    } else {
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.abort();
    }
  }, [isOpen]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isListening, isLoading]);

  const speakAgentResponse = (text, targetLang = selectedVoiceLang) => {
    setIsSpeaking(true);
    speakText(text, targetLang, () => {
      setIsSpeaking(false);
    }, 0.85);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }

    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your query below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = STT_LANG_MAP[selectedVoiceLang] || 'te-IN';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('[LiveVoiceAgent] Could not start speech recognition:', e);
      }
    }
  };

  const handleSendMessage = async (userText) => {
    if (!userText || !userText.trim()) return;

    const trimmed = userText.trim();
    const lower = trimmed.toLowerCase();

    // Direct client detection for immediate instant switch
    let targetLang = selectedVoiceLang;
    if (lower === 'telugu' || lower === 'in telugu' || lower === 'speak in telugu' || lower === 'తెలుగు') {
      targetLang = 'te';
      setSelectedVoiceLang('te');
      changeLanguage('te');
    } else if (lower === 'hindi' || lower === 'in hindi' || lower === 'speak in hindi' || lower === 'हिंदी' || lower === 'हिन्दी') {
      targetLang = 'hi';
      setSelectedVoiceLang('hi');
      changeLanguage('hi');
    } else if (lower === 'tamil' || lower === 'in tamil' || lower === 'தமிழ்') {
      targetLang = 'ta';
      setSelectedVoiceLang('ta');
      changeLanguage('ta');
    } else if (lower === 'kannada' || lower === 'in kannada' || lower === 'ಕನ್ನಡ') {
      targetLang = 'kn';
      setSelectedVoiceLang('kn');
      changeLanguage('kn');
    }

    setChatHistory(prev => [...prev, { role: 'user', text: trimmed, timestamp: Date.now() }]);
    setManualInput('');
    setIsLoading(true);
    stopSpeaking();

    try {
      const res = await fetch('/api/voice-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: targetLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response;
        const finalLang = data.switchedLanguage || data.language || targetLang;

        if (data.switchedLanguage && data.switchedLanguage !== selectedVoiceLang) {
          setSelectedVoiceLang(data.switchedLanguage);
          changeLanguage(data.switchedLanguage);
        }

        setLastResponse(reply);
        setChatHistory(prev => [...prev, { role: 'agent', text: reply, timestamp: Date.now(), lang: finalLang }]);
        speakAgentResponse(reply, finalLang);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.warn('[LiveVoiceAgent] Fallback reply:', e);
      let localFallback = AGENT_GREETINGS[targetLang] || AGENT_GREETINGS.en;
      if (targetLang === 'te') {
        localFallback = 'నేను మీ మాట విన్నాను. దయచేసి ఒక గ్లాసు మంచినీళ్లు తాగి ఆరాముగా ఉండండి.';
      } else if (targetLang === 'hi') {
        localFallback = 'मैंने आपकी बात सुनी। कृपया एक गिलास ताज़ा पानी पिएं और आराम करें।';
      }
      setLastResponse(localFallback);
      setChatHistory(prev => [...prev, { role: 'agent', text: localFallback, timestamp: Date.now(), lang: targetLang }]);
      speakAgentResponse(localFallback, targetLang);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const suggestions = SUGGESTED_QUERIES[selectedVoiceLang] || SUGGESTED_QUERIES.en;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-agent-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 12, 29, 0.94)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          border: '4px solid #6750A4',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 22px 14px',
            backgroundColor: '#F3EDF7',
            borderBottom: '2px solid #E7E0EC',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: '#6750A4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(103, 80, 164, 0.3)'
                }}
              >
                <Sparkles size={24} color="#FFFFFF" />
              </div>
              <div>
                <h2
                  id="voice-agent-title"
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#1C1B1F',
                    margin: 0,
                    lineHeight: 1.2
                  }}
                >
                  {selectedVoiceLang === 'te'
                    ? 'సంజీవని AI లైవ్ వాయిస్ అసిస్టెంట్'
                    : selectedVoiceLang === 'hi'
                    ? 'संजीवनी एआई लाइव वॉइस असिस्टेंट'
                    : selectedVoiceLang === 'ta'
                    ? 'சஞ்சீவனி AI நேரடி குரல் உதவியாளர்'
                    : selectedVoiceLang === 'kn'
                    ? 'ಸಂಜೀವಿನಿ AI ಲೈವ್ ಧ್ವನಿ ಸಹಾಯಕ'
                    : 'Sanjeevani AI Live Voice Agent'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: isListening ? '#B3261E' : isSpeaking ? '#1E7E34' : '#6750A4'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#49454F' }}>
                    {isListening
                      ? (selectedVoiceLang === 'te' ? 'వింటోంది...' : selectedVoiceLang === 'hi' ? 'सुन रहा है...' : 'Listening...')
                      : isSpeaking
                      ? (selectedVoiceLang === 'te' ? 'మాట్లాడుతోంది...' : selectedVoiceLang === 'hi' ? 'बोल रहा है...' : 'Speaking...')
                      : isLoading
                      ? (selectedVoiceLang === 'te' ? 'ఆలోచిస్తోంది...' : selectedVoiceLang === 'hi' ? 'सोच रहा है...' : 'Thinking...')
                      : (selectedVoiceLang === 'te' ? 'సిద్ధంగా ఉంది (తెలుగు)' : selectedVoiceLang === 'hi' ? 'तैयार है (हिंदी)' : `Ready (${selectedVoiceLang.toUpperCase()})`)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Voice Assistant"
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

          {/* Direct 1-Click Language Switcher Bar inside the Modal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '2px'
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6750A4', whiteSpace: 'nowrap', marginRight: '4px' }}>
              భాష / LANGUAGE:
            </span>
            {VOICE_LANGUAGES.map((vLang) => {
              const isSelected = vLang.code === selectedVoiceLang;
              return (
                <button
                  key={vLang.code}
                  onClick={() => handleSelectLanguage(vLang.code)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #6750A4' : '1px solid #CAC4D0',
                    backgroundColor: isSelected ? '#6750A4' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#1C1B1F',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isSelected ? '0 2px 8px rgba(103,80,164,0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{vLang.flag}</span>
                  <span>{vLang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversational Visual Flow */}
        <div
          ref={chatScrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#FAF9FC'
          }}
        >
          {chatHistory.map((msg, i) => {
            const isAgent = msg.role === 'agent';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: isAgent ? 'flex-start' : 'flex-end',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: isAgent ? '#FFFFFF' : '#6750A4',
                    color: isAgent ? '#1C1B1F' : '#FFFFFF',
                    borderRadius: isAgent ? '24px 24px 24px 6px' : '24px 24px 6px 24px',
                    padding: '16px 20px',
                    border: isAgent ? '2px solid #E7E0EC' : 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: isAgent ? 600 : 700,
                      lineHeight: 1.5
                    }}
                  >
                    {msg.text}
                  </p>

                  {isAgent && (
                    <button
                      onClick={() => speakAgentResponse(msg.text, msg.lang || selectedVoiceLang)}
                      aria-label="Repeat Voice"
                      style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        backgroundColor: '#F3EDF7',
                        color: '#21005D',
                        border: '1px solid #CAC4D0',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Volume2 size={16} color="#6750A4" />
                      <span>{selectedVoiceLang === 'te' ? 'మళ్లీ వినండి' : selectedVoiceLang === 'hi' ? 'दोबारा सुनें' : 'Listen Again'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Real-time speech transcript bubble */}
          {transcript && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <div
                style={{
                  maxWidth: '85%',
                  backgroundColor: '#EADDFF',
                  color: '#21005D',
                  borderRadius: '24px 24px 6px 24px',
                  padding: '14px 18px',
                  fontStyle: 'italic',
                  fontSize: '1.15rem',
                  fontWeight: 600
                }}
              >
                "{transcript}..."
              </div>
            </div>
          )}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '12px 20px',
                  border: '2px solid #E7E0EC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6750A4',
                  fontWeight: 700
                }}
              >
                <Sparkles size={20} className="pulse" />
                <span>{selectedVoiceLang === 'te' ? 'సమాధానం సిద్ధమవుతోంది...' : selectedVoiceLang === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'Preparing comforting response...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips in User's Local Language */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E7E0EC',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                padding: '8px 14px',
                borderRadius: '16px',
                backgroundColor: '#F3EDF7',
                border: '1.5px solid #6750A4',
                color: '#21005D',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Big Mic Audio Control Center (High Contrast >= 72px) */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#FFFFFF',
            borderTop: '2px solid #E7E0EC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          {/* Animated Big Microphone Button */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(isListening || isSpeaking) && (
              <div
                style={{
                  position: 'absolute',
                  width: '108px',
                  height: '108px',
                  borderRadius: '54px',
                  backgroundColor: isListening ? 'rgba(179, 38, 30, 0.2)' : 'rgba(103, 80, 164, 0.25)',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            )}

            <button
              onClick={toggleListening}
              aria-label={isListening ? 'Stop Listening' : 'Start Talking'}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '42px',
                backgroundColor: isListening ? '#B3261E' : '#6750A4',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening
                  ? '0 8px 24px rgba(179, 38, 30, 0.5)'
                  : '0 8px 24px rgba(103, 80, 164, 0.4)',
                zIndex: 2,
                transition: 'all 0.25s ease'
              }}
            >
              {isListening ? (
                <MicOff size={42} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <Mic size={42} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: isListening ? '#B3261E' : '#1C1B1F'
              }}
            >
              {isListening
                ? (selectedVoiceLang === 'te' ? 'ఇప్పుడు మాట్లాడండి... (ఆపడానికి నొక్కండి)' : selectedVoiceLang === 'hi' ? 'अब बोलें... (रोकने के लिए दबाएं)' : 'Listening... Speak now (Tap to stop)')
                : (selectedVoiceLang === 'te' ? 'తెలుగులో మాట్లాడటానికి మైక్ నొక్కండి' : selectedVoiceLang === 'hi' ? 'हिंदी में बात करने के लिए माइक दबाएं' : 'Tap Microphone to Speak')}
            </span>
          </div>

          {/* Backup text input */}
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualInput.trim()) {
                  handleSendMessage(manualInput.trim());
                }
              }}
              placeholder={
                selectedVoiceLang === 'te'
                  ? 'లేదా తెలుగులో ఇక్కడ టైప్ చేయండి...'
                  : selectedVoiceLang === 'hi'
                  ? 'या हिंदी में यहाँ टाइप करें...'
                  : 'Or type here in your language...'
              }
              style={{
                flex: 1,
                minHeight: '48px',
                padding: '0 16px',
                borderRadius: '16px',
                border: '2px solid #CAC4D0',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendMessage(manualInput.trim())}
              disabled={!manualInput.trim()}
              style={{
                minWidth: '48px',
                minHeight: '48px',
                borderRadius: '16px',
                backgroundColor: manualInput.trim() ? '#6750A4' : '#E7E0EC',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: manualInput.trim() ? 'pointer' : 'default'
              }}
            >
              <Send size={20} color={manualInput.trim() ? '#FFFFFF' : '#79747E'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
