import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill, FileText, Package, Brain, Bell, Activity, Menu, X
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Open Navigation Menu"
            style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Menu size={22} />
          </button>
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

      {/* MOBILE SLIDING NAVIGATION DRAWER OVERLAY */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)', display: 'flex' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{ width: '82%', maxWidth: '320px', height: '100%', backgroundColor: 'var(--md-sys-color-surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="sidebar-logo" style={{ width: '32px', height: '32px', borderRadius: '10px' }}><Pill size={16} color="#fff" /></div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{t('appName')}</h3>
                </div>
                <button onClick={() => setDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setDrawerOpen(false)} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ padding: '10px 14px', borderRadius: '12px' }}>
                    <span className="nav-icon"><Icon size={18} /></span>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)' }}>
              <button className="nav-link" onClick={() => { setDrawerOpen(false); handleLogout(); }} style={{ color: 'var(--md-sys-color-error)', width: '100%', justifyContent: 'flex-start' }}>
                <span className="nav-icon"><LogOut size={18} /></span>
                <span style={{ fontWeight: 700 }}>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={() => setDrawerOpen(true)} className="mobile-nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
