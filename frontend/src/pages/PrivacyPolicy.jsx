import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, FileText, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
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
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="var(--md-sys-color-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              Medical Data Privacy Policy
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Last Updated: August 2026 • GDPR, DPDP & HIPAA Compliant Framework
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--md-sys-color-on-surface)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} /> 1. Commitment to Health Data Security
            </h3>
            <p>
              At <strong>PharmaVision AI</strong>, we recognize that prescription slips, medication packaging, and laboratory diagnostic reports contain deeply personal health data. We are fundamentally committed to ensuring that your health information remains strictly confidential, encrypted, and under your absolute control.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOff size={18} /> 2. What Information We Process
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Optical Visual Inputs:</strong> High-resolution medicine packaging images, blister packs, prescription slips, and blood lab reports that you capture or upload.</li>
              <li><strong>Account Credentials:</strong> Name, Email, and encrypted passwords managed securely via Supabase Cloud Auth.</li>
              <li><strong>Personal Cabinet & Scan History:</strong> Extracted medication schedules (1-0-1 routines), active ingredients, and biomarker metrics stored in encrypted cloud databases.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} /> 3. How AI Models Ingest Your Data
            </h3>
            <p>
              Uploaded documents are transmitted over encrypted TLS 1.3 channels to Google Gemini Vision AI APIs solely for real-time optical text reading and clinical pharmacological extraction. <strong>Your images are not used to train public foundational AI models and are never sold or shared with commercial advertising networks.</strong>
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> 4. Your Rights (Export & Permanent Deletion)
            </h3>
            <p>
              In accordance with GDPR and global digital privacy laws, you possess the unabridged right to:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Export:</strong> Download all your past medication records, disease cabinet shelves, and consultation audit histories in standardized JSON format.</li>
              <li><strong>Permanently Erase:</strong> Purge specific scans or wipe your entire account and all associated medical records in 1 click from your Profile dashboard.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
