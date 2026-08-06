import React, { useState } from 'react';
import { FileText, Upload, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ReportResultCard } from '../components/ReportResultCard';

export const ReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError('');
    setResult(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF lab report.');
      return;
    }

    setFile(selectedFile);
    setMimeType(selectedFile.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!fileBase64) {
      setError('Please select a lab report file first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const res = await api.analyzeReport(fileBase64, mimeType);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Report analysis failed. Ensure the report is clearly readable.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Lab Report Analyzer</h1>
        <p className="page-subtitle">Upload your blood test or medical lab report — Gemini AI will analyze your biomarkers, cross-check against your scanned medicine cabinet, and provide targeted exercises.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Main Grid: Upload Left, Results Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Upload Card */}
        <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="var(--md-sys-color-primary)" /> Upload Blood / Lab Report
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
            onClick={() => document.getElementById('report-file-input').click()}
          >
            <input
              id="report-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FileText size={40} color="var(--md-sys-color-primary)" style={{ marginBottom: '12px', opacity: 0.8 }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '4px' }}>
              {file ? file.name : 'Click or Drag Lab Report PDF / Image'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              Supports PDF, PNG, JPG files up to 10MB
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!fileBase64 || analyzing}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
          >
            {analyzing ? 'Analyzing Lab Report...' : 'Analyze Report & Check Cabinet'} <ArrowRight size={18} />
          </button>
        </div>

        {/* Results Card */}
        <div>
          {(analyzing || result) && (
            <ReportResultCard result={result} loading={analyzing} />
          )}
        </div>
      </div>
    </div>
  );
};
