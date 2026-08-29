import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const getStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

export const getSchemes = async (params = {}) => {
  const response = await api.get('/api/schemes', { params });
  return response.data;
};

export const getSchemeDetail = async (slug, lang) => {
  const response = await api.get(`/api/schemes/${slug}`, { params: { lang } });
  return response.data;
};

export const askAssistant = async (question, language, history = [], state = '') => {
  const response = await api.post('/api/chat', { question, language, history, state });
  return response.data;
};

export const submitFeedback = async (question, helpful) => {
  const response = await api.post('/api/feedback', { question, helpful });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/api/analytics');
  return response.data;
};

export const checkEligibility = async (profile) => {
  const response = await api.post('/api/eligibility', profile);
  return response.data;
};

export default api;
