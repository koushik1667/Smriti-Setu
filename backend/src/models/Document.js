const { getCollection } = require('../config/durableStorage');
const { getSupabaseClient } = require('../config/supabase');

const docCollection = getCollection('documents');

class Document {
  static async create({
    userId,
    documentType, // 'prescription', 'lab_report', 'dual_audit'
    title,
    summary,
    doctorInfo = {},
    patientInfo = {},
    medicines = [],
    biomarkers = [],
    criticalFindings = [],
    drugInteractions = [],
    generalPrecautions = [],
    rawAnalysis = {},
    thumbnail = ''
  }) {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    const record = {
      id,
      user_id: userId || 'anonymous',
      document_type: documentType,
      title: title || `${documentType === 'prescription' ? 'Doctor Prescription' : documentType === 'lab_report' ? 'Lab Diagnostic Report' : 'Medical Document'} - ${new Date().toLocaleDateString()}`,
      summary: summary || '',
      doctor_info: doctorInfo,
      patient_info: patientInfo,
      medicines,
      biomarkers,
      critical_findings: criticalFindings,
      drug_interactions: drugInteractions,
      general_precautions: generalPrecautions,
      raw_analysis: rawAnalysis,
      thumbnail: thumbnail || '',
      created_at: createdAt
    };

    // 1. Save to durable local storage immediately
    const saved = docCollection.insert(record);

    // 2. Sync to Supabase if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('scanned_documents').insert([record]);
      } catch (err) {
        console.warn('[Document Model] Supabase document sync notice:', err.message);
      }
    }

    return saved;
  }

  static async findByUserId(userId, limit = null, type = null) {
    const query = (doc) => {
      const userMatch = !userId || doc.user_id === userId || doc.user_id === 'anonymous';
      const typeMatch = !type || doc.document_type === type;
      return userMatch && typeMatch;
    };

    const results = docCollection.find(query, limit);

    // Sort by latest created_at
    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  static async findById(id) {
    return docCollection.findById(id);
  }

  static async delete(id, userId = null) {
    const doc = docCollection.findById(id);
    if (!doc) return false;

    if (userId && doc.user_id && doc.user_id !== userId && doc.user_id !== 'anonymous') {
      return false;
    }

    const success = docCollection.delete(id);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('scanned_documents').delete().eq('id', id);
      } catch (err) {}
    }

    return success;
  }
}

module.exports = Document;
