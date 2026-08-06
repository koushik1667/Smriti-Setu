import React, { useState } from 'react';
import { recognize } from 'tesseract.js';
import { WebcamCapture }     from '../components/WebcamCapture';
import { AnalysisResultCard } from '../components/AnalysisResultCard';
import { api } from '../services/api';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const Scanner = () => {
  const [result,    setResult]    = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState('');
  const [saved,     setSaved]     = useState(false);

  const handleCapture = async (base64Image) => {
    setAnalyzing(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      let ocrText = '';
      try {
        const ocrRes = await recognize(base64Image, 'eng');
        ocrText = ocrRes?.data?.text || '';
        console.log('[Tesseract OCR Extracted Text]:', ocrText);
      } catch (ocrErr) {
        console.warn('[Tesseract OCR Warning]:', ocrErr.message);
      }

      const res = await api.analyzeMedicine(base64Image, ocrText);
      setResult(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Analysis failed. Ensure the medicine label is clearly visible.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Medicine Scanner</h1>
        <p className="page-subtitle">Point your webcam at a medicine label, blister pack, or bottle — Gemini AI will extract all clinical details.</p>
      </div>

      {/* Saved toast */}
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 500 }}>
          <CheckCircle size={16} /> Scan saved to history
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Two-column grid: scanner left, result right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <WebcamCapture onCapture={handleCapture} isAnalyzing={analyzing} />
        {(analyzing || result) && (
          <AnalysisResultCard result={result} loading={analyzing} />
        )}
      </div>
    </div>
  );
};
