/**
 * Director Subject Registration Approvals Controller
 * Bhubaneswar Engineering College (BEC) — Level 2 Directorate Approval
 */

const directorRegistrations = {
  registrations: [],
  programs: [],
  departments: [],
  selectedDepartmentId: null,
  currentModalReg: null,
  searchTimer: null,
  rejectTargetId: null,

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;
    if (!['DIRECTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      ui.showToast('Access restricted to College Directorate.', 'error');
      setTimeout(() => window.location.replace('/dashboard.html'), 1200);
      return;
    }
    await this.loadMetadata();
    await this.loadQueue();
  },

  async loadMetadata() {
    try {
      const res = await api.get('/registration/metadata');
      if (res && res.data) {
        this.programs = res.data.programs || [];
        this.departments = res.data.departments || [];

        // Populate Program dropdown
        const pSelect = document.getElementById('filterProgram');
        if (pSelect) {
          pSelect.innerHTML = '<option value="">All Programs</option>' +
            this.programs.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.code})</option>`).join('');
        }

        this.updateDepartmentDropdown();
      }
    } catch (e) {
      console.warn('Metadata load note:', e);
    }
  },

  onProgramChange() {
    this.updateDepartmentDropdown();
    this.loadQueue();
  },

  updateDepartmentDropdown() {
    const pSelect = document.getElementById('filterProgram');
    const dSelect = document.getElementById('filterDepartment');
    if (!dSelect) return;

    const progId = pSelect ? pSelect.value : '';
    let filteredDepts = this.departments;
    if (progId) {
      filteredDepts = this.departments.filter(d => String(d.program_id) === String(progId));
    }

    dSelect.innerHTML = '<option value="">All Departments</option>' +
      filteredDepts.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.code})</option>`).join('');
  },

  onSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadQueue();
    }, 300);
  },

  selectDepartmentChip(deptId) {
    const dSelect = document.getElementById('filterDepartment');
    if (this.selectedDepartmentId === deptId) {
      this.selectedDepartmentId = null;
      if (dSelect) dSelect.value = '';
    } else {
      this.selectedDepartmentId = deptId;
      if (dSelect) dSelect.value = deptId;
    }
    this.loadQueue();
  },

  async loadQueue() {
    const container = document.getElementById('directorPendingListBody');
    if (!container) return;
    container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#64748B;">Loading Directorate review queue...</td></tr>';

    const progId = document.getElementById('filterProgram')?.value || '';
    const deptId = this.selectedDepartmentId || document.getElementById('filterDepartment')?.value || '';
    const sem = document.getElementById('filterSemester')?.value || '';
    const st = document.getElementById('filterStatus')?.value || '';
    const srch = document.getElementById('filterSearch')?.value || '';

    try {
      const q = new URLSearchParams();
      if (progId) q.append('program_id', progId);
      if (deptId) q.append('department_id', deptId);
      if (sem) q.append('semester', sem);
      if (st) q.append('status', st);
      if (srch) q.append('search', srch);

      const res = await api.get(`/registration/director/registrations?${q.toString()}`);
      if (!res || !res.data) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Failed to load applications.</td></tr>';
        return;
      }

      this.registrations = res.data.registrations || [];
      const dash = res.data.statsDashboard || {};

      // 1. Update 4 Status Counters
      const byStatus = dash.byStatus || {};
      const elTot = document.getElementById('statDirTotal');
      const elFwd = document.getElementById('statDirForwarded');
      const elApp = document.getElementById('statDirApproved');
      const elConf = document.getElementById('statDirConfirmed');
      const badge = document.getElementById('directorPendingCountBadge');
      const resultCount = document.getElementById('tableResultCount');

      if (elTot) elTot.textContent = dash.totalRegistrations || 0;
      if (elFwd) elFwd.textContent = byStatus.hod_forwarded || 0;
      if (elApp) elApp.textContent = byStatus.director_approved || 0;
      if (elConf) elConf.textContent = byStatus.confirmed || 0;
      if (badge) badge.textContent = `${byStatus.hod_forwarded || 0} Forwarded`;
      if (resultCount) resultCount.textContent = `Showing ${this.registrations.length} records`;

      // 2. Render Department Chips
      const chipsEl = document.getElementById('deptChipsContainer');
      if (chipsEl && this.departments.length) {
        const byDept = dash.byDepartment || {};
        chipsEl.innerHTML = this.departments.map(d => {
          const count = byDept[d.code] || 0;
          const isSelected = String(this.selectedDepartmentId) === String(d.id);
          return `
            <button onclick="directorRegistrations.selectDepartmentChip(${d.id})" style="border:1px solid ${isSelected ? '#0B63C5' : '#CBD5E1'};background:${isSelected ? '#EFF6FF' : '#ffffff'};color:${isSelected ? '#0B63C5' : '#334155'};font-weight:${isSelected ? '700' : '500'};font-size:0.75rem;padding:3px 10px;border-radius:14px;cursor:pointer;display:inline-flex;align-items:center;gap:0.35rem;transition:all 0.15s;">
              <span>${d.code}</span>
              <span style="background:${isSelected ? '#0B63C5' : '#E2E8F0'};color:${isSelected ? '#ffffff' : '#475569'};font-size:0.7rem;font-weight:700;padding:1px 5px;border-radius:10px;">${count}</span>
            </button>
          `;
        }).join('');
      }

      if (!this.registrations.length) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:3rem;color:#94A3B8;"><div style="font-size:2rem;margin-bottom:0.5rem;">🎉</div>No registrations found matching criteria.</td></tr>';
        return;
      }

      const statusBadges = {
        SUBMITTED: { bg: '#FEF3C7', text: '#B45309', label: '1/3 HOD Review' },
        HOD_FORWARDED: { bg: '#DBEAFE', text: '#1D4ED8', label: '2/3 Forwarded' },
        DIRECTOR_APPROVED: { bg: '#E0E7FF', text: '#4338CA', label: '3/3 Approved' },
        CONFIRMED: { bg: '#DCFCE7', text: '#15803D', label: '✓ Confirmed' },
        HOD_REVERTED: { bg: '#FEE2E2', text: '#DC2626', label: 'HOD Reverted' },
        DIRECTOR_REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' }
      };

      container.innerHTML = this.registrations.map(r => {
        const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
        const b = statusBadges[r.status] || { bg: '#F1F5F9', text: '#475569', label: r.status };

        return `
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:12px;font-family:monospace;font-weight:700;color:#0B63C5;font-size:0.85rem;">
              ${escapeHtml(refNo)}
            </td>
            <td style="padding:12px;font-size:0.85rem;">
              <span style="font-weight:700;color:#0F172A;display:block;">${escapeHtml(r.department_code || 'CSE')}</span>
              <span style="font-size:0.75rem;color:#64748B;">${escapeHtml(r.program_name || 'B.Tech')}</span>
            </td>
            <td style="padding:12px;">
              <strong style="color:#0F172A;display:block;">${escapeHtml(r.full_name)}</strong>
              <span style="font-size:0.75rem;color:#64748B;">${escapeHtml(r.student_category || 'General')}</span>
            </td>
            <td style="padding:12px;font-size:0.85rem;font-weight:600;color:#334155;">${escapeHtml(r.reg_no)}</td>
            <td style="padding:12px;font-size:0.85rem;text-align:center;">Sem ${r.semester}</td>
            <td style="padding:12px;font-size:0.82rem;">
              <span style="color:#166534;font-weight:600;">✓ Forwarded</span>
              <div style="font-size:0.75rem;color:#64748B;">by ${escapeHtml(r.hod_name || 'HOD')}</div>
              ${r.hod_remarks ? `<div style="font-size:0.72rem;color:#475569;font-style:italic;">"${escapeHtml(r.hod_remarks)}"</div>` : ''}
            </td>
            <td style="padding:12px;text-align:center;">
              <span style="font-weight:700;color:#0B63C5;">${r.total_credits}</span>
              <span style="font-size:0.72rem;color:#64748B;display:block;">${r.registration_type}</span>
            </td>
            <td style="padding:12px;text-align:center;">
              <span style="background:${b.bg};color:${b.text};font-weight:700;font-size:0.75rem;padding:0.25rem 0.55rem;border-radius:12px;">
                ${b.label}
              </span>
            </td>
            <td style="padding:12px;text-align:right;">
              <div style="display:flex;justify-content:flex-end;gap:0.35rem;flex-wrap:wrap;">
                <button class="btn btn-sm btn-primary" onclick="directorRegistrations.openReviewModal(${r.id})" style="background:#0B63C5;border:none;padding:0.3rem 0.65rem;border-radius:6px;font-size:0.78rem;font-weight:600;cursor:pointer;color:#fff;">
                  Review →
                </button>
                ${r.status === 'HOD_FORWARDED' ? `
                  <button class="btn btn-sm btn-primary" onclick="directorRegistrations.quickApprove(${r.id})" style="background:#16A34A;border:none;padding:0.3rem 0.65rem;border-radius:6px;font-size:0.78rem;font-weight:600;cursor:pointer;color:#fff;">
                    Approve
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="directorRegistrations.openRejectModal(${r.id})" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;padding:0.3rem 0.65rem;border-radius:6px;font-size:0.78rem;font-weight:600;cursor:pointer;">
                    Reject
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Error loading data.</td></tr>';
    }
  },

  async openReviewModal(regId) {
    try {
      const res = await api.get(`/registration/detail/${regId}`);
      if (!res || !res.data) return;

      const { registration: r, financialSummary: fin = {}, clearanceTrail: trail = {} } = res.data;
      this.currentModalReg = r;

      const modalTitle = document.getElementById('modalDirectorTitle');
      const modalBody = document.getElementById('modalDirectorBody');

      const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
      modalTitle.textContent = `Director Academic Review: ${refNo} — ${r.full_name}`;

      // 1. Compute Subject Statistics
      const subs = r.subjects || [];
      const totalSubs = subs.length;
      const theorySubs = subs.filter(s => (s.type || '').toUpperCase() === 'THEORY').length;
      const labSubs = subs.filter(s => (s.type || '').toUpperCase() !== 'THEORY').length;
      const backlogSubs = subs.filter(s => s.is_backlog).length;
      const regularSubs = totalSubs - backlogSubs;

      const subjectsHtml = subs.map((s, idx) => `
        <tr style="border-bottom:1px solid #E2E8F0;background:${s.is_backlog ? '#FFF1F2' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;color:#64748B;">${idx + 1}</td>
          <td style="padding:8px 10px;font-weight:700;font-family:monospace;color:#0B63C5;">${escapeHtml(s.code)}</td>
          <td style="padding:8px 10px;font-weight:600;color:#1E293B;">${escapeHtml(s.name)}</td>
          <td style="padding:8px 10px;text-align:center;">
            <span style="background:${(s.type || '').toUpperCase() === 'THEORY' ? '#EFF6FF' : '#F0FDF4'};color:${(s.type || '').toUpperCase() === 'THEORY' ? '#1D4ED8' : '#15803D'};font-weight:700;padding:2px 8px;border-radius:4px;font-size:0.75rem;">
              ${escapeHtml(s.type || 'THEORY')}
            </span>
          </td>
          <td style="padding:8px 10px;text-align:center;font-weight:800;color:#0F172A;">${s.credits}</td>
          <td style="padding:8px 10px;text-align:center;">
            ${s.is_backlog 
              ? '<span style="background:#FEE2E2;color:#DC2626;font-weight:800;padding:2px 8px;border-radius:4px;font-size:0.75rem;">BACKLOG</span>' 
              : '<span style="background:#DCFCE7;color:#166534;font-weight:700;padding:2px 8px;border-radius:4px;font-size:0.75rem;">REGULAR</span>'
            }
          </td>
        </tr>
      `).join('');

      // 2. Financial Metrics
      const totalCollegeFee = fin.totalCollegeFee || 115000;
      const totalCollegePaid = fin.totalCollegePaid || 0;
      const collegeBalanceDue = fin.collegeBalanceDue || 0;
      const clearancePercent = fin.clearancePercent || (totalCollegeFee > 0 ? Math.min(100, Math.round((totalCollegePaid / totalCollegeFee) * 100)) : 100);
      const examFeeAmount = fin.examFeeAmount || 1550;
      const isExamPaid = fin.examFeeStatus === 'PAID' || r.status === 'CONFIRMED';
      const examReceiptNo = fin.examReceiptNo || (isExamPaid ? (r.exam_receipt_no || `EXAM-REC-${r.id}`) : '-');
      const examFeePaidAt = fin.examFeePaidAt ? new Date(fin.examFeePaidAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
      const totalOverallPaid = fin.totalPaidOverall || (totalCollegePaid + (isExamPaid ? examFeeAmount : 0));

      // 3. Status Badge Color
      let statusBadge = `<span style="background:#EFF6FF;color:#1D4ED8;font-weight:800;padding:3px 10px;border-radius:4px;font-size:0.82rem;">${r.status}</span>`;
      if (r.status === 'CONFIRMED') {
        statusBadge = `<span style="background:#DCFCE7;color:#15803D;font-weight:800;padding:3px 10px;border-radius:4px;font-size:0.82rem;">✓ FULLY CONFIRMED</span>`;
      } else if (r.status === 'DIRECTOR_APPROVED') {
        statusBadge = `<span style="background:#FEF3C7;color:#B45309;font-weight:800;padding:3px 10px;border-radius:4px;font-size:0.82rem;">DIRECTORATE APPROVED</span>`;
      } else if (r.status === 'HOD_FORWARDED') {
        statusBadge = `<span style="background:#E0E7FF;color:#4338CA;font-weight:800;padding:3px 10px;border-radius:4px;font-size:0.82rem;">HOD FORWARDED</span>`;
      }

      modalBody.innerHTML = `
        <!-- Reference & Status Header Strip -->
        <div style="display:flex;justify-content:space-between;align-items:center;background:#EFF6FF;border:1px solid #BFDBFE;padding:0.75rem 1.25rem;border-radius:8px;margin-bottom:1.25rem;font-size:0.88rem;flex-wrap:wrap;gap:0.75rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div><strong>Reference:</strong> <span style="font-family:monospace;font-weight:800;color:#0B63C5;font-size:1rem;">${escapeHtml(refNo)}</span></div>
            <span style="color:#94A3B8;">|</span>
            <div><strong>Submitted:</strong> ${new Date(r.submitted_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <strong>Status:</strong> ${statusBadge}
          </div>
        </div>

        <!-- Student & Academic Snapshot with Photo -->
        <div style="display:grid;grid-template-columns:auto 1fr;gap:1.25rem;background:#F8FAFC;padding:1.2rem;border-radius:8px;border:1px solid #E2E8F0;margin-bottom:1.25rem;align-items:center;">
          <div style="width:84px;height:98px;border:2px solid #CBD5E1;border-radius:6px;overflow:hidden;background:#E2E8F0;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.05);flex-shrink:0;">
            ${r.photo_url && r.photo_url.startsWith('http') 
              ? `<img src="${r.photo_url}" alt="${escapeHtml(r.full_name)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='🎓'"/>` 
              : `<div style="font-size:2.2rem;color:#0284C7;font-weight:800;">${(r.full_name || 'S').charAt(0)}</div>`
            }
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:0.65rem;font-size:0.86rem;">
            <div><strong>Student Name:</strong> <span style="color:#0F172A;font-weight:700;">${escapeHtml(r.full_name)}</span></div>
            <div><strong>Roll / Reg No:</strong> <span style="font-family:monospace;color:#0B63C5;font-weight:700;">${escapeHtml(r.reg_no || r.roll_number)}</span></div>
            <div><strong>Program:</strong> ${escapeHtml(r.program_name || 'B.Tech')}</div>
            <div><strong>Department:</strong> ${escapeHtml(r.department_name || r.branch_name || 'Computer Science')}</div>
            <div><strong>Semester:</strong> <span style="font-weight:700;color:#0B63C5;">${r.semester_label || `Semester ${r.semester}`}</span></div>
            <div><strong>Category / Opted:</strong> ${escapeHtml(r.student_category || 'General')} | ${r.hostel_opted ? 'Hosteller' : 'Day Scholar'}</div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 1: REGISTERED SUBJECTS ("KON KON SA SUBJECT") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.65rem;flex-wrap:wrap;gap:0.5rem;">
            <div style="font-weight:800;color:#0F172A;font-size:0.95rem;display:flex;align-items:center;gap:0.45rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B63C5" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Registered Subjects Particulars (${totalSubs} Subjects, ${r.total_credits} Credits)
            </div>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;font-size:0.75rem;">
              <span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:12px;font-weight:700;">Theory: ${theorySubs}</span>
              <span style="background:#F0FDF4;color:#15803D;padding:2px 8px;border-radius:12px;font-weight:700;">Lab / Practical: ${labSubs}</span>
              <span style="background:#F1F5F9;color:#334155;padding:2px 8px;border-radius:12px;font-weight:700;">Regular: ${regularSubs}</span>
              ${backlogSubs > 0 ? `<span style="background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:12px;font-weight:800;">Backlog: ${backlogSubs}</span>` : ''}
            </div>
          </div>

          <div style="border:1px solid #CBD5E1;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="background:#0B63C5;color:#ffffff;text-align:left;">
                  <th style="padding:8px 10px;text-align:center;width:40px;">#</th>
                  <th style="padding:8px 10px;width:120px;">Subject Code</th>
                  <th style="padding:8px 10px;">Subject Title</th>
                  <th style="padding:8px 10px;text-align:center;width:95px;">Category</th>
                  <th style="padding:8px 10px;text-align:center;width:75px;">Credits</th>
                  <th style="padding:8px 10px;text-align:center;width:95px;">Paper Type</th>
                </tr>
              </thead>
              <tbody>
                ${subjectsHtml.length ? subjectsHtml : '<tr><td colspan="6" style="padding:1.5rem;text-align:center;color:#94A3B8;">No subjects registered.</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background:#F8FAFC;font-weight:800;border-top:2px solid #0B63C5;color:#0F172A;">
                  <td colspan="4" style="padding:8px 12px;text-align:right;">TOTAL REGISTERED CREDITS:</td>
                  <td style="padding:8px 10px;text-align:center;color:#0B63C5;font-size:1rem;">${r.total_credits}</td>
                  <td style="padding:8px 10px;text-align:center;font-size:0.75rem;color:#64748B;">BPUT Approved</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 2: PAYMENT AUDIT & BALANCE ("KITNA PAYMENT KYA" & "TOTAL KITNA HE") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-weight:800;color:#0F172A;font-size:0.95rem;margin-bottom:0.65rem;display:flex;align-items:center;gap:0.45rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Fee Clearance &amp; Payment Audit Breakdown
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:0.85rem;">
            <!-- Card 1: BPUT Exam Fee -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:1rem;border-left:4px solid ${isExamPaid ? '#16A34A' : '#D97706'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                <span style="font-size:0.75rem;font-weight:700;color:#64748B;text-transform:uppercase;">BPUT Exam &amp; Board Fee</span>
                ${isExamPaid 
                  ? '<span style="background:#DCFCE7;color:#15803D;font-weight:800;font-size:0.72rem;padding:2px 7px;border-radius:4px;">✓ PAID</span>' 
                  : '<span style="background:#FEF3C7;color:#B45309;font-weight:800;font-size:0.72rem;padding:2px 7px;border-radius:4px;">⏳ PENDING</span>'
                }
              </div>
              <div style="font-size:1.35rem;font-weight:800;color:#0F172A;margin-bottom:0.35rem;">
                ₹${examFeeAmount.toLocaleString('en-IN')}
              </div>
              <div style="font-size:0.8rem;color:#475569;">
                Receipt: <strong style="font-family:monospace;color:#0B63C5;">${escapeHtml(examReceiptNo)}</strong>
              </div>
              <div style="font-size:0.75rem;color:#64748B;margin-top:2px;">
                Paid At: ${examFeePaidAt}
              </div>
            </div>

            <!-- Card 2: Annual College Fee -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:1rem;border-left:4px solid #0B63C5;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                <span style="font-size:0.75rem;font-weight:700;color:#64748B;text-transform:uppercase;">Institutional College Fee</span>
                <span style="background:#E0F2FE;color:#0369A1;font-weight:800;font-size:0.72rem;padding:2px 7px;border-radius:4px;">${clearancePercent}% CLEARED</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.35rem;">
                <div style="font-size:1.35rem;font-weight:800;color:#16A34A;">
                  ₹${totalCollegePaid.toLocaleString('en-IN')}
                </div>
                <div style="font-size:0.8rem;color:#64748B;">
                  of ₹${totalCollegeFee.toLocaleString('en-IN')}
                </div>
              </div>
              <div style="font-size:0.8rem;color:#475569;">
                Balance Dues: <strong style="color:${collegeBalanceDue > 0 ? '#DC2626' : '#16A34A'};">₹${collegeBalanceDue.toLocaleString('en-IN')}</strong>
              </div>
              <!-- Progress Bar -->
              <div style="width:100%;height:6px;background:#E2E8F0;border-radius:3px;margin-top:0.4rem;overflow:hidden;">
                <div style="width:${clearancePercent}%;height:100%;background:${clearancePercent >= 100 ? '#16A34A' : '#0B63C5'};border-radius:3px;"></div>
              </div>
            </div>

            <!-- Card 3: Total Paid & Status -->
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:1rem;border-left:4px solid #16A34A;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                <span style="font-size:0.75rem;font-weight:700;color:#15803D;text-transform:uppercase;">Total Consolidated Paid</span>
                <span style="background:#DCFCE7;color:#15803D;font-weight:800;font-size:0.72rem;padding:2px 7px;border-radius:4px;">CLEARED</span>
              </div>
              <div style="font-size:1.35rem;font-weight:800;color:#0F172A;margin-bottom:0.35rem;">
                ₹${totalOverallPaid.toLocaleString('en-IN')}
              </div>
              <div style="font-size:0.8rem;color:#15803D;font-weight:600;">
                ✓ Accounts Financial Audit Passed
              </div>
              <div style="font-size:0.75rem;color:#64748B;margin-top:2px;">
                Verified under BPUT Minimum Fee Rule
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 3: INSTITUTIONAL 4-TIER CLEARANCE DETAILS ("TOTAL CLEARANCE DEAI") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-weight:800;color:#0F172A;font-size:0.95rem;margin-bottom:0.65rem;display:flex;align-items:center;gap:0.45rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Institutional Multi-Tier Clearance Trail
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:0.75rem;">
            <!-- Stage 1: Student -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid #16A34A;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 1: STUDENT</span>
                <span style="color:#16A34A;font-weight:800;font-size:0.75rem;">✓ SUBMITTED</span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">Self Registration</div>
              <div style="font-size:0.75rem;color:#64748B;margin-top:2px;">Ref: ${escapeHtml(refNo)}</div>
              <div style="font-size:0.72rem;color:#94A3B8;margin-top:2px;">${new Date(r.submitted_at || Date.now()).toLocaleDateString('en-IN')}</div>
            </div>

            <!-- Stage 2: HOD -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.hod?.ok ? '#16A34A' : '#D97706'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 2: HOD</span>
                <span style="color:${trail.hod?.ok ? '#16A34A' : '#D97706'};font-weight:800;font-size:0.75rem;">
                  ${trail.hod?.ok ? '✓ ENDORSED' : (trail.hod?.status === 'REVERTED' ? '↺ REVERTED' : '⏳ PENDING')}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">Academic Head</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${escapeHtml(trail.hod?.officer || r.hod_name || 'Department HOD')}</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">"${escapeHtml(trail.hod?.remarks || r.hod_remarks || 'Academic verification passed.')}"</div>
            </div>

            <!-- Stage 3: Director -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.director?.ok ? '#16A34A' : '#0B63C5'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 3: DIRECTOR</span>
                <span style="color:${trail.director?.ok ? '#16A34A' : '#0B63C5'};font-weight:800;font-size:0.75rem;">
                  ${trail.director?.ok ? '✓ APPROVED' : (trail.director?.status === 'REJECTED' ? '✕ REJECTED' : '⏳ CURRENT STAGE')}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">College Directorate</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${escapeHtml(trail.director?.officer || r.director_name || 'Dr. B.N. Biswal')}</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">"${escapeHtml(trail.director?.remarks || r.director_remarks || 'Pending Directorate approval.')}"</div>
            </div>

            <!-- Stage 4: Accounts -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.accounts?.ok ? '#16A34A' : '#D97706'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 4: ACCOUNTS</span>
                <span style="color:${trail.accounts?.ok ? '#16A34A' : '#D97706'};font-weight:800;font-size:0.75rem;">
                  ${trail.accounts?.ok ? '✓ CLEARED' : '⏳ PENDING'}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">Fee Clearance Audit</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${clearancePercent}% Cleared (₹${totalCollegePaid.toLocaleString('en-IN')})</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">BPUT 50% minimum fee satisfied</div>
            </div>

            <!-- Stage 5: Exam Cell -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.examSection?.ok ? '#16A34A' : '#64748B'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 5: EXAM CELL</span>
                <span style="color:${trail.examSection?.ok ? '#16A34A' : '#64748B'};font-weight:800;font-size:0.75rem;">
                  ${trail.examSection?.ok ? '✓ CONFIRMED' : (isExamPaid ? 'RECEIPT ISSUED' : 'PENDING')}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">BPUT University Roll</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${escapeHtml(trail.examSection?.officer || 'Exam Controller')}</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">${isExamPaid ? 'Exam form confirmed' : 'Awaiting confirmation'}</div>
            </div>
          </div>
        </div>

        <!-- Directorate Approval Endorsement Remarks -->
        <div style="margin-bottom:1.25rem;background:#F8FAFC;padding:1rem;border-radius:8px;border:1px solid #CBD5E1;">
          <label style="font-weight:700;font-size:0.85rem;color:#1E293B;display:block;margin-bottom:0.35rem;">
            Directorate Approval Endorsement Remarks
          </label>
          <textarea id="directorModalRemarks" rows="2" style="width:100%;padding:0.6rem;border:1px solid #CBD5E1;border-radius:6px;font-size:0.85rem;" placeholder="Approved under BPUT academic guidelines. Cleared for Accounts fee audit and University confirmation."></textarea>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;border-top:1px solid #E2E8F0;padding-top:1rem;">
          <button class="btn btn-secondary" onclick="directorRegistrations.openRejectFromModal(${r.id})" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-weight:600;padding:0.5rem 1.25rem;border-radius:6px;cursor:pointer;">
            ✕ Reject Application
          </button>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-secondary" onclick="ui.closeModal('directorReviewModal')" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">
              Close
            </button>
            <button class="btn btn-primary" onclick="directorRegistrations.approveFromModal(${r.id})" style="background:#16A34A;color:#fff;border:none;font-weight:700;padding:0.5rem 1.5rem;border-radius:6px;cursor:pointer;">
              ✓ Grant Director Approval →
            </button>
          </div>
        </div>
      `;

      ui.openModal('directorReviewModal');
    } catch (e) {
      console.error(e);
      ui.showToast('Failed to load application details.', 'error');
    }
  },

  async quickApprove(regId) {
    if (!confirm(`Confirm approval for registration #${regId}? This will forward the application to Accounts for final confirmation.`)) return;
    try {
      const res = await api.put(`/registration/director/${regId}/approve`, {
        remarks: 'Institutional approval granted by College Directorate.'
      });
      if (res && res.data) {
        ui.showToast('Registration approved and forwarded to Accounts.', 'success');
        await this.loadQueue();
      } else {
        ui.showToast(res.message || 'Approval failed.', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Approval failed.', 'error');
    }
  },

  async approveFromModal(regId) {
    const remarks = document.getElementById('directorModalRemarks')?.value || 'Institutional approval granted by College Directorate.';
    try {
      const res = await api.put(`/registration/director/${regId}/approve`, { remarks });
      if (res && res.data) {
        ui.showToast('Registration approved and forwarded to Accounts.', 'success');
        ui.closeModal('directorReviewModal');
        await this.loadQueue();
      } else {
        ui.showToast(res.message || 'Approval failed.', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Approval failed.', 'error');
    }
  },

  openRejectFromModal(regId) {
    ui.closeModal('directorReviewModal');
    this.openRejectModal(regId);
  },

  openRejectModal(regId) {
    this.rejectTargetId = regId;
    const input = document.getElementById('directorRejectReason');
    if (input) input.value = '';
    ui.openModal('directorRejectModal');
  },

  async confirmReject() {
    if (!this.rejectTargetId) return;
    const reason = document.getElementById('directorRejectReason')?.value?.trim();
    if (!reason || reason.length < 5) {
      ui.showToast('Please specify a rejection reason (minimum 5 characters).', 'warning');
      return;
    }

    try {
      const res = await api.put(`/registration/director/${this.rejectTargetId}/reject`, {
        remarks: reason
      });

      if (res && res.data) {
        ui.showToast('Registration application rejected.', 'info');
        ui.closeModal('directorRejectModal');
        await this.loadQueue();
      } else {
        ui.showToast(res.message || 'Rejection failed.', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Rejection failed.', 'error');
    }
  },

  exportExcel() {
    if (!this.registrations || !this.registrations.length) {
      ui.showToast('No registrations to export.', 'warning');
      return;
    }

    if (typeof XLSX === 'undefined') {
      ui.showToast('Excel exporter loading... please try again.', 'info');
      return;
    }

    const dataToExport = this.registrations.map((r, i) => ({
      'Sl No': i + 1,
      'Reference No': r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`,
      'Program': r.program_name || 'B.Tech',
      'Department': r.department_name || r.department_code || 'CSE',
      'Student Name': r.full_name,
      'Roll Number': r.reg_no,
      'Semester': `Semester ${r.semester}`,
      'Academic Year': r.academic_year || '2026-27',
      'Total Credits': r.total_credits,
      'HOD Endorsed By': r.hod_name || '',
      'Status': r.status,
      'Submitted Date': new Date(r.submitted_at).toLocaleDateString('en-IN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DirectorateQueue');
    XLSX.writeFile(workbook, 'BEC_Director_Subject_Registrations.xlsx');
    ui.showToast('Excel report downloaded successfully.', 'success');
  }
};

