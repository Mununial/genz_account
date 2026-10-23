/**
 * Authentication & Session Management
 * Gen-Z University Accounts System
 */

const auth = {
  currentUser: null,
  _authPromise: null,

  async checkAuth() {
    // 1. If auth is already resolved in memory, return immediately
    if (this.currentUser) {
      this.renderUserBadge();
      return this.currentUser;
    }

    // 2. Try loading cached user session from storage for instant UI render
    try {
      const cached = sessionStorage.getItem('bec_user_cache') || localStorage.getItem('bec_user_cache');
      if (cached && !this.currentUser) {
        this.currentUser = JSON.parse(cached);
        this.renderUserBadge();
      }
    } catch (e) {}

    // 3. Deduplicate in-flight requests (navigation.init & page.init share single fetch)
    if (this._authPromise) {
      return this._authPromise;
    }

    this._authPromise = (async () => {
      const token = api.getToken();
      const isMasterRoute = window.location.pathname.includes('master');
      const fallbackLogin = isMasterRoute ? '/master-login.html' : '/login.html';

      if (!token) {
        if (!window.location.pathname.includes('login')) {
          window.location.href = fallbackLogin;
        }
        return null;
      }

      try {
        const res = await api.get('/auth/me');
        if (!res || !res.data) {
          throw new Error('Invalid auth session data');
        }
        this.currentUser = res.data;
        try {
          sessionStorage.setItem('bec_user_cache', JSON.stringify(res.data));
          localStorage.setItem('bec_user_cache', JSON.stringify(res.data));
        } catch (e) {}
        this.renderUserBadge();
        return this.currentUser;
      } catch (err) {
        console.warn('Session verification notice:', err);

        // ONLY clear token if the backend explicitly reports 401 Unauthorized
        if (err.status === 401) {
          api.clearToken();
          if (!window.location.pathname.includes('login')) {
            window.location.href = fallbackLogin;
          }
          return null;
        }

        // On network latency, 502/504 gateway timeouts, or offline, PRESERVE THE SESSION
        if (this.currentUser) {
          this.renderUserBadge();
          return this.currentUser;
        }

        return null;
      } finally {
        this._authPromise = null;
      }
    })();

    return this._authPromise;
  },

  async login(email, password, remember = false) {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res || !res.data) {
        throw new Error((res && res.message) || 'Invalid login response. Please check credentials.');
      }
      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error('Authentication succeeded but session token is missing.');
      }

      api.setToken(token, remember);
      this.currentUser = user;

      // Handle first login password change requirement
      if (user.mustChangePassword) {
        if (typeof ui !== 'undefined' && ui.showToast) {
          ui.showToast('First-time login: You must set a new secure password.', 'warning');
        }
        return { mustChangePassword: true, user };
      }

      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast('Login successful! Redirecting to your portal...', 'success');
      }

      // Direct, fast route to appropriate portal without extra redirects
      if (user.role === 'STUDENT') {
        window.location.href = '/student-portal.html';
      } else if (user.role === 'HOD') {
        window.location.href = '/hod-registrations.html';
      } else if (user.role === 'DIRECTOR') {
        window.location.href = '/director-registrations.html';
      } else if (user.role === 'EXAM_CELL' || user.role === 'EXAM_SECTION') {
        window.location.href = '/exam-registrations.html';
      } else {
        window.location.href = '/receipt-desk.html';
      }

      return { success: true, user };
    } catch (err) {
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast(err.message || 'Login failed. Check credentials.', 'error');
      }
      throw err;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast('Password updated successfully.', 'success');
      }
      return true;
    } catch (err) {
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast(err.message || 'Failed to update password.', 'error');
      }
      throw err;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors on logout
    }
    api.clearToken();
    this.currentUser = null;
    window.location.href = '/login.html';
  },

  renderUserBadge() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById('userDisplayName');
    const roleEl = document.getElementById('userDisplayRole');
    const avatarEl = document.getElementById('userAvatar');

    let displayName = this.currentUser.email;
    if (this.currentUser.student) {
      displayName = this.currentUser.student.full_name;
    } else if (this.currentUser.staff) {
      displayName = this.currentUser.staff.full_name;
    }

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = this.currentUser.role.replace(/_/g, ' ');
    if (avatarEl) {
      const initials = displayName
        .split(' ')
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      avatarEl.textContent = initials || 'GENZ';
    }
  }
};

window.auth = auth;
