const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateWithFailover } = require('../services/geminiKeyManager');
let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  OpenAI = null;
}
const ScanHistory = require('../models/ScanHistory');
const Document = require('../models/Document');

const REPORT_SYSTEM_PROMPT = `
You are PharmaVision AI's Senior Clinical Diagnostic & Lab Report Specialist.
Analyze the uploaded medical/blood test report image or document and return a structured JSON response.

Follow this exact JSON structure:
{
  "reportTitle": "Title of report e.g. Comprehensive Lipid & Metabolic Panel",
  "patientSummary": "Brief summary of patient lab findings",
  "outOfRangeBiomarkers": [
    {
      "testName": "Name of test e.g. LDL Cholesterol / HbA1c",
      "value": "Measured value e.g. 185 mg/dL",
      "referenceRange": "Normal range e.g. < 100 mg/dL",
      "status": "HIGH / LOW / CRITICAL"
    }
  ],
  "detectedConditions": [
    {
      "condition": "Medical condition name e.g. Hypercholesterolemia / Type 2 Diabetes / Anemia",
      "severity": "Mild / Moderate / Severe",
      "description": "Short explanation of the condition based on the lab values"
    }
  ],
  "exerciseAndLifestyle": [
    {
      "condition": "Condition name this exercise addresses",
      "recommendedExercises": [
        "Specific exercise e.g., 30-min daily brisk walking",
        "Moderate aerobic cardio / swimming 3-4 days a week",
        "Post-meal 10-minute light walking"
      ],
      "dietaryAdvice": [
        "Diet tip e.g., Increase soluble fiber (oats, beans)",
        "Reduce saturated fats and refined sugars"
      ],
      "precautions": "Precaution e.g., Stay hydrated and monitor blood sugar before vigorous workouts"
    }
  ]
}
`;

async function analyzeReport(req, res, next) {
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

    let reportAnalysis = null;
    let lastError = null;

    // 1. Gemini Vision AI for Report Analysis with Multi-Key Failover
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const filePart = { inlineData: { data: base64Data, mimeType: cleanMimeType } };
        const prompt = `${REPORT_SYSTEM_PROMPT}\nPlease analyze this lab report and return the JSON object in ${targetLanguage === 'hi' ? 'Hindi (हिंदी)' : targetLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English'}.`;

        const response = await generateWithFailover({
          prompt,
          parts: [filePart],
          overrideKey: req.headers['x-gemini-api-key']
        });
        reportAnalysis = response.data;
        console.log(`[Report AI Success] Analyzed lab report with Key #${response.keyIndexUsed} (${response.modelUsed})`);
      } catch (geminiErr) {
        console.warn('[Report AI Multi-Key Warning]:', geminiErr.message);
        lastError = geminiErr;
      }
    }

    if (!reportAnalysis) {
      const errMsg = lastError ? lastError.message : 'Gemini AI Vision API key invalid or quota exceeded.';
      return res.status(500).json({
        success: false,
        message: `Lab Report Analysis failed: ${errMsg}. Please check your GEMINI_API_KEY in backend/.env.`
      });
    }

    // 2. Fetch User's Scanned Cabinet History for Cross-Matching
    const userId = req.user ? req.user.id : 'anonymous';
    let userScannedCabinet = [];
    try {
      userScannedCabinet = await ScanHistory.findByUserId(userId);
    } catch (e) {
      console.warn('[Cabinet Search Warning]:', e.message);
    }

    // 3. Cross-Match Report Conditions against Scanned Cabinet History ONLY
    const matchedCabinet = [];
    const unmappedConditions = [];

    if (reportAnalysis.detectedConditions && Array.isArray(reportAnalysis.detectedConditions)) {
      for (const condItem of reportAnalysis.detectedConditions) {
        const condName = (condItem.condition || '').toLowerCase();
        let foundMatches = [];

        for (const item of userScannedCabinet) {
          const medName = (item.medicationName || '').toLowerCase();
          const primaryUse = (item.primaryUse || '').toLowerCase();

          // Check if condition matches scanned medication use
          if (
            (condName.includes('cholesterol') || condName.includes('lipid')) && (medName.includes('rozucor') || medName.includes('rosuvastatin') || primaryUse.includes('cholesterol')) ||
            (condName.includes('diabetes') || condName.includes('sugar') || condName.includes('hba1c')) && (medName.includes('metformin') || medName.includes('glycomet') || primaryUse.includes('diabetes') || primaryUse.includes('sugar')) ||
            (condName.includes('inflammation') || condName.includes('adrenal') || condName.includes('allergy')) && (medName.includes('hisone') || medName.includes('hydrocortisone') || primaryUse.includes('adrenal') || primaryUse.includes('allergy')) ||
            (condName.includes('infection') || condName.includes('bacterial')) && (medName.includes('amoxicillin') || medName.includes('azithromycin') || primaryUse.includes('infection')) ||
            (condName.includes('fever') || condName.includes('pain')) && (medName.includes('dolo') || medName.includes('paracetamol') || primaryUse.includes('fever') || primaryUse.includes('pain'))
          ) {
            foundMatches.push({
              scannedId: item.id,
              medicationName: item.medicationName,
              primaryUse: item.primaryUse,
              dosageInstructions: item.dosageInstructions,
              warnings: item.warnings,
              scannedAt: item.createdAt
            });
          }
        }

        if (foundMatches.length > 0) {
          matchedCabinet.push({
            condition: condItem.condition,
            matchedMedicines: foundMatches
          });
        } else {
          unmappedConditions.push(condItem.condition);
        }
      }
    }

    // Automatically persist analyzed lab report to durable Document database
    let savedDocument = null;
    try {
      savedDocument = await Document.create({
        userId,
        documentType: 'lab_report',
        title: reportAnalysis.reportType 
          ? `Lab Report - ${reportAnalysis.reportType}` 
          : `Diagnostic Report - ${new Date().toLocaleDateString()}`,
        summary: reportAnalysis.clinicalSummary || '',
        doctorInfo: { labName: reportAnalysis.reportType || 'Clinical Laboratory' },
        patientInfo: {
          patientName: reportAnalysis.patientName || '',
          sampleDate: reportAnalysis.sampleDate || ''
        },
        biomarkers: reportAnalysis.testResults || [],
        criticalFindings: reportAnalysis.criticalFindings || [],
        generalPrecautions: reportAnalysis.dietaryLifestyleAdvice || [],
        rawAnalysis: reportAnalysis,
        thumbnail: fileBase64.length < 500000 ? fileBase64 : ''
      });
    } catch (docErr) {
      console.warn('[Report Auto-Save Warning]:', docErr.message);
    }

    return res.json({
      success: true,
      data: {
        ...reportAnalysis,
        documentId: savedDocument ? savedDocument.id : null,
        cabinetMatching: {
          scannedCabinetSize: userScannedCabinet.length,
          matchedCabinet,
          unmappedConditions,
          hasCabinetMatch: matchedCabinet.length > 0,
          noMatchNotice: matchedCabinet.length === 0 ? "No common medicines found in your scanned cabinet for the detected conditions." : null
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeReport
};
