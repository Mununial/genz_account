/**
 * Bhubaneswar Engineering College (BEC) - Finance System
 * Master Unified Navigation, AppShell & Universal Search Controller
 * Implements Requirement 25 practical sidebar order and Requirement 16 Universal Search
 */

const navigation = {
  activePage: '',
  currentUser: null,

  init(activePageId) {
    this.activePage = activePageId;
    this.startLiveClock();
    this.setupMobileMenu();
    this.setupKeyboardShortcuts();
    this.setupInactivityTimeout();
    this.renderPageBreadcrumbs();
    this.checkAuthAndUser();
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F2: Focus local counter search or open student search omnibar
      if (e.key === 'F2') {
        e.preventDefault();
        const localInput = document.getElementById('fastSearchInput') || 
                           document.getElementById('sfdSearchInput') ||
                           document.getElementById('sfdStudentName') ||
                           document.getElementById('studentPickerSearchInput');
        if (localInput) {
          localInput.focus();
          if (localInput.select) localInput.select();
        } else {
          navigation.openUniversalSearch('STUDENT');
        }
        return;
      }

      // Ctrl + K or Cmd + K: Open Universal Omnibar Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigation.openUniversalSearch();
      }
    });
  },

  /**
   * Inactivity Auto-Logout (15 minutes idle timeout)
   */
  inactivityTimer: null,
  warningTimer: null,
  setupInactivityTimeout() {
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
    const WARNING_MS = 14 * 60 * 1000; // 14 mins

    const resetTimers = () => {
      clearTimeout(this.warningTimer);
      clearTimeout(this.inactivityTimer);

      this.warningTimer = setTimeout(() => {
        ui.showToast('Your session will expire in 60 seconds due to inactivity. Move mouse to stay logged in.', 'warning', 10000);
      }, WARNING_MS);

      this.inactivityTimer = setTimeout(() => {
        if (typeof auth !== 'undefined' && auth.getToken()) {
          ui.showToast('Session timed out after 15 minutes of inactivity.', 'error');
          setTimeout(() => auth.logout(), 1000);
        }
      }, TIMEOUT_MS);
    };

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, resetTimers, { passive: true });
    });
    resetTimers();
  },

  /**
   * Render Breadcrumb Navigation
   */
  renderPageBreadcrumbs() {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent || document.querySelector('.bec-breadcrumb-nav')) return;

    const titles = {
      'dashboard': { section: 'Administration', title: 'Executive Dashboard' },
      'receipt-desk': { section: 'Counter Operations', title: 'Fast e-Receipt Desk' },
      'students': { section: 'Student Management', title: 'Students Directory & 360 Profile' },
      'student-fee': { section: 'Student Accounts', title: 'Student Fee Details & Ledger' },
      'payment-details': { section: 'Transaction Registers', title: 'Payment Details' },
      'student-transport-fee': { section: 'Auxiliary Services', title: 'Student Transport Fee' },
      'expenses': { section: 'Financial Operations', title: 'Institutional Expenses & Accounts' },
      'receipts': { section: 'Audit Registers', title: 'Fee Receipts Register' },
      'invoices': { section: 'Audit Registers', title: 'Invoices Register' },
      'reports': { section: 'Intelligence & Audit', title: 'Financial Reports & Defaulters' },
      'cash-bank': { section: 'Cash & Banking', title: 'Cash & Bank Management Hub' },
      'admin-settings': { section: 'Administration', title: 'Control Panel & System Settings' }
    };

    const info = titles[this.activePage] || { section: 'Accounts ERP', title: document.title.split('-')[0].trim() };
    const breadcrumbHtml = `
      <div class="bec-breadcrumb-nav" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #64748B; margin-bottom: 1.25rem;">
        <a href="/dashboard.html" style="color: #64748B; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </a>
        <span style="color: #CBD5E1;">/</span>
        <span style="color: #64748B;">${escapeHtml(info.section)}</span>
        <span style="color: #CBD5E1;">/</span>
        <strong style="color: #1E293B; font-weight: 700; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.03em;">${escapeHtml(info.title)}</strong>
      </div>
    `;
    pageContent.insertAdjacentHTML('afterbegin', breadcrumbHtml);
  },

  startLiveClock() {
    const clockEl = document.getElementById('topbarClock');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const day = now.getDate();
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      clockEl.textContent = `${dayName}, ${monthName} ${day}, ${year}, ${strHours}:${minutes}:${seconds} ${ampm}`;
    };

    update();
    setInterval(update, 1000);
  },

  setupMobileMenu() {
    window.toggleSidebar = function() {
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('active');
    };
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + K or Cmd + K: Open Universal Transaction Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigation.openUniversalSearch();
      }
    });
  },

  async checkAuthAndUser() {
    if (typeof auth !== 'undefined') {
      const user = await auth.checkAuth();
      if (!user) return;
      this.currentUser = user;

      // Strict role isolation: Students cannot access staff admin pages
      const isStudent = user.role === 'STUDENT';
      const currentPath = window.location.pathname.toLowerCase();
      const adminPages = [
        '/dashboard.html', '/receipt-desk.html', '/students.html',
        '/student-fee.html', '/payment-details.html', '/student-transport-fee.html',
        '/expenses.html', '/receipts.html', '/invoices.html', '/reports.html',
        '/cash-bank.html', '/admin-settings.html'
      ];

      if (isStudent && adminPages.some(p => currentPath.endsWith(p))) {
        window.location.replace('/student-portal.html');
        return;
      }

      // Staff cannot access student self-service portal directly
      if (!isStudent && currentPath.endsWith('/student-portal.html')) {
        window.location.replace('/dashboard.html');
        return;
      }

      // Populate sidebar according to user's permissions
      this.renderMasterSidebar(user);

      // Auditor restrictions
      if (user.role === 'AUDITOR_READ_ONLY') {
        const actionBars = document.querySelectorAll('.bec-action-toolbar, .quick-actions-bar, .fast-action-buttons');
        actionBars.forEach(ab => {
          if (ab) ab.style.display = 'none';
        });
      }

      // Update header alerts badge
      this.loadHeaderAlerts();
    }
  },

  /**
   * Render Master Sidebar according to Requirement 25
   */
  renderMasterSidebar(user) {
    const adminNav = document.getElementById('adminNavGroup');
    if (!adminNav) return;

    const role = user ? user.role : 'ACCOUNTS_STAFF';
    const isSuperAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role);
    const isAccountsHead = ['ACCOUNTS_HEAD', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS_MANAGER'].includes(role);
    const isCashier = role === 'CASHIER';
    const isAuditor = role === 'AUDITOR_READ_ONLY';
    const isExam = role === 'EXAM_SECTION';

    const p = this.activePage || '';

    // Requirement 25 Sidebar Hierarchy
    let html = `
      <!-- ==================== 1. HOME ==================== -->
      <div class="nav-section-title">Home</div>
      <a href="/dashboard.html" class="nav-item ${p === 'dashboard' ? 'active' : ''}" data-page="dashboard">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Accounts Dashboard</span>
      </a>

      <!-- ==================== 2. STUDENT ACCOUNTS ==================== -->
      <div class="nav-section-title">Student Accounts</div>
      <a href="/students.html" class="nav-item ${p === 'students' ? 'active' : ''}" data-page="students">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Student Search (360)</span>
      </a>
      <a href="/receipt-desk.html" class="nav-item ${p === 'receipt-desk' ? 'active' : ''}" data-page="receipt-desk">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>Fee Collection (Fast Desk)</span>
      </a>
      <a href="/student-fee.html" class="nav-item ${p === 'student-fee' ? 'active' : ''}" data-page="student-fee">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>Student Fee Ledger</span>
      </a>
      <a href="/receipts.html" class="nav-item ${p === 'receipts' ? 'active' : ''}" data-page="receipts">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span>Fee Receipts Register</span>
      </a>
      <a href="/students.html?tab=exam" class="nav-item ${p === 'exam' ? 'active' : ''}" data-page="exam">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        <span>Exam Registration</span>
      </a>
      <a href="/student-transport-fee.html" class="nav-item ${p === 'transport' ? 'active' : ''}" data-page="transport">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Transport &amp; Hostel Fees</span>
      </a>
      ${!isCashier ? `
        <a href="/student-fee.html?action=scholarship" class="nav-item ${p === 'scholarships' ? 'active' : ''}" data-page="scholarships">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span>Scholarships &amp; Discounts</span>
        </a>
        <a href="/admin-settings.html?tab=refunds" class="nav-item ${p === 'refunds' ? 'active' : ''}" data-page="refunds">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          <span>Refunds &amp; Reversals</span>
        </a>
      ` : ''}

      <!-- ==================== 3. ACCOUNTS ==================== -->
      <div class="nav-section-title">Accounts</div>
      <a href="/expenses.html" class="nav-item ${p === 'expenses' ? 'active' : ''}" data-page="expenses">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <span>Expenses &amp; Outflow</span>
      </a>
      <a href="/expenses.html?tab=parties" class="nav-item ${p === 'vendors' ? 'active' : ''}" data-page="vendors">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
        <span>Vendors / Parties Master</span>
      </a>
      <a href="/cash-bank.html" class="nav-item ${p === 'cash-bank' ? 'active' : ''}" data-page="cash-bank">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
        <span>Cash &amp; Bank Management</span>
      </a>

      <!-- ==================== 4. REPORTS ==================== -->
      <div class="nav-section-title">Reports</div>
      <a href="/reports.html" class="nav-item ${p === 'reports' ? 'active' : ''}" data-page="reports">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        <span>Reports &amp; Defaulters</span>
      </a>
      <a href="/invoices.html" class="nav-item ${p === 'invoices' ? 'active' : ''}" data-page="invoices">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>Invoices &amp; Billing</span>
      </a>
    `;

    // 5. ADMINISTRATION (Only for Accounts Head, Admin, or Auditor)
    if (isAccountsHead || isAuditor) {
      html += `
        <!-- ==================== 5. ADMINISTRATION ==================== -->
        <div class="nav-section-title">Administration</div>
        <a href="/admin-settings.html?tab=users" class="nav-item ${p === 'admin-users' ? 'active' : ''}" data-page="admin-users">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <span>Users &amp; Staff Roles</span>
        </a>
        <a href="/admin-settings.html?tab=fees" class="nav-item ${p === 'admin-fees' ? 'active' : ''}" data-page="admin-fees">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Fee Configuration</span>
        </a>
        <a href="/admin-settings.html?tab=audit" class="nav-item ${p === 'admin-audit' ? 'active' : ''}" data-page="admin-audit">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Immutable Audit Log</span>
        </a>
      `;
    }

    adminNav.innerHTML = html;
  },

  /**
   * Load topbar pending counters and alerts
   */
  async loadHeaderAlerts() {
    try {
      const res = await api.get('/admin/dashboard');
      if (res && res.data && res.data.kpis) {
        const kpis = res.data.kpis;
        const pendingTotal = (kpis.pending_approvals_count || 0) + (kpis.pending_recon_count || 0);
        const badge = document.getElementById('topbarPendingBadge');
        if (badge) {
          if (pendingTotal > 0) {
            badge.style.display = 'inline-flex';
            badge.textContent = pendingTotal;
          } else {
            badge.style.display = 'none';
          }
        }
      }
    } catch (e) {
      // ignore
    }
  },

  /**
   * Universal Omnibar Search Modal (Ctrl + K & F2)
   * Searches simultaneously by Name, Roll No, Reg No, Mobile, Guardian Mobile, Branch, and Transactions
   */
  uniSearchMode: 'STUDENT',
  uniHighlightedIndex: -1,
  uniResultsData: [],

  openUniversalSearch(mode = 'STUDENT') {
    this.uniSearchMode = mode;
    this.uniHighlightedIndex = -1;
    this.uniResultsData = [];

    let modal = document.getElementById('universalSearchModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'universalSearchModal';
      modal.className = 'modal-backdrop active';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 740px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden;">
          <div class="modal-header" style="background: #0F172A; color: #FFFFFF; padding: 0.9rem 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div>
                <span style="font-weight: 800; font-size: 1rem; letter-spacing: 0.02em;">Universal ERP Omnibar</span>
                <span style="font-size: 0.72rem; color: #94A3B8; margin-left: 0.5rem;">[Ctrl + K] / [F2]</span>
              </div>
            </div>
            <button class="modal-close-btn" onclick="navigation.closeUniversalSearch()" style="color: #94A3B8; font-size: 1.25rem;">&times;</button>
          </div>

          <div style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0; padding: 0.5rem 1.25rem; display: flex; gap: 0.5rem;">
            <button type="button" id="uniTabStudents" class="btn btn-sm btn-primary" onclick="navigation.setUniSearchMode('STUDENT')" style="font-size: 0.78rem; font-weight: 700; border-radius: 20px;">
              🎓 Students Directory (Name, Roll, Reg, Mobile, Branch)
            </button>
            <button type="button" id="uniTabTxns" class="btn btn-sm btn-outline" onclick="navigation.setUniSearchMode('TXN')" style="font-size: 0.78rem; font-weight: 600; border-radius: 20px; border-color: #CBD5E1;">
              💳 Transactions &amp; Receipts
            </button>
          </div>

          <div class="modal-body" style="padding: 1.25rem;">
            <div style="position: relative; margin-bottom: 0.75rem;">
              <input 
                type="text" 
                id="uniSearchInput" 
                class="form-control" 
                style="font-size: 1.05rem; padding: 0.7rem 1rem; height: 48px; border: 2px solid #2563EB; border-radius: 8px; font-weight: 600;" 
                placeholder="Type Name, Roll No, Reg No, Mobile, Branch..." 
                autocomplete="off"
              >
              <div style="position: absolute; right: 12px; top: 13px; display: flex; gap: 0.35rem; align-items: center;">
                <span style="font-size: 0.7rem; color: #64748B; background: #E2E8F0; padding: 3px 6px; border-radius: 4px; font-weight: 700;">&uarr;&darr; Navigate</span>
                <span style="font-size: 0.7rem; color: #64748B; background: #E2E8F0; padding: 3px 6px; border-radius: 4px; font-weight: 700;">Enter Select</span>
                <span style="font-size: 0.7rem; color: #64748B; background: #E2E8F0; padding: 3px 6px; border-radius: 4px; font-weight: 700;">ESC</span>
              </div>
            </div>

            <div id="uniSearchResults" style="max-height: 420px; overflow-y: auto;">
              <div style="text-align: center; padding: 2.5rem; color: #64748B; font-size: 0.88rem;">
                Search across all 1st, 2nd, 3rd, 4th Year engineering students by <strong>Name</strong>, <strong>Roll No</strong>, <strong>Registration No</strong>, <strong>Mobile</strong>, or <strong>Branch</strong>.
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const input = document.getElementById('uniSearchInput');
      input.addEventListener('input', (e) => {
        navigation.handleUniversalSearchDebounced(e.target.value);
      });
      input.addEventListener('keydown', (e) => {
        navigation.handleUniKeydown(e);
      });
    } else {
      modal.classList.add('active');
    }

    this.updateUniTabUI();

    setTimeout(() => {
      const input = document.getElementById('uniSearchInput');
      if (input) {
        input.value = '';
        input.focus();
        this.renderUniInitialState();
      }
    }, 100);
  },

  setUniSearchMode(mode) {
    this.uniSearchMode = mode;
    this.updateUniTabUI();
    const input = document.getElementById('uniSearchInput');
    if (input) {
      input.placeholder = mode === 'STUDENT' 
        ? 'Search by Student Name, Roll No, Reg No, Phone, Guardian Mobile, Branch...' 
        : 'Search by Receipt No, Txn ID, UTR, Voucher No, Student Name...';
      input.focus();
      this.executeUniversalSearch(input.value);
    }
  },

  updateUniTabUI() {
    const tabStudents = document.getElementById('uniTabStudents');
    const tabTxns = document.getElementById('uniTabTxns');
    if (!tabStudents || !tabTxns) return;

    if (this.uniSearchMode === 'STUDENT') {
      tabStudents.className = 'btn btn-sm btn-primary';
      tabTxns.className = 'btn btn-sm btn-outline';
      tabTxns.style.borderColor = '#CBD5E1';
    } else {
      tabStudents.className = 'btn btn-sm btn-outline';
      tabStudents.style.borderColor = '#CBD5E1';
      tabTxns.className = 'btn btn-sm btn-primary';
    }
  },

  renderUniInitialState() {
    const container = document.getElementById('uniSearchResults');
    if (!container) return;
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: #64748B; font-size: 0.88rem;">
        Type any query to search instantly across <strong>Students Directory</strong> and <strong>Financial Ledgers</strong>.
      </div>
    `;
  },

  closeUniversalSearch() {
    const modal = document.getElementById('universalSearchModal');
    if (modal) modal.classList.remove('active');
    this.uniHighlightedIndex = -1;
    this.uniResultsData = [];
  },

  searchTimer: null,
  handleUniversalSearchDebounced(val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.executeUniversalSearch(val);
    }, 200);
  },

  handleUniKeydown(e) {
    const items = document.querySelectorAll('.uni-result-row');
    if (e.key === 'Escape') {
      this.closeUniversalSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length === 0) return;
      this.uniHighlightedIndex = (this.uniHighlightedIndex + 1) % items.length;
      this.highlightUniRow(items);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length === 0) return;
      this.uniHighlightedIndex = (this.uniHighlightedIndex - 1 + items.length) % items.length;
      this.highlightUniRow(items);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.uniHighlightedIndex >= 0 && this.uniResultsData[this.uniHighlightedIndex]) {
        const item = this.uniResultsData[this.uniHighlightedIndex];
        if (this.uniSearchMode === 'STUDENT') {
          window.location.href = `/receipt-desk.html?reg_no=${encodeURIComponent(item.reg_no)}`;
        } else if (item.action_url) {
          window.location.href = item.action_url;
        }
      } else if (items.length > 0) {
        items[0].click();
      }
    }
  },

  highlightUniRow(items) {
    items.forEach((it, idx) => {
      if (idx === this.uniHighlightedIndex) {
        it.style.background = '#EFF6FF';
        it.style.borderColor = '#3B82F6';
        it.scrollIntoView({ block: 'nearest' });
      } else {
        it.style.background = '#FFFFFF';
        it.style.borderColor = '#E2E8F0';
      }
    });
  },

  async executeUniversalSearch(val) {
    const term = (val || '').trim();
    const container = document.getElementById('uniSearchResults');
    if (!container) return;

    if (!term || term.length < 2) {
      this.renderUniInitialState();
      return;
    }

    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #64748B;"><span class="spinner-sm"></span> Searching live database...</div>`;

    if (this.uniSearchMode === 'STUDENT') {
      try {
        const res = await api.get(`/admin/students?search=${encodeURIComponent(term)}&limit=10`);
        const students = (res && res.data && res.data.students) ? res.data.students : [];
        this.uniResultsData = students;
        this.uniHighlightedIndex = -1;

        if (students.length === 0) {
          container.innerHTML = `<div style="text-align: center; padding: 2.5rem; color: #DC2626; font-size: 0.88rem;">No students found matching "${escapeHtml(term)}".</div>`;
          return;
        }

        container.innerHTML = students.map((s, idx) => {
          const dues = parseFloat(s.total_outstanding || 0);
          const duesBadge = dues > 0 
            ? `<span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 800;">Dues: ₹${dues.toLocaleString('en-IN')}</span>`
            : `<span class="badge" style="background: #D1FAE5; color: #059669; font-weight: 800;">✓ Fully Paid (₹0)</span>`;

          return `
            <div 
              class="uni-result-row" 
              data-index="${idx}"
              style="padding: 0.85rem 1rem; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; cursor: pointer; transition: all 0.15s ease;"
              onclick="window.location.href='/receipt-desk.html?reg_no=${encodeURIComponent(s.reg_no)}'"
            >
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: #0F172A; font-size: 0.95rem;">${escapeHtml(s.full_name)}</strong>
                  <span class="badge badge-info" style="font-size: 0.72rem; font-weight: 700;">${escapeHtml(s.branch_code || 'B.Tech')}</span>
                  <span style="font-size: 0.75rem; color: #64748B;">${escapeHtml(s.semester_label || '1st Sem')}</span>
                </div>
                <div style="font-size: 0.78rem; color: #64748B; margin-top: 0.3rem; display: flex; gap: 0.75rem;">
                  <span>Roll: <strong style="color: #1E293B;">${escapeHtml(s.roll_no || s.reg_no)}</strong></span>
                  <span>Reg: <code style="color: #0284C7; font-weight: 700;">${escapeHtml(s.reg_no)}</code></span>
                  ${s.phone ? `<span>Phone: <strong>${escapeHtml(s.phone)}</strong></span>` : ''}
                </div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
                ${duesBadge}
                <div style="display: flex; gap: 0.3rem;">
                  <a href="/receipt-desk.html?reg_no=${encodeURIComponent(s.reg_no)}" class="btn btn-sm btn-primary" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; text-decoration: none;" onclick="event.stopPropagation()">⚡ Fast Desk</a>
                  <a href="/student-fee.html?reg_no=${encodeURIComponent(s.reg_no)}" class="btn btn-sm btn-outline" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; text-decoration: none;" onclick="event.stopPropagation()">📋 Ledger</a>
                  <a href="/students.html?reg_no=${encodeURIComponent(s.reg_no)}" class="btn btn-sm btn-outline" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; text-decoration: none;" onclick="event.stopPropagation()">👤 360</a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #DC2626;">Error searching students: ${escapeHtml(e.message)}</div>`;
      }
    } else {
      // Transaction search mode
      try {
        const res = await api.get(`/admin/transactions/search?q=${encodeURIComponent(term)}`);
        const results = (res && res.data && res.data.results) ? res.data.results : [];
        this.uniResultsData = results;
        this.uniHighlightedIndex = -1;

        if (results.length === 0) {
          container.innerHTML = `<div style="text-align: center; padding: 2.5rem; color: #DC2626; font-size: 0.88rem;">No financial transactions found for "${escapeHtml(term)}".</div>`;
          return;
        }

        container.innerHTML = results.map((r, idx) => `
          <div 
            class="uni-result-row" 
            data-index="${idx}"
            style="padding: 0.75rem 0.9rem; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; cursor: pointer; transition: all 0.15s ease;"
            onclick="window.location.href='${r.action_url}'"
          >
            <div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span class="badge ${r.type === 'EXPENSE_VOUCHER' ? 'badge-danger' : 'badge-info'}" style="font-size: 0.68rem; font-weight: 700;">${r.type === 'EXPENSE_VOUCHER' ? 'EXPENSE' : 'RECEIPT'}</span>
                <strong style="color: #0F172A; font-size: 0.9rem; font-family: monospace;">${escapeHtml(r.doc_no)}</strong>
              </div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #1E293B; margin-top: 0.2rem;">${escapeHtml(r.title)}</div>
              <div style="font-size: 0.75rem; color: #64748B;">${escapeHtml(r.subtitle)}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 0.95rem; color: ${r.amount > 0 ? '#059669' : '#DC2626'};">${r.amount > 0 ? '+' : ''}${ui.formatCurrency(r.amount)}</div>
              <div style="font-size: 0.72rem; color: #64748B; margin-top: 0.15rem;">${ui.formatDate(r.date)}</div>
              <a href="${r.action_url}" class="btn btn-sm btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; margin-top: 0.35rem; display: inline-block;" onclick="event.stopPropagation()">View Record</a>
            </div>
          </div>
        `).join('');
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #DC2626;">Error searching transactions: ${escapeHtml(e.message)}</div>`;
      }
    }
  },

  openRolePasswordModal() {
    let modal = document.getElementById('globalRolePasswordModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'globalRolePasswordModal';
      modal.className = 'modal-backdrop active';
      const u = (typeof auth !== 'undefined') ? auth.getUser() : null;
      const roleName = u ? (u.role || 'ACCOUNTS') : 'ACCOUNTS_STAFF';

      modal.innerHTML = `
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header" style="background: #0F172A; color: #FFFFFF;">
            <span style="font-weight: 700;">Change Account Password</span>
            <button class="modal-close-btn" onclick="document.getElementById('globalRolePasswordModal').remove()" style="color: #94A3B8;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1.25rem;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem;">
              <span style="font-size: 0.72rem; color: #64748B; text-transform: uppercase; font-weight: 700;">Role:</span>
              <div style="font-size: 1rem; font-weight: 800; color: #2563EB;">${roleName}</div>
            </div>
            <div style="margin-bottom: 0.85rem;">
              <label class="form-label">Current Password:</label>
              <input type="password" id="globalCurrentPass" class="form-control">
            </div>
            <div style="margin-bottom: 0.85rem;">
              <label class="form-label">New Password:</label>
              <input type="password" id="globalNewPass" class="form-control" placeholder="Minimum 8 characters">
            </div>
            <div style="margin-bottom: 1.25rem;">
              <label class="form-label">Confirm New Password:</label>
              <input type="password" id="globalConfirmPass" class="form-control">
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="navigation.submitPasswordChange()">
              Update Password
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.add('active');
    }
  },

  async submitPasswordChange() {
    const cur = document.getElementById('globalCurrentPass')?.value;
    const nw = document.getElementById('globalNewPass')?.value;
    const cnf = document.getElementById('globalConfirmPass')?.value;

    if (!cur || !nw) {
      ui.showToast('Please enter current and new password', 'warning');
      return;
    }
    if (nw !== cnf) {
      ui.showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: cur,
        newPassword: nw
      });
      if (res && res.success) {
        ui.showToast('Password successfully updated!', 'success');
        document.getElementById('globalRolePasswordModal')?.remove();
      } else {
        ui.showToast(res.message || 'Failed to update password', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Error updating password', 'error');
    }
  }
};

window.openRolePasswordModal = function() {
  navigation.openRolePasswordModal();
};

window.openUniversalSearch = function() {
  navigation.openUniversalSearch();
};
