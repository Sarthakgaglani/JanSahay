import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
let accessToken = localStorage.getItem('jansahay_access_token') || null;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const setAccessToken = (token, user = null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('jansahay_access_token', token);
    if (user) localStorage.setItem('jansahay_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('jansahay_access_token');
    localStorage.removeItem('jansahay_user');
  }
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('jansahay_access_token');
  localStorage.removeItem('jansahay_user');
};

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

export const signup = async (payload) => (await api.post('/api/v1/auth/signup', payload)).data.data;
export const login = async (payload) => (await api.post('/api/v1/auth/login', payload)).data.data;
export const refreshSession = async () => (await api.post('/api/v1/auth/refresh')).data.data;
export const logout = async () => (await api.post('/api/v1/auth/logout')).data.data;

export const getApplications = async () => (await api.get('/api/v1/applications')).data.data.applications;
export const getApplication = async (applicationId) => (await api.get(`/api/v1/applications/${encodeURIComponent(applicationId)}`)).data.data.application;
export const createApplication = async (payload) => (await api.post('/api/v1/applications', payload)).data.data.application;

export default api;
