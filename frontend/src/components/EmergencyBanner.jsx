import React, { useState } from 'react';
import { AlertCircle, Phone, X, ShieldAlert } from 'lucide-react';

export const EmergencyBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #991b1b 0%, #b91c1c 100%)',
        color: '#ffffff',
        padding: '6px 16px',
        fontSize: '0.78rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 105,
        boxShadow: '0 2px 8px rgba(185, 28, 28, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <ShieldAlert size={16} color="#fecaca" />
        <span>
          <strong>Emergency Disclaimer:</strong> <span className="notranslate" translate="no">Smriti Setu</span> is an assistive digital aid. In acute medical emergencies or severe drug reactions, do not rely on AI:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '4px' }}>
          <a
            href="tel:112"
            style={{
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              textDecoration: 'none',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Phone size={11} /> Call 112 / 108 (India)
          </a>
          <a
            href="tel:911"
            style={{
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              textDecoration: 'none',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Phone size={11} /> 911 (US)
          </a>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fecaca',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Dismiss Emergency Bar"
      >
        <X size={14} />
      </button>
    </div>
  );
};
