const test = require('node:test');
const assert = require('node:assert');

const PRESET_ALLERGENS = [
  {
    id: 'penicillin',
    name: 'Penicillins & Beta-Lactams',
    triggers: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'amox', 'clav', 'piperacillin', 'cloxacillin', 'cephalexin', 'cefixime', 'ceftriaxone', 'cefuroxime', 'meropenem', 'amoxyclav']
  },
  {
    id: 'sulfa',
    name: 'Sulfa Drugs (Sulfonamides)',
    triggers: ['sulfa', 'sulfamethoxazole', 'bactrim', 'septra', 'cotrimoxazole', 'sulfasalazine', 'dapsone', 'sulfadiazine', 'furosemide', 'hydrochlorothiazide']
  },
  {
    id: 'nsaids',
    name: 'NSAIDs & Aspirin',
    triggers: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'mefenamic', 'indomethacin', 'celecoxib', 'etodolac', 'piroxicam', 'combiflam', 'brufen', 'voveran']
  }
];

const PRESET_CONDITIONS = [
  {
    id: 'pregnancy',
    name: 'Pregnant / Breastfeeding',
    triggers: ['warfarin', 'isotretinoin', 'lisinopril', 'losartan', 'methotrexate', 'atorvastatin', 'rosuvastatin', 'doxycycline', 'tetracycline', 'valproate', 'finasteride']
  },
  {
    id: 'asthma',
    name: 'Asthma / Bronchospasm',
    triggers: ['aspirin', 'ibuprofen', 'diclofenac', 'propranolol', 'atenolol', 'timolol', 'carvedilol', 'metoprolol']
  }
];

function checkAllergenConflictsWithProfile(medicineData, userProfile = { allergies: [], conditions: [] }) {
  if (!medicineData) return [];
  const { allergies, conditions } = userProfile;
  if (allergies.length === 0 && conditions.length === 0) return [];

  const conflicts = [];
  const searchableText = [
    medicineData.medicationName || '',
    ...(Array.isArray(medicineData.activeIngredients) ? medicineData.activeIngredients : [medicineData.activeIngredients || '']),
    medicineData.drugClass || '',
    medicineData.primaryUse || '',
    ...(Array.isArray(medicineData.warnings) ? medicineData.warnings : [medicineData.warnings || '']),
    ...(Array.isArray(medicineData.contraindications) ? medicineData.contraindications : [medicineData.contraindications || ''])
  ].join(' ').toLowerCase();

  allergies.forEach(allergenId => {
    const allergenDef = PRESET_ALLERGENS.find(a => a.id === allergenId);
    if (!allergenDef) return;
    const matchedTrigger = allergenDef.triggers.find(trigger => searchableText.includes(trigger.toLowerCase()));
    if (matchedTrigger) {
      conflicts.push({
        type: 'ALLERGY',
        severity: 'CRITICAL',
        matchedTrigger,
        allergenName: allergenDef.name
      });
    }
  });

  conditions.forEach(conditionId => {
    const conditionDef = PRESET_CONDITIONS.find(c => c.id === conditionId);
    if (!conditionDef) return;
    const matchedTrigger = conditionDef.triggers.find(trigger => searchableText.includes(trigger.toLowerCase()));
    if (matchedTrigger) {
      conflicts.push({
        type: 'CONDITION',
        severity: 'HIGH',
        matchedTrigger,
        conditionName: conditionDef.name
      });
    }
  });

  return conflicts;
}

test('Allergen Shield - Detects Beta-Lactam / Penicillin Allergy on Augmentin', () => {
  const medicine = {
    medicationName: 'Augmentin 625 Duo',
    activeIngredients: ['Amoxicillin 500mg', 'Clavulanate Potassium 125mg']
  };

  const conflicts = checkAllergenConflictsWithProfile(medicine, {
    allergies: ['penicillin'],
    conditions: []
  });

  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].type, 'ALLERGY');
  assert.strictEqual(conflicts[0].severity, 'CRITICAL');
  assert.ok(conflicts[0].matchedTrigger.includes('amox') || conflicts[0].matchedTrigger.includes('augmentin'));
});

test('Allergen Shield - Detects NSAID Allergy on Combiflam', () => {
  const medicine = {
    medicationName: 'Combiflam Tablet',
    activeIngredients: ['Ibuprofen 400mg', 'Paracetamol 325mg']
  };

  const conflicts = checkAllergenConflictsWithProfile(medicine, {
    allergies: ['nsaids'],
    conditions: []
  });

  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].type, 'ALLERGY');
  assert.strictEqual(conflicts[0].matchedTrigger, 'ibuprofen');
});

test('Allergen Shield - Detects Pregnancy Contraindication with Statin (Rosuvastatin)', () => {
  const medicine = {
    medicationName: 'Rozucor 10mg',
    activeIngredients: ['Rosuvastatin 10mg']
  };

  const conflicts = checkAllergenConflictsWithProfile(medicine, {
    allergies: [],
    conditions: ['pregnancy']
  });

  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].type, 'CONDITION');
  assert.strictEqual(conflicts[0].severity, 'HIGH');
  assert.strictEqual(conflicts[0].matchedTrigger, 'rosuvastatin');
});

test('Allergen Shield - Clean Pass when No Allergies Match', () => {
  const medicine = {
    medicationName: 'Vitamin C 500mg (Limcee)',
    activeIngredients: ['Ascorbic Acid 500mg']
  };

  const conflicts = checkAllergenConflictsWithProfile(medicine, {
    allergies: ['penicillin', 'sulfa'],
    conditions: ['asthma']
  });

  assert.strictEqual(conflicts.length, 0);
});
