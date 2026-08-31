import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill, FileText, Package, Brain, Bell, Activity
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    : 'PV';

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
            <h2>{t('appName')}</h2>
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
              <span className="nav-icon"><Icon size={16} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user + language selector + theme switch + logout */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user && (
            <div className="sidebar-user">
              <div className="user-avatar">{initials}</div>
              <div className="user-info-text">
                <div className="name">{user.name}</div>
                <div className="email">{user.email}</div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => navigate('/dashboard')} role="button">
          <div className="sidebar-logo" style={{ width: '32px', height: '32px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(103, 80, 164, 0.4)' }}>
            <Pill size={15} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, letterSpacing: '-0.02em' }}>
              {t('appName')}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LanguageSelector direction="down" align="right" style={{ fontSize: '0.75rem' }} />
          <ThemeToggle compact={true} style={{ padding: '8px', minHeight: 'unset', width: '34px', height: '34px', justifyContent: 'center' }} />
          {user && (
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--r-full)',
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
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

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
