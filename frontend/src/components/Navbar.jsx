import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Pill, LogOut, User, Activity } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}>
            <Pill size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              {t('appName')}
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{t('tagline')}</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <User size={16} color="#06b6d4" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</span>
            </div>

            <button onClick={logout} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.875rem' }}>
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
