import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldX, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speakText } from '../utils/speechUtils';

export const AllergenAlertBanner = ({ conflicts = [] }) => {
  const { lang } = useLanguage();

  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
      {conflicts.map((conflict, idx) => {
        const isCritical = conflict.severity === 'CRITICAL';
        const title = lang === 'hi' ? conflict.title_hi : lang === 'te' ? conflict.title_te : conflict.title;
        const msg = lang === 'hi' ? conflict.message_hi : lang === 'te' ? conflict.message_te : conflict.message;

        return (
          <div
            key={idx}
            className="fade-in"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--r-lg)',
              background: isCritical
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(220, 38, 38, 0.22) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.22) 100%)',
              border: isCritical ? '2px solid #dc2626' : '2px solid #d97706',
              boxShadow: isCritical ? '0 0 16px rgba(220, 38, 38, 0.25)' : '0 0 12px rgba(217, 119, 6, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-full)', background: isCritical ? '#dc2626' : '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isCritical ? <ShieldX size={18} /> : <AlertTriangle size={18} />}
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: isCritical ? '#991b1b' : '#92400e', margin: 0 }}>
                  {title}
                </h4>
              </div>

              <button
                onClick={() => speakText(msg, lang)}
                className="btn-ghost"
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isCritical ? '#991b1b' : '#92400e',
                  background: isCritical ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                  border: isCritical ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(217, 119, 6, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Voice Warning"
              >
                <Volume2 size={13} /> Listen Warning
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: isCritical ? '#7f1d1d' : '#78350f', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
              {msg}
            </p>
          </div>
        );
      })}
    </div>
  );
};
