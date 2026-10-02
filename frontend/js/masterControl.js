/**
 * ==============================================================================
 * BHUBANESWAR ENGINEERING COLLEGE (BEC) - MASTER CONTROL CONSOLE CONTROLLER
 * Full System Authority: Edit All Roles, IDs, Passwords, Windows, & Permissions
 * ==============================================================================
 */

const masterControl = {
  activeTab: 'users',
  users: [],
  roles: [],
  students: [],
  windows: [],
  branches: [],
  auditLogs: [],
  searchTimer: null,

  async init() {
    await this.loadRoles();
    await this.loadBranches();
    await this.loadUsers();
    await this.loadStudents();
    await this.loadWindows();
    this.renderRbacMatrix();
    await this.loadAuditLogs();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.master-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sectionUsers').style.display = tab === 'users' ? 'block' : 'none';
    document.getElementById('sectionStudents').style.display = tab === 'students' ? 'block' : 'none';
    document.getElementById('sectionWindows').style.display = tab === 'windows' ? 'block' : 'none';
    document.getElementById('sectionRbac').style.display = tab === 'rbac' ? 'block' : 'none';
    document.getElementById('sectionAudit').style.display = tab === 'audit' ? 'block' : 'none';

    if (tab === 'users') document.getElementById('tabBtnUsers')?.classList.add('active');
    if (tab === 'students') document.getElementById('tabBtnStudents')?.classList.add('active');
    if (tab === 'windows') document.getElementById('tabBtnWindows')?.classList.add('active');
    if (tab === 'rbac') document.getElementById('tabBtnRbac')?.classList.add('active');
    if (tab === 'audit') document.getElementById('tabBtnAudit')?.classList.add('active');
  },

  // 1. ROLES MANAGEMENT
  async loadRoles() {
    try {
      const res = await api.get('/admin/roles');
      this.roles = res?.data || [];
      this.populateRoleDropdowns();
      const el = document.getElementById('statTotalRoles');
      if (el) el.textContent = `${this.roles.length} Roles`;
    } catch (e) {
      console.warn('Failed to load roles:', e.message);
    }
  },

  populateRoleDropdowns() {
    const editSel = document.getElementById('editUserRole');
    const newSel = document.getElementById('newRole');
    const options = this.roles.map(r => `<option value="${r.id}">${r.name} (ID: ${r.id}) - ${r.description || ''}</option>`).join('');
    if (editSel) editSel.innerHTML = options;
    if (newSel) newSel.innerHTML = options;
  },

  async loadBranches() {
    try {
      const res = await api.get('/registration/metadata');
      this.branches = res?.data?.departments || [];
      const branchSel = document.getElementById('editStudentBranch');
      if (branchSel) {
        branchSel.innerHTML = this.branches.map(b => `<option value="${b.id}">${b.name} (${b.code})</option>`).join('');
      }
    } catch (e) {
      console.warn('Metadata load notice:', e.message);
    }
  },

  // 2. USERS MASTER
  debounceSearchUsers() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadUsers(), 300);
  },

  async loadUsers() {
    const tbody = document.getElementById('usersMasterTbody');
    if (!tbody) return;

    const roleName = document.getElementById('userRoleFilter')?.value || '';
    const search = document.getElementById('userSearchInput')?.value || '';

    let url = `/admin/users?limit=500`;
    if (roleName) url += `&role_name=${encodeURIComponent(roleName)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading users...</td></tr>';
      const res = await api.get(url);
      const data = res?.data;
      this.users = (data && data.users) ? data.users : (Array.isArray(data) ? data : []);
      
      const totalEl = document.getElementById('statTotalUsers');
      if (totalEl) totalEl.textContent = data?.total || this.users.length;

      this.renderUsersTable();
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger-rose); padding: 1.5rem;">Failed to load users: ${e.message}</td></tr>`;
    }
  },

  renderUsersTable() {
    const tbody = document.getElementById('usersMasterTbody');
    if (!tbody) return;

    if (this.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No users matched your query.</td></tr>';
      return;
    }

    const roleColors = {
      ADMIN: '#9333EA',
      ACCOUNTS_HEAD: '#2563EB',
      ACCOUNTS_STAFF: '#0284C7',
      CASHIER: '#059669',
      AUDITOR_READ_ONLY: '#D97706',
      EXAM_CELL: '#4F46E5',
      HOD: '#EA580C',
      DIRECTOR: '#7C3AED',
      STUDENT: '#475569'
    };

    tbody.innerHTML = this.users.map(u => {
      const color = roleColors[u.role_name] || '#64748B';
      const isStudent = u.role_name === 'STUDENT';
      const cleanName = escapeHtml(u.full_name || 'System User');
      const cleanEmail = escapeHtml(u.email || '');

      return `
        <tr>
          <td><strong style="color: var(--primary-navy); font-family: monospace;">#${u.id}</strong></td>
          <td>
            <div style="font-weight: 700; color: #0F172A;">${cleanName}</div>
            <code style="font-size: 0.78rem; color: #2563EB;">${cleanEmail}</code>
          </td>
          <td>
            <span class="badge" style="background: ${color}15; color: ${color}; font-weight: 800; border: 1px solid ${color}40;">
              ${escapeHtml(u.role_name)}
            </span>
          </td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(u.department || 'Main Campus')}</div>
            ${u.code ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${escapeHtml(u.code)}</div>` : ''}
          </td>
          <td>
            <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}">
              ${u.is_active ? 'ACTIVE' : 'BLOCKED'}
            </span>
          </td>
          <td><small style="color: var(--text-muted);">${u.last_login_at ? new Date(u.last_login_at).toLocaleString('en-IN') : 'Never'}</small></td>
          <td style="text-align: right;">
            <div class="action-btn-group">
              <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" 
                onclick="masterControl.openEditUserModal(${u.id})">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF;" 
                onclick="masterControl.openChangePasswordModal(${u.id}, ${isStudent ? 1 : 0}, '${escapeHtml(u.full_name)}', '${cleanEmail}')">
                🔑 Pass
              </button>
              <button type="button" class="btn btn-sm ${u.is_active ? 'btn-ghost-danger' : 'btn-secondary'}" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" 
                onclick="masterControl.toggleUserStatus(${u.id}, ${u.is_active})">
                ${u.is_active ? 'Block' : 'Active'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openEditUserModal(userId) {
    const u = this.users.find(usr => usr.id === userId);
    if (!u) return;

    document.getElementById('editUserId').value = u.id;
    document.getElementById('editUserFullName').value = u.full_name || '';
    document.getElementById('editUserEmail').value = u.email || '';
    document.getElementById('editUserRole').value = u.role_id;
    document.getElementById('editUserDepartment').value = u.department || '';
    document.getElementById('editUserPhone').value = u.phone || '';
    document.getElementById('editUserActive').value = u.is_active ? '1' : '0';

    ui.openModal('editUserModal');
  },

  async submitEditUser() {
    const id = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editUserFullName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const roleId = parseInt(document.getElementById('editUserRole').value, 10);
    const department = document.getElementById('editUserDepartment').value.trim();
    const phone = document.getElementById('editUserPhone').value.trim();
    const isActive = document.getElementById('editUserActive').value === '1';

    if (!email || !fullName) {
      ui.showToast('Full name and email are required.', 'error');
      return;
    }

    try {
      await api.put(`/admin/users/${id}`, {
        email,
        role_id: roleId,
        is_active: isActive,
        full_name: fullName,
        department,
        phone
      });
      ui.showToast('User account updated successfully.', 'success');
      ui.closeModal('editUserModal');
      await this.loadUsers();
    } catch (e) {
      ui.showToast(e.message || 'Failed to update user.', 'error');
    }
  },

  openChangePasswordModal(id, isStudent, name, email) {
    document.getElementById('pwdUserId').value = id;
    document.getElementById('pwdIsStudent').value = isStudent;
    document.getElementById('pwdTargetUserName').textContent = name;
    document.getElementById('pwdTargetUserEmail').textContent = email;
    document.getElementById('newCustomPassword').value = '123456';

    ui.openModal('changePasswordModal');
    setTimeout(() => document.getElementById('newCustomPassword')?.focus(), 80);
  },

  async submitChangePassword() {
    const id = document.getElementById('pwdUserId').value;
    const isStudent = document.getElementById('pwdIsStudent').value === '1';
    const newPassword = document.getElementById('newCustomPassword').value.trim();

    if (!newPassword || newPassword.length < 3) {
      ui.showToast('Password must be at least 3 characters long.', 'warning');
      return;
    }

    try {
      const url = isStudent ? `/admin/students/${id}/password` : `/admin/users/${id}/password`;
      const res = await api.post(url, { newPassword });
      ui.showToast(res.message || `Password successfully changed to "${newPassword}".`, 'success');
      ui.closeModal('changePasswordModal');
    } catch (e) {
      ui.showToast(e.message || 'Failed to update password.', 'error');
    }
  },

  async toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus ? 0 : 1;
    try {
      await api.post(`/admin/users/${userId}/status`, { isActive: newStatus });
      ui.showToast(`User account #${userId} marked ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`, 'info');
      await this.loadUsers();
    } catch (e) {
      ui.showToast(e.message || 'Failed to toggle status.', 'error');
    }
  },

  openNewUserModal() {
    document.getElementById('newFullName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newPassword').value = '123456';
    document.getElementById('newDepartment').value = '';
    document.getElementById('newPhone').value = '';
    ui.openModal('newUserModal');
  },

  async submitNewUser() {
    const fullName = document.getElementById('newFullName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const roleId = parseInt(document.getElementById('newRole').value, 10);
    const department = document.getElementById('newDepartment').value.trim();
    const phone = document.getElementById('newPhone').value.trim();

    if (!fullName || !email || !password) {
      ui.showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    try {
      await api.post('/admin/users', {
        full_name: fullName,
        email,
        password,
        role_id: roleId,
        department,
        phone
      });
      ui.showToast(`User ${email} created successfully.`, 'success');
      ui.closeModal('newUserModal');
      await this.loadUsers();
    } catch (e) {
      ui.showToast(e.message || 'Failed to create user.', 'error');
    }
  },

  // 3. STUDENT CREDENTIALS & PROFILE MASTER
  debounceSearchStudents() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadStudents(), 300);
  },

  async loadStudents() {
    const tbody = document.getElementById('studentsMasterTbody');
    if (!tbody) return;

    const search = document.getElementById('studentSearchInput')?.value || '';
    let url = `/admin/students?limit=100`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
      const res = await api.get(url);
      this.students = res?.data?.students || [];

      const totalEl = document.getElementById('statTotalStudents');
      if (totalEl) totalEl.textContent = res?.data?.pagination?.total || this.students.length;

      this.renderStudentsTable();
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger-rose); padding: 1.5rem;">Failed to load students: ${e.message}</td></tr>`;
    }
  },

  renderStudentsTable() {
    const tbody = document.getElementById('studentsMasterTbody');
    if (!tbody) return;

    if (this.students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No student records found.</td></tr>';
      return;
    }

    tbody.innerHTML = this.students.map(s => {
      // Format DOB to DDMMYYYY passcode
      let dobPasscode = 'DDMMYYYY';
      if (s.dob) {
        const parts = String(s.dob).split(/[-/T]/);
        if (parts.length >= 3) {
          dobPasscode = `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
        }
      }

      return `
        <tr>
          <td><strong style="color: var(--primary-navy); font-family: monospace;">#${s.id}</strong></td>
          <td>
            <strong>${escapeHtml(s.roll_no || s.reg_no)}</strong>
            <br><code style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(s.reg_no)}</code>
          </td>
          <td>
            <div style="font-weight: 700; color: #0F172A;">${escapeHtml(s.full_name)}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${escapeHtml(s.category || 'General')} • ${escapeHtml(s.gender || 'Male')}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--brand-blue);">${escapeHtml(s.branch_code || s.branch_name || 'B.Tech')}</div>
            <span class="badge badge-neutral" style="font-size: 0.72rem;">${escapeHtml(s.semester_label || '1st Semester')}</span>
          </td>
          <td>
            <code style="font-size: 0.78rem; color: #1E40AF;">${escapeHtml(s.email || 'N/A')}</code>
          </td>
          <td>
            <span class="badge" style="background: #FEF3C7; color: #92400E; font-family: monospace; font-weight: 800; font-size: 0.8rem; border: 1px solid #FCD34D;">
              ${dobPasscode}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="action-btn-group">
              <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" 
                onclick="masterControl.openEditStudentModal(${s.id})">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF;" 
                onclick="masterControl.openChangePasswordModal(${s.id}, 1, '${escapeHtml(s.full_name)}', '${escapeHtml(s.email)}')">
                🔑 New Pass
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openEditStudentModal(studentId) {
    const s = this.students.find(stu => stu.id === studentId);
    if (!s) return;

    document.getElementById('editStudentId').value = s.id;
    document.getElementById('editStudentFullName').value = s.full_name || '';
    document.getElementById('editStudentRegNo').value = s.reg_no || '';
    document.getElementById('editStudentRollNo').value = s.roll_no || s.reg_no || '';
    document.getElementById('editStudentEmail').value = s.email || '';
    document.getElementById('editStudentPhone').value = s.phone || '';
    if (s.branch_id) document.getElementById('editStudentBranch').value = s.branch_id;
    if (s.current_semester_id) document.getElementById('editStudentSemester').value = s.current_semester_id;

    ui.openModal('editStudentModal');
  },

  async submitEditStudent() {
    const id = document.getElementById('editStudentId').value;
    const fullName = document.getElementById('editStudentFullName').value.trim();
    const regNo = document.getElementById('editStudentRegNo').value.trim();
    const rollNo = document.getElementById('editStudentRollNo').value.trim();
    const email = document.getElementById('editStudentEmail').value.trim();
    const phone = document.getElementById('editStudentPhone').value.trim();
    const branchId = parseInt(document.getElementById('editStudentBranch').value, 10);
    const semesterId = parseInt(document.getElementById('editStudentSemester').value, 10);

    if (!fullName || !regNo) {
      ui.showToast('Student name and registration number are required.', 'error');
      return;
    }

    try {
      await api.put(`/admin/students/${id}/profile`, {
        full_name: fullName,
        reg_no: regNo,
        roll_no: rollNo,
        email,
        phone,
        branch_id: branchId,
        current_semester_id: semesterId
      });
      ui.showToast('Student profile updated successfully.', 'success');
      ui.closeModal('editStudentModal');
      await this.loadStudents();
    } catch (e) {
      ui.showToast(e.message || 'Failed to update student profile.', 'error');
    }
  },

  // 4. SEMESTER REGISTRATION WINDOWS MASTER
  async loadWindows() {
    const tbody = document.getElementById('windowsMasterTbody');
    if (!tbody) return;

    try {
      const res = await api.get('/registration/exam-section/windows');
      this.windows = res?.data?.windows || [];
      this.renderWindowsTable();
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger-rose); padding: 1.5rem;">Could not load registration windows: ${e.message}</td></tr>`;
    }
  },

  renderWindowsTable() {
    const tbody = document.getElementById('windowsMasterTbody');
    if (!tbody) return;

    tbody.innerHTML = this.windows.map(w => {
      const isOpen = Boolean(w.is_open);
      const semNo = w.semester;
      const semLabel = w.semester_label || `Semester ${semNo}`;
      const badge = isOpen 
        ? `<span class="badge badge-success" style="font-weight: 800; font-size: 0.8rem;">OPEN (ACTIVE)</span>`
        : `<span class="badge badge-danger" style="font-weight: 800; font-size: 0.8rem;">LOCKED (CLOSED)</span>`;

      return `
        <tr>
          <td><strong style="color: var(--primary-navy); font-size: 0.95rem;">${escapeHtml(semLabel)}</strong></td>
          <td>${escapeHtml(w.academic_year || '2026-27')}</td>
          <td>${badge}</td>
          <td><small>${w.start_date ? new Date(w.start_date).toLocaleDateString('en-IN') : 'Immediate'}</small></td>
          <td><small>${w.end_date ? new Date(w.end_date).toLocaleDateString('en-IN') : 'No Deadline'}</small></td>
          <td><strong>₹${parseFloat(w.late_fine_amount || 500).toLocaleString('en-IN')}</strong></td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-sm ${isOpen ? 'btn-ghost-danger' : 'btn-primary'}" 
              onclick="masterControl.toggleWindow(${semNo}, ${isOpen ? 1 : 0})">
              ${isOpen ? '🔒 Lock Window' : '🔓 Open Window'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async toggleWindow(sem, currentOpen) {
    try {
      const res = await api.put(`/registration/exam-section/windows/${sem}/toggle`, {});
      ui.showToast(res.message || `Semester ${sem} window toggled.`, 'success');
      await this.loadWindows();
    } catch (e) {
      ui.showToast(e.message || 'Failed to toggle window.', 'error');
    }
  },

  // 5. RBAC PERMISSIONS MATRIX
  renderRbacMatrix() {
    const tbody = document.getElementById('rbacMatrixTbody');
    if (!tbody) return;

    const capabilities = [
      { name: 'View Financial Dashboard & Collections', roles: [1, 1, 1, 1, 0, 1, 1, 1] },
      { name: 'Fast e-Receipt Cutting & Cash Drawer', roles: [1, 1, 1, 1, 0, 0, 0, 0] },
      { name: 'Edit & Create Invoices / Ledgers', roles: [1, 1, 1, 0, 0, 0, 0, 0] },
      { name: 'Approve Refunds & Fee Adjustments', roles: [1, 1, 0, 0, 0, 0, 0, 0] },
      { name: 'Verify BPUT Subject Registrations (HOD)', roles: [1, 0, 0, 0, 0, 1, 0, 0] },
      { name: 'Academic Director Final Clearance', roles: [1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Examination Section Admit Card & Window Control', roles: [1, 0, 0, 0, 1, 0, 0, 0] },
      { name: 'Edit All User Roles & Reset Passwords', roles: [1, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'Inspect Immutable Audit Trails', roles: [1, 1, 0, 0, 0, 0, 1, 1] },
      { name: 'Student 360 Profile & Passcode Reset', roles: [1, 1, 1, 0, 0, 0, 0, 0] }
    ];

    tbody.innerHTML = capabilities.map(cap => `
      <tr>
        <td style="font-weight: 700; color: #1E293B;">${cap.name}</td>
        ${cap.roles.map(r => r ? '<td style="text-align: center; color: #15803D; font-weight: 800; font-size: 1.1rem;">✓</td>' : '<td style="text-align: center; color: #CBD5E1;">—</td>').join('')}
      </tr>
    `).join('');
  },

  // 6. LIVE AUDIT TRAIL
  async loadAuditLogs() {
    const tbody = document.getElementById('auditMasterTbody');
    if (!tbody) return;

    try {
      const res = await api.get('/admin/audit-logs');
      const logs = (res?.data && res?.data?.logs) || (Array.isArray(res?.data) ? res.data : []);
      if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No audit events recorded yet.</td></tr>';
        return;
      }

      tbody.innerHTML = logs.slice(0, 50).map(l => `
        <tr>
          <td><small style="color: var(--text-muted);">${new Date(l.created_at).toLocaleString('en-IN')}</small></td>
          <td>
            <strong>${escapeHtml(l.role || 'ADMIN')}</strong>
            ${l.user_id ? `<br><small style="color: var(--text-muted);">User #${l.user_id}</small>` : ''}
          </td>
          <td><span class="badge badge-neutral" style="font-weight: 700;">${escapeHtml(l.action)}</span></td>
          <td><span class="badge" style="background: #EFF6FF; color: #1E40AF;">${escapeHtml(l.module)}</span></td>
          <td style="font-size: 0.85rem; color: #334155;">${escapeHtml(l.reason || '-')}</td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Audit log stream active.</td></tr>`;
    }
  }
};
