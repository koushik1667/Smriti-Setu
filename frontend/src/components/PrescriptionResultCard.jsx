import React, { useState } from 'react';
import {
  FileText, Pill, ShieldAlert, CheckCircle, Clock, AlertTriangle,
  Zap, Calendar, User, Building2, Check, ArrowRight, Sparkles,
  Info, ChevronDown, ChevronUp, Sun, Moon, Sunrise, Utensils,
  ChevronLeft, ChevronRight, LayoutGrid, List, Award, AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';

export const PrescriptionResultCard = ({ result, loading, onSavedToCabinet, imageThumbnail }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState('flashcards'); // 'flashcards' or 'all'
  const [selectedMedIds, setSelectedMedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Auto-select all medicines when result arrives
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
          Digitizing Prescription & Extracting Medications...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Gemini Vision AI is identifying doctor notes, dosage frequencies (1-0-1), and running drug-drug interaction safety checks.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const {
    doctorInfo = {},
    prescriptionSummary = '',
    medicines = [],
    drugInteractions = [],
    generalPrecautions = []
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

  // Build Flashcard Deck
  const CARDS = [
    {
      id: 'overview',
      title: 'Rx Overview',
      category: 'Prescription Metadata',
      icon: <FileText size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              <Award size={14} /> Rx Prescription Intelligence
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '6px 0' }}>
              {doctorInfo.clinicOrHospital || 'Doctor Prescription Summary'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {doctorInfo.doctorName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <User size={14} color="var(--md-sys-color-primary)" />
                <strong>Doctor:</strong> {doctorInfo.doctorName}
              </div>
            )}
            {doctorInfo.prescriptionDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <Calendar size={14} color="var(--md-sys-color-primary)" />
                <strong>Date:</strong> {doctorInfo.prescriptionDate}
              </div>
            )}
            <span className="badge badge-indigo" style={{ padding: '8px 14px' }}>
              💊 {medicines.length} Medication{medicines.length !== 1 ? 's' : ''} Detected
            </span>
          </div>

          {prescriptionSummary && (
            <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} /> Clinical Summary & Diagnosis
              </h4>
              <p style={{ fontSize: '0.94rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.6, margin: 0 }}>
                {prescriptionSummary}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'medicines',
      title: 'Prescribed Drugs',
      category: 'Dosage Routines',
      icon: <Pill size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Header */}
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

          {/* Medication Cards List */}
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  </div>

                  {/* 1-0-1 Schedule Badges */}
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
      id: 'interactions',
      title: 'Drug Safety & Alerts',
      category: 'Interaction Checker',
      icon: <AlertTriangle size={24} color="#b45309" />,
      bgIcon: '#fffbeb',
      borderColor: '#fde68a',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Drug-Drug Interaction Analysis
          </h4>

          {drugInteractions && drugInteractions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drugInteractions.map((inter, iIdx) => (
                <div key={iIdx} style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#92400e' }}>
                      {inter.drugsInvolved?.join(' ⚡ ') || 'Prescribed Combination'}
                    </strong>
                    <span className={`badge ${inter.severity === 'SEVERE' ? 'badge-rose' : 'badge-amber'}`}>
                      {inter.severity || 'CAUTION'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                    {inter.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: '0.88rem' }}>
              <CheckCircle size={20} color="#10b981" />
              <span><strong>Interaction Check:</strong> No adverse drug-drug interactions detected between prescribed medications.</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'indications',
      title: 'Clinical Indications',
      category: 'Therapeutic Use',
      icon: <Zap size={24} color="#7c3aed" />,
      bgIcon: '#ede9fe',
      borderColor: '#ddd6fe',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            What Each Medication Treats
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {medicines.map((med, idx) => (
              <div key={idx} style={{ padding: '14px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--md-sys-color-primary)', display: 'block', marginBottom: '4px' }}>
                  💊 {med.medicationName}
                </strong>
                {med.primaryUse && (
                  <div style={{ fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '4px' }}>
                    <strong>🎯 Purpose:</strong> {med.primaryUse}
                  </div>
                )}
                {med.mechanismOfAction && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong>⚡ How it works:</strong> {med.mechanismOfAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'precautions',
      title: 'Doctor Advice',
      category: 'Lifestyle & Care',
      icon: <Info size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            General Doctor Instructions & Review Advice
          </h4>

          {generalPrecautions && generalPrecautions.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.6 }}>
              {generalPrecautions.map((gp, gpIdx) => <li key={gpIdx}>{gp}</li>)}
            </ul>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Take medications as prescribed and attend scheduled clinical reviews.</p>
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

      {/* Interactive AI Prescription Assistant */}
      <PrescriptionAiAssistant contextResult={result} />

      {/* Safety Notice Disclaimer */}
      <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--r-md)', color: '#b91c1c', fontSize: '0.8rem', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
        <span>
          <strong>Prescription Disclaimer:</strong> Prescription analysis and dosage extractions are generated with AI for patient convenience. Always follow your prescribing doctor's direct advice and verify with a licensed pharmacist.
        </span>
      </div>

    </div>
  );
};

/* Interactive AI Prescription Assistant */
const PrescriptionAiAssistant = ({ contextResult }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Prescription Assistant. Ask me any question regarding your prescribed medications, 1-0-1 dosage timing, food interactions, or side effects!`
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
      const medSummary = (contextResult?.medicines || []).map(m => `${m.medicationName} (${m.prescribedDosage})`).join(', ');
      const res = await api.chatWithAI(userMsg, {
        medicationName: contextResult?.doctorInfo?.clinicOrHospital || 'Doctor Prescription',
        primaryUse: contextResult?.prescriptionSummary || '',
        dosageInstructions: medSummary
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || res.message || 'Please consult your doctor regarding any medication changes.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to help you understand your prescription dosages and instructions.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Sparkles size={20} color="var(--md-sys-color-primary)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          Ask AI Prescription Assistant
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
            AI Assistant is reviewing prescription...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about when to take your medicines, before/after meals..."
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
