/**
 * Automated Clinical Disease Classification Engine with Native Multilingual Support (EN / HI / TE)
 * Classifies ANY historical or newly scanned medication into a standardized Disease Category.
 */

export const DISEASE_CATEGORIES = {
  diabetes: {
    id: 'diabetes',
    name: {
      en: 'Type 2 Diabetes & Blood Sugar',
      hi: 'टाइप 2 मधुमेह और रक्त शर्करा',
      te: 'టైప్ 2 మధుమేహం & రక్తంలో చక్కెర'
    },
    shortName: {
      en: 'Diabetes',
      hi: 'मधुमेह (शुगर)',
      te: 'డయాబెటిస్'
    },
    icon: '🩸',
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    description: {
      en: 'Glycemic regulation, insulin sensitizers & diabetes management',
      hi: 'रक्त शर्करा नियंत्रण, इंसुलिन संवेदनशीलता और मधुमेह प्रबंधन',
      te: 'రక్తంలో చక్కెర నియంత్రణ మరియు మధుమేహ నిర్వహణ'
    },
    keywords: [
      'diabetes', 'glucose', 'sugar', 'metformin', 'glycomet', 'glimepiride', 'gliclazide',
      'insulin', 'hba1c', 'dapagliflozin', 'empagliflozin', 'vildagliptin', 'sitagliptin',
      'januvia', 'teneligliptin', 'pioglitazone', 'forxiga', 'jardiance', 'galvus'
    ]
  },
  cholesterol: {
    id: 'cholesterol',
    name: {
      en: 'High Cholesterol & Lipids',
      hi: 'उच्च कोलेस्ट्रॉल और लिपिड',
      te: 'అధిక కొలెస్ట్రాల్ & లిపిడ్లు'
    },
    shortName: {
      en: 'Cholesterol',
      hi: 'कोलेस्ट्रॉल',
      te: 'కొలెస్ట్రాల్'
    },
    icon: '🫀',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
    description: {
      en: 'Lipid reduction, statins & cardiovascular protection',
      hi: 'लिपिड कमी, स्टेटिन और हृदय सुरक्षा',
      te: 'లిపిడ్ తగ్గింపు, స్టాటిన్స్ & గుండె రక్షణ'
    },
    keywords: [
      'cholesterol', 'lipid', 'statin', 'rozucor', 'rosuvastatin', 'atorvastatin', 'atorva',
      'lipitor', 'triglyceride', 'fenofibrate', 'ezetimibe', 'crestor', 'lipaglyn', 'statin'
    ]
  },
  hypertension: {
    id: 'hypertension',
    name: {
      en: 'Hypertension & Blood Pressure',
      hi: 'उच्च रक्तचाप (बीपी) और हृदय देखभाल',
      te: 'అధిక రక్తపోటు (BP) & గుండె సంరక్షణ'
    },
    shortName: {
      en: 'Blood Pressure',
      hi: 'ब्लड प्रेशर (BP)',
      te: 'బ్లడ్ ప్రెజర్'
    },
    icon: '❤️',
    color: '#e11d48',
    bgColor: '#ffe4e6',
    borderColor: '#fecdd3',
    description: {
      en: 'Blood pressure control, cardiac load reduction & vascular care',
      hi: 'रक्तचाप नियंत्रण और कार्डियक लोड में कमी',
      te: 'రక్తపోటు నియంత్రణ మరియు గుండె సంరక్షణ'
    },
    keywords: [
      'hypertension', 'blood pressure', 'bp', 'telmisartan', 'telma', 'amlodipine', 'amlong',
      'losartan', 'olmesartan', 'ramipril', 'enalapril', 'atenolol', 'metoprolol', 'beta-blocker',
      'cardiac', 'angiotensin', 'concor', 'cilacar', 'nebivolol'
    ]
  },
  gerd: {
    id: 'gerd',
    name: {
      en: 'Acid Reflux, GERD & Acidity',
      hi: 'एसिडिटी, जीईआरडी और गैस राहत',
      te: 'ఎసిడిటీ, గ్యాస్ & గుండెల్లో మంట'
    },
    shortName: {
      en: 'Acidity & GERD',
      hi: 'एसिडिटी व गैस',
      te: 'ఎసిడిటీ'
    },
    icon: '🥣',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
    description: {
      en: 'Gastric acid suppression, heartburn relief & ulcer healing',
      hi: 'गैस्ट्रिक एसिड में कमी, सीने में जलन से राहत और अल्सर उपचार',
      te: 'గ్యాస్ట్రిక్ యాసిడ్ తగ్గింపు & కడుపులో మంట నివారణ'
    },
    keywords: [
      'acid reflux', 'acidity', 'hyperacidity', 'gerd', 'reflux', 'gastritis', 'heartburn',
      'pantoprazole', 'pan-d', 'pantocid', 'omeprazole', 'rabeprazole', 'esomeprazole',
      'antacid', 'ulcer', 'gelusil', 'digene', 'ranitidine', 'famotidine', 'sucralfate',
      'omez', 'rabicip', 'nexpro'
    ]
  },
  pain_fever: {
    id: 'pain_fever',
    name: {
      en: 'Fever, Headaches & Pain Relief',
      hi: 'बुखार, सिरदर्द और दर्द निवारक',
      te: 'జ్వరం, తలనొప్పి & నొప్పి నివారణ'
    },
    shortName: {
      en: 'Pain & Fever',
      hi: 'दर्द व बुखार',
      te: 'నొప్పి & జ్వరం'
    },
    icon: '⚡',
    color: '#b45309',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: {
      en: 'Analgesic, anti-inflammatory & antipyretic fever relief',
      hi: 'दर्द निवारक, सूजन रोधी और बुखार नियंत्रण',
      te: 'నొప్పి నివారిణి మరియు జ్వరం నియంత్రణ'
    },
    keywords: [
      'fever', 'pain', 'headache', 'dolo', 'paracetamol', 'crocin', 'calpol', 'ibuprofen',
      'combiflam', 'diclofenac', 'voveran', 'aceclofenac', 'zerodol', 'analgesic', 'antipyretic',
      'nsaid', 'body ache', 'muscle pain', 'naproxen', 'tramadol'
    ]
  },
  infection: {
    id: 'infection',
    name: {
      en: 'Bacterial & Fungal Infections',
      hi: 'बैक्टीरियल और फंगल संक्रमण',
      te: 'బ్యాక్టీరియా & ఫంగల్ ఇన్ఫెక్షన్లు'
    },
    shortName: {
      en: 'Antibiotics',
      hi: 'एंटीबायोटिक्स',
      te: 'యాంటీబయాటిక్స్'
    },
    icon: '🦠',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
    description: {
      en: 'Antibiotic, antimicrobial & antifungal therapy',
      hi: 'एंटीबायोटिक, रोगाणुरोधी और एंटीफंगल थेरेपी',
      te: 'యాంటీబయాటిక్ మరియు యాంటీ ఫంగల్ చికిత్స'
    },
    keywords: [
      'infection', 'antibiotic', 'bacterial', 'fungal', 'amoxicillin', 'augmentin', 'azithromycin',
      'aziwok', 'cefixime', 'taxim', 'ciprofloxacin', 'ofloxacin', 'fluconazole', 'itracanazole',
      'doxycycline', 'metronidazole', 'flagyl', 'moxikind', 'zifi', 'cefpodoxime'
    ]
  },
  vitamins: {
    id: 'vitamins',
    name: {
      en: 'Vitamins, Bone & Supplements',
      hi: 'विटामिन, हड्डी और पोषण पूरक',
      te: 'విటమిన్లు, ఎముకలు & సప్లిమెంట్లు'
    },
    shortName: {
      en: 'Supplements',
      hi: 'विटामिन व सप्लीमेंट्स',
      te: 'సప్లిమెంట్లు'
    },
    icon: '🌿',
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: '#bbf7d0',
    description: {
      en: 'Micronutrients, bone mineralization & wellness supplements',
      hi: 'सूक्ष्म पोषक तत्व, हड्डी खनिज और स्वास्थ्य पूरक',
      te: 'సూక్ష్మ పోషకాలు, ఎముకల బలం & సప్లిమెంట్లు'
    },
    keywords: [
      'vitamin', 'calcium', 'd3', 'cholecalciferol', 'supplement', 'mineral', 'iron', 'ferritin',
      'b-complex', 'b12', 'folic acid', 'zinc', 'shelcal', 'becosules', 'neurobion', 'multivitamin',
      'protein', 'omega', 'calcirol', 'supradyn', 'gemcal'
    ]
  },
  respiratory: {
    id: 'respiratory',
    name: {
      en: 'Allergies, Cold & Respiratory',
      hi: 'एलर्जी, सर्दी, खांसी और श्वसन',
      te: 'అలెర్జీలు, జలుబు & శ్వాసకోశ'
    },
    shortName: {
      en: 'Allergies & Cold',
      hi: 'एलर्जी व जुकाम',
      te: 'అలెర్జీలు & జలుబు'
    },
    icon: '🌬️',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#ddd6fe',
    description: {
      en: 'Antihistamines, decongestants, cough, cold & asthma',
      hi: 'एंटीहिस्टामाइन, खांसी, जुकाम और अस्थमा से राहत',
      te: 'దగ్గు, జలుబు మరియు ఉబ్బసం నివారణ'
    },
    keywords: [
      'allergy', 'allergic', 'cold', 'cough', 'cetirizine', 'levocetirizine', 'montelukast',
      'montair', 'inhaler', 'budecort', 'foracort', 'asthma', 'respiratory', 'sinus', 'rhinitis',
      'alex', 'benadryl', 'ascoril', 'allegra', 'fexofenadine', 'cheston'
    ]
  },
  general: {
    id: 'general',
    name: {
      en: 'General & Specialized Care',
      hi: 'सामान्य और विशेष देखभाल',
      te: 'సాధారణ & ప్రత్యేక సంరక్షణ'
    },
    shortName: {
      en: 'General',
      hi: 'सामान्य',
      te: 'సాధారణం'
    },
    icon: '🩹',
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    borderColor: '#c7d2fe',
    description: {
      en: 'General therapeutic health support & other conditions',
      hi: 'सामान्य चिकित्सीय स्वास्थ्य सहायता',
      te: 'సాధారణ ఆరోగ్య సంరక్షణ'
    },
    keywords: []
  }
};

/**
 * Returns localized category metadata based on active language
 */
export function getLocalizedCategory(category, lang = 'en') {
  if (!category) return null;
  return {
    ...category,
    name: typeof category.name === 'object' ? (category.name[lang] || category.name.en) : category.name,
    shortName: typeof category.shortName === 'object' ? (category.shortName[lang] || category.shortName.en) : category.shortName,
    description: typeof category.description === 'object' ? (category.description[lang] || category.description.en) : category.description
  };
}

/**
 * Classifies a medication item into a Disease Category
 */
export function classifyMedication(med) {
  if (!med) return DISEASE_CATEGORIES.general;

  const textToSearch = [
    med.medicationName || '',
    med.primaryUse || '',
    med.drugClass || '',
    (med.activeIngredients || []).join(' '),
    (med.warnings || []).join(' '),
    med.rawAnalysis || ''
  ].join(' ').toLowerCase();

  const categoryKeys = [
    'diabetes',
    'cholesterol',
    'hypertension',
    'gerd',
    'pain_fever',
    'infection',
    'vitamins',
    'respiratory'
  ];

  for (const key of categoryKeys) {
    const cat = DISEASE_CATEGORIES[key];
    const isMatch = cat.keywords.some(kw => textToSearch.includes(kw));
    if (isMatch) {
      return cat;
    }
  }

  return DISEASE_CATEGORIES.general;
}

/**
 * Groups an array of medications by Disease Category with localized strings
 */
export function groupMedicationsByDisease(medications = [], lang = 'en') {
  const groups = {};
  const validList = Array.isArray(medications) ? medications.filter(Boolean) : [];

  Object.keys(DISEASE_CATEGORIES).forEach(key => {
    groups[key] = {
      category: getLocalizedCategory(DISEASE_CATEGORIES[key], lang),
      items: []
    };
  });

  validList.forEach(med => {
    try {
      const cat = classifyMedication(med);
      const targetId = (cat && cat.id && groups[cat.id]) ? cat.id : 'general';
      if (groups[targetId]) {
        groups[targetId].items.push(med);
      }
    } catch (e) {
      if (groups.general) {
        groups.general.items.push(med);
      }
    }
  });

  const populatedGroups = Object.values(groups).filter(g => g.items.length > 0);

  return {
    allGroups: groups,
    populatedGroups,
    totalMedications: validList.length
  };
}
