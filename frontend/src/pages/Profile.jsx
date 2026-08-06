import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogOut, User, Mail, Calendar, Scan } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
      <Icon size={18} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{value}</span>
  </div>
);

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [scanCount, setScanCount] = useState('—');

  useEffect(() => {
    api.getHistory()
      .then(res => setScanCount(res.history?.length ?? 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PV';

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '580px' }}>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your medical account information.</p>
      </div>

      {/* Avatar card */}
      <div className="card" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', border: '2px solid var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: 'var(--md-sys-color-on-primary-container)', flexShrink: 0, boxShadow: 'var(--shadow-elevation-1)' }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>{user?.email}</div>
        </div>
      </div>

      {/* Info rows */}
      <div className="card" style={{ padding: '8px 24px', marginBottom: '20px' }}>
        <InfoRow icon={User}     label="Full Name"    value={user?.name || '—'} />
        <InfoRow icon={Mail}     label="Email"        value={user?.email || '—'} />
        <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
        <InfoRow icon={Scan}     label="Total Scans"  value={scanCount} />
      </div>

      {/* Logout */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <button
          className="btn-danger"
          onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: '0.9rem' }}
        >
          <LogOut size={18} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};
