const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('pharmavision_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getActiveLanguage() {
  return localStorage.getItem('pharmavision_lang') || 'en';
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

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
  register: (name, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  }),

  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  loginWithGoogle: (googleData) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData)
  }),

  getProfile: () => request('/auth/profile'),

  // Vision API with Multi-Language Support & OCR Text Extraction
  analyzeMedicine: (imageBase64, ocrText = '') => request('/analyze-medicine', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, ocrText, targetLanguage: getActiveLanguage() })
  }),

  chatWithAI: (message, medicineContext) => request('/vision/chat', {
    method: 'POST',
    body: JSON.stringify({ message, medicineContext, targetLanguage: getActiveLanguage() })
  }),

  // History API
  getHistory: () => request('/history'),
  deleteHistoryItem: (id) => request(`/history/${id}`, { method: 'DELETE' })
};
