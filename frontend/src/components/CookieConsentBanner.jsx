import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('pharmavision_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('pharmavision_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('pharmavision_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-modal fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={22} color="var(--md-sys-color-primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              Privacy & Medical Data Protection
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>
              HIPAA & GDPR / DPDP Compliant Processing
            </span>
          </div>
        </div>

        <button
          onClick={handleEssentialOnly}
          className="btn-ghost"
          style={{ padding: '4px', color: 'var(--text-muted)' }}
          title="Dismiss"
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ fontSize: '0.81rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
        PharmaVision AI uses essential session cookies to authenticate your account and securely analyze your medicine packaging, lab reports, and doctor prescriptions. <strong>Your health records are encrypted and never sold to third-party advertisers.</strong>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '2px' }}>
        <button
          onClick={() => navigate('/privacy')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--md-sys-color-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          Read Privacy Policy <ChevronRight size={14} />
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleEssentialOnly}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 'var(--r-full)' }}
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 'var(--r-full)' }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
