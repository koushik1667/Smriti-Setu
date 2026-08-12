import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Database, ShieldCheck, CheckCircle } from 'lucide-react';

export const LiveAnalysisStepper = ({ mode = 'medicine' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const stepsConfig = {
    medicine: [
      { icon: Camera, title: 'Optical Vision OCR', desc: 'Reading active ingredients, strength (mg/ml) & packaging text' },
      { icon: Database, title: 'NCBI / PubChem Enrichment', desc: 'Querying pharmacology, therapeutic indications & warnings' },
      { icon: ShieldCheck, title: 'Dosage & Safety Guardrails', desc: 'Generating 1-0-1 schedule, food interactions & side effects' }
    ],
    prescription: [
      { icon: Camera, title: 'Prescription OCR', desc: 'Digitizing doctor notes, clinic diagnosis & rx signatures' },
      { icon: Sparkles, title: 'Medication Extraction', desc: 'Parsing drug names, morning/afternoon/night routines & duration' },
      { icon: ShieldCheck, title: 'Drug-Drug Conflict Radar', desc: 'Checking cross-medication contraindications & food cautions' }
    ],
    report: [
      { icon: Camera, title: 'Diagnostic OCR', desc: 'Parsing lab biomarkers, reference ranges & measurement units' },
      { icon: Database, title: 'Biomarker Assessment', desc: 'Categorizing elevated / abnormal indicators against clinical norms' },
      { icon: ShieldCheck, title: 'Cabinet Cross-Verification', desc: 'Cross-matching treatment coverage against your medicine cabinet' }
    ],
    dual: [
      { icon: Camera, title: 'Dual Document Digitization', desc: 'Simultaneously ingesting Blood Lab Report & Doctor Prescription' },
      { icon: Database, title: 'Treatment Alignment Matrix', desc: 'Cross-referencing prescribed drugs against abnormal lab markers' },
      { icon: ShieldCheck, title: '360° Organ Safety Audit', desc: 'Detecting renal, hepatic & cardiac drug contraindications' }
    ]
  };

  const steps = stepsConfig[mode] || stepsConfig.medicine;

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1600);
    const timer2 = setTimeout(() => setCurrentStep(2), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      className="card fade-in"
      style={{
        padding: '24px',
        borderRadius: 'var(--r-xl)',
        background: 'var(--md-sys-color-surface-container)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevation-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} color="var(--md-sys-color-primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
            AI Clinical Analysis in Progress…
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Gemini Multimodal Vision + NCBI Pharmacology Engine
          </span>
        </div>
      </div>

      {/* 3-Step Animated Vertical Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;
          const Icon = step.icon;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                opacity: isDone || isActive ? 1 : 0.45,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Step Icon Badge */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--r-full)',
                  background: isDone
                    ? 'var(--md-sys-color-primary)'
                    : isActive
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface-container-high)',
                  color: isDone
                    ? 'var(--md-sys-color-on-primary)'
                    : isActive
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 12px rgba(103, 80, 164, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isDone ? <CheckCircle size={18} /> : <Icon size={16} />}
              </div>

              {/* Step Text Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                    {step.title}
                  </h4>
                  {isActive && (
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', fontWeight: 700 }}>
                      Processing…
                    </span>
                  )}
                  {isDone && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-primary)', fontWeight: 700 }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
