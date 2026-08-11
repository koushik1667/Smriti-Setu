import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Camera, Clock, Pill, ChevronRight, Scan, Package, FileText } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
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
    ? new Date(history[0].createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const topDrug    = history[0]?.medicationName || '—';

  const greeting = new Date().getHours() < 12
    ? t('goodMorning')
    : new Date().getHours() < 17
    ? t('goodAfternoon')
    : t('goodEvening');

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {greeting},{' '}
          {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="page-subtitle">{t('dashboardSubtitle')}</p>
      </div>

      {/* Stats - MD3 Surface Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">{t('totalScans')}</div>
          <div className="stat-value">{loading ? '…' : totalScans}</div>
          <div className="stat-sub">{t('allTimeScans')}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{t('lastScanDate')}</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '4px', color: 'var(--md-sys-color-on-secondary-container)' }}>{loading ? '…' : lastScan}</div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{history[0]?.medicationName || t('noRecentScans')}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>{t('latestDrug')}</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', marginTop: '4px', color: 'var(--md-sys-color-on-tertiary-container)' }}>{loading ? '…' : topDrug}</div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>{t('verifiedAI')}</div>
        </div>
      </div>

      {/* Feature Navigation Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Scanner Card */}
        <div
          onClick={() => navigate('/scanner')}
          className="card"
          style={{ padding: '20px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', border: '1px solid var(--border)', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Scan size={22} color="var(--md-sys-color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 6px 0' }}>
              {t('scanNewMedicine')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('scanNewDesc')}
            </p>
          </div>
          <div style={{ marginTop: '16px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('openScanner')} <ChevronRight size={16} />
          </div>
        </div>

        {/* Cabinet Card */}
        <div
          onClick={() => navigate('/cabinet')}
          className="card"
          style={{ padding: '20px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', border: '1px solid var(--border)', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Package size={22} color="var(--md-sys-color-on-secondary-container)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 6px 0' }}>
              {t('myCabinetTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('myCabinetDesc')}
            </p>
          </div>
          <div style={{ marginTop: '16px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('openCabinet')} <ChevronRight size={16} />
          </div>
        </div>

        {/* Reports Card */}
        <div
          onClick={() => navigate('/report-analyzer')}
          className="card"
          style={{ padding: '20px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', border: '1px solid var(--border)', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-tertiary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FileText size={22} color="var(--md-sys-color-on-tertiary-container)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 6px 0' }}>
              {t('reportsRxTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('reportsRxDesc')}
            </p>
          </div>
          <div style={{ marginTop: '16px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('openReports')} <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--md-sys-color-primary)" />
            {t('recentScans')}
          </h3>
          <button className="btn-ghost" onClick={() => navigate('/history')}>
            {t('viewAllHistory')} <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.9rem' }}>Loading activity...</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '54px', textAlign: 'center' }}>
            <Pill size={36} color="var(--text-3)" style={{ margin: '0 auto 14px', display: 'block' }} />
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', fontWeight: 500 }}>{t('noScansYet')}</p>
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
                      {new Date(item.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
