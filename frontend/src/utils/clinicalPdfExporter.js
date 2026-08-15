/**
 * PharmaVision AI — Hospital-Grade Clinical PDF & Printable Summary Generator
 * Generates beautiful, structured medical consultation sheets for Patients & Doctors.
 */

export const generateDualAuditPDF = (result) => {
  if (!result) return;

  const {
    auditSummary = {},
    organSafetyAndContraindications = [],
    treatmentCoverageMatrix = [],
    unaddressedGaps = [],
    medicines = [],
    lifestyleAndDietaryCoPrescription = []
  } = result;

  const printDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    alert('Please allow popups to download or print the Clinical PDF summary.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>PharmaVision AI — 360° Clinical Dual-Audit Report</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 24px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-title {
          font-size: 24px;
          font-weight: 800;
          color: #0369a1;
          margin: 0 0 4px 0;
        }
        .sub-title {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .report-meta {
          text-align: right;
          font-size: 12px;
          color: #475569;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-critical { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
        .badge-caution { background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; }
        .badge-safe { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
        
        .score-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .score-val {
          font-size: 32px;
          font-weight: 800;
          color: #16a34a;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          margin: 24px 0 12px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 12px;
        }
        th {
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        .alert-box {
          background: #fff1f2;
          border-left: 4px solid #e11d48;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-radius: 0 6px 6px 0;
          font-size: 12px;
        }
        .gap-box {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-radius: 0 6px 6px 0;
          font-size: 12px;
        }
        .footer {
          margin-top: 32px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="logo-title">PharmaVision AI</h1>
          <p class="sub-title">Clinical Decision Support & Dual-Audit Verification Sheet</p>
        </div>
        <div class="report-meta">
          <div><strong>Date:</strong> ${printDate}</div>
          <div><strong>Clinic / Doctor:</strong> ${auditSummary.doctorOrClinic || 'Attending Physician'}</div>
          <div><strong>Report:</strong> ${auditSummary.reportTitle || 'Diagnostic Panel'}</div>
        </div>
      </div>

      <div class="score-card">
        <div>
          <div style="font-weight: 700; font-size: 15px; color: #166534; margin-bottom: 4px;">Overall Clinical Alignment Verdict</div>
          <div style="font-size: 13px; color: #374151;">${auditSummary.clinicalVerdict || 'Prescription and lab reports cross-evaluated for pharmacological safety.'}</div>
        </div>
        <div style="text-align: right; padding-left: 20px;">
          <div class="score-val">${auditSummary.overallAlignmentScore ?? 90}%</div>
          <div style="font-size: 11px; color: #166534; font-weight: 700;">Safety Score</div>
        </div>
      </div>

      ${organSafetyAndContraindications.length > 0 ? `
        <div class="section-title">🚨 Organ Safety & Contraindication Alerts</div>
        ${organSafetyAndContraindications.map(alert => `
          <div class="alert-box">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong>${alert.organSystem} System — ${alert.biomarkerFlagged}</strong>
              <span class="badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : 'badge-caution'}">${alert.severity}</span>
            </div>
            <div><strong>Drug Involved:</strong> ${alert.prescribedDrugInvolved}</div>
            <div style="color: #4b5563; margin-top: 4px;">${alert.clinicalAlert}</div>
          </div>
        `).join('')}
      ` : ''}

      <div class="section-title">💊 Prescribed Medications & Treatment Schedule</div>
      <table>
        <thead>
          <tr>
            <th>Medication Name</th>
            <th>Class / Active Salts</th>
            <th>Dosage & Frequency</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          ${medicines.map(med => `
            <tr>
              <td><strong>${med.medicationName}</strong></td>
              <td>${med.drugClass || 'Pharmacological Drug'}<br/><span style="color: #64748b;">${(med.activeIngredients || []).join(', ')}</span></td>
              <td>${med.prescribedDosage || 'As advised'}<br/><span style="color: #64748b;">${med.primaryUse || ''}</span></td>
              <td>
                ${med.schedule ? `Morn: ${med.schedule.morning} | Aft: ${med.schedule.afternoon} | Night: ${med.schedule.night}<br/><span style="color: #64748b;">${med.schedule.timing || ''}</span>` : 'Standard'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${unaddressedGaps.length > 0 ? `
        <div class="section-title">⚠️ Clinical Gaps for Doctor Discussion</div>
        ${unaddressedGaps.map(gap => `
          <div class="gap-box">
            <div style="font-weight: 700; color: #b45309; margin-bottom: 4px;">${gap.biomarker}</div>
            <div style="color: #374151; margin-bottom: 4px;"><strong>Significance:</strong> ${gap.clinicalSignificance}</div>
            <div style="color: #1e293b;"><strong>Recommended Question for Doctor:</strong> ${gap.recommendedPhysicianDiscussion}</div>
          </div>
        `).join('')}
      ` : ''}

      ${lifestyleAndDietaryCoPrescription.length > 0 ? `
        <div class="section-title">🥗 Lifestyle & Dietary Co-Prescriptions</div>
        <table>
          <thead>
            <tr>
              <th style="width: 30%;">Category</th>
              <th>Clinical Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${lifestyleAndDietaryCoPrescription.map(item => `
              <tr>
                <td><strong>${item.topic}</strong></td>
                <td>${item.advice}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        Generated by PharmaVision AI Clinical CDSS Suite. This document is intended to assist medical consultations and does not replace the direct diagnostic judgment of a licensed healthcare practitioner.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateCabinetSummaryPDF = (medications = []) => {
  if (!medications || medications.length === 0) {
    alert('Your medicine cabinet is empty.');
    return;
  }

  const printDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    alert('Please allow popups to download or print the Cabinet PDF summary.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>PharmaVision AI — Patient Active Medicine Cabinet</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-title { font-size: 24px; font-weight: 800; color: #0369a1; margin: 0 0 4px 0; }
        .sub-title { font-size: 13px; color: #64748b; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px; border: 1px solid #e2e8f0; }
        td { padding: 10px; border: 1px solid #e2e8f0; vertical-align: top; }
        .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="logo-title">PharmaVision AI</h1>
          <p class="sub-title">Patient Active Medicine Cabinet Summary</p>
        </div>
        <div>
          <div><strong>Date:</strong> ${printDate}</div>
          <div><strong>Total Medications:</strong> ${medications.length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medication Name</th>
            <th>Primary Use</th>
            <th>Dosage Instructions</th>
            <th>Active Chemical Ingredients</th>
          </tr>
        </thead>
        <tbody>
          ${medications.map((med, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${med.medicationName}</strong></td>
              <td>${med.primaryUse || '—'}</td>
              <td>${med.dosageInstructions || 'As prescribed'}</td>
              <td>${(med.activeIngredients || []).join(', ') || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Generated by PharmaVision AI. Always verify full prescribing guidelines with your doctor or licensed pharmacist before altering dosages.
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
