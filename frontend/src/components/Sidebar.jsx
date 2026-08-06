import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill, FileText
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { to: '/dashboard',       icon: LayoutDashboard, label: t('home') },
    { to: '/scanner',         icon: Camera,          label: t('scanner') },
    { to: '/report-analyzer', icon: FileText,        label: 'Report Analyzer' },
    { to: '/history',         icon: History,         label: t('history') },
    { to: '/profile',         icon: User,            label: t('profile') },
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
            <LanguageSelector style={{ flex: 1 }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="sidebar-logo" style={{ width: '32px', height: '32px' }}>
            <Pill size={14} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>{t('appName')}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LanguageSelector style={{ padding: '2px 6px' }} />
          <ThemeToggle style={{ padding: '6px' }} />
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
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
