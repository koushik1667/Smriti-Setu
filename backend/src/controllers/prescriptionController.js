const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateWithFailover } = require('../services/geminiKeyManager');
const ScanHistory = require('../models/ScanHistory');

const PRESCRIPTION_SYSTEM_PROMPT = `
You are PharmaVision AI's Senior Clinical Pharmacologist and Prescription Digitization Specialist.
Analyze the provided medical prescription (handwritten or printed doctor prescription, clinic Rx note, or e-prescription document/image).

Carefully identify ALL prescribed medications, dosage instructions, timing abbreviations (e.g. 1-0-1, 1-0-0, 0-0-1, OD, BD, TDS, QID, SOS, AC, PC, HS), duration, and safety precautions.
Also evaluate whether any of the prescribed medications interact with each other (Drug-Drug Interactions).

You MUST reply with ONLY a valid, raw JSON object (no markdown code blocks, no backticks, no preamble).

JSON Structure:
{
  "doctorInfo": {
    "doctorName": "Doctor Name if identified, or 'Attending Physician'",
    "clinicOrHospital": "Clinic / Hospital Name if visible e.g. City Care Hospital",
    "prescriptionDate": "Date on prescription if visible e.g. Aug 11, 2026",
    "patientName": "Patient Name if visible e.g. John Doe"
  },
  "prescriptionSummary": "Plain-language summary of what this prescription is treating",
  "medicines": [
    {
      "id": "med_1",
      "medicationName": "Exact Brand and Generic Name identified (e.g. Augmentin 625mg)",
      "drugClass": "Pharmacological class (e.g. Antibiotic / Beta-blocker / Antacid / NSAID)",
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
        "Critical warning e.g. Complete full course even if symptoms improve",
        "Take with a full glass of water"
      ],
      "sideEffects": {
        "common": ["Nausea", "Mild diarrhea", "Headache"],
        "serious": ["Allergic skin rash", "Shortness of breath"]
      },
      "activeIngredients": ["Amoxicillin 500mg", "Clavulanate Potassium 125mg"]
    }
  ],
  "drugInteractions": [
    {
      "severity": "MODERATE / SEVERE / SAFE",
      "drugsInvolved": ["Drug Name 1", "Drug Name 2"],
      "description": "Clinical explanation of the interaction and safety advice"
    }
  ],
  "generalPrecautions": [
    "General lifestyle, hydration, or dietary advice specified on prescription"
  ]
}
`;

async function analyzePrescription(req, res, next) {
  try {
    const { fileBase64, mimeType = 'image/jpeg', targetLanguage = 'en' } = req.body;

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Base64 file string is required'
      });
    }

    const base64Data = fileBase64.replace(/^data:(image\/\w+|application\/pdf);base64,/, '');
    const cleanMimeType = mimeType || 'image/jpeg';
    const geminiApiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

    let prescriptionData = null;
    let lastError = null;

    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const filePart = { inlineData: { data: base64Data, mimeType: cleanMimeType } };
        
        const langPrompt = targetLanguage === 'hi'
          ? 'Please provide all text values (summary, primaryUse, mechanismOfAction, warnings, sideEffects, instructions) in Hindi (हिंदी). Keep medicationName recognizable.'
          : targetLanguage === 'te'
          ? 'Please provide all text values (summary, primaryUse, mechanismOfAction, warnings, sideEffects, instructions) in Telugu (తెలుగు). Keep medicationName recognizable.'
          : 'Respond in clear, professional English.';

        const prompt = `${PRESCRIPTION_SYSTEM_PROMPT}\nLANGUAGE REQUIREMENT: ${langPrompt}`;

        const response = await generateWithFailover({
          prompt,
          parts: [filePart],
          overrideKey: req.headers['x-gemini-api-key']
        });
        prescriptionData = response.data;
        console.log(`[Prescription AI Success] Analyzed prescription with Key #${response.keyIndexUsed} (${response.modelUsed})`);
      } catch (err) {
        console.warn('[Prescription Multi-Key Warning]:', err.message);
        lastError = err;
      }
    }

    if (!prescriptionData) {
      const errMsg = lastError ? lastError.message : 'Gemini AI Vision API key invalid or quota exceeded.';
      return res.status(500).json({
        success: false,
        message: `Prescription Analysis failed: ${errMsg}. Please check your GEMINI_API_KEY in backend/.env.`
      });
    }

    return res.json({
      success: true,
      data: prescriptionData
    });
  } catch (error) {
    next(error);
  }
}

async function batchSaveMedicines(req, res, next) {
  try {
    const { medicines = [], imageThumbnail = '' } = req.body;
    const userId = req.user ? req.user.id : 'anonymous';

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Medicines array is required and cannot be empty'
      });
    }

    const records = medicines.map(med => ({
      userId,
      medicationName: med.medicationName || 'Prescribed Medication',
      primaryUse: med.primaryUse || med.prescribedDosage || '',
      dosageInstructions: med.prescribedDosage || (med.schedule ? `${med.schedule.morning}-${med.schedule.afternoon}-${med.schedule.night} (${med.schedule.timing || ''})` : ''),
      warnings: med.warnings || [],
      activeIngredients: med.activeIngredients || [],
      imageThumbnail: imageThumbnail || '',
      rawAnalysis: JSON.stringify(med)
    }));

    const savedRecords = await ScanHistory.createBatch(records);

    return res.json({
      success: true,
      message: `Successfully saved ${savedRecords.length} prescription medications to your cabinet.`,
      savedCount: savedRecords.length,
      savedRecords
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzePrescription,
  batchSaveMedicines
};
