import axios from 'axios';

let getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.includes('jansahay-ct2k.onrender.com')) {
    return 'https://jansahay-api.onrender.com';
  }
  return envUrl;
};

const API_URL = getApiUrl();
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const isAuthEndpoint = originalRequest.url && (
      originalRequest.url.includes('/api/v1/auth/refresh') ||
      originalRequest.url.includes('/api/v1/auth/login') ||
      originalRequest.url.includes('/api/v1/auth/signup')
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = await refreshSession();
        if (session && session.access_token) {
          setAccessToken(session.access_token, session.user);
          processQueue(null, session.access_token);
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return api(originalRequest);
        } else {
          clearAccessToken();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        clearAccessToken();
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
