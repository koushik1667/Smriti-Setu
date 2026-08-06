const { getSupabaseClient } = require('../config/supabase');

const localHistory = [
  {
    id: 'scan_seed_1',
    user_id: 'user_1785937910_demo',
    medication_name: 'ROZUCOR 10 (Rosuvastatin Calcium 10mg)',
    primary_use: 'Lowering high LDL cholesterol and triglycerides, preventing heart attacks and strokes.',
    dosage_instructions: 'Take 1 tablet (10mg) orally once daily.',
    warnings: ['Report unexplained muscle pain immediately', 'Avoid heavy alcohol consumption'],
    active_ingredients: ['Rosuvastatin Calcium 10mg'],
    image_thumbnail: '',
    raw_analysis: '',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'scan_seed_2',
    user_id: 'user_1785937910_demo',
    medication_name: 'Metformin 500mg Tablets',
    primary_use: 'Lowering blood glucose levels in Type 2 Diabetes Mellitus.',
    dosage_instructions: 'Take 1 tablet (500mg) twice daily with meals.',
    warnings: ['Take with food to minimize GI upset', 'Report severe fatigue or muscle pain'],
    active_ingredients: ['Metformin Hydrochloride 500mg'],
    image_thumbnail: '',
    raw_analysis: '',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

class ScanHistory {
  static async create({ userId, medicationName, primaryUse, dosageInstructions, warnings, activeIngredients, imageThumbnail, rawAnalysis }) {
    const id = 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    const record = {
      id,
      user_id: userId,
      medication_name: medicationName,
      primary_use: primaryUse,
      dosage_instructions: dosageInstructions,
      warnings,
      active_ingredients: activeIngredients,
      image_thumbnail: imageThumbnail || '',
      raw_analysis: rawAnalysis || '',
      created_at: createdAt
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('scan_history')
        .insert([record])
        .select()
        .single();
      
      if (!error && data) {
        return ScanHistory.mapRecord(data);
      }
    }

    // Local fallback
    localHistory.unshift(record);
    return ScanHistory.mapRecord(record);
  }

  static async findByUserId(userId, limit = 20) {
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map(ScanHistory.mapRecord);
      }
    }

    // Local fallback filter
    return localHistory
      .filter(item => item.user_id === userId || item.user_id === 'user_1785937910_demo' || !userId)
      .slice(0, limit)
      .map(ScanHistory.mapRecord);
  }

  static async deleteById(id, userId) {
    const supabase = getSupabaseClient();

    if (supabase) {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    }

    const index = localHistory.findIndex(item => item.id === id && item.user_id === userId);
    if (index !== -1) {
      localHistory.splice(index, 1);
      return true;
    }
    return false;
  }

  static mapRecord(rec) {
    return {
      id: rec.id,
      userId: rec.user_id,
      medicationName: rec.medication_name,
      primaryUse: rec.primary_use,
      dosageInstructions: rec.dosage_instructions,
      warnings: rec.warnings,
      activeIngredients: rec.active_ingredients,
      imageThumbnail: rec.image_thumbnail,
      rawAnalysis: rec.raw_analysis,
      createdAt: rec.created_at
    };
  }
}

module.exports = ScanHistory;
