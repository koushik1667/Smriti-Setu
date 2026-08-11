import React, { useState } from 'react';
import {
  FileText, Pill, ShieldAlert, CheckCircle, Clock, AlertTriangle,
  Zap, Calendar, User, Building2, Check, ArrowRight, Sparkles,
  Info, ChevronDown, ChevronUp, Sun, Moon, Sunrise, Utensils,
  Activity, Heart, Dumbbell, AlertOctagon, Layers,
  ChevronLeft, ChevronRight, LayoutGrid, List, Award
} from 'lucide-react';
import { api } from '../services/api';

export const DualAuditResultCard = ({ result, loading, onSavedToCabinet, imageThumbnail }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState('flashcards'); // 'flashcards' or 'all'
  const [selectedMedIds, setSelectedMedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  React.useEffect(() => {
    if (result?.medicines && Array.isArray(result.medicines)) {
      setSelectedMedIds(result.medicines.map((m, idx) => m.id || `med_${idx}`));
    }
  }, [result]);

  if (loading) {
    return (
      <div className="card text-center py-12 fade-in" style={{ padding: '48px 24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'inline-block', width: '52px', height: '52px', border: '4px solid var(--md-sys-color-primary-container)', borderTopColor: 'var(--md-sys-color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
          Performing 360° Dual Clinical Audit...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Gemini AI is cross-evaluating abnormal blood biomarkers against prescribed medications, checking organ safety, and finding clinical gaps.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const {
    auditSummary = {},
    organSafetyAndContraindications = [],
    treatmentCoverageMatrix = [],
    unaddressedGaps = [],
    medicines = [],
    lifestyleAndDietaryCoPrescription = []
  } = result;

  const toggleSelect = (id) => {
    setSelectedMedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMedIds(medicines.map((m, idx) => m.id || `med_${idx}`));
  };

  const deselectAll = () => {
    setSelectedMedIds([]);
  };

  const handleSaveToCabinet = async () => {
    if (selectedMedIds.length === 0) return;

    const medicinesToSave = medicines.filter((m, idx) =>
      selectedMedIds.includes(m.id || `med_${idx}`)
    );

    setSaving(true);
    setSavedSuccess('');
    setSaveError('');

    try {
      const res = await api.saveBatchToCabinet(medicinesToSave, imageThumbnail);
      setSavedSuccess(`🎉 Added ${res.savedCount || medicinesToSave.length} prescription medicines directly to your Medicine Cabinet!`);
      if (onSavedToCabinet) onSavedToCabinet();
    } catch (err) {
      setSaveError(err.message || 'Failed to save medicines to cabinet.');
    } finally {
      setSaving(false);
    }
  };

  const score = auditSummary.overallAlignmentScore ?? 90;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  // Build Flashcard Deck
  const CARDS = [
    {
      id: 'scorecard',
      title: '360° Audit Scorecard',
      category: 'Clinical Verification',
      icon: <Layers size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-flex' }}>
                <Award size={14} /> Dual Consultation Audit
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '6px 0' }}>
                {auditSummary.reportTitle || 'Lab & Prescription Audit'}
              </h2>
              {auditSummary.doctorOrClinic && (
                <div style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Attending Clinic / Doctor: <strong>{auditSummary.doctorOrClinic}</strong>
                </div>
              )}
            </div>

            {/* Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevation-1)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Coverage
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {score}%
                </div>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'var(--border)' }} />
              <span className={`badge ${score >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '6px 12px' }}>
                {score >= 80 ? 'Well Aligned' : 'Needs Review'}
              </span>
            </div>
          </div>

          {auditSummary.clinicalVerdict && (
            <div style={{ padding: '16px 18px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                Clinical Audit Verdict:
              </strong>
              <p style={{ color: 'var(--md-sys-color-on-surface)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                {auditSummary.clinicalVerdict}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'safety',
      title: 'Organ Safety Guardrails',
      category: 'Contraindications',
      icon: <AlertOctagon size={24} color="#b91c1c" />,
      bgIcon: '#fee2e2',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Organ Safety & Contraindication Alerts ({organSafetyAndContraindications.length})
          </h4>

          {organSafetyAndContraindications && organSafetyAndContraindications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {organSafetyAndContraindications.map((item, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {item.severity || 'CRITICAL'}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#991b1b' }}>
                        {item.organSystem} System: {item.biomarkerFlagged}
                      </strong>
                    </div>
                    {item.prescribedDrugInvolved && (
                      <span style={{ fontSize: '0.82rem', padding: '4px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--r-full)', fontWeight: 600 }}>
                        Rx Drug: {item.prescribedDrugInvolved}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>
                    {item.clinicalAlert}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: '0.88rem' }}>
              <CheckCircle size={20} color="#10b981" />
              <span><strong>Safety Check:</strong> No organ-specific contraindications detected between lab biomarkers and prescribed medications.</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'matrix',
      title: 'Treatment Alignment Matrix',
      category: 'Lab ⟷ Rx Mapping',
      icon: <Activity size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Biomarker Findings vs Prescribed Treatments
          </h4>

          {treatmentCoverageMatrix && treatmentCoverageMatrix.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {treatmentCoverageMatrix.map((row, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--r-md)',
                    background: row.isCovered ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.06)',
                    border: row.isCovered ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {row.isCovered ? <CheckCircle size={18} color="#10b981" /> : <AlertTriangle size={18} color="#f59e0b" />}
                      <strong style={{ fontSize: '0.95rem', color: row.isCovered ? '#065f46' : '#92400e' }}>
                        {row.labCondition}
                      </strong>
                    </div>

                    <span className={`badge ${row.isCovered ? 'badge-emerald' : 'badge-amber'}`}>
                      {row.isCovered ? 'Treated by Prescription' : 'Untreated Finding'}
                    </span>
                  </div>

                  {row.matchedPrescribedDrug && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface)', marginBottom: '4px' }}>
                      💊 <strong>Prescribed Drug:</strong> {row.matchedPrescribedDrug} {row.dosageRoutine ? `(${row.dosageRoutine})` : ''}
                    </div>
                  )}

                  {row.clinicalNote && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {row.clinicalNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No abnormal biomarkers mapped.</p>
          )}
        </div>
      )
    },
    {
      id: 'gaps',
      title: 'Unaddressed Gaps',
      category: 'Follow-Up Questions',
      icon: <AlertTriangle size={24} color="#d97706" />,
      bgIcon: '#fffbeb',
      borderColor: '#fde68a',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Unaddressed Lab Abnormalities & Doctor Discussion Points
          </h4>

          {unaddressedGaps && unaddressedGaps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unaddressedGaps.map((gap, gIdx) => (
                <div key={gIdx} style={{ padding: '14px 18px', background: '#fffbeb', borderRadius: 'var(--r-md)', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.92rem', marginBottom: '4px' }}>
                    ⚠️ {gap.biomarker}
                  </div>
                  {gap.clinicalSignificance && (
                    <div style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '6px' }}>
                      {gap.clinicalSignificance}
                    </div>
                  )}
                  {gap.recommendedPhysicianDiscussion && (
                    <div style={{ fontSize: '0.82rem', padding: '8px 12px', background: '#ffffff', borderRadius: '4px', border: '1px solid #fde68a', color: '#92400e' }}>
                      💬 <strong>Ask Your Doctor:</strong> {gap.recommendedPhysicianDiscussion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: '0.88rem' }}>
              <CheckCircle size={20} color="#10b981" />
              <span><strong>Comprehensive Coverage:</strong> All diagnostic lab abnormalities have corresponding treatments on the prescription.</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'medicines',
      title: 'Prescribed Drugs',
      category: '1-0-1 Schedules & Save',
      icon: <Pill size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '12px 16px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
                Selected: <strong>{selectedMedIds.length} / {medicines.length}</strong>
              </span>
              <button className="btn-ghost" onClick={selectAll} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>All</button>
              <button className="btn-ghost" onClick={deselectAll} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>None</button>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveToCabinet}
              disabled={saving || selectedMedIds.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <Pill size={16} />
              {saving ? 'Adding...' : `Save (${selectedMedIds.length}) to Cabinet`}
              <ArrowRight size={14} />
            </button>
          </div>

          {savedSuccess && (
            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-md)', color: '#065f46', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#10b981" /> {savedSuccess}
            </div>
          )}

          {saveError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', color: '#b91c1c', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="#b91c1c" /> {saveError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {medicines.map((med, idx) => {
              const medId = med.id || `med_${idx}`;
              const isSelected = selectedMedIds.includes(medId);
              const schedule = med.schedule || {};

              return (
                <div
                  key={medId}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--md-sys-color-surface)',
                    border: isSelected ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-elevation-1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(medId)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--md-sys-color-primary)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                        {med.medicationName}
                      </h4>
                      {med.drugClass && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-primary)', fontWeight: 600 }}>
                          {med.drugClass}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', padding: '8px 12px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-sm)' }}>
                    <span style={{ fontSize: '0.78rem', padding: '3px 8px', background: schedule.morning > 0 ? '#fef3c7' : '#f3f4f6', color: schedule.morning > 0 ? '#92400e' : '#9ca3af', borderRadius: 'var(--r-full)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Sunrise size={12} /> Morning: {schedule.morning ?? '—'}
                    </span>
                    <span style={{ fontSize: '0.78rem', padding: '3px 8px', background: schedule.afternoon > 0 ? '#ffedd5' : '#f3f4f6', color: schedule.afternoon > 0 ? '#c2410c' : '#9ca3af', borderRadius: 'var(--r-full)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Sun size={12} /> Afternoon: {schedule.afternoon ?? '—'}
                    </span>
                    <span style={{ fontSize: '0.78rem', padding: '3px 8px', background: schedule.night > 0 ? '#ede9fe' : '#f3f4f6', color: schedule.night > 0 ? '#6d28d9' : '#9ca3af', borderRadius: 'var(--r-full)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Moon size={12} /> Night: {schedule.night ?? '—'}
                    </span>
                    {schedule.timing && (
                      <span style={{ fontSize: '0.78rem', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--r-full)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Utensils size={12} /> {schedule.timing}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface)' }}>
                    <strong>Instruction:</strong> {med.prescribedDosage || 'Take as advised.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Co-Prescription',
      category: 'Diet & Exercise Support',
      icon: <Dumbbell size={24} color="#3b82f6" />,
      bgIcon: '#eff6ff',
      borderColor: '#bfdbfe',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Targeted Lifestyle & Nutrition Co-Prescription
          </h4>

          {lifestyleAndDietaryCoPrescription && lifestyleAndDietaryCoPrescription.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {lifestyleAndDietaryCoPrescription.map((item, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--r-md)' }}>
                  <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>
                    {item.topic}
                  </h5>
                  <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                    {item.advice}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Follow standard balanced lifestyle and nutritional recommendations.</p>
          )}
        </div>
      )
    }
  ];

  const safeIndex = Math.min(activeCardIndex, CARDS.length - 1);
  const currentCard = CARDS[safeIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Controls: Quick Tab Pills + View Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', flex: 1 }}>
          {CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => { setActiveCardIndex(idx); setViewMode('flashcards'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                border: idx === safeIndex && viewMode === 'flashcards' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
                background: idx === safeIndex && viewMode === 'flashcards' ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-low)',
                color: idx === safeIndex && viewMode === 'flashcards' ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {card.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => setViewMode(prev => prev === 'flashcards' ? 'all' : 'flashcards')}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', gap: '6px' }}
        >
          {viewMode === 'flashcards' ? <List size={14} /> : <LayoutGrid size={14} />}
          {viewMode === 'flashcards' ? 'Show All Cards' : 'Carousel View'}
        </button>
      </div>

      {/* FLASHCARDS CAROUSEL VIEW */}
      {viewMode === 'flashcards' ? (
        <div className="card fade-in" style={{ padding: '28px', display: 'flex', flexDirection: 'column', minHeight: '340px', justifyContent: 'space-between', boxShadow: 'var(--shadow-elevation-2)', borderColor: currentCard.borderColor || 'var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: 'var(--r-full)', background: currentCard.bgIcon || 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentCard.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                    {currentCard.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600 }}>
                    {currentCard.category}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', fontWeight: 700 }}>
                Card {safeIndex + 1} of {CARDS.length}
              </span>
            </div>

            <div style={{ padding: '6px 0' }}>{currentCard.content}</div>
          </div>

          {/* SIDE-BY-SIDE PREV & NEXT NAVIGATION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', gap: '12px' }}>
            <button
              onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--r-full)', fontSize: '0.88rem', fontWeight: 700, opacity: safeIndex === 0 ? 0.4 : 1, cursor: safeIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={18} /> Previous Card
            </button>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {CARDS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveCardIndex(i)}
                  style={{ width: i === safeIndex ? '26px' : '8px', height: '8px', borderRadius: 'var(--r-full)', background: i === safeIndex ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveCardIndex(prev => Math.min(CARDS.length - 1, prev + 1))}
              disabled={safeIndex === CARDS.length - 1}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: 'var(--r-full)', fontSize: '0.88rem', fontWeight: 700, opacity: safeIndex === CARDS.length - 1 ? 0.4 : 1, cursor: safeIndex === CARDS.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              Next Card <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* STACKED FULL LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {CARDS.map((card, i) => (
            <div key={card.id} className="card" style={{ padding: '24px', borderColor: card.borderColor || 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--r-full)', background: card.bgIcon || 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center' }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>{card.title}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Card {i + 1} of {CARDS.length}</span>
                </div>
              </div>
              {card.content}
            </div>
          ))}
        </div>
      )}

      {/* Interactive AI Dual Audit Assistant */}
      <DualAuditAiAssistant contextResult={result} />

      {/* Safety Notice Disclaimer */}
      <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--r-md)', color: '#b91c1c', fontSize: '0.8rem', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
        <span>
          <strong>Clinical Disclaimer:</strong> Dual consultation audits and organ contraindication checks are generated for patient education and awareness. Always consult your attending physician before initiating or modifying any medication regimen.
        </span>
      </div>

    </div>
  );
};

/* Interactive AI Dual Audit Assistant */
const DualAuditAiAssistant = ({ contextResult }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Clinical Audit Specialist. Ask me anything about your lab-treatment alignment score, contraindications, unaddressed gaps, or lifestyle co-prescription!`
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.chatWithAI(userMsg, {
        medicationName: contextResult?.auditSummary?.reportTitle || 'Dual Consultation Audit',
        primaryUse: contextResult?.auditSummary?.clinicalVerdict || '',
        dosageInstructions: (contextResult?.treatmentCoverageMatrix || []).map(m => `${m.labCondition}: ${m.matchedPrescribedDrug || 'Untreated'}`).join(', ')
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || res.message || 'Please discuss clinical gaps and treatment questions with your doctor.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to help you evaluate your lab report and prescription audit.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Sparkles size={20} color="var(--md-sys-color-primary)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          Ask AI Clinical Auditor
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '10px 16px',
              borderRadius: '16px',
              background: m.sender === 'user' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)',
              color: m.sender === 'user' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              fontWeight: m.sender === 'user' ? 600 : 400
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 16px', borderRadius: '16px', background: 'var(--md-sys-color-surface-container-high)', fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Clinical Auditor is reviewing data...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about organ safety, untreated biomarkers, or lifestyle tips..."
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 'var(--r-full)',
            border: '1px solid var(--border)',
            background: 'var(--md-sys-color-surface-container-low)',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', fontSize: '0.85rem', opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          Ask
        </button>
      </form>
    </div>
  );
};
