import React, { useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, Info, ShieldAlert, Heart, Dumbbell,
  Pill, FileText, ChevronLeft, ChevronRight, LayoutGrid, List, Sparkles,
  Utensils, AlertOctagon, Award, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const ReportResultCard = ({ result, loading }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState('flashcards'); // 'flashcards' or 'all'

  if (loading) {
    return (
      <div className="card text-center py-12 fade-in" style={{ padding: '48px 24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'inline-block', width: '52px', height: '52px', border: '4px solid var(--md-sys-color-primary-container)', borderTopColor: 'var(--md-sys-color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
          Analyzing Lab Report & Cross-Checking Cabinet...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Gemini AI is parsing biomarkers, extracting diagnostic conditions, and checking your scanned medicine cabinet.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const {
    reportTitle = 'Diagnostic Lab Report Analysis',
    patientSummary = '',
    outOfRangeBiomarkers = [],
    detectedConditions = [],
    exerciseAndLifestyle = [],
    cabinetMatching = {}
  } = result;

  const { matchedCabinet = [], noMatchNotice } = cabinetMatching;

  // Build Flashcard Deck
  const CARDS = [
    {
      id: 'overview',
      title: 'Report Summary',
      category: 'Diagnostic Overview',
      icon: <FileText size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              <Award size={14} /> Diagnostic Lab Intelligence
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '6px 0' }}>
              {reportTitle}
            </h2>
          </div>

          {patientSummary && (
            <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} /> Clinical Summary
              </h4>
              <p style={{ fontSize: '0.94rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.6, margin: 0 }}>
                {patientSummary}
              </p>
            </div>
          )}

          {detectedConditions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>
                Detected Diagnostic Conditions ({detectedConditions.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detectedConditions.map((cond, cIdx) => (
                  <div key={cIdx} style={{ padding: '12px 16px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>{cond.condition}</strong>
                      <span className={`badge ${cond.severity?.toLowerCase() === 'severe' ? 'badge-rose' : cond.severity?.toLowerCase() === 'moderate' ? 'badge-amber' : 'badge-emerald'}`}>
                        {cond.severity || 'Detected'}
                      </span>
                    </div>
                    {cond.description && (
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {cond.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'biomarkers',
      title: 'Lab Biomarkers',
      category: 'Blood Chemistry',
      icon: <Activity size={24} color="#d97706" />,
      bgIcon: '#fef3c7',
      borderColor: '#fde68a',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
              Out-of-Range Markers ({outOfRangeBiomarkers.length})
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Flagged vs Standard Reference</span>
          </div>

          {outOfRangeBiomarkers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {outOfRangeBiomarkers.map((bio, idx) => (
                <div key={idx} style={{ padding: '14px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>{bio.testName}</strong>
                    <span className={`badge ${bio.status === 'HIGH' || bio.status === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                      {bio.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginBottom: '4px' }}>
                    {bio.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Normal Range: {bio.referenceRange || 'Standard range'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)', textAlign: 'center', color: '#065f46' }}>
              <CheckCircle size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <strong>All Biomarkers Within Standard Ranges</strong>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'cabinet',
      title: 'Cabinet Cross-Check',
      category: 'Medication Matching',
      icon: <Pill size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Matches in Your Scanned Medicine Cabinet
          </h4>

          {matchedCabinet.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {matchedCabinet.map((match, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CheckCircle size={18} color="#10b981" />
                    <strong style={{ fontSize: '0.95rem', color: '#065f46' }}>
                      Target Condition: {match.condition}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {match.matchedMedicines.map((med, mIdx) => (
                      <div key={mIdx} style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 'var(--r-sm)', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 700, color: 'var(--md-sys-color-primary)', fontSize: '0.95rem', marginBottom: '2px' }}>
                          💊 {med.medicationName} (From Cabinet)
                        </div>
                        {med.primaryUse && (
                          <div style={{ fontSize: '0.84rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                            <strong>Indication:</strong> {med.primaryUse}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 'var(--r-md)', color: '#c2410c' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                <AlertTriangle size={18} color="#c2410c" />
                No Common Medicines Found in Scanned Cabinet
              </div>
              <p style={{ fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
                {noMatchNotice || 'None of your previously scanned medications match the detected lab conditions. Check the exercise and lifestyle recommendations below.'}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'exercises',
      title: 'Targeted Exercises',
      category: 'Physical Therapy',
      icon: <Dumbbell size={24} color="#3b82f6" />,
      bgIcon: '#eff6ff',
      borderColor: '#bfdbfe',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Condition-Specific Physical Activities
          </h4>

          {exerciseAndLifestyle.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {exerciseAndLifestyle.map((ex, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--r-md)' }}>
                  <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1d4ed8', margin: '0 0 10px 0' }}>
                    🏃‍♂️ Exercises for: {ex.condition}
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                    {(ex.recommendedExercises || []).map((item, eIdx) => (
                      <li key={eIdx}>{item}</li>
                    ))}
                  </ul>
                  {ex.precautions && (
                    <div style={{ fontSize: '0.8rem', background: '#ffffff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e5e7eb', color: '#6b7280', marginTop: '10px' }}>
                      💡 <strong>Precautions:</strong> {ex.precautions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No specialized exercise regimens required for standard normal ranges.</p>
          )}
        </div>
      )
    },
    {
      id: 'nutrition',
      title: 'Dietary Guidance',
      category: 'Nutrition & Wellness',
      icon: <Utensils size={24} color="#16a34a" />,
      bgIcon: '#dcfce7',
      borderColor: '#bbf7d0',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontWeight: 700 }}>
            Nutrition & Dietary Strategy
          </h4>

          {exerciseAndLifestyle.some(ex => ex.dietaryAdvice && ex.dietaryAdvice.length > 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {exerciseAndLifestyle.map((ex, idx) => (
                ex.dietaryAdvice && ex.dietaryAdvice.length > 0 && (
                  <div key={idx} style={{ padding: '16px', background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 'var(--r-md)' }}>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#15803d', margin: '0 0 10px 0' }}>
                      🥗 Dietary Advice for: {ex.condition}
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                      {ex.dietaryAdvice.map((item, dIdx) => (
                        <li key={dIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Follow standard balanced nutrition and hydration.</p>
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

      {/* Interactive AI Lab Report Q&A Assistant */}
      <ReportAiAssistant contextResult={result} />

      {/* Safety Notice Disclaimer */}
      <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--r-md)', color: '#b91c1c', fontSize: '0.8rem', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
        <span>
          <strong>Clinical Disclaimer:</strong> Lab report findings and cabinet cross-matching are generated for educational awareness. Always consult your attending physician before modifying your prescribed treatment plan.
        </span>
      </div>

    </div>
  );
};

/* Interactive AI Lab Report Assistant */
const ReportAiAssistant = ({ contextResult }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Diagnostic Assistant. Ask me any question regarding your lab test results, biomarkers, or lifestyle recommendations!`
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
        medicationName: contextResult?.reportTitle || 'Lab Diagnostic Report',
        primaryUse: contextResult?.patientSummary || '',
        dosageInstructions: (contextResult?.outOfRangeBiomarkers || []).map(b => `${b.testName}: ${b.value} (${b.status})`).join(', ')
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || res.message || 'Please consult your physician regarding critical biomarker levels.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to help you understand your lab test report values and general health advice.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Sparkles size={20} color="var(--md-sys-color-primary)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          Ask AI Diagnostic Assistant
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
            AI Assistant is reviewing lab data...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your cholesterol, blood sugar, or exercise advice..."
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
