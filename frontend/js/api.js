/**
 * Central REST API Client Wrapper
 * Gen-Z University Accounts & ERP System
 */

const REMOTE_BACKEND_URL = 'https://genz-account.onrender.com/api';

// Proactively warm up backend on page load so login is instant with zero cold-start delay
try {
  fetch(`${REMOTE_BACKEND_URL}/health`, { method: 'GET', mode: 'cors' }).catch(() => {});
} catch (e) {}

let cachedApiBase = null;

async function resolveApiBase() {
  if (cachedApiBase) return cachedApiBase;

  if (typeof window === 'undefined') {
    cachedApiBase = '/api';
    return cachedApiBase;
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    cachedApiBase = 'http://localhost:5000/api';
    return cachedApiBase;
  }

  // Check if Hostinger local /api has an active Node.js server responding with JSON
  try {
    const ctrl = new AbortController();
    const tId = setTimeout(() => ctrl.abort(), 1000);
    const probe = await fetch('/api/health', { signal: ctrl.signal });
    clearTimeout(tId);
    const cType = probe.headers.get('content-type') || '';
    if (probe.ok && cType.includes('application/json')) {
      cachedApiBase = '/api';
      return cachedApiBase;
    }
  } catch (err) {
    // Local /api not ready or timed out
  }

  // Default to live backend (connected directly to Hostinger MySQL)
  cachedApiBase = REMOTE_BACKEND_URL;
  return cachedApiBase;
}

// Start probing immediately in background
const baseReadyPromise = resolveApiBase();

const api = {
  getToken() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get('token');
      if (qToken) {
        localStorage.setItem('bec_auth_token', qToken);
        return qToken;
      }
    } catch (e) {}
    return sessionStorage.getItem('bec_auth_token') || localStorage.getItem('bec_auth_token');
  },

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('bec_auth_token', token);
    } else {
      sessionStorage.setItem('bec_auth_token', token);
    }
  },

  clearToken() {
    sessionStorage.removeItem('bec_auth_token');
    localStorage.removeItem('bec_auth_token');
  },

  async request(endpoint, options = {}) {
    const apiBase = await baseReadyPromise;
    const url = `${apiBase}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      let response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      // Handle 401 unauthorized
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        this.clearToken();
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login.html';
        }
      }

      // Check if response is valid JSON
      const cType = response.headers.get('content-type') || '';
      const isJson = cType.includes('application/json');

      if (!isJson && apiBase !== REMOTE_BACKEND_URL) {
        // If local /api returned HTML, immediately switch and retry via remote backend
        cachedApiBase = REMOTE_BACKEND_URL;
        const retryUrl = `${REMOTE_BACKEND_URL}${endpoint}`;
        response = await fetch(retryUrl, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined
        });
      }

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        data = null;
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
