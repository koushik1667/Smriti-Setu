import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  LogOut, User, Mail, Calendar, Scan, Download, Trash2,
  ShieldCheck, FileText, ExternalLink, CheckCircle, AlertTriangle,
  ShieldAlert, Activity, Check, HeartPulse
} from 'lucide-react';
import { PRESET_ALLERGENS, PRESET_CONDITIONS, getUserMedicalProfile } from '../utils/allergenShield';

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
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Allergen & Condition State
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [shieldSaved, setShieldSaved] = useState(false);

  useEffect(() => {
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const { allergies, conditions } = getUserMedicalProfile();
    setSelectedAllergies(allergies);
    setSelectedConditions(conditions);
  }, []);

  const toggleAllergy = (id) => {
    const next = selectedAllergies.includes(id)
      ? selectedAllergies.filter(item => item !== id)
      : [...selectedAllergies, id];
    setSelectedAllergies(next);
    localStorage.setItem('pharmavision_allergens', JSON.stringify(next));
    setShieldSaved(true);
    setTimeout(() => setShieldSaved(false), 2000);
  };

  const toggleCondition = (id) => {
    const next = selectedConditions.includes(id)
      ? selectedConditions.filter(item => item !== id)
      : [...selectedConditions, id];
    setSelectedConditions(next);
    localStorage.setItem('pharmavision_conditions', JSON.stringify(next));
    setShieldSaved(true);
    setTimeout(() => setShieldSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        name: user?.name,
        email: user?.email,
        exportedAt: new Date().toISOString()
      },
      allergies: selectedAllergies,
      conditions: selectedConditions,
      totalScans: history.length,
      medications: history.map(item => ({
        name: item.medicationName,
        primaryUse: item.primaryUse,
        activeIngredients: item.activeIngredients,
        dosageInstructions: item.dosageInstructions,
        warnings: item.warnings,
        scannedAt: item.createdAt
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PharmaVision_Medical_Records_${user?.name?.replace(/\s+/g, '_') || 'Patient'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handlePurgeHistory = async () => {
    try {
      for (const item of history) {
        await api.deleteHistoryItem(item.id);
      }
      setHistory([]);
      setConfirmDelete(false);
    } catch (err) {
      console.error('Failed to purge history:', err);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PV';

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <h1 className="page-title">Account & Medical Shield</h1>
        <p className="page-subtitle">Configure your personal drug allergen radar, export health records, and security settings.</p>
      </div>

      {exportSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', color: '#10b981', fontSize: '0.88rem', marginBottom: '20px', fontWeight: 700 }}>
          <CheckCircle size={18} /> Medical records exported successfully to your downloads.
        </div>
      )}

      {/* Avatar Card */}
      <div className="card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', border: '2px solid var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: 'var(--md-sys-color-on-primary-container)', flexShrink: 0, boxShadow: 'var(--shadow-elevation-1)' }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>{user?.email}</div>
        </div>
      </div>

      {/* 🚨 PRIORITY 1: PATIENT ALLERGEN & CONTRAINDICATION SHIELD */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '20px', border: '1px solid var(--md-sys-color-error-container)', background: 'var(--md-sys-color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-error)' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Patient Allergen & Safety Shield
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-error)', fontWeight: 700 }}>
                Automatic Real-Time AI Conflict Interceptor
              </span>
            </div>
          </div>

          {shieldSaved && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 'var(--r-full)' }}>
              <Check size={13} /> Radar Updated
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
          Select your known drug allergies and physiological conditions. PharmaVision AI will automatically cross-match every scanned medicine packaging, doctor prescription, and lab report against this profile to prevent severe adverse drug reactions.
        </p>

        {/* Allergen Chips */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            Known Drug Allergies
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESET_ALLERGENS.map(allergen => {
              const active = selectedAllergies.includes(allergen.id);
              const label = lang === 'hi' ? allergen.name_hi : lang === 'te' ? allergen.name_te : allergen.name;

              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergy(allergen.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--r-full)',
                    border: active ? '1px solid #ef4444' : '1px solid var(--border)',
                    background: active ? 'rgba(239, 68, 68, 0.15)' : 'var(--md-sys-color-surface-container-low)',
                    color: active ? '#ef4444' : 'var(--md-sys-color-on-surface)',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {active && <Check size={14} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Chips */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            Chronic Medical Conditions / Warnings
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESET_CONDITIONS.map(cond => {
              const active = selectedConditions.includes(cond.id);
              const label = lang === 'hi' ? cond.name_hi : lang === 'te' ? cond.name_te : cond.name;

              return (
                <button
                  key={cond.id}
                  onClick={() => toggleCondition(cond.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--r-full)',
                    border: active ? '1px solid #f59e0b' : '1px solid var(--border)',
                    background: active ? 'rgba(245, 158, 11, 0.15)' : 'var(--md-sys-color-surface-container-low)',
                    color: active ? '#d97706' : 'var(--md-sys-color-on-surface)',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {active && <Check size={14} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="card" style={{ padding: '8px 24px', marginBottom: '20px' }}>
        <InfoRow icon={User}     label="Full Name"    value={user?.name || '—'} />
        <InfoRow icon={Mail}     label="Email"        value={user?.email || '—'} />
        <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
        <InfoRow icon={Scan}     label="Total Medicine Scans"  value={history.length} />
      </div>

      {/* Data Sovereignty & GDPR Actions */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--md-sys-color-primary)" />
          Data Sovereignty & Medical Records
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
          You have full ownership of your health scans and diagnostic data. You can download a structured copy of your records or erase your medical history at any time.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportData}
            className="btn-secondary"
            style={{ flex: 1, minWidth: '200px', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={16} /> Export Medical Data (JSON)
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-ghost"
              style={{ color: 'var(--md-sys-color-error)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 16px', borderRadius: 'var(--r-full)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={16} /> Purge Scan History
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handlePurgeHistory}
                className="btn-danger"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                Confirm Delete All Scans
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legal & Policy Links */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          Legal & Compliance
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/privacy')}
            style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
          >
            <FileText size={16} /> Medical Privacy Policy <ExternalLink size={14} />
          </button>
          <button
            onClick={() => navigate('/terms')}
            style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
          >
            <ShieldCheck size={16} /> Terms of Service <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Sign Out Card */}
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
