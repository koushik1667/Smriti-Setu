const test = require('node:test');
const assert = require('node:assert');

// Ported core reconciliation algorithms for node test suite verification
const extractDosageStrength = (text = '') => {
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

const normalizeDrugBaseName = (name = '') => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)/gi, '')
    .replace(/[-_]\d+/g, '')
    .replace(/\b\d+\b/g, '')
    .replace(/tablets?|capsules?|syrup|injection|drops?|cream|gel|suspension|oral/gi, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractActiveSalts = (med) => {
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

const detectMedicationConflict = (newMed, existingHistory = []) => {
  if (!newMed || !existingHistory || existingHistory.length === 0) return null;

  const newName = newMed.medicationName || '';
  const newBase = normalizeDrugBaseName(newName);
  const newStrength = extractDosageStrength(newName) || extractDosageStrength(JSON.stringify(newMed.activeIngredients || ''));
  const newSalts = extractActiveSalts(newMed);

  for (const existing of existingHistory) {
    const existingName = existing.medicationName || '';
    const existingBase = normalizeDrugBaseName(existingName);
    const existingStrength = extractDosageStrength(existingName) || extractDosageStrength(JSON.stringify(existing.activeIngredients || ''));
    const existingSalts = extractActiveSalts(existing);

    const baseNameMatch = newBase && existingBase && (
      newBase.includes(existingBase) || existingBase.includes(newBase)
    );

    const sharedSalts = newSalts.filter(salt =>
      existingSalts.some(eSalt => eSalt.includes(salt) || salt.includes(eSalt))
    );
    const saltOverlap = sharedSalts.length > 0;

    if (baseNameMatch || saltOverlap) {
      if (baseNameMatch && existingStrength && newStrength && (existingStrength.value !== newStrength.value || existingStrength.unit !== newStrength.unit)) {
        return {
          type: 'DOSAGE_TITRATION',
          severity: 'HIGH',
          oldStrength: existingStrength.formatted,
          newStrength: newStrength.formatted
        };
      }

      if (!baseNameMatch && saltOverlap) {
        return {
          type: 'BRAND_SWITCH',
          severity: 'HIGH',
          sharedSalt: sharedSalts.join(', ')
        };
      }

      if (baseNameMatch) {
        return {
          type: 'EXACT_REFILL',
          severity: 'INFO'
        };
      }
    }
  }
  return null;
};

test('Reconciliation Engine - Dosage Strength Extraction', () => {
  const result1 = extractDosageStrength('Rozucor 10mg');
  assert.deepStrictEqual(result1, { value: '10', unit: 'mg', formatted: '10 mg' });

  const result2 = extractDosageStrength('Amoxicillin 500 mg Capsules');
  assert.deepStrictEqual(result2, { value: '500', unit: 'mg', formatted: '500 mg' });

  const result3 = extractDosageStrength('No strength here');
  assert.strictEqual(result3, null);
});

test('Reconciliation Engine - Drug Base Name Normalization', () => {
  assert.strictEqual(normalizeDrugBaseName('Rozucor-10 (Rosuvastatin Tablets 10 mg)'), 'rozucor');
  assert.strictEqual(normalizeDrugBaseName('Augmentin 625 Duo Tablets'), 'augmentin duo');
});

test('Reconciliation Engine - Detects Dosage Titration (10mg -> 20mg)', () => {
  const existingHistory = [
    { medicationName: 'Rozucor 10mg', activeIngredients: ['Rosuvastatin 10mg'] }
  ];
  const newScan = { medicationName: 'Rozucor 20mg', activeIngredients: ['Rosuvastatin 20mg'] };

  const conflict = detectMedicationConflict(newScan, existingHistory);
  assert.ok(conflict);
  assert.strictEqual(conflict.type, 'DOSAGE_TITRATION');
  assert.strictEqual(conflict.oldStrength, '10 mg');
  assert.strictEqual(conflict.newStrength, '20 mg');
});

test('Reconciliation Engine - Detects Brand Switch / Duplicate Active Salt (Dolo vs Crocin)', () => {
  const existingHistory = [
    { medicationName: 'Dolo 650', activeIngredients: ['Paracetamol 650mg'] }
  ];
  const newScan = { medicationName: 'Crocin Advance', activeIngredients: ['Paracetamol 500mg'] };

  const conflict = detectMedicationConflict(newScan, existingHistory);
  assert.ok(conflict);
  assert.strictEqual(conflict.type, 'BRAND_SWITCH');
  assert.ok(conflict.sharedSalt.includes('paracetamol'));
});

test('Reconciliation Engine - Detects Exact Refill', () => {
  const existingHistory = [
    { medicationName: 'Augmentin 625mg', activeIngredients: ['Amoxicillin and Clavulanate'] }
  ];
  const newScan = { medicationName: 'Augmentin 625mg', activeIngredients: ['Amoxicillin and Clavulanate'] };

  const conflict = detectMedicationConflict(newScan, existingHistory);
  assert.ok(conflict);
  assert.strictEqual(conflict.type, 'EXACT_REFILL');
});
