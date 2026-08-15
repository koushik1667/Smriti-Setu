/**
 * PharmaVision AI — Medication Reconciliation & Dosage Titration Engine
 * Detects dosage changes, exact duplicates, and therapeutic brand switches.
 */

/**
 * Extract dosage numbers and units from drug name or active ingredients
 * e.g., "Rozucor-10 (Rosuvastatin 10mg)" -> { value: "10", unit: "mg", formatted: "10 mg" }
 */
export const extractDosageStrength = (text = '') => {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%|tablet|tab|cap)/i);
  if (match) {
    return {
      value: match[1],
      unit: match[2].toLowerCase(),
      formatted: `${match[1]} ${match[2]}`
    };
  }
  return null;
};

/**
 * Clean and normalize drug base name (strip numbers, dosage, forms)
 * e.g., "Rozucor-10 (Rosuvastatin Tablets 10 mg)" -> "rozucor"
 */
export const normalizeDrugBaseName = (name = '') => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parentheses
    .replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)/gi, '') // remove strengths
    .replace(/[-_]\d+/g, '') // remove hyphenated numbers e.g. -10, -20, -650
    .replace(/\b\d+\b/g, '') // remove isolated standalone numbers e.g. 650, 500
    .replace(/tablets?|capsules?|syrup|injection|drops?|cream|gel|suspension|oral/gi, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract an array of active chemical salt names
 */
export const extractActiveSalts = (med) => {
  if (!med) return [];
  let salts = [];
  if (Array.isArray(med.activeIngredients)) {
    salts = med.activeIngredients;
  } else if (typeof med.activeIngredients === 'string') {
    salts = med.activeIngredients.split(/[,+;/]/);
  }
  return salts
    .map(s => s.toLowerCase().replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)/gi, '').trim())
    .filter(Boolean);
};

/**
 * Main Conflict & Titration Detector
 */
export const detectMedicationConflict = (newMed, existingHistory = []) => {
  if (!newMed || !existingHistory || existingHistory.length === 0) {
    return null;
  }

  const newName = newMed.medicationName || '';
  const newBase = normalizeDrugBaseName(newName);
  const newStrength = extractDosageStrength(newName) || extractDosageStrength(JSON.stringify(newMed.activeIngredients || ''));
  const newSalts = extractActiveSalts(newMed);

  for (const existing of existingHistory) {
    const existingName = existing.medicationName || '';
    const existingBase = normalizeDrugBaseName(existingName);
    const existingStrength = extractDosageStrength(existingName) || extractDosageStrength(JSON.stringify(existing.activeIngredients || ''));
    const existingSalts = extractActiveSalts(existing);

    // 1. Check if base brand name matches (e.g. Rozucor vs Rozucor, Metformin vs Metformin)
    const baseNameMatch = newBase && existingBase && (
      newBase.includes(existingBase) || existingBase.includes(newBase)
    );

    // 2. Check if active chemical salts overlap (e.g. Paracetamol in Dolo and Crocin)
    const sharedSalts = newSalts.filter(salt =>
      existingSalts.some(eSalt => eSalt.includes(salt) || salt.includes(eSalt))
    );
    const saltOverlap = sharedSalts.length > 0;

    if (baseNameMatch || saltOverlap) {
      // Check Dosage Titration vs Refill vs Brand Switch
      const oldStrengthStr = existingStrength ? existingStrength.formatted : 'Current dose';
      const newStrengthStr = newStrength ? newStrength.formatted : 'New dose';

      // CASE A: Same Drug, Different Dosage (Titration)
      if (baseNameMatch && existingStrength && newStrength && (existingStrength.value !== newStrength.value || existingStrength.unit !== newStrength.unit)) {
        const isIncrease = parseFloat(newStrength.value) > parseFloat(existingStrength.value);
        return {
          type: 'DOSAGE_TITRATION',
          severity: 'HIGH',
          title: `Dosage ${isIncrease ? 'Increase' : 'Adjustment'} Detected`,
          title_hi: `खुराक में ${isIncrease ? 'वृद्धि' : 'बदलाव'} का पता चला`,
          title_te: `మోతాదు ${isIncrease ? 'పెరుగుదల' : 'మార్పు'} కనుగొనబడింది`,
          existingMed: existing,
          oldStrength: oldStrengthStr,
          newStrength: newStrengthStr,
          oldName: existingName,
          newName: newName,
          reason: `You already have "${existingName}" (${oldStrengthStr}) in your active cabinet. You are now scanning "${newName}" (${newStrengthStr}).`,
          reason_hi: `आपकी सक्रिय कैबिनेट में पहले से ही "${existingName}" (${oldStrengthStr}) मौजूद है। अब आप "${newName}" (${newStrengthStr}) स्कैन कर रहे हैं।`,
          reason_te: `మీ యాక్టివ్ క్యాబినెట్‌లో ఇప్పటికే "${existingName}" (${oldStrengthStr}) ఉంది. మీరు ఇప్పుడు "${newName}" (${newStrengthStr}) స్కాన్ చేస్తున్నారు.`
        };
      }

      // CASE B: Brand Switch / Therapeutic Duplicate (Different brand, same active chemical)
      if (!baseNameMatch && saltOverlap) {
        return {
          type: 'BRAND_SWITCH',
          severity: 'HIGH',
          title: 'Therapeutic Duplicate (Brand Switch)',
          title_hi: 'समान सक्रिय घटक (ब्रांड परिवर्तन)',
          title_te: 'ఒకే క్రియాశీల పదార్థం (బ్రాండ్ మార్పు)',
          existingMed: existing,
          oldStrength: oldStrengthStr,
          newStrength: newStrengthStr,
          oldName: existingName,
          newName: newName,
          sharedSalt: sharedSalts.join(', '),
          reason: `Both "${newName}" and your existing "${existingName}" contain the active chemical salt "${sharedSalts.join(', ')}". Do not take both simultaneously to prevent accidental overdose.`,
          reason_hi: `दोनों "${newName}" और आपकी मौजूदा "${existingName}" में सक्रिय रासायनिक घटक "${sharedSalts.join(', ')}" शामिल है। आकस्मिक ओवरडोज से बचने के लिए दोनों को एक साथ न लें।`,
          reason_te: `"${newName}" మరియు మీ ప్రస్తుత "${existingName}" రెండింటిలోనూ "${sharedSalts.join(', ')}" అనే క్రియాశీల రసాయనం ఉంది. ప్రమాదవశాత్తు ఓవర్‌డోస్ కాకుండా ఉండటానికి రెండింటినీ ఒకేసారి తీసుకోవద్దు.`
        };
      }

      // CASE C: Exact Duplicate / Refill
      if (baseNameMatch) {
        return {
          type: 'EXACT_REFILL',
          severity: 'INFO',
          title: 'Medication Refill Detected',
          title_hi: 'दवा रिफिल का पता चला',
          title_te: 'మందుల రీఫిల్ కనుగొనబడింది',
          existingMed: existing,
          oldStrength: oldStrengthStr,
          newStrength: newStrengthStr,
          oldName: existingName,
          newName: newName,
          reason: `"${newName}" is already registered in your cabinet. Would you like to update your cabinet with this new scan?`,
          reason_hi: `"${newName}" आपकी कैबिनेट में पहले से ही दर्ज है। क्या आप इस नए स्कैन से अपनी कैबिनेट को अपडेट करना चाहते हैं?`,
          reason_te: `"${newName}" ఇప్పటికే మీ క్యాబినెట్‌లో నమోదు చేయబడింది. మీరు ఈ కొత్త స్కాన్‌తో మీ క్యాబినెట్‌ను అప్‌డేట్ చేయాలనుకుంటున్నారా?`
        };
      }
    }
  }

  return null;
};
