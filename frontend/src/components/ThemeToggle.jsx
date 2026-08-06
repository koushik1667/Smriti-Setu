import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ compact = false, style = {} }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary"
      aria-label="Toggle Theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? '0px' : '8px',
        padding: compact ? '8px 12px' : '10px 18px',
        borderRadius: 'var(--r-full)',
        border: '1px solid var(--border)',
        background: 'var(--md-sys-color-surface-container-high)',
        color: 'var(--md-sys-color-on-surface)',
        fontSize: '0.82rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
        boxShadow: 'var(--shadow-elevation-1)',
        ...style
      }}
    >
      {isDark ? (
        <>
          <Sun size={compact ? 18 : 16} color="var(--amber)" style={{ transition: 'transform 0.3s ease' }} />
          {!compact && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon size={compact ? 18 : 16} color="var(--md-sys-color-primary)" style={{ transition: 'transform 0.3s ease' }} />
          {!compact && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
};
