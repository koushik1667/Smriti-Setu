export const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL || '/api';
  const clean = raw.trim().replace(/\/+$/, '');
  if (clean.startsWith('http') && !clean.endsWith('/api')) {
    return `${clean}/api`;
  }
  return clean;
};

const API_BASE_URL = getApiBaseUrl();

function getAuthHeader() {
  const token = localStorage.getItem('pharmavision_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getActiveLanguage() {
  return localStorage.getItem('pharmavision_lang') || 'en';
}

// ─── High-Performance Client-Side SWR & Memory Cache ────────────────────────
let memoryHistoryCache = null;
let lastHistoryFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh cache

export const invalidateHistoryCache = () => {
  memoryHistoryCache = null;
  lastHistoryFetchTime = 0;
  try {
    sessionStorage.removeItem('pv_history_cache');
  } catch (e) {}
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 45000);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
  } catch (netErr) {
    clearTimeout(timeoutId);
    if (netErr.name === 'AbortError') {
      throw new Error('Connection timed out. The server may be waking up (Render cold start) — please try again in a few seconds.');
    }
    throw netErr;
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text && text.startsWith('<') ? `Server response error (${response.status})` : (text || `Server error (${response.status})`) };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth API
  register: (name, email, password) => {
    invalidateHistoryCache();
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  login: (email, password) => {
    invalidateHistoryCache();
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  loginWithGoogle: (googleData) => {
    invalidateHistoryCache();
    return request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData)
    });
  },

  getProfile: () => request('/auth/profile'),

  // Vision API with Multi-Language Support & OCR Text Extraction
  analyzeMedicine: async (imageBase64, ocrText = '') => {
    const res = await request('/analyze-medicine', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, ocrText, targetLanguage: getActiveLanguage() })
    });
    invalidateHistoryCache();
    return res;
  },

  // Lab Report Analysis API
  analyzeReport: (fileBase64, mimeType = 'image/jpeg') => request('/analyze-report', {
    method: 'POST',
    body: JSON.stringify({ fileBase64, mimeType, targetLanguage: getActiveLanguage() })
  }),

  // Doctor Prescription Analysis API
  analyzePrescription: (fileBase64, mimeType = 'image/jpeg') => request('/analyze-prescription', {
    method: 'POST',
    body: JSON.stringify({ fileBase64, mimeType, targetLanguage: getActiveLanguage() })
  }),

  // Dual Consultation Audit API (Lab Report + Doctor Prescription)
  analyzeDualAudit: (labFileBase64, labMimeType = 'image/jpeg', rxFileBase64, rxMimeType = 'image/jpeg') => request('/analyze-dual-audit', {
    method: 'POST',
    body: JSON.stringify({ labFileBase64, labMimeType, rxFileBase64, rxMimeType, targetLanguage: getActiveLanguage() })
  }),

  // Batch Save Prescription Medicines to Cabinet
  saveBatchToCabinet: async (medicines, imageThumbnail = '') => {
    const res = await request('/history/batch', {
      method: 'POST',
      body: JSON.stringify({ medicines, imageThumbnail })
    });
    invalidateHistoryCache();
    return res;
  },

  chatWithAI: (message, medicineContext) => request('/vision/chat', {
    method: 'POST',
    body: JSON.stringify({ message, medicineContext, targetLanguage: getActiveLanguage() })
  }),

  // Instant SWR Cached History API (0ms Instant Load)
  getHistory: async (forceRefresh = false) => {
    const now = Date.now();

    // 1. Return Memory Cache immediately if fresh
    if (!forceRefresh && memoryHistoryCache && (now - lastHistoryFetchTime < CACHE_TTL_MS)) {
      return memoryHistoryCache;
    }

    // 2. Check Session Storage Cache
    if (!forceRefresh && !memoryHistoryCache) {
      try {
        const stored = sessionStorage.getItem('pv_history_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.history)) {
            memoryHistoryCache = parsed;
            lastHistoryFetchTime = now;
            // Return cached version immediately and revalidate in background
            request('/history')
              .then(freshData => {
                memoryHistoryCache = freshData;
                lastHistoryFetchTime = Date.now();
                sessionStorage.setItem('pv_history_cache', JSON.stringify(freshData));
              })
              .catch(() => {});
            return parsed;
          }
        }
      } catch (e) {}
    }

    // 3. Perform network fetch and update cache
    const freshData = await request('/history');
    memoryHistoryCache = freshData;
    lastHistoryFetchTime = Date.now();
    try {
      sessionStorage.setItem('pv_history_cache', JSON.stringify(freshData));
    } catch (e) {}
    return freshData;
  },

  deleteHistoryItem: async (id) => {
    const res = await request(`/history/${id}`, { method: 'DELETE' });
    invalidateHistoryCache();
    return res;
  },

  // Health Check & Wake-Up Ping for Render Free Tier
  checkHealth: () => request('/health'),
  warmUpBackend: async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  invalidateHistoryCache
};
