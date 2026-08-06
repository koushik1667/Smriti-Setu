import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AnalysisResultCard } from '../components/AnalysisResultCard';
import { ArrowLeft, Calendar } from 'lucide-react';

export const ScanDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [scan, setScan]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getHistory()
      .then(res => {
        const items = res.history || [];
        const found = items.find(item => item.id === id);
        if (!found) { setError('Scan record not found.'); return; }

        // Parse rawAnalysis for full rich data if available
        try {
          const parsed = typeof found.rawAnalysis === 'string'
            ? JSON.parse(found.rawAnalysis)
            : found;
          setScan(parsed);
        } catch {
          setScan({
            medicationName:     found.medicationName,
            primaryUse:         found.primaryUse,
            dosageInstructions: found.dosageInstructions,
            warnings:           found.warnings,
            activeIngredients:  found.activeIngredients,
          });
        }
      })
      .catch(() => setError('Failed to load scan details.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '1120px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '28px' }}>
        <button className="btn-secondary" onClick={() => navigate('/history')}>
          <ArrowLeft size={18} /> Back to History
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">Scan Detail</h1>
        <p className="page-subtitle">Full clinical analysis report for this medicine scan.</p>
      </div>

      {loading && (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem' }}>
          Loading scan record…
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: 'var(--md-sys-color-error-container)', borderRadius: 'var(--r-full)', color: 'var(--md-sys-color-on-error-container)', fontSize: '0.9rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {scan && <AnalysisResultCard result={scan} loading={false} />}
    </div>
  );
};
