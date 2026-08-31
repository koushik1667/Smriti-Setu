import React, { useState } from 'react';
import { Mic, Sparkles, Flower2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { LiveVoiceAgentModal } from './LiveVoiceAgentModal.jsx';
import { VoiceTherapistRoom } from './VoiceTherapistRoom.jsx';

export const FloatingVoiceAgentButton = () => {
  const { lang } = useLanguage();
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isTherapistOpen, setIsTherapistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAgentLabel = () => {
    if (lang === 'te') return 'వాయిస్ AI';
    if (lang === 'hi') return 'वॉइस एआई';
    if (lang === 'ta') return 'குரல் AI';
    if (lang === 'kn') return 'ಧ್ವನಿ AI';
    return 'Voice AI';
  };

  const getTherapistLabel = () => {
    if (lang === 'te') return 'వాయిస్ థెరపిస్ట్';
    if (lang === 'hi') return 'वॉइस थेरेपिस्ट';
    if (lang === 'ta') return 'சிகிச்சையாளர்';
    if (lang === 'kn') return 'ಥೆರಪಿಸ್ಟ್';
    return 'Voice Therapist';
  };

  return (
    <>
      {/* Mobile-Only Compact FAB Trigger (Replaces wide blocking pills on mobile) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-fab-trigger"
        aria-label="Toggle Voice Assistants"
        title="Open Voice Assistants"
      >
        {mobileMenuOpen ? <X size={20} /> : <Mic size={20} />}
      </button>

      {/* Floating Action Pills (Expanded on Desktop, Toggleable Pop-up on Mobile) */}
      <div
        className={`floating-voice-agents-container desktop-fab-pills${mobileMenuOpen ? ' mobile-open' : ''}`}
      >
        {/* Button 1: Fine-Tuned Voice-to-Voice Therapist */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setIsTherapistOpen(true);
          }}
          className="floating-voice-btn"
          aria-label="Open Voice-to-Voice Geriatric Therapist"
          style={{
            minHeight: '48px',
            padding: '0 18px',
            borderRadius: '24px',
            backgroundColor: '#7E57C2',
            color: '#FFFFFF',
            border: '2px solid #E9D5FF',
            boxShadow: '0 8px 24px rgba(126, 87, 194, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.94rem',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            className="floating-voice-btn-icon"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Flower2 size={16} color="#7E57C2" />
          </div>
          <span>{getTherapistLabel()}</span>
        </button>

        {/* Button 2: Live Voice Agent */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setIsAgentOpen(true);
          }}
          className="floating-voice-btn"
          aria-label="Open Live Multilingual Voice Agent"
          style={{
            minHeight: '48px',
            padding: '0 18px',
            borderRadius: '24px',
            backgroundColor: '#6750A4',
            color: '#FFFFFF',
            border: '2px solid #EADDFF',
            boxShadow: '0 8px 24px rgba(103, 80, 164, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.94rem',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            className="floating-voice-btn-icon"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Mic size={16} color="#6750A4" />
          </div>
          <span>{getAgentLabel()}</span>
          <Sparkles size={15} color="#EADDFF" />
        </button>
      </div>

      <LiveVoiceAgentModal isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
      <VoiceTherapistRoom isOpen={isTherapistOpen} onClose={() => setIsTherapistOpen(false)} />
    </>
  );
};
