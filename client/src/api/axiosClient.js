import axios from 'axios';

const TOKEN_KEY = 'unijob.accessToken';

function readStoredToken() {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

let accessToken = readStoredToken();
const unauthorizedListeners = new Set();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = typeof token === 'string' && token ? token : null;

  try {
    if (typeof window === 'undefined') return;
    if (accessToken) {
      window.sessionStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // phiên vẫn dùng được trong bộ nhớ.
  }
}

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);

  return () => {
    unauthorizedListeners.delete(listener);
  };
}

api.interceptors.request.use((config) => {
  if (accessToken && !config.publicRequest) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
    config.sentAccessToken = accessToken;
  }

  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401
    && accessToken
    && error.config?.sentAccessToken === accessToken
  ) {
    setAccessToken(null);
    unauthorizedListeners.forEach((listener) => listener());
  }

  return Promise.reject(error);
});

export default api;
