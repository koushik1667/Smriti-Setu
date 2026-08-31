import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle, Check, Compass } from 'lucide-react';
import { voiceControlService } from '../../services/voiceControlService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const VoiceCommandBar = () => {
  const navigate = useNavigate();
  const { lang, changeLanguage } = useLanguage();
  const [state, setState] = useState({
    isEnabled: false,
    isListening: false,
    lastTranscript: '',
    lastFeedback: '',
    currentLang: lang
  });
  const [showCommandsHelp, setShowCommandsHelp] = useState(false);

  useEffect(() => {
    voiceControlService.setNavigationHandler((path) => {
      navigate(path);
    });

    voiceControlService.setLanguageChangeHandler((newLang) => {
      changeLanguage(newLang);
    });

    voiceControlService.setLanguage(lang);

    const unsub = voiceControlService.subscribe((updated) => {
      setState(updated);
    });

    return () => unsub();
  }, [navigate, changeLanguage, lang]);

  const toggleVoiceControl = () => {
    voiceControlService.toggle();
  };

  const isTe = lang === 'te';
  const isHi = lang === 'hi';

  return (
    <>
      {/* Floating Background Voice Control Strip */}
      <div
        className="voice-command-bar-container"
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: 'calc(100vw - 160px)'
        }}
      >
        <button
          onClick={toggleVoiceControl}
          className="voice-command-toggle-btn"
          aria-label={state.isEnabled ? 'Pause Voice Control' : 'Enable Background Voice Control'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            minHeight: '48px',
            borderRadius: '24px',
            backgroundColor: state.isEnabled ? (state.isListening ? '#1E7E34' : '#6750A4') : '#2B2930',
            color: '#FFFFFF',
            border: state.isEnabled ? '2px solid #A8DAB5' : '2px solid #79747E',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.92rem',
            userSelect: 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <div
            className="voice-command-icon-box"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {state.isEnabled ? (
              <Mic size={18} color="#FFFFFF" className={state.isListening ? 'pulse' : ''} />
            ) : (
              <MicOff size={18} color="#CAC4D0" />
            )}
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.1, fontWeight: 800 }}>
              {state.isEnabled
                ? (isTe ? 'VC: ఆన్' : isHi ? 'VC: चालू' : 'VC: ON')
                : 'VC'}
            </span>
            <span className="voice-command-subtext" style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
              {state.isEnabled
                ? (state.isListening
                    ? (isTe ? '● వింటోంది' : '● Listening')
                    : (isTe ? 'స్టాండ్‌బై' : 'Standby'))
                : (isTe ? 'నొక్కండి' : 'Tap to start')}
            </span>
          </div>
        </button>

        {/* Quick Command Help Toggle */}
        <button
          onClick={() => setShowCommandsHelp(!showCommandsHelp)}
          className="voice-command-help-btn"
          title="View Voice Commands"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '21px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #6750A4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Compass size={20} color="#6750A4" />
        </button>
      </div>

      {/* Live Command Feedback Pill */}
      {state.lastTranscript && state.isEnabled && (
        <div
          className="voice-command-feedback-pill"
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9989,
            backgroundColor: 'rgba(28, 27, 31, 0.94)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '10px 16px',
            maxWidth: '380px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            border: '1.5px solid #6750A4',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#EADDFF', fontWeight: 700, marginBottom: '2px' }}>
            {isTe ? 'గుర్తించిన మాట:' : 'Heard Command:'}
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>
            "{state.lastTranscript}"
          </div>
          {state.lastFeedback && (
            <div style={{ fontSize: '0.85rem', color: '#A8DAB5', marginTop: '4px', fontWeight: 600 }}>
              ✓ {state.lastFeedback}
            </div>
          )}
        </div>
      )}

      {/* Voice Commands Cheat-Sheet Modal */}
      {showCommandsHelp && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99995,
            backgroundColor: 'rgba(15, 12, 29, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowCommandsHelp(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '28px',
              padding: '28px 24px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              border: '3px solid #6750A4'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={24} color="#6750A4" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1C1B1F' }}>
                  {isTe ? 'వాయిస్ కంట్రోల్ ఆదేశాలు' : 'Voice Control Commands'}
                </h3>
              </div>
              <button
                onClick={() => setShowCommandsHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: '#49454F'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px', color: '#49454F', fontSize: '0.92rem', lineHeight: 1.5 }}>
              {isTe
                ? 'వాయిస్ కంట్రోల్ ఆన్‌లో ఉన్నప్పుడు మీరు ఎక్కడినుంచైనా ఈ మాటలు పలికి యాప్‌ని నడపవచ్చు:'
                : 'When Voice Control is ON, simply speak any of these commands out loud from any screen:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#F3EDF7', borderRadius: '14px', padding: '12px 14px' }}>
                <strong style={{ color: '#21005D', fontSize: '0.9rem' }}>
                  {isTe ? 'నావిగేషన్ (పేజీలు తెరవండి):' : 'Navigation Commands:'}
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"హోమ్" ➔ హోమ్ పేజీ' : '"Home" ➔ Dashboard'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"జ్ఞాపకశక్తి ఆట" ➔ ఆట పేజీ' : '"Game" ➔ Memory Match'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"రిమైండర్లు" ➔ మందుల సమయం' : '"Reminders" ➔ Alerts'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"కేర్ గివర్" ➔ కేర్ గివర్ హబ్' : '"Caregiver" ➔ Analytics'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"స్కానర్" ➔ మందుల స్కానర్' : '"Scanner" ➔ Camera'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"క్యాబినెట్" ➔ నా మందులు' : '"Cabinet" ➔ Medicine Shelves'}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: '#EADDFF', borderRadius: '14px', padding: '12px 14px' }}>
                <strong style={{ color: '#21005D', fontSize: '0.9rem' }}>
                  {isTe ? 'పనులు నమోదు చేయండి:' : 'Action Logging Commands:'}
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"నీళ్లు తాగాను" ➔ హైడ్రేషన్ రికార్డ్' : '"I drank water" ➔ Log Water'}
                  </span>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    {isTe ? '"మందులు వేసుకున్నాను" ➔ మోతాదు రికార్డ్' : '"I took medicine" ➔ Log Dose'}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: '#E0F2FE', borderRadius: '14px', padding: '12px 14px' }}>
                <strong style={{ color: '#0369A1', fontSize: '0.9rem' }}>
                  {isTe ? 'భాష మార్చండి:' : 'Language Commands:'}
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <span style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                    "తెలుగు" / "English" / "हिंदी"
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCommandsHelp(false)}
              style={{
                width: '100%',
                marginTop: '18px',
                minHeight: '48px',
                borderRadius: '16px',
                backgroundColor: '#6750A4',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {isTe ? 'అర్థమైంది' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
