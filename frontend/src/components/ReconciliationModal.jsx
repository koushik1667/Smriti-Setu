import React from 'react';
import { ArrowRight, RefreshCw, PlusCircle, XCircle, AlertTriangle, Pill, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ReconciliationModal = ({
  conflict,
  onReplaceOld,
  onKeepBoth,
  onCancel
}) => {
  const { lang } = useLanguage();

  if (!conflict) return null;

  const title = lang === 'hi' ? conflict.title_hi : lang === 'te' ? conflict.title_te : conflict.title;
  const reason = lang === 'hi' ? conflict.reason_hi : lang === 'te' ? conflict.reason_te : conflict.reason;
  const isTitration = conflict.type === 'DOSAGE_TITRATION';
  const isBrandSwitch = conflict.type === 'BRAND_SWITCH';

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--md-sys-color-surface)',
          borderRadius: 'var(--r-2xl)',
          padding: '28px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'dropdownAppearUp 0.3s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-full)', background: isTitration ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isTitration ? '#3b82f6' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isTitration ? <RefreshCw size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              {title}
            </h3>
            <span style={{ fontSize: '0.78rem', color: isTitration ? '#2563eb' : '#d97706', fontWeight: 700 }}>
              Smart Cabinet Reconciliation
            </span>
          </div>
        </div>

        {/* Before vs After Evolution Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', background: 'var(--md-sys-color-surface-container-low)', padding: '16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          {/* Old Medicine Card */}
          <div style={{ textAlign: 'center', padding: '10px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Previous in Cabinet
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', marginTop: '4px' }}>
              {conflict.oldName}
            </div>
            <span style={{ display: 'inline-block', fontSize: '0.78rem', padding: '2px 8px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: 'var(--r-full)', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '6px', fontWeight: 600 }}>
              {conflict.oldStrength}
            </span>
          </div>

          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={18} />
          </div>

          {/* New Scanned Medicine Card */}
          <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(103, 80, 164, 0.08)', borderRadius: 'var(--r-md)', border: '1px solid var(--md-sys-color-primary)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Newly Scanned
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', marginTop: '4px' }}>
              {conflict.newName}
            </div>
            <span style={{ display: 'inline-block', fontSize: '0.78rem', padding: '2px 8px', background: 'var(--md-sys-color-primary)', borderRadius: 'var(--r-full)', color: 'var(--md-sys-color-on-primary)', marginTop: '6px', fontWeight: 700 }}>
              {conflict.newStrength}
            </span>
          </div>
        </div>

        {/* Reason Explanation */}
        <p style={{ fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
          {reason}
        </p>

        {isBrandSwitch && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--r-md)', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Do not take both brands together. Consult your physician regarding brand replacement.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onReplaceOld}
            className="btn btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RefreshCw size={17} /> Update & Replace Previous ({conflict.oldStrength} → {conflict.newStrength})
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={onKeepBoth}
              className="btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, justifyContent: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} /> Keep Both in Cabinet
            </button>

            <button
              onClick={onCancel}
              className="btn-ghost"
              style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, justifyContent: 'center', gap: '6px', color: 'var(--text-muted)' }}
            >
              <XCircle size={15} /> Discard This Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
