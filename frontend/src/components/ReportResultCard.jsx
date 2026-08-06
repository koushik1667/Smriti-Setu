import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Info, ShieldAlert, Heart, Dumbbell, Pill, FileText } from 'lucide-react';

export const ReportResultCard = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="card text-center py-12 fade-in" style={{ padding: '40px 24px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '4px solid var(--md-sys-color-primary-container)', borderTopColor: 'var(--md-sys-color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}>
          Analyzing Lab Report & Cabinet History...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Gemini AI is parsing biomarkers, extracting diagnostic conditions, and checking your scanned medicine cabinet.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const {
    reportTitle,
    patientSummary,
    outOfRangeBiomarkers = [],
    detectedConditions = [],
    exerciseAndLifestyle = [],
    cabinetMatching = {}
  } = result;

  const { matchedCabinet = [], unmappedConditions = [], noMatchNotice } = cabinetMatching;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(16,185,129,0.06))', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="var(--md-sys-color-primary)" />
          </div>
          <div>
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
              Lab Report Intelligence
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              {reportTitle || 'Diagnostic Lab Report Analysis'}
            </h2>
          </div>
        </div>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          {patientSummary || 'Diagnostic analysis of uploaded blood test values and matching against your personal scanned medicine cabinet.'}
        </p>
      </div>

      {/* Out-of-Range Biomarkers */}
      {outOfRangeBiomarkers.length > 0 && (
        <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#f59e0b" /> Out-of-Range Lab Biomarkers ({outOfRangeBiomarkers.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {outOfRangeBiomarkers.map((bio, idx) => (
              <div key={idx} style={{ padding: '14px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>{bio.testName}</strong>
                  <span className={`badge ${bio.status === 'HIGH' || bio.status === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                    {bio.status}
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706', marginBottom: '4px' }}>
                  {bio.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Normal Ref: {bio.referenceRange}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanned Cabinet Matching Section */}
      <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Pill size={20} color="var(--md-sys-color-primary)" /> Scanned Medicine Cabinet Cross-Checker
        </h3>

        {matchedCabinet.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {matchedCabinet.map((match, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <strong style={{ fontSize: '0.95rem', color: '#065f46' }}>
                    Matched Condition: {match.condition}
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {match.matchedMedicines.map((med, mIdx) => (
                    <div key={mIdx} style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 'var(--r-sm)', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--md-sys-color-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>
                        💊 {med.medicationName} (From Scanned History)
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '4px' }}>
                        <strong>Indication:</strong> {med.primaryUse}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>Dosage Advice:</strong> {med.dosageInstructions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 'var(--r-md)', color: '#c2410c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
              <AlertTriangle size={18} color="#c2410c" />
              No Common Medicines Found in Scanned Cabinet
            </div>
            <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              {noMatchNotice || 'None of your previously scanned medications match the detected lab conditions. Refer below for targeted exercises and non-drug lifestyle recommendations.'}
            </p>
          </div>
        )}
      </div>

      {/* Targeted Exercise & Lifestyle Recommendations */}
      {exerciseAndLifestyle.length > 0 && (
        <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={20} color="#3b82f6" /> Targeted Physical Exercises & Lifestyle Routine
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {exerciseAndLifestyle.map((ex, idx) => (
              <div key={idx} style={{ padding: '18px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--r-md)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '12px' }}>
                  🏃‍♂️ Exercises for: {ex.condition}
                </h4>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--md-sys-color-on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Recommended Physical Activities:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                    {ex.recommendedExercises.map((item, eIdx) => (
                      <li key={eIdx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {ex.dietaryAdvice && ex.dietaryAdvice.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--md-sys-color-on-surface)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                      Nutrition & Dietary Habits:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                      {ex.dietaryAdvice.map((item, dIdx) => (
                        <li key={dIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ex.precautions && (
                  <div style={{ fontSize: '0.8rem', background: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
                    💡 <strong>Precautions:</strong> {ex.precautions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
