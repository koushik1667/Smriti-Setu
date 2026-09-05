import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertTriangle, ArrowRight, Pill, Activity, Stethoscope, Layers, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ReportResultCard } from '../components/ReportResultCard';
import { PrescriptionResultCard } from '../components/PrescriptionResultCard';
import { DualAuditResultCard } from '../components/DualAuditResultCard';
import { LiveAnalysisStepper } from '../components/LiveAnalysisStepper';

export const ReportAnalyzer = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dual'); // 'dual', 'prescription', 'lab'
  const [savedDocs, setSavedDocs] = useState([]);

  const loadSavedDocs = async () => {
    try {
      const res = await api.getDocuments();
      setSavedDocs(res.documents || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadSavedDocs();
  }, []);

  // Dual Audit State
  const [dualLabFile, setDualLabFile] = useState(null);
  const [dualLabBase64, setDualLabBase64] = useState('');
  const [dualLabMime, setDualLabMime] = useState('');
  const [dualRxFile, setDualRxFile] = useState(null);
  const [dualRxBase64, setDualRxBase64] = useState('');
  const [dualRxMime, setDualRxMime] = useState('');
  const [analyzingDual, setAnalyzingDual] = useState(false);
  const [dualResult, setDualResult] = useState(null);
  const [dualError, setDualError] = useState('');

  // Prescription State
  const [rxFile, setRxFile] = useState(null);
  const [rxFileBase64, setRxFileBase64] = useState('');
  const [rxMimeType, setRxMimeType] = useState('');
  const [analyzingRx, setAnalyzingRx] = useState(false);
  const [rxResult, setRxResult] = useState(null);
  const [rxError, setRxError] = useState('');

  // Lab Report State
  const [labFile, setLabFile] = useState(null);
  const [labFileBase64, setLabFileBase64] = useState('');
  const [labMimeType, setLabMimeType] = useState('');
  const [analyzingLab, setAnalyzingLab] = useState(false);
  const [labResult, setLabResult] = useState(null);
  const [labError, setLabError] = useState('');

  // Dual Audit Handlers
  const handleDualLabChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDualError('');
    setDualResult(null);
    setDualLabFile(file);
    setDualLabMime(file.type);
    const reader = new FileReader();
    reader.onload = () => setDualLabBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDualRxChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDualError('');
    setDualResult(null);
    setDualRxFile(file);
    setDualRxMime(file.type);
    const reader = new FileReader();
    reader.onload = () => setDualRxBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzeDual = async () => {
    if (!dualLabBase64 || !dualRxBase64) {
      setDualError('Please upload BOTH a Lab Report and a Doctor Prescription for Dual Consultation Audit.');
      return;
    }

    setAnalyzingDual(true);
    setDualError('');
    setDualResult(null);

    try {
      const res = await api.analyzeDualAudit(dualLabBase64, dualLabMime, dualRxBase64, dualRxMime);
      setDualResult(res.data);
    } catch (err) {
      setDualError(err.message || 'Dual audit failed. Ensure both documents are readable.');
    } finally {
      setAnalyzingDual(false);
    }
  };

  // Prescription Handlers
  const handleRxFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRxError('');
    setRxResult(null);
    setRxFile(file);
    setRxMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => setRxFileBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzeRx = async () => {
    if (!rxFileBase64) {
      setRxError('Please select a prescription file first.');
      return;
    }
    setAnalyzingRx(true);
    setRxError('');
    setRxResult(null);
    try {
      const res = await api.analyzePrescription(rxFileBase64, rxMimeType);
      setRxResult(res.data);
      loadSavedDocs();
    } catch (err) {
      setRxError(err.message || 'Prescription analysis failed.');
    } finally {
      setAnalyzingRx(false);
    }
  };

  // Lab Report Handlers
  const handleLabFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLabError('');
    setLabResult(null);
    setLabFile(file);
    setLabMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => setLabFileBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzeLab = async () => {
    if (!labFileBase64) {
      setLabError('Please select a lab report file first.');
      return;
    }
    setAnalyzingLab(true);
    setLabError('');
    setLabResult(null);
    try {
      const res = await api.analyzeReport(labFileBase64, labMimeType);
      setLabResult(res.data);
      loadSavedDocs();
    } catch (err) {
      setLabError(err.message || 'Lab report analysis failed.');
    } finally {
      setAnalyzingLab(false);
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">{t('reportsHeader')}</h1>
        <p className="page-subtitle">{t('reportsSubtitle')}</p>
      </div>

      {/* 3-Way Segmented Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--md-sys-color-surface-container-low)', padding: '6px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', width: 'fit-content', marginBottom: '28px', maxWidth: '100%', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('dual')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'dual' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'dual' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Layers size={18} />
          {t('dualAuditTab')}
        </button>

        <button
          onClick={() => setActiveTab('prescription')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'prescription' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'prescription' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Stethoscope size={18} />
          {t('rxDigitizerTab')}
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: 'none',
            background: activeTab === 'lab' ? 'var(--md-sys-color-primary)' : 'transparent',
            color: activeTab === 'lab' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={18} />
          {t('labReportTab')}
        </button>
      </div>

      {/* ================= 1. DUAL CONSULTATION AUDIT VIEW ================= */}
      {activeTab === 'dual' && (
        <div className="fade-in">
          {dualError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
              <AlertTriangle size={16} /> {dualError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="var(--md-sys-color-primary)" /> {t('uploadBothDocs')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {t('dualAuditDesc')}
              </p>

              {/* Slot 1: Lab Report */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', display: 'block', marginBottom: '6px' }}>
                  {t('doc1Lab')}
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '20px 16px',
                    textAlign: 'center',
                    background: dualLabFile ? 'rgba(16,185,129,0.05)' : 'var(--md-sys-color-surface-container-low)',
                    cursor: 'pointer',
                    borderColor: dualLabFile ? '#10b981' : 'var(--border)'
                  }}
                  onClick={() => document.getElementById('dual-lab-input').click()}
                >
                  <input id="dual-lab-input" type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleDualLabChange} />
                  <FileText size={28} color={dualLabFile ? '#10b981' : 'var(--md-sys-color-primary)'} style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
                    {dualLabFile ? `✅ ${dualLabFile.name}` : t('clickUploadLab')}
                  </div>
                </div>
              </div>

              {/* Slot 2: Doctor's Prescription */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', display: 'block', marginBottom: '6px' }}>
                  {t('doc2Rx')}
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '20px 16px',
                    textAlign: 'center',
                    background: dualRxFile ? 'rgba(16,185,129,0.05)' : 'var(--md-sys-color-surface-container-low)',
                    cursor: 'pointer',
                    borderColor: dualRxFile ? '#10b981' : 'var(--border)'
                  }}
                  onClick={() => document.getElementById('dual-rx-input').click()}
                >
                  <input id="dual-rx-input" type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleDualRxChange} />
                  <Pill size={28} color={dualRxFile ? '#10b981' : 'var(--md-sys-color-primary)'} style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
                    {dualRxFile ? `✅ ${dualRxFile.name}` : t('clickUploadRx')}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAnalyzeDual}
                disabled={!dualLabBase64 || !dualRxBase64 || analyzingDual}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '0.92rem', fontWeight: 700 }}
              >
                {analyzingDual ? 'Auditing Lab & Prescription...' : t('runDualAuditBtn')} <ArrowRight size={18} />
              </button>
            </div>

            <div>
              {analyzingDual && (
                <LiveAnalysisStepper mode="dual" />
              )}
              {!analyzingDual && dualResult && (
                <DualAuditResultCard
                  result={dualResult}
                  loading={false}
                  imageThumbnail={dualRxBase64 || dualLabBase64}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. PRESCRIPTION DIGITIZER VIEW ================= */}
      {activeTab === 'prescription' && (
        <div className="fade-in">
          {rxError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
              <AlertTriangle size={16} /> {rxError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color="var(--md-sys-color-primary)" /> {t('uploadRxTitle')}
              </h3>

              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: 'var(--md-sys-color-surface-container-low)',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('rx-file-input').click()}
              >
                <input id="rx-file-input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={handleRxFileChange} />
                <Pill size={40} color="var(--md-sys-color-primary)" style={{ marginBottom: '12px', opacity: 0.8 }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '4px' }}>
                  {rxFile ? rxFile.name : 'Click or Drag Prescription Photo / PDF'}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  {t('rxUploadDesc')}
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAnalyzeRx}
                disabled={!rxFileBase64 || analyzingRx}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                {analyzingRx ? 'Extracting Medications...' : t('digitizeRxBtn')} <ArrowRight size={18} />
              </button>
            </div>

            <div>
              {analyzingRx && (
                <LiveAnalysisStepper mode="prescription" />
              )}
              {!analyzingRx && rxResult && (
                <PrescriptionResultCard
                  result={rxResult}
                  loading={false}
                  imageThumbnail={rxFileBase64}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. LAB REPORT ANALYZER VIEW ================= */}
      {activeTab === 'lab' && (
        <div className="fade-in">
          {labError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
              <AlertTriangle size={16} /> {labError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color="var(--md-sys-color-primary)" /> {t('uploadLabTitle')}
              </h3>

              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: 'var(--md-sys-color-surface-container-low)',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('lab-file-input').click()}
              >
                <input id="lab-file-input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={handleLabFileChange} />
                <FileText size={40} color="var(--md-sys-color-primary)" style={{ marginBottom: '12px', opacity: 0.8 }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '4px' }}>
                  {labFile ? labFile.name : 'Click or Drag Lab Report PDF / Image'}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  {t('labUploadDesc')}
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAnalyzeLab}
                disabled={!labFileBase64 || analyzingLab}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                {analyzingLab ? 'Analyzing Lab Report...' : t('analyzeLabBtn')} <ArrowRight size={18} />
              </button>
            </div>

            <div>
              {analyzingLab && (
                <LiveAnalysisStepper mode="report" />
              )}
              {!analyzingLab && labResult && (
                <ReportResultCard result={labResult} loading={false} />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
