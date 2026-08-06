import React, { useState } from 'react';
import {
  Pill, ShieldAlert, CheckCircle, Clock, Info, Award,
  Users, AlertTriangle, Zap, Package, FlaskConical,
  Thermometer, Baby, LayoutGrid, List, Sparkles, Activity,
  ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TagList = ({ items, color = 'var(--md-sys-color-on-primary-container)', bg = 'var(--md-sys-color-primary-container)' }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {(items || []).map((item, i) => (
      <span key={i} style={{ fontSize: '0.8rem', padding: '5px 14px', borderRadius: 'var(--r-full)', background: bg, color, fontWeight: 500 }}>
        {item}
      </span>
    ))}
  </div>
);

const BulletList = ({ items, color = 'var(--md-sys-color-on-surface)' }) => (
  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
    {(items || []).map((item, i) => (
      <li key={i} style={{ fontSize: '0.88rem', color, lineHeight: 1.5 }}>{item}</li>
    ))}
  </ul>
);

export const AnalysisResultCard = ({ result, loading }) => {
  const { t } = useLanguage();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState('flashcards'); // 'flashcards' carousel or 'all' stack

  if (loading) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--r-full)', border: '4px solid var(--md-sys-color-primary-container)', borderTopColor: 'var(--md-sys-color-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto' }} />
        <h3 style={{ fontSize: '1.15rem', color: 'var(--md-sys-color-on-surface)', fontWeight: 700 }}>{t('analyzing')}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px' }}>{t('analyzingDesc')}</p>
      </div>
    );
  }

  if (!result) return null;

  const profile = result.patientProfile || {};

  // Define Flash Cards array
  const CARDS = [
    {
      id: 'overview',
      title: t('primaryUse'),
      category: 'Pharmacology',
      icon: <Pill size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              <Award size={14} /> AI Vision Analysis
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: '6px 0' }}>
              {result.medicationName || 'Identified Medication'}
            </h2>
            {result.drugClass && (
              <span className="badge badge-indigo">
                <FlaskConical size={14} /> {result.drugClass}
              </span>
            )}
          </div>

          <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> {t('primaryUse')}
            </h4>
            <p style={{ fontSize: '0.94rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.6, margin: 0 }}>
              {result.primaryUse || 'No primary indication recorded.'}
            </p>
          </div>

          {result.detailedIndications && (
            <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '14px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} /> Clinical Indications
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.5, margin: 0 }}>
                {result.detailedIndications}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'mechanism',
      title: t('activeIngredients'),
      category: 'Ingredients',
      icon: <Zap size={24} color="#b45309" />,
      bgIcon: '#fef3c7',
      borderColor: '#fde68a',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 700 }}>
              {t('activeIngredients')}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(result.activeIngredients || []).map((ing, idx) => (
                <span key={idx} style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-tertiary-container)', fontWeight: 600 }}>
                  ⚗ {ing}
                </span>
              ))}
            </div>
          </div>

          {result.mechanismOfAction && (
            <div style={{ background: '#fffbeb', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid #fde68a' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> Mechanism of Action
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                {result.mechanismOfAction}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'dosage',
      title: t('dosageInstructions'),
      category: 'Administration',
      icon: <Clock size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-secondary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--md-sys-color-secondary-container)', padding: '16px 18px', borderRadius: 'var(--r-md)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-secondary-container)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {t('dosageInstructions')}
            </h4>
            <p style={{ fontSize: '0.94rem', color: 'var(--md-sys-color-on-secondary-container)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              {result.dosageInstructions || 'Follow prescribing physician instructions.'}
            </p>
          </div>

          {result.dosageForms && result.dosageForms.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 700 }}>
                Dosage Forms
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.dosageForms.map((form, i) => (
                  <span key={i} className="badge badge-cyan">{form}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'warnings',
      title: t('warnings'),
      category: 'Safety',
      icon: <ShieldAlert size={24} color="var(--md-sys-color-error)" />,
      bgIcon: 'var(--md-sys-color-error-container)',
      borderColor: 'rgba(179, 38, 30, 0.3)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.warnings && result.warnings.length > 0 ? (
            <div style={{ background: 'var(--md-sys-color-error-container)', padding: '16px 18px', borderRadius: 'var(--r-md)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-error-container)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} /> {t('warnings')}
              </h4>
              <BulletList items={result.warnings} color="var(--md-sys-color-on-error-container)" />
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>No specific critical warnings listed for this medication.</p>
          )}
        </div>
      )
    },
    {
      id: 'sideeffects',
      title: t('sideEffects'),
      category: 'Adverse Effects',
      icon: <AlertTriangle size={24} color="#b45309" />,
      bgIcon: '#fffbeb',
      borderColor: '#fde68a',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.sideEffects ? (
            <div style={{ background: '#fffbeb', padding: '16px 18px', borderRadius: 'var(--r-md)', border: '1px solid #fde68a' }}>
              {result.sideEffects.common && result.sideEffects.common.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '6px', fontWeight: 700 }}>COMMON SIDE EFFECTS</p>
                  <TagList items={result.sideEffects.common} color="#92400e" bg="#fef3c7" />
                </div>
              )}
              {result.sideEffects.serious && result.sideEffects.serious.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-error)', marginBottom: '6px', fontWeight: 700 }}>SERIOUS REACTIONS — CONSULT PHYSICIAN</p>
                  <BulletList items={result.sideEffects.serious} color="var(--md-sys-color-error)" />
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>Refer to medication package insert for detailed side effect listings.</p>
          )}
        </div>
      )
    },
    {
      id: 'patient',
      title: 'Patient Profile',
      category: 'Suitability',
      icon: <Users size={24} color="var(--md-sys-color-tertiary)" />,
      bgIcon: 'var(--md-sys-color-tertiary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {profile.typicalPatients && (
            <p style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.5, margin: 0 }}>
              <strong>Target Patients:</strong> {profile.typicalPatients}
            </p>
          )}
          {profile.ageGroups && profile.ageGroups.length > 0 && (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '6px', fontWeight: 700 }}>SUITABLE AGE GROUPS</p>
              <TagList items={profile.ageGroups} color="var(--md-sys-color-on-tertiary-container)" bg="var(--md-sys-color-tertiary-container)" />
            </div>
          )}
          {profile.contraindicated && profile.contraindicated.length > 0 && (
            <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-error)', marginBottom: '6px', fontWeight: 700 }}>CONTRAINDICATED IN</p>
              <BulletList items={profile.contraindicated} color="var(--md-sys-color-error)" />
            </div>
          )}
        </div>
      )
    },
    {
      id: 'interactions',
      title: 'Interactions & Storage',
      category: 'Compatibility',
      icon: <Thermometer size={24} color="var(--md-sys-color-primary)" />,
      bgIcon: 'var(--md-sys-color-primary-container)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.drugInteractions && result.drugInteractions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700 }}>
                Drug Interactions
              </h4>
              <BulletList items={result.drugInteractions} />
            </div>
          )}

          {result.storageInstructions && (
            <div style={{ background: 'var(--md-sys-color-surface-container-low)', padding: '14px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Thermometer size={16} /> Storage Instructions
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface)', lineHeight: 1.5, margin: 0 }}>
                {result.storageInstructions}
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  // If NCBI PubChem data is present, add NCBI Card
  if (result.ncbiData) {
    CARDS.push({
      id: 'ncbi',
      title: t('ncbiRecord'),
      category: 'Biomedical Database',
      icon: <FlaskConical size={24} color="#0369a1" />,
      bgIcon: '#e0f2fe',
      borderColor: '#bae6fd',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>PubChem Verified</span>
            {result.ncbiData.ncbiRefUrl && (
              <a href={result.ncbiData.ncbiRefUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                NCBI Record <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
            {result.ncbiData.molecularFormula && (
              <div>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>Formula:</span> {result.ncbiData.molecularFormula}
              </div>
            )}
            {result.ncbiData.molecularWeight && (
              <div>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>Mol Weight:</span> {result.ncbiData.molecularWeight}
              </div>
            )}
            {result.ncbiData.pubchemCid && (
              <div>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>PubChem CID:</span> #{result.ncbiData.pubchemCid}
              </div>
            )}
          </div>
          {result.ncbiData.pharmacologySummary && (
            <p style={{ fontSize: '0.85rem', color: '#0c4a6e', lineHeight: 1.5, marginTop: '4px', borderTop: '1px dashed #bae6fd', paddingTop: '8px', margin: 0 }}>
              <strong>Biomedical Summary:</strong> {result.ncbiData.pharmacologySummary.substring(0, 220)}...
            </p>
          )}
        </div>
      )
    });
  }

  const safeIndex = Math.min(activeCardIndex, CARDS.length - 1);
  const currentCard = CARDS[safeIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Controls: Quick Tab Pills + View Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Quick Category Tab Pills */}
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

        {/* View Mode Switcher Button */}
        <button
          onClick={() => setViewMode(prev => prev === 'flashcards' ? 'all' : 'flashcards')}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', gap: '6px' }}
        >
          {viewMode === 'flashcards' ? <List size={14} /> : <LayoutGrid size={14} />}
          {viewMode === 'flashcards' ? t('showAllCards') : t('carouselView')}
        </button>
      </div>

      {/* MAIN CAROUSEL FLASHCARD VIEW WITH SIDE-BY-SIDE PREVIOUS & NEXT BUTTONS */}
      {viewMode === 'flashcards' ? (
        <div className="card fade-in" style={{ padding: '28px', display: 'flex', flexDirection: 'column', minHeight: '340px', justifyContent: 'space-between', boxShadow: 'var(--shadow-elevation-2)', borderColor: currentCard.borderColor || 'var(--border)' }}>
          
          {/* Card Top Header */}
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
                {t('cardXofY', { x: safeIndex + 1, y: CARDS.length })}
              </span>
            </div>

            {/* Card Content Body */}
            <div style={{ padding: '6px 0' }}>{currentCard.content}</div>
          </div>

          {/* SIDE-BY-SIDE NEXT & PREVIOUS NAVIGATION BUTTONS ROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', gap: '12px' }}>
            {/* Previous Card Button */}
            <button
              onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--r-full)',
                fontSize: '0.88rem',
                fontWeight: 700,
                opacity: safeIndex === 0 ? 0.4 : 1,
                cursor: safeIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={18} /> {t('previousCard')}
            </button>

            {/* Dot Progress Indicator */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {CARDS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveCardIndex(i)}
                  style={{
                    width: i === safeIndex ? '26px' : '8px',
                    height: '8px',
                    borderRadius: 'var(--r-full)',
                    background: i === safeIndex ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Next Card Button */}
            <button
              onClick={() => setActiveCardIndex(prev => Math.min(CARDS.length - 1, prev + 1))}
              disabled={safeIndex === CARDS.length - 1}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--r-full)',
                fontSize: '0.88rem',
                fontWeight: 700,
                opacity: safeIndex === CARDS.length - 1 ? 0.4 : 1,
                cursor: safeIndex === CARDS.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              {t('nextCard')} <ChevronRight size={18} />
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
                  <span style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{t('cardXofY', { x: i + 1, y: CARDS.length })}</span>
                </div>
              </div>
              {card.content}
            </div>
          ))}
        </div>
      )}

      {/* Interactive AI Pharmacist Q&A Assistant */}
      <AiPharmacistChatbot contextResult={result} />

      {/* Medical Disclaimer Card */}
      <div style={{ textAlign: 'center', padding: '14px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', fontStyle: 'italic', margin: 0 }}>
          {t('disclaimer')}
        </p>
      </div>

    </div>
  );
};

/* Interactive AI Pharmacist Assistant Component */
const AiPharmacistChatbot = ({ contextResult }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Pharmacist. Ask me any question about ${contextResult?.medicationName || 'your scanned medicine'}, its dosage, interactions, or safety guidelines!`
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
      const { api } = await import('../services/api');
      const res = await api.chatWithAI(userMsg, contextResult);
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || res.message || 'I am strictly programmed to answer questions about your scanned medication.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am here to answer questions regarding your scanned medication. Please ask about dosage, food interactions, or side effects.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Sparkles size={20} color="var(--md-sys-color-primary)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
          {t('aiPharmacist')}
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
            AI Pharmacist is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askPharmacist')}
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
          {t('askBtn')}
        </button>
      </form>
    </div>
  );
};
