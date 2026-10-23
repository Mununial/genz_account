/**
 * Central REST API Client Wrapper
 * Gen-Z University Accounts & ERP System
 */

const REMOTE_BACKEND_URL = 'https://genz-account.onrender.com/api';

// Direct, fast API base resolution - avoids 404 console probes
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : REMOTE_BACKEND_URL;

window.API_BASE = API_BASE;

// Proactively warm up backend on page load so login is instant with zero cold-start delay
try {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    fetch(`${REMOTE_BACKEND_URL}/health`, { method: 'GET', mode: 'cors' }).catch(() => {});
  }
} catch (e) {}

const api = {
  getToken() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get('token');
      if (qToken) {
        localStorage.setItem('bec_auth_token', qToken);
        sessionStorage.setItem('bec_auth_token', qToken);
        return qToken;
      }
    } catch (e) {}
    return sessionStorage.getItem('bec_auth_token') || localStorage.getItem('bec_auth_token');
  },

  setToken(token, remember = false) {
    try {
      sessionStorage.setItem('bec_auth_token', token);
      localStorage.setItem('bec_auth_token', token);
      if (remember) {
        localStorage.setItem('bec_remember_me', '1');
      }
    } catch (e) {}
  },

  clearToken() {
    try {
      sessionStorage.removeItem('bec_auth_token');
      localStorage.removeItem('bec_auth_token');
      sessionStorage.removeItem('bec_user_cache');
      localStorage.removeItem('bec_user_cache');
    } catch (e) {}
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      // Handle 401 unauthorized: Only clear token & redirect if specifically from session verification (/auth/me)
      if (response.status === 401 && endpoint.includes('/auth/me')) {
        this.clearToken();
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login.html';
        }
      }

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        data = null;
      }

      // If server explicitly reports invalid or missing token on auth check, clear stale storage
      if (response.status === 403 && endpoint.includes('/auth/me') && data && (data.message === 'Invalid authentication token.' || data.message.includes('token'))) {
        this.clearToken();
      }

      if (!response.ok) {
        const errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      if (!data) {
        throw new Error('Received empty response from server. Please try again.');
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet or retry.');
      }
      throw err;
    }
  },

  get(endpoint, params = null) {
    let url = endpoint;
    if (params) {
      const cleanParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams.append(k, v);
        }
      });
      const qs = cleanParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

window.api = api;
