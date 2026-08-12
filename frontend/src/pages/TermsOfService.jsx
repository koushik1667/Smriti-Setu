import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Stethoscope, Scale, PhoneCall, ArrowLeft } from 'lucide-react';

export const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', padding: '6px 12px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ padding: '32px', borderRadius: 'var(--r-xl)', background: 'var(--md-sys-color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={26} color="var(--md-sys-color-error)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              Terms of Service & Clinical Disclaimer
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Assistive AI Visual Intelligence Terms of Use
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--md-sys-color-on-surface)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          {/* Prominent Red Alert Box */}
          <div style={{ padding: '16px 20px', borderRadius: 'var(--r-lg)', background: 'var(--md-sys-color-error-container)', border: '1px solid var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error-container)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Critical Medical Notice
            </h4>
            <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
              PharmaVision AI is strictly an <strong>assistive visual translation and optical recognition tool</strong>. It does not provide medical diagnosis, clinical treatment plans, or emergency triage. Always consult a qualified physician or registered pharmacist before starting, changing, or discontinuing any medication.
            </p>
          </div>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} /> 1. No Doctor-Patient Relationship
            </h3>
            <p>
              Use of PharmaVision AI, its chatbots, diagnostic calculators, 360° dual consultation audits, and medicine cabinet categorizations does not establish a doctor-patient relationship. All generated 1-0-1 routines and biomarker interpretations are algorithmic outputs based on optical data and should be verified against your physical doctor prescription.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={18} /> 2. Emergency Situations
            </h3>
            <p>
              If you are experiencing a life-threatening medical event, chest pain, anaphylactic allergic reaction, poisoning, or severe difficulty breathing, immediately call your local emergency services (<strong>112 / 108 in India</strong> or <strong>911 in the United States</strong>) or visit the nearest emergency room.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
