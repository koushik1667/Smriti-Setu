const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database] Supabase Client Initialized');
  } catch (err) {
    console.warn('[Database Warning] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Database Notice] Supabase URL/Key not configured. Using local database/in-memory store fallback.');
}

const getSupabaseClient = () => supabase;

module.exports = {
  supabase,
  getSupabaseClient
};
