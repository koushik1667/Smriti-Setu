import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { voiceControlService } from '../services/voiceControlService';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill, FileText, Package, Brain, Bell, Activity, Menu, X, Mic, MicOff
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vcState, setVcState] = useState(
    typeof voiceControlService?.getState === 'function'
      ? voiceControlService.getState()
      : { isEnabled: false, isListening: false }
  );

  useEffect(() => {
    if (typeof voiceControlService?.subscribe === 'function') {
      const unsub = voiceControlService.subscribe(setVcState);
      return () => unsub();
    }
  }, []);

  const NAV_ITEMS = [
    { to: '/dashboard',           icon: LayoutDashboard, label: t('home') },
    { to: '/cognitive-game',      icon: Brain,           label: t('cognitiveGames') },
    { to: '/memory-assistance',   icon: Bell,            label: t('memoryReminders') },
    { to: '/caregiver-dashboard', icon: Activity,        label: t('caregiverAnalytics') },
    { to: '/scanner',             icon: Camera,          label: t('scanner') },
    { to: '/report-analyzer',     icon: FileText,        label: t('reportsRx') },
    { to: '/cabinet',             icon: Package,         label: t('cabinet') },
    { to: '/history',             icon: History,         label: t('history') },
    { to: '/profile',             icon: User,            label: t('profile') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SS';

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="sidebar desktop-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Pill size={18} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h2 className="notranslate" translate="no">{t('appName')}</h2>
            <p>{t('tagline')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Settings */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user" onClick={() => navigate('/profile')} role="button" title="View Profile">
              <div className="avatar">{initials}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <LanguageSelector direction="up" align="left" style={{ flex: 1 }} />
            <ThemeToggle style={{ padding: '8px' }} />
          </div>

          <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--md-sys-color-error)', width: '100%' }}>
            <span className="nav-icon"><LogOut size={16} /></span>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* MOBILE TOP HEADER BAR */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Open Navigation Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--md-sys-color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/dashboard')} role="button">
            <div className="sidebar-logo" style={{ width: '28px', height: '28px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(103, 80, 164, 0.4)' }}>
              <Pill size={14} color="#fff" />
            </div>
            <h2 className="notranslate" translate="no" style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, letterSpacing: '-0.02em' }}>
              {t('appName')}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Embedded Mobile VC Button */}
          <button
            onClick={() => voiceControlService.toggle()}
            aria-label="Toggle Voice Control"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: vcState.isEnabled ? (vcState.isListening ? '#1E7E34' : '#6750A4') : 'var(--md-sys-color-surface-container)',
              color: vcState.isEnabled ? '#FFFFFF' : 'var(--md-sys-color-on-surface)',
              border: vcState.isEnabled ? '1.5px solid #A8DAB5' : '1px solid var(--border)',
              fontWeight: 800,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            {vcState.isEnabled ? <Mic size={14} className={vcState.isListening ? 'pulse' : ''} /> : <MicOff size={14} />}
            <span>{vcState.isEnabled ? 'VC: ON' : 'VC'}</span>
          </button>

          <LanguageSelector direction="down" align="right" style={{ fontSize: '0.75rem' }} />
          <ThemeToggle compact={true} style={{ padding: '8px', minHeight: 'unset', width: '32px', height: '32px', justifyContent: 'center' }} />
          {user && (
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--r-full)',
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: '1px solid var(--border)',
                flexShrink: 0
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SLIDING NAVIGATION DRAWER OVERLAY */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex'
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              width: '82%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: 'var(--md-sys-color-surface)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
              animation: 'slideInLeft 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 18px',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="sidebar-logo" style={{ width: '32px', height: '32px', borderRadius: '10px' }}>
                    <Pill size={16} color="#fff" />
                  </div>
                  <div>
                    <h3 className="notranslate" translate="no" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                      {t('appName')}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {t('tagline')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--md-sys-color-on-surface)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Bar */}
              {user && (
                <div
                  onClick={() => { setDrawerOpen(false); navigate('/profile'); }}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{user.email}</div>
                  </div>
                </div>
              )}

              {/* All 9 Navigation Links */}
              <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    style={{ padding: '10px 14px', borderRadius: '12px' }}
                  >
                    <span className="nav-icon"><Icon size={18} /></span>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Drawer Footer with Logout */}
            <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)' }}>
              <button
                className="nav-link"
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
                style={{ color: 'var(--md-sys-color-error)', width: '100%', justifyContent: 'flex-start' }}
              >
                <span className="nav-icon"><LogOut size={18} /></span>
                <span style={{ fontWeight: 700 }}>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>{t('home')}</span>
        </NavLink>
        <NavLink to="/cognitive-game" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Brain size={20} />
          <span>{t('cognitiveGames')}</span>
        </NavLink>
        <NavLink to="/scanner" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Camera size={20} />
          <span>{t('scanner')}</span>
        </NavLink>
        <NavLink to="/caregiver-dashboard" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Activity size={20} />
          <span>{t('caregiverAnalytics')}</span>
        </NavLink>
        <button
          onClick={() => setDrawerOpen(true)}
          className="mobile-nav-item"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="More Pages"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
