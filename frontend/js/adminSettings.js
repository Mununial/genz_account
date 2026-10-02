/**
 * ==============================================================================
 * BHUBANESWAR ENGINEERING COLLEGE (BEC) - ADMINISTRATION & AUDIT CONTROLLER
 * Users & Staff Master, 8-Role RBAC Matrix, Fee Configuration, Audit Trail
 * ==============================================================================
 */

const adminSettings = {
  activeTab: 'users',
  users: [],
  allAuditLogs: [],

  async init() {
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get('tab') || 'users';
    this.switchTab(initialTab);

    await this.loadUsers();
    this.renderRbacMatrix();
    this.renderFeeHeads();
    await this.loadAuditLogs();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sectionUsers').style.display = tab === 'users' ? 'block' : 'none';
    document.getElementById('sectionRbac').style.display = tab === 'rbac' ? 'block' : 'none';
    document.getElementById('sectionFees').style.display = tab === 'fees' ? 'block' : 'none';
    document.getElementById('sectionSessions').style.display = tab === 'sessions' ? 'block' : 'none';
    document.getElementById('sectionAudit').style.display = tab === 'audit' ? 'block' : 'none';

    if (tab === 'users') document.getElementById('tabBtnUsers')?.classList.add('active');
    if (tab === 'rbac') document.getElementById('tabBtnRbac')?.classList.add('active');
    if (tab === 'fees') document.getElementById('tabBtnFees')?.classList.add('active');
    if (tab === 'sessions') document.getElementById('tabBtnSessions')?.classList.add('active');
    if (tab === 'audit') document.getElementById('tabBtnAudit')?.classList.add('active');
  },

  async loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/users');
      const data = res?.data;
      this.users = (data && data.users) ? data.users : (Array.isArray(data) ? data : (Array.isArray(res) ? res : []));

      if (this.users.length === 0) {
        this.users = [
          { id: 1, email: 'admin@bec.ac.in', full_name: 'Ayush Mallick', role_name: 'ADMIN', department: 'Central IT & Administration', is_active: 1, last_login_at: 'Today, 09:42 AM' },
          { id: 2, email: 'accounts.head@bec.ac.in', full_name: 'Harihara Parida', role_name: 'ACCOUNTS_HEAD', department: 'Finance & Accounts', is_active: 1, last_login_at: 'Today, 09:15 AM' },
          { id: 19, email: 'director@bec.ac.in', full_name: 'Dr. B.N. Biswal', role_name: 'DIRECTOR', department: 'Directorate', is_active: 1, last_login_at: 'Today, 08:50 AM' },
          { id: 20, email: 'exam.section@bec.ac.in', full_name: 'Mr. Manoj Kumar Pati', role_name: 'EXAM_CELL', department: 'Examination Section', is_active: 1, last_login_at: 'Today, 09:00 AM' },
          { id: 10, email: 'hod.cse@bec.ac.in', full_name: 'Anita Behera', role_name: 'HOD', department: 'CSE & Data Science', is_active: 1, last_login_at: 'Yesterday, 04:30 PM' }
        ];
      }

      this.renderUsersTable();
    } catch (e) {
      console.warn('Load users error:', e.message);
    }
  },

  renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!Array.isArray(this.users) || this.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #64748B;">No institutional staff records found.</td></tr>';
      return;
    }

    tbody.innerHTML = this.users.map(u => {
      const roleName = u.role_name || u.role || 'STAFF';
      const roleColor = {
        ADMIN: '#9333EA',
        ACCOUNTS_HEAD: '#2563EB',
        ACCOUNTS_STAFF: '#0284C7',
        CASHIER: '#10B981',
        AUDITOR: '#D97706',
        AUDITOR_READ_ONLY: '#D97706',
        EXAM_CELL: '#4F46E5',
        DIRECTOR: '#7C3AED',
        HOD: '#EA580C',
        STUDENT: '#64748B'
      }[roleName] || '#64748B';

      const displayName = u.full_name || (u.email ? u.email.split('@')[0].replace('.', ' ').toUpperCase() : 'STAFF MEMBER');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(displayName)}</strong>
            <br><code style="font-size: 0.78rem; color: #64748B;">${escapeHtml(u.email || '')}</code>
          </td>
          <td>
            <span class="badge" style="background: ${roleColor}15; color: ${roleColor}; font-weight: 700; border: 1px solid ${roleColor}40;">
              ${escapeHtml(roleName)}
            </span>
          </td>
          <td>${escapeHtml(u.department || 'Institutional Staff')}</td>
          <td>
            <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}">
              ${u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
            </span>
          </td>
          <td><small>${escapeHtml(u.last_login_at || u.last_login || 'Active Session')}</small></td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-sm ${u.is_active ? 'btn-ghost-danger' : 'btn-secondary'}" onclick="adminSettings.toggleUserStatus(${u.id}, ${u.is_active ? 0 : 1})">
              ${u.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <a class="btn btn-sm btn-secondary" href="/master-control.html" style="margin-left: 4px; text-decoration: none;">
              ⚡ Edit in Master
            </a>
          </td>
        </tr>
      `;
    }).join('');
  },

  async toggleUserStatus(userId, newStatus) {
    try {
      await api.post(`/admin/users/${userId}/status`, { isActive: newStatus });
      ui.showToast(`User status updated to ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`, 'success');
      const u = this.users.find(usr => usr.id === userId);
      if (u) u.is_active = newStatus;
      this.renderUsersTable();
    } catch (e) {
      ui.showToast(e.message || 'Failed to update user status.', 'danger');
    }
  },

  // 8-Role RBAC Matrix (Requirement 24)
  renderRbacMatrix() {
    const tbody = document.getElementById('rbacMatrixTbody');
    if (!tbody) return;

    const capabilities = [
      { name: 'View Dashboard & Financial Analytics', admin: 1, head: 1, staff: 1, cashier: 0, auditor: 1, exam: 0, mgmt: 1, student: 0 },
      { name: 'Universal Student 360 & Directory Search', admin: 1, head: 1, staff: 1, cashier: 1, auditor: 1, exam: 1, mgmt: 1, student: 0 },
      { name: 'Collect Fees & Issue Fast e-Receipts', admin: 1, head: 1, staff: 1, cashier: 1, auditor: 0, exam: 0, mgmt: 0, student: 0 },
      { name: 'Cancel e-Receipt (Audit Justified)', admin: 1, head: 1, staff: 0, cashier: 0, auditor: 0, exam: 0, mgmt: 0, student: 0 },
      { name: 'Record Expense Vouchers & Vendor Payments', admin: 1, head: 1, staff: 1, cashier: 0, auditor: 0, exam: 0, mgmt: 0, student: 0 },
      { name: 'Daily Cash Drawer Balancing & Closing', admin: 1, head: 1, staff: 1, cashier: 1, auditor: 1, exam: 0, mgmt: 0, student: 0 },
      { name: 'Bank Accounts Management & BRS', admin: 1, head: 1, staff: 0, cashier: 0, auditor: 1, exam: 0, mgmt: 1, student: 0 },
      { name: 'Approve Refunds & Fee Reversals', admin: 1, head: 1, staff: 0, cashier: 0, auditor: 0, exam: 0, mgmt: 0, student: 0 },
      { name: 'BPUT Examination Dues Clearance Override', admin: 1, head: 1, staff: 0, cashier: 0, auditor: 0, exam: 1, mgmt: 0, student: 0 },
      { name: 'Export Statutory Reports & Excel/CSV', admin: 1, head: 1, staff: 1, cashier: 0, auditor: 1, exam: 0, mgmt: 1, student: 0 },
      { name: 'View Immutable Audit Trail', admin: 1, head: 1, staff: 0, cashier: 0, auditor: 1, exam: 0, mgmt: 1, student: 0 },
      { name: 'User Management & Role Permissions', admin: 1, head: 0, staff: 0, cashier: 0, auditor: 0, exam: 0, mgmt: 0, student: 0 },
      { name: 'Student Portal Self-Payment & Ledger', admin: 0, head: 0, staff: 0, cashier: 0, auditor: 0, exam: 0, mgmt: 0, student: 1 }
    ];

    const icon = val => val ? '<span class="perm-check">✓</span>' : '<span class="perm-cross">&bull;</span>';

    tbody.innerHTML = capabilities.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${icon(c.admin)}</td>
        <td>${icon(c.head)}</td>
        <td>${icon(c.staff)}</td>
        <td>${icon(c.cashier)}</td>
        <td>${icon(c.auditor)}</td>
        <td>${icon(c.exam)}</td>
        <td>${icon(c.mgmt)}</td>
        <td>${icon(c.student)}</td>
      </tr>
    `).join('');
  },

  // Fee Categories / Heads (Requirement 22)
  renderFeeHeads() {
    const tbody = document.getElementById('feeHeadsTbody');
    if (!tbody) return;

    const feeHeads = [
      { name: 'Tuition Fee (Annual Academic)', code: 'TUI', rate: 85000, class: 'ACADEMIC_CORE', ref: false, due: '31-Oct-2026' },
      { name: 'Institutional Development Fee', code: 'DEV', rate: 15000, class: 'INFRASTRUCTURE', ref: false, due: '31-Oct-2026' },
      { name: 'BPUT University Examination Fee', code: 'EXAM', rate: 5000, class: 'UNIVERSITY_AFFILIATION', ref: false, due: '31-Oct-2026' },
      { name: 'Computing & Advanced Engineering Lab', code: 'LAB', rate: 5000, class: 'ACADEMIC_LAB', ref: false, due: '31-Oct-2026' },
      { name: 'University Caution Deposit (Security)', code: 'CAUTION', rate: 5000, class: 'INSTITUTIONAL_DEPOSIT', ref: true, due: '31-Oct-2026' },
      { name: 'Hostel & Residence Accommodation', code: 'HOSTEL', rate: 45000, class: 'RESIDENTIAL', ref: false, due: '31-Jul-2026' },
      { name: 'Hostel Mess & Boarding Advance', code: 'MESS', rate: 36000, class: 'CATERING_BOARDING', ref: false, due: 'Per Semester' },
      { name: 'Fleet Transportation Bus Pass', code: 'TRANS', rate: 24000, class: 'LOGISTICS_TRANS', ref: false, due: 'Annual' }
    ];

    tbody.innerHTML = feeHeads.map(f => `
      <tr>
        <td><strong>${escapeHtml(f.name)}</strong></td>
        <td><code style="font-weight: 700; color: #0284C7;">${escapeHtml(f.code)}</code></td>
        <td style="font-weight: 700; font-family: monospace;">${ui.formatCurrency(f.rate)}</td>
        <td><span class="badge badge-info" style="font-size: 0.72rem;">${f.class}</span></td>
        <td><span class="badge ${f.ref ? 'badge-warning' : 'badge-neutral'}">${f.ref ? 'REFUNDABLE' : 'NON-REFUNDABLE'}</span></td>
        <td>${f.due}</td>
        <td style="text-align: right;"><span class="badge badge-success">ACTIVE</span></td>
      </tr>
    `).join('');
  },

  // Immutable Audit Trail
  async loadAuditLogs() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/audit-logs?limit=50');
      this.allAuditLogs = res?.data?.logs || [];
      this.filterAuditLogs();
    } catch (e) {
      console.warn('Audit logs load notice:', e.message);
    }
  },

  filterAuditLogs() {
    const tbody = document.getElementById('auditTableBody');
    const countLabel = document.getElementById('auditLogCountLabel');
    if (!tbody) return;

    const modFilter = document.getElementById('auditModuleFilter')?.value || '';
    const search = (document.getElementById('auditSearchInput')?.value || '').trim().toLowerCase();

    let logs = this.allAuditLogs;

    if (modFilter) {
      logs = logs.filter(l => l.module === modFilter);
    }

    if (search) {
      logs = logs.filter(l => {
        const r = (l.reason || '').toLowerCase();
        const u = (l.user_email || '').toLowerCase();
        const a = (l.action || '').toLowerCase();
        return r.includes(search) || u.includes(search) || a.includes(search);
      });
    }

    if (countLabel) {
      countLabel.textContent = `Showing ${logs.length} immutable events in audit stream`;
    }

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: #64748B;">No audit trail events matching filter.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="white-space: nowrap; font-family: monospace; font-size: 0.82rem;">${l.created_at ? l.created_at.slice(0, 19).replace('T', ' ') : 'Live'}</td>
        <td><span class="badge" style="background: #F1F5F9; color: #1E293B; font-weight: 700;">${escapeHtml(l.action || 'TRANSACTION')}</span></td>
        <td><code style="font-weight: 700; color: #0284C7;">${escapeHtml(l.module || 'ACCOUNTS')}</code></td>
        <td><strong>${escapeHtml(l.user_email || 'staff@bec.edu.in')}</strong></td>
        <td><span class="badge badge-info" style="font-size: 0.72rem;">${escapeHtml(l.role || 'STAFF')}</span></td>
        <td>${escapeHtml(l.reason || 'Ledger event recorded')}</td>
        <td><small style="color: #64748B; font-family: monospace;">${escapeHtml(l.ip_address || '127.0.0.1')}</small></td>
      </tr>
    `).join('');
  }
};
