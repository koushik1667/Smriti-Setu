import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Camera, Clock, Pill, ChevronRight, Scan } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recent     = history.slice(0, 4);
  const totalScans = history.length;
  const lastScan   = history[0]
    ? new Date(history[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const topDrug    = history[0]?.medicationName || '—';

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="page-subtitle">Here's a summary of your medicine scanning activity.</p>
      </div>

      {/* Stats - MD3 Surface Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Scans</div>
          <div className="stat-value">{loading ? '…' : totalScans}</div>
          <div className="stat-sub">All time medicine analyses</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>Last Scan Date</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '4px', color: 'var(--md-sys-color-on-secondary-container)' }}>{loading ? '…' : lastScan}</div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{history[0]?.medicationName || 'No recent scans'}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>Latest Drug</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', marginTop: '4px', color: 'var(--md-sys-color-on-tertiary-container)' }}>{loading ? '…' : topDrug}</div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>Gemini Vision AI verified</div>
        </div>
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: '32px' }}>
        <button
          className="btn-primary"
          onClick={() => navigate('/scanner')}
          style={{ padding: '14px 32px', fontSize: '0.95rem' }}
        >
          <Scan size={20} />
          Scan a Medicine Now
        </button>
      </div>

      {/* Recent Scans */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--md-sys-color-primary)" />
            Recent Scans
          </h3>
          <button className="btn-ghost" onClick={() => navigate('/history')}>
            View all <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.9rem' }}>Loading activity...</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '54px', textAlign: 'center' }}>
            <Pill size={36} color="var(--text-3)" style={{ margin: '0 auto 14px', display: 'block' }} />
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', fontWeight: 500 }}>No scans recorded yet.</p>
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '4px' }}>Head to the Scanner to get started.</p>
          </div>
        ) : (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/scan/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--md-sys-color-surface-container-low)',
                  transition: 'all var(--md-motion-duration) var(--md-motion-easing)',
                  border: '1px solid var(--border)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--md-sys-color-surface-container-low)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={20} color="var(--md-sys-color-on-primary-container)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{item.medicationName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--md-sys-color-on-surface-variant)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
