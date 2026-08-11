const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateWithFailover } = require('../services/geminiKeyManager');
const ScanHistory = require('../models/ScanHistory');

const DUAL_AUDIT_SYSTEM_PROMPT = `
You are PharmaVision AI's Senior Clinical Pharmacologist and Diagnostic Auditor.
You are provided with TWO medical documents for the same patient:
1. Diagnostic Blood / Medical Lab Report (Image or PDF)
2. Doctor's Prescription / Rx Note (Image or PDF)

Perform a comprehensive 360-degree Clinical Dual-Audit.
Analyze what is clinically abnormal in the patient's lab report and evaluate whether the doctor's prescription accurately, safely, and sufficiently addresses those findings.

You MUST reply with ONLY a valid, raw JSON object (no markdown code blocks, no backticks, no preamble).

JSON Structure:
{
  "auditSummary": {
    "reportTitle": "Title of Lab Report e.g. Comprehensive Metabolic & Lipid Profile",
    "doctorOrClinic": "Doctor / Clinic Name on Prescription e.g. Dr. R. Sharma, Apollo Clinic",
    "overallAlignmentScore": 90,
    "clinicalVerdict": "Clear 2-sentence summary of how well the prescription matches the lab findings and any critical alerts"
  },
  "organSafetyAndContraindications": [
    {
      "severity": "CRITICAL / CAUTION / SAFE",
      "organSystem": "Renal / Hepatic / Cardiovascular / Metabolic",
      "biomarkerFlagged": "Biomarker with abnormal value e.g. Serum Creatinine: 2.2 mg/dL",
      "prescribedDrugInvolved": "Drug involved e.g. Ibuprofen 400mg",
      "clinicalAlert": "Detailed safety warning explaining why this drug might stress this organ and what precautions to take"
    }
  ],
  "treatmentCoverageMatrix": [
    {
      "labCondition": "Condition from abnormal biomarker e.g. Hypercholesterolemia (LDL 185 mg/dL)",
      "isCovered": true,
      "matchedPrescribedDrug": "Rosuvastatin 10mg",
      "dosageRoutine": "1 tablet at bedtime (0-0-1)",
      "clinicalNote": "Effectively targets LDL reduction and cardiovascular risk"
    }
  ],
  "unaddressedGaps": [
    {
      "biomarker": "Biomarker name with measured value e.g. Vitamin D3 (14 ng/mL - Low)",
      "clinicalSignificance": "Explanation of clinical impact e.g. Risk of bone density loss and fatigue",
      "recommendedPhysicianDiscussion": "Actionable question or topic to discuss with prescribing physician"
    }
  ],
  "medicines": [
    {
      "id": "med_1",
      "medicationName": "Exact Brand and Generic Name identified (e.g. Augmentin 625mg)",
      "drugClass": "Pharmacological class (e.g. Antibiotic / Statin / Antacid)",
      "prescribedDosage": "Standard dosage description e.g. 1 tablet twice daily after meals for 5 days",
      "schedule": {
        "morning": 1,
        "afternoon": 0,
        "night": 1,
        "timing": "After Food / Before Food / With Food",
        "duration": "5 Days"
      },
      "primaryUse": "Clear, plain-language description of what this medication treats",
      "mechanismOfAction": "Plain-language explanation of how this drug works",
      "warnings": [
        "Critical warning e.g. Take with food",
        "Avoid alcohol during treatment"
      ],
      "sideEffects": {
        "common": ["Nausea", "Mild stomach upset"],
        "serious": ["Severe rash or breathing difficulty"]
      },
      "activeIngredients": ["Amoxicillin 500mg", "Clavulanate Potassium 125mg"]
    }
  ],
  "lifestyleAndDietaryCoPrescription": [
    {
      "topic": "Dietary Strategy",
      "advice": "Personalized nutrition advice tailored to the lab findings and prescribed medicines."
    },
    {
      "topic": "Targeted Physical Activity",
      "advice": "Safe, targeted exercises that complement the medical treatment plan."
    }
  ]
}
`;

async function analyzeDualAudit(req, res, next) {
  try {
    const {
      labFileBase64,
      labMimeType = 'image/jpeg',
      rxFileBase64,
      rxMimeType = 'image/jpeg',
      targetLanguage = 'en'
    } = req.body;

    if (!labFileBase64 || !rxFileBase64) {
      return res.status(400).json({
        success: false,
        message: 'Both lab report and prescription files are required for Dual Consultation Audit.'
      });
    }

    const cleanLabData = labFileBase64.replace(/^data:(image\/\w+|application\/pdf);base64,/, '');
    const cleanRxData = rxFileBase64.replace(/^data:(image\/\w+|application\/pdf);base64,/, '');
    const geminiApiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

    let auditData = null;
    let lastError = null;

    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const labPart = { inlineData: { data: cleanLabData, mimeType: labMimeType || 'image/jpeg' } };
        const rxPart = { inlineData: { data: cleanRxData, mimeType: rxMimeType || 'image/jpeg' } };

        const langPrompt = targetLanguage === 'hi'
          ? 'Please provide all text values (summary, clinicalVerdict, alerts, clinicalNotes, warnings, sideEffects, advice) in Hindi (हिंदी). Keep medication names recognizable.'
          : targetLanguage === 'te'
          ? 'Please provide all text values (summary, clinicalVerdict, alerts, clinicalNotes, warnings, sideEffects, advice) in Telugu (తెలుగు). Keep medication names recognizable.'
          : 'Respond in clear, professional English.';

        const prompt = `${DUAL_AUDIT_SYSTEM_PROMPT}\nLANGUAGE REQUIREMENT: ${langPrompt}\nNOTE: Document 1 is the Diagnostic Lab Report. Document 2 is the Doctor's Prescription. Audit both together.`;

        const response = await generateWithFailover({
          prompt,
          parts: [labPart, rxPart],
          overrideKey: req.headers['x-gemini-api-key']
        });
        auditData = response.data;
        console.log(`[Dual Audit AI Success] Analyzed dual documents with Key #${response.keyIndexUsed} (${response.modelUsed})`);
      } catch (err) {
        console.warn('[Dual Audit Multi-Key Warning]:', err.message);
        lastError = err;
      }
    }

    if (!auditData) {
      const errMsg = lastError ? lastError.message : 'Gemini AI Vision API key invalid or quota exceeded.';
      return res.status(500).json({
        success: false,
        message: `Dual Consultation Audit failed: ${errMsg}. Please check your GEMINI_API_KEY in backend/.env.`
      });
    }

    return res.json({
      success: true,
      data: auditData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeDualAudit
};
