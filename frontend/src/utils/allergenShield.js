/**
 * PharmaVision AI — Patient Allergen Shield & Contraindication Radar
 * Clinical cross-reactivity database & intelligent match engine.
 */

export const PRESET_ALLERGENS = [
  {
    id: 'penicillin',
    name: 'Penicillins & Beta-Lactams',
    name_hi: 'पेनिसिलिन और बीटा-लैक्टम',
    name_te: 'పెన్సిలిన్ మరియు బీటా-లాక్టమ్స్',
    triggers: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'amox', 'clav', 'piperacillin', 'cloxacillin', 'cephalexin', 'cefixime', 'ceftriaxone', 'cefuroxime', 'meropenem', 'amoxyclav']
  },
  {
    id: 'sulfa',
    name: 'Sulfa Drugs (Sulfonamides)',
    name_hi: 'सल्फा दवाएं (सल्फोनामाइड्स)',
    name_te: 'సల్ఫా మందులు (సల్ఫోనామైడ్స్)',
    triggers: ['sulfa', 'sulfamethoxazole', 'bactrim', 'septra', 'cotrimoxazole', 'sulfasalazine', 'dapsone', 'sulfadiazine', 'furosemide', 'hydrochlorothiazide']
  },
  {
    id: 'nsaids',
    name: 'NSAIDs & Aspirin',
    name_hi: 'एनएसएआईडी और एस्पिरिन',
    name_te: 'ఎన్‌ఎస్‌ఏఐడీలు మరియు ఆస్పిరిన్',
    triggers: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'mefenamic', 'indomethacin', 'celecoxib', 'etodolac', 'piroxicam', 'combiflam', 'brufen', 'voveran']
  },
  {
    id: 'opioids',
    name: 'Opioids (Codeine / Tramadol)',
    name_hi: 'ओपिओइड्स (कोडीन / ट्रामाडोल)',
    name_te: 'ఓపియాయిడ్స్ (కోడీన్ / ట్రమడాల్)',
    triggers: ['codeine', 'tramadol', 'morphine', 'oxycodone', 'hydrocodone', 'fentanyl', 'pethidine', 'buprenorphine']
  },
  {
    id: 'macrolides',
    name: 'Macrolide Antibiotics',
    name_hi: 'मैक्रोलाइड एंटीबायोटिक्स',
    name_te: 'మాక్రోలైడ్ యాంటీబయాటిక్స్',
    triggers: ['azithromycin', 'clarithromycin', 'erythromycin', 'roxithromycin', 'azithral', 'zithromax']
  },
  {
    id: 'quinolones',
    name: 'Fluoroquinolones',
    name_hi: 'फ्लोरोक्विनोलोन एंटीबायोटिक्स',
    name_te: 'ఫ్లోరోక్వినోలోన్ యాంటీబయాటిక్స్',
    triggers: ['ciprofloxacin', 'levofloxacin', 'ofloxacin', 'norfloxacin', 'moxifloxacin', 'cifran', 'ciplox']
  }
];

export const PRESET_CONDITIONS = [
  {
    id: 'pregnancy',
    name: 'Pregnant / Breastfeeding',
    name_hi: 'गर्भावस्था / स्तनपान',
    name_te: 'గర్భధారణ / పాలివ్వడం',
    triggers: ['warfarin', 'isotretinoin', 'lisinopril', 'losartan', 'methotrexate', 'atorvastatin', 'rosuvastatin', 'doxycycline', 'tetracycline', 'valproate', 'finasteride']
  },
  {
    id: 'asthma',
    name: 'Asthma / Bronchospasm',
    name_hi: 'अस्थमा / सांस की बीमारी',
    name_te: 'ఉబ్బసం / ఆస్తమా',
    triggers: ['aspirin', 'ibuprofen', 'diclofenac', 'propranolol', 'atenolol', 'timolol', 'carvedilol', 'metoprolol']
  },
  {
    id: 'kidney_disease',
    name: 'Chronic Kidney Disease (CKD)',
    name_hi: 'किडनी की बीमारी (CKD)',
    name_te: 'మూత్రపిండాల వ్యాధి (CKD)',
    triggers: ['ibuprofen', 'diclofenac', 'naproxen', 'gentamicin', 'amikacin', 'metformin', 'contrast', 'spironolactone']
  },
  {
    id: 'liver_disease',
    name: 'Liver Impairment / Cirrhosis',
    name_hi: 'लिवर की बीमारी / सिरोसिस',
    name_te: 'కాలేయ వ్యాధి / సిర్రోసిస్',
    triggers: ['paracetamol', 'acetaminophen', 'statin', 'methotrexate', 'isoniazid', 'ketoconazole', 'valproate']
  },
  {
    id: 'peptic_ulcer',
    name: 'Peptic Ulcer / Acid Reflux',
    name_hi: 'पेट का अल्सर / एसिडिटी',
    name_te: 'కడుపులో పుండు / అసిడిటీ',
    triggers: ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'steroid', 'prednisolone', 'dexamethasone']
  }
];

/**
 * Get user's configured allergies and conditions from storage
 */
export const getUserMedicalProfile = () => {
  try {
    const allergies = JSON.parse(localStorage.getItem('pharmavision_allergens') || '[]');
    const conditions = JSON.parse(localStorage.getItem('pharmavision_conditions') || '[]');
    return { allergies, conditions };
  } catch (e) {
    return { allergies: [], conditions: [] };
  }
};

/**
 * Check if a medication or prescription triggers any user allergen or condition warning
 */
export const checkAllergenConflicts = (medicineData) => {
  if (!medicineData) return [];

  const { allergies, conditions } = getUserMedicalProfile();
  if (allergies.length === 0 && conditions.length === 0) return [];

  const conflicts = [];

  // Compile searchable text from medicine fields
  const searchableText = [
    medicineData.medicationName || '',
    ...(Array.isArray(medicineData.activeIngredients) ? medicineData.activeIngredients : [medicineData.activeIngredients || '']),
    medicineData.drugClass || '',
    medicineData.primaryUse || '',
    ...(Array.isArray(medicineData.warnings) ? medicineData.warnings : [medicineData.warnings || '']),
    ...(Array.isArray(medicineData.contraindications) ? medicineData.contraindications : [medicineData.contraindications || '']),
    medicineData.patientProfile?.pregnancyLactation || '',
    medicineData.patientProfile?.elderlyPediatric || ''
  ].join(' ').toLowerCase();

  // 1. Check Allergen Triggers
  allergies.forEach(allergenId => {
    const allergenDef = PRESET_ALLERGENS.find(a => a.id === allergenId);
    if (!allergenDef) return;

    const matchedTrigger = allergenDef.triggers.find(trigger => searchableText.includes(trigger.toLowerCase()));
    if (matchedTrigger) {
      conflicts.push({
        type: 'ALLERGY',
        severity: 'CRITICAL',
        title: `🚨 Severe Allergy Warning: ${allergenDef.name}`,
        title_hi: `🚨 गंभीर एलर्जी चेतावनी: ${allergenDef.name_hi}`,
        title_te: `🚨 తీవ్రమైన అలెర్జీ హెచ్చరిక: ${allergenDef.name_te}`,
        matchedTrigger,
        message: `This medication contains or cross-reacts with "${matchedTrigger}", which violates your saved "${allergenDef.name}" allergy profile. DO NOT INGEST without consulting your doctor.`,
        message_hi: `इस दवा में "${matchedTrigger}" मौजूद है या यह उससे क्रिया कर सकती है, जो आपकी "${allergenDef.name_hi}" एलर्जी प्रोफ़ाइल से मेल खाता है। डॉक्टर से परामर्श के बिना इसका सेवन न करें।`,
        message_te: `ఈ మందులో "${matchedTrigger}" ఉంది, ఇది మీ "${allergenDef.name_te}" అలెర్జీ ప్రొఫైల్‌కు సరిపోలడం లేదు. వైద్యుడిని సంప్రదించకుండా తీసుకోకండి.`
      });
    }
  });

  // 2. Check Medical Condition Contraindications
  conditions.forEach(conditionId => {
    const conditionDef = PRESET_CONDITIONS.find(c => c.id === conditionId);
    if (!conditionDef) return;

    const matchedTrigger = conditionDef.triggers.find(trigger => searchableText.includes(trigger.toLowerCase()));
    if (matchedTrigger) {
      conflicts.push({
        type: 'CONDITION',
        severity: 'HIGH',
        title: `⚠️ Condition Contraindication: ${conditionDef.name}`,
        title_hi: `⚠️ स्वास्थ्य स्थिति चेतावनी: ${conditionDef.name_hi}`,
        title_te: `⚠️ ఆరోగ్య పరిస్థితి హెచ్చరిక: ${conditionDef.name_te}`,
        matchedTrigger,
        message: `Caution: "${matchedTrigger}" is clinically contraindicated for patients with ${conditionDef.name}. Please verify safe dosage with your physician.`,
        message_hi: `सावधानी: "${matchedTrigger}" का उपयोग ${conditionDef.name_hi} वाले रोगियों के लिए वर्जित हो सकता है। कृपया अपने चिकित्सक से उचित खुराक की पुष्टि करें।`,
        message_te: `హెచ్చరిక: "${matchedTrigger}" వాడకం ${conditionDef.name_te} ఉన్న రోగులకు హానికరం కావచ్చు. దయచేసి సరైన మోతాదును మీ వైద్యుడితో సరిచూసుకోండి.`
      });
    }
  });

  return conflicts;
};
