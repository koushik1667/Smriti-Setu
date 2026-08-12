import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Camera, Clock, Pill, ChevronRight, Scan, Package, FileText,
  ShieldCheck, Sparkles, Activity, Layers, Stethoscope, ArrowRight
} from 'lucide-react';
import { getUserMedicalProfile } from '../utils/allergenShield';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalScans = history.length;
  const recent = history.slice(0, 5);
  const { allergies } = getUserMedicalProfile();

  const greeting = new Date().getHours() < 12
    ? t('goodMorning')
    : new Date().getHours() < 17
    ? t('goodAfternoon')
    : t('goodEvening');

  const lastScanDate = history[0]
    ? new Date(history[0].createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '1040px' }}>

      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title">
          {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="page-subtitle">
          {t('dashboardSubtitle')}
        </p>
      </div>

      {/* ─── 3 Metric Stat Cards ─────────────────────────────────── */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        {/* Stat 1: Total Scans */}
        <div className="stat-card">
          <div className="stat-label">{t('totalScans')}</div>
          <div className="stat-value">{loading ? '…' : totalScans}</div>
          <div className="stat-sub">{t('allTimeScans')}</div>
        </div>

        {/* Stat 2: Latest Scan Date */}
        <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{t('lastScanDate')}</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--md-sys-color-on-secondary-container)' }}>{loading ? '…' : lastScanDate}</div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{history[0]?.medicationName || t('noRecentScans')}</div>
        </div>

        {/* Stat 3: Allergen Radar Status */}
        <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>Allergen Shield</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--md-sys-color-on-tertiary-container)' }}>
            {allergies.length > 0 ? `${allergies.length} Active Filters` : 'Protected'}
          </div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>
            {allergies.length > 0 ? 'Auto-conflict radar active' : 'Configured in Profile'}
          </div>
        </div>
      </div>

      {/* ─── 3 Core Clinical Action Cards ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Card 1: Medicine Scanner */}
        <div
          onClick={() => navigate('/scanner')}
          className="card"
          style={{ padding: '24px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-primary)', marginBottom: '16px' }}>
              <Scan size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 8px 0' }}>
              {t('scanNewMedicine')}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('scanNewDesc')}
            </p>
          </div>
          <div style={{ marginTop: '20px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('openScanner')} <ChevronRight size={16} />
          </div>
        </div>

        {/* Card 2: Reports & Prescriptions */}
        <div
          onClick={() => navigate('/report-analyzer')}
          className="card"
          style={{ padding: '24px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-tertiary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-tertiary-container)', marginBottom: '16px' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 8px 0' }}>
              {t('reportsRxTitle')}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('reportsRxDesc')}
            </p>
          </div>
          <div style={{ marginTop: '20px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('openReports')} <ChevronRight size={16} />
          </div>
        </div>

        {/* Card 3: Medicine Cabinet */}
        <div
          onClick={() => navigate('/cabinet')}
          className="card"
          style={{ padding: '24px', cursor: 'pointer', background: 'var(--md-sys-color-surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-on-secondary-container)', marginBottom: '16px' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '0 0 8px 0' }}>
              {t('myCabinetTitle')}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {t('myCabinetDesc')}
            </p>
          </div>
          <div style={{ marginTop: '20px', color: 'var(--md-sys-color-primary)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('openCabinet')} <ChevronRight size={16} />
          </div>
        </div>

      </div>

      {/* ─── Recent Medicine Scans List ───────────────────────────── */}
      <div className="card" style={{ padding: '24px 28px', background: 'var(--md-sys-color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--md-sys-color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              {t('recentScans')}
            </h3>
          </div>

          <button
            onClick={() => navigate('/history')}
            style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-primary)', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
          >
            {t('viewAllHistory')} <ChevronRight size={15} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <Pill size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{t('noRecentScans')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/scan/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--md-sys-color-surface-container-low)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-primary)', flexShrink: 0 }}>
                    <Pill size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.medicationName || 'Identified Medicine'}
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'} • {item.drugClass || 'Active Medication'}
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
