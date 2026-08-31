import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', label: 'EN', subtitle: 'Default Language' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', label: 'TE', subtitle: 'ప్రత్యక్ష అనువాదం (Live)' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', label: 'HI', subtitle: 'लाइव अनुवाद (Live)' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', label: 'TA', subtitle: 'நேரடி மொழிபெயர்ப்பு' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', label: 'KN', subtitle: 'ನೇರ ಅನುವಾದ (Live)' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', label: 'BN', subtitle: 'লাইভ অনুবাদ (Live)' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳', label: 'AS', subtitle: 'লাইভ অনুবাদ (NER)' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', label: 'MR', subtitle: 'थेट भाषांतर (Live)' }
];

export const LanguageSelector = ({ direction = 'down', align = 'right', style = {} }) => {
  const { lang, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  const isUp = direction === 'up';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {/* Trigger Pill Button - Amazon India Style */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title="Live Page Translation & Voice"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '7px 14px',
          borderRadius: 'var(--r-full)',
          background: isOpen ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)',
          color: isOpen ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
          border: '1.5px solid var(--border)',
          fontSize: '0.82rem',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          boxShadow: isOpen ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentLang.flag}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' }}>
            {currentLang.label}
          </span>
          <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>
            • {currentLang.native}
          </span>
        </div>
        <ChevronDown
          size={14}
          color="var(--md-sys-color-on-surface-variant)"
          style={{
            transform: isUp ? (isOpen ? 'rotate(0deg)' : 'rotate(180deg)') : (isOpen ? 'rotate(180deg)' : 'rotate(0deg)'),
            transition: 'transform 0.25s ease'
          }}
        />
      </button>

      {/* Floating Animated Dropdown Menu */}
      {isOpen && (
        <div
          className="fade-in"
          style={{
            position: 'absolute',
            ...(isUp ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
            ...(align === 'left' ? { left: 0 } : { right: 0 }),
            minWidth: '240px',
            background: 'var(--md-sys-color-surface-container-highest)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '2px solid var(--border)',
            borderRadius: '20px',
            padding: '8px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.24)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: isUp ? 'dropdownAppearUp 0.2s cubic-bezier(0.2, 0, 0, 1)' : 'dropdownAppearDown 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '6px 10px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} color="var(--md-sys-color-primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
              LIVE PAGE TRANSLATION & VOICE
            </span>
          </div>

          {LANGUAGES.map((item) => {
            const isSelected = item.code === lang;

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isSelected ? 'var(--md-sys-color-primary)' : 'transparent',
                  color: isSelected ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.flag}</span>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                      {item.native} <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>({item.label})</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: isSelected ? 0.9 : 0.65 }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check size={18} color="var(--md-sys-color-on-primary)" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
