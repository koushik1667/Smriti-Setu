import React, { useState, useEffect } from 'react';
import { WebcamCapture }     from '../components/WebcamCapture';
import { AnalysisResultCard } from '../components/AnalysisResultCard';
import { LiveAnalysisStepper } from '../components/LiveAnalysisStepper';
import { ReconciliationModal } from '../components/ReconciliationModal';
import { api } from '../services/api';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { detectMedicationConflict } from '../utils/reconciliationEngine';

export const Scanner = () => {
  const { t } = useLanguage();
  const [result,    setResult]    = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState('');
  const [savedToast, setSavedToast] = useState('');
  const [existingHistory, setExistingHistory] = useState([]);
  const [reconciliationConflict, setReconciliationConflict] = useState(null);

  // Load existing cabinet history for reconciliation detection
  const loadHistory = () => {
    api.getHistory()
      .then(res => setExistingHistory(res.history || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleCapture = async (base64Image) => {
    setAnalyzing(true);
    setError('');
    setResult(null);
    setSavedToast('');
    setReconciliationConflict(null);

    try {
      const res = await api.analyzeMedicine(base64Image);
      const newMedData = res.data;
      setResult(newMedData);

      // Run Smart Reconciliation & Dosage Evolution Check
      const conflict = detectMedicationConflict(newMedData, existingHistory);
      if (conflict) {
        setReconciliationConflict(conflict);
      } else {
        setSavedToast('Scan analyzed and saved to your Medicine Cabinet & History!');
        setTimeout(() => setSavedToast(''), 4000);
      }
      loadHistory();
    } catch (err) {
      setError(err.message || 'Analysis failed. Ensure the medicine packaging is clearly visible and your Gemini API key is active.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle Reconciliation Actions
  const handleReplaceOld = async () => {
    if (!reconciliationConflict?.existingMed?.id) return;
    try {
      // Delete old outdated dosage item from history/cabinet
      await api.deleteHistoryItem(reconciliationConflict.existingMed.id);
      setSavedToast(`✅ Successfully updated cabinet: Replaced "${reconciliationConflict.oldName}" with "${reconciliationConflict.newName}"!`);
      setTimeout(() => setSavedToast(''), 5000);
      setReconciliationConflict(null);
      loadHistory();
    } catch (e) {
      console.error('Failed to replace old medication:', e);
      setReconciliationConflict(null);
    }
  };

  const handleKeepBoth = () => {
    setSavedToast(`✅ Both "${reconciliationConflict.oldName}" and "${reconciliationConflict.newName}" are kept in your Cabinet.`);
    setTimeout(() => setSavedToast(''), 5000);
    setReconciliationConflict(null);
  };

  const handleCancelScan = async () => {
    try {
      if (result?.id) {
        await api.deleteHistoryItem(result.id);
      }
      setResult(null);
      setReconciliationConflict(null);
      setSavedToast('Scan discarded. Previous cabinet record preserved.');
      setTimeout(() => setSavedToast(''), 4000);
    } catch (e) {
      setResult(null);
      setReconciliationConflict(null);
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t('scanner')}</h1>
        <p className="page-subtitle">{t('scanNewDesc')}</p>
      </div>

      {/* Saved / Reconciliation Toast */}
      {savedToast && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', color: '#10b981', fontSize: '0.875rem', marginBottom: '20px', fontWeight: 700 }}>
          <CheckCircle size={16} /> {savedToast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--r-md)', color: '#fda4af', fontSize: '0.875rem', marginBottom: '20px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Interactive Reconciliation Modal */}
      {reconciliationConflict && (
        <ReconciliationModal
          conflict={reconciliationConflict}
          onReplaceOld={handleReplaceOld}
          onKeepBoth={handleKeepBoth}
          onCancel={handleCancelScan}
        />
      )}

      {/* Two-column grid: scanner left, result right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <WebcamCapture onCapture={handleCapture} isAnalyzing={analyzing} />

        {analyzing && (
          <LiveAnalysisStepper mode="medicine" />
        )}

        {!analyzing && result && (
          <AnalysisResultCard result={result} loading={false} />
        )}
      </div>
    </div>
  );
};
