import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector = ({ style = {} }) => {
  const { lang, changeLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--md-sys-color-surface-container-high)', padding: '4px 10px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', ...style }}>
      <Globe size={14} color="var(--md-sys-color-primary)" />
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--md-sys-color-on-surface)',
          fontSize: '0.78rem',
          fontWeight: 700,
          outline: 'none',
          cursor: 'pointer',
          paddingRight: '4px'
        }}
      >
        <option value="en" style={{ background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}>English</option>
        <option value="hi" style={{ background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}>हिंदी (Hindi)</option>
        <option value="te" style={{ background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}>తెలుగు (Telugu)</option>
      </select>
    </div>
  );
};
