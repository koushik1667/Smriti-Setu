import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/scanner',   icon: Camera,          label: 'Scanner' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/profile',   icon: User,            label: 'Profile' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <h2>PharmaVision</h2>
            <p>AI Medicine Scanner</p>
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

        {/* Footer — user + theme switch + logout */}
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
          
          <ThemeToggle style={{ width: '100%', justifyContent: 'center' }} />

          <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--md-sys-color-error)', width: '100%' }}>
            <span className="nav-icon"><LogOut size={16} /></span>
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP HEADER BAR */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-logo" style={{ width: '34px', height: '34px' }}>
            <Pill size={15} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>PharmaVision</h2>
            <p style={{ fontSize: '0.68rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>AI Medicine Scanner</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle style={{ padding: '6px' }} />
          {user && (
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>{initials}</div>
          )}
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
