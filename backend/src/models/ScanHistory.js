const { getSupabaseClient } = require('../config/supabase');

const localHistory = [];
// In-memory cache per user for lightning-fast repeat queries
const userCache = new Map();

function invalidateUserCache(userId) {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}

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

    invalidateUserCache(userId);

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

  static async createBatch(records = []) {
    if (!records || records.length === 0) return [];

    const now = Date.now();
    const formattedRecords = records.map((rec, idx) => ({
      id: 'scan_' + (now + idx) + '_' + Math.random().toString(36).substring(2, 9),
      user_id: rec.userId,
      medication_name: rec.medicationName,
      primary_use: rec.primaryUse,
      dosage_instructions: rec.dosageInstructions,
      warnings: rec.warnings || [],
      active_ingredients: rec.activeIngredients || [],
      image_thumbnail: rec.imageThumbnail || '',
      raw_analysis: rec.rawAnalysis || '',
      created_at: new Date(now + idx * 1000).toISOString()
    }));

    if (records[0]?.userId) {
      invalidateUserCache(records[0].userId);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('scan_history')
        .insert(formattedRecords)
        .select();

      if (!error && data) {
        return data.map(ScanHistory.mapRecord);
      }
    }

    // Local fallback
    formattedRecords.forEach(rec => localHistory.unshift(rec));
    return formattedRecords.map(ScanHistory.mapRecord);
  }

  static async findByUserId(userId, limit = null) {
    const cacheKey = `${userId}_${limit || 'all'}`;
    const cached = userCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < 30000)) {
      return cached.data;
    }

    const supabase = getSupabaseClient();
    let results = [];

    if (supabase) {
      let query = supabase
        .from('scan_history')
        .select('id, user_id, medication_name, primary_use, dosage_instructions, warnings, active_ingredients, image_thumbnail, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit && Number.isInteger(limit)) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (!error && data) {
        results = data.map(ScanHistory.mapRecord);
        userCache.set(cacheKey, { data: results, timestamp: now });
        return results;
      }
    }

    // Local fallback filter
    const items = localHistory.filter(item => item.user_id === userId);
    results = (limit && Number.isInteger(limit) ? items.slice(0, limit) : items)
      .map(ScanHistory.mapRecord);
    
    userCache.set(cacheKey, { data: results, timestamp: now });
    return results;
  }

  static async deleteById(id, userId) {
    invalidateUserCache(userId);
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
