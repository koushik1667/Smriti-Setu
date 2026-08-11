import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', label: 'EN' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', label: 'HI' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', label: 'TE' }
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
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          width: '100%',
          padding: '7px 12px',
          borderRadius: 'var(--r-full)',
          background: isOpen ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)',
          color: isOpen ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
          border: '1px solid var(--border)',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          boxShadow: isOpen ? 'var(--shadow-elevation-2)' : 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.92rem', lineHeight: 1 }}>{currentLang.flag}</span>
          <span style={{ fontSize: '0.78rem' }}>{currentLang.native}</span>
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

      {/* Floating Animated Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          className="fade-in"
          style={{
            position: 'absolute',
            ...(isUp ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
            ...(align === 'left' ? { left: 0 } : { right: 0 }),
            minWidth: '175px',
            background: 'var(--md-sys-color-surface-container-highest)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '6px',
            boxShadow: 'var(--shadow-elevation-3)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            animation: isUp ? 'dropdownAppearUp 0.2s cubic-bezier(0.2, 0, 0, 1)' : 'dropdownAppearDown 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
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
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: isSelected ? 'var(--md-sys-color-primary)' : 'transparent',
                  color: isSelected ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                  fontSize: '0.82rem',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>{item.flag}</span>
                  <div>
                    <div>{item.native}</div>
                    <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.85 : 0.6 }}>
                      {item.name}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check size={16} color="var(--md-sys-color-on-primary)" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
