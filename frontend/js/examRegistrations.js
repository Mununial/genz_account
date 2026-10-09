/**
 * College Examination Section Controller — Gen-Z University Exam Cell
 * Gen-Z University
 */

const examRegistrations = {
  queue: [],
  programs: [],
  departments: [],
  windows: [],
  searchTimeout: null,
  activeRegId: null,

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;

    if (!['EXAM_CELL', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD'].includes(user.role)) {
      ui.showToast('Access restricted to Examination Section & Administrative Officers.', 'error');
      setTimeout(() => window.location.replace('/dashboard.html'), 1200);
      return;
    }

    if (window.navigation) {
      navigation.init('exam-registrations');
    }

    await this.loadMetadata();
    await this.loadWindows();
    await this.loadQueue();
  },

  async loadMetadata() {
    try {
      const res = await api.get('/registration/metadata');
      if (res && res.data) {
        this.programs = res.data.programs || [];
        this.departments = res.data.departments || [];
        this.populateFilterDropdowns();
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  },

  populateFilterDropdowns() {
    const pSel = document.getElementById('filterProgram');
    if (pSel) {
      pSel.innerHTML = '<option value="">All Programs</option>' +
        this.programs.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.code})</option>`).join('');
    }

    this.onProgramChange();
  },

  onProgramChange() {
    const pSel = document.getElementById('filterProgram');
    const dSel = document.getElementById('filterDepartment');
    if (!dSel) return;

    const progId = pSel ? parseInt(pSel.value) : null;
    let filteredDepts = this.departments;
    if (progId) {
      filteredDepts = this.departments.filter(d => d.program_id === progId);
    }

    dSel.innerHTML = '<option value="">All Departments</option>' +
      filteredDepts.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.code})</option>`).join('');

    this.loadQueue();
  },

  onSearchInput() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadQueue(), 300);
  },

  async loadWindows() {
    const grid = document.getElementById('registrationWindowsGrid');
    if (!grid) return;

    try {
      const res = await api.get('/registration/exam-section/windows');
      this.windows = (res && res.data && res.data.windows) ? res.data.windows : [];
      this.renderWindows();
    } catch (e) {
      console.warn('Windows load error:', e);
      grid.innerHTML = '<div style="color:#DC2626;font-size:0.85rem;">Failed to load registration window toggles.</div>';
    }
  },

  renderWindows() {
    const grid = document.getElementById('registrationWindowsGrid');
    if (!grid) return;

    const years = [
      {
        yearNumber: 1,
        title: '1st Year (B.Tech)',
        semesters: [
          { sem: 1, isAdmission: true },
          { sem: 2, isAdmission: false }
        ]
      },
      {
        yearNumber: 2,
        title: '2nd Year (B.Tech)',
        semesters: [
          { sem: 3, isAdmission: false },
          { sem: 4, isAdmission: false }
        ]
      },
      {
        yearNumber: 3,
        title: '3rd Year (B.Tech)',
        semesters: [
          { sem: 5, isAdmission: false },
          { sem: 6, isAdmission: false }
        ]
      },
      {
        yearNumber: 4,
        title: '4th Year (B.Tech)',
        semesters: [
          { sem: 7, isAdmission: false },
          { sem: 8, isAdmission: false }
        ]
      }
    ];

    grid.innerHTML = years.map(y => {
      const semRows = y.semesters.map(sDef => {
        if (sDef.isAdmission) {
          return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0.6rem;background:#F8FAFC;border-radius:6px;border:1px solid #E2E8F0;margin-top:0.4rem;">
              <div>
                <strong style="color:#0F172A;font-size:0.84rem;">Semester 1</strong>
                <div style="font-size:0.7rem;color:#64748B;">Admission Onboarding</div>
              </div>
              <div>
                <span class="badge-admission">✓ Auto-Registered</span>
              </div>
            </div>
          `;
        }

        const win = this.windows.find(w => w.semester === sDef.sem) || { is_open: 1, status: 'OPEN' };
        const isOpen = win.is_open === 1 || win.status === 'OPEN';

        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0.6rem;background:${isOpen ? '#F0FDF4' : '#FEF2F2'};border-radius:6px;border:1px solid ${isOpen ? '#BBF7D0' : '#FECACA'};margin-top:0.4rem;">
            <div>
              <strong style="color:#0F172A;font-size:0.84rem;">Semester ${sDef.sem}</strong>
              <div style="font-size:0.7rem;color:${isOpen ? '#15803D' : '#991B1B'};font-weight:600;">
                ${isOpen ? '● REGISTRATION OPEN' : '🔒 LOCKED'}
              </div>
            </div>
            <div>
              <button onclick="examRegistrations.toggleWindow(${sDef.sem}, ${isOpen ? 1 : 0})" style="background:${isOpen ? '#DC2626' : '#16A34A'};color:#fff;border:none;padding:0.3rem 0.65rem;border-radius:5px;font-size:0.75rem;font-weight:700;cursor:pointer;">
                ${isOpen ? '🔒 Lock Window' : '🔓 Open Window'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="window-card">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #E2E8F0;padding-bottom:0.4rem;margin-bottom:0.5rem;">
            <div style="font-weight:800;color:#0F172A;font-size:0.92rem;">${y.title}</div>
            <span style="font-size:0.7rem;font-weight:700;color:#0B63C5;background:#EFF6FF;padding:2px 6px;border-radius:4px;">Academic Year ${y.yearNumber}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.35rem;">
            ${semRows}
          </div>
        </div>
      `;
    }).join('');
  },

  async toggleWindow(semester, currentIsOpen) {
    const nextState = currentIsOpen ? 0 : 1;
    const actionWord = nextState ? 'OPEN' : 'LOCK';

    if (!confirm(`Are you sure you want to ${actionWord} Semester ${semester} Registration window for students?`)) {
      return;
    }

    try {
      const res = await api.put(`/registration/exam-section/windows/${semester}/toggle`, {
        is_open: nextState
      });

      if (res && res.data) {
        ui.showToast(`Semester ${semester} registration window is now ${nextState ? 'OPEN' : 'LOCKED'}.`, 'success');
        await this.loadWindows();
      } else {
        ui.showToast(res?.message || 'Toggle failed', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Window toggle failed', 'error');
    }
  },

  async loadQueue() {
    const body = document.getElementById('examPendingListBody');
    if (!body) return;

    body.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: #64748B;">Loading Examination Section candidate queue &amp; registered subjects...</td></tr>`;

    try {
      const yr = document.getElementById('filterYear')?.value || '';
      const prog = document.getElementById('filterProgram')?.value || '';
      const dept = document.getElementById('filterDepartment')?.value || '';
      const sem = document.getElementById('filterSemester')?.value || '';
      const status = document.getElementById('filterStatus')?.value || '';
      const search = document.getElementById('filterSearch')?.value.trim() || '';

      const queryParams = new URLSearchParams();
      if (yr) queryParams.set('year', yr);
      if (prog) queryParams.set('program_id', prog);
      if (dept) queryParams.set('department_id', dept);
      if (sem) queryParams.set('semester', sem);
      if (status) queryParams.set('status', status);
      if (search) queryParams.set('search', search);

      const res = await api.get(`/registration/exam-section/registrations?${queryParams.toString()}`);
      if (!res || !res.data) throw new Error('Failed to load applications');

      const data = res.data;
      this.queue = data.registrations || [];

      // Update Stats
      const stats = data.stats || {};
      const statTotal = document.getElementById('statExamTotal');
      const statPending = document.getElementById('statExamPending');
      const statConfirmed = document.getElementById('statExamConfirmed');
      const statAwaitingFee = document.getElementById('statExamAwaitingFee');
      const badge = document.getElementById('examPendingCountBadge');
      const countEl = document.getElementById('tableResultCount');

      if (statTotal) statTotal.textContent = stats.total || this.queue.length;
      if (statPending) statPending.textContent = stats.pendingVerification || 0;
      if (statConfirmed) statConfirmed.textContent = stats.totalConfirmed || 0;
      if (statAwaitingFee) statAwaitingFee.textContent = stats.awaitingExamFee || 0;
      if (badge) badge.textContent = `${stats.pendingVerification || 0} Ready to Receive & Confirm`;
      if (countEl) countEl.textContent = `Showing ${this.queue.length} candidate registrations`;

      this.renderTable();
    } catch (err) {
      console.error('Queue load error:', err);
      body.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #DC2626;">Error: ${err.message || 'Could not load applications.'}</td></tr>`;
    }
  },

  renderTable() {
    const body = document.getElementById('examPendingListBody');
    if (!body) return;

    if (!this.queue.length) {
      body.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: #64748B;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📋</div>
            <div style="font-weight: 700; color: #0F172A; font-size: 1rem;">No Candidate Applications Found</div>
            <div style="font-size: 0.85rem; margin-top: 0.25rem;">There are no applications matching your current filter criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    body.innerHTML = this.queue.map(r => {
      const isFeePaid = r.status === 'EXAM_FEE_PAID';
      const isConfirmed = r.status === 'CONFIRMED';
      const isDirApproved = r.status === 'DIRECTOR_APPROVED';
      const candYear = r.candidate_year || `${Math.ceil(r.semester / 2)}${Math.ceil(r.semester / 2) === 1 ? 'st' : Math.ceil(r.semester / 2) === 2 ? 'nd' : Math.ceil(r.semester / 2) === 3 ? 'rd' : 'th'} Year`;

      let statusBadge = '';
      if (isConfirmed) {
        statusBadge = `<span style="background: #DCFCE7; color: #15803D; font-size: 0.76rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">✓ Received &amp; Confirmed</span>`;
      } else if (isFeePaid) {
        statusBadge = `<span style="background: #FEF3C7; color: #92400E; font-size: 0.76rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">⚡ Exam Fee Paid</span>`;
      } else if (isDirApproved) {
        statusBadge = `<span style="background: #EFF6FF; color: #1D4ED8; font-size: 0.76rem; font-weight: 600; padding: 3px 8px; border-radius: 4px;">Director Cleared (Fee Pending)</span>`;
      } else {
        statusBadge = `<span style="background: #F1F5F9; color: #475569; font-size: 0.76rem; font-weight: 600; padding: 3px 8px; border-radius: 4px;">${escapeHtml(r.status)}</span>`;
      }

      const examFeeHtml = isFeePaid || isConfirmed ? `
        <div style="font-weight: 700; color: #15803D; font-size: 0.86rem;">✓ ₹${Number(r.exam_fee_amount || 1550).toLocaleString('en-IN')} Paid</div>
        <div style="font-size: 0.7rem; color: #64748B; font-family: monospace;">${escapeHtml(r.exam_receipt_no || 'REC-' + r.id)}</div>
        <div style="font-size: 0.68rem; color: #0284C7; font-family: monospace;">Txn: ${escapeHtml(r.exam_transaction_id || 'pay_gtw_' + r.id)}</div>
      ` : `
        <div style="font-weight: 600; color: #B45309; font-size: 0.82rem;">Pending Payment</div>
        <div style="font-size: 0.7rem; color: #94A3B8;">₹1,550 required</div>
      `;

      // Render Subjects breakdown
      const subs = r.subjects || [];
      const subItemsHtml = subs.length ? subs.map(s => `
        <span class="sub-item-badge ${s.is_backlog ? 'backlog' : ''}" title="${escapeHtml(s.name)} (${s.credits} Credits - ${s.type || 'Theory'})">
          <strong>${escapeHtml(s.code)}</strong>: ${escapeHtml(s.name)}
          <span style="opacity:0.8;font-size:0.68rem;">(${s.credits} Cr)</span>
          ${s.is_backlog ? '<span style="font-weight:700;color:#DC2626;">[BACKLOG]</span>' : ''}
        </span>
      `).join('') : '<span style="color:#94A3B8;font-size:0.75rem;">Standard Curriculum Subjects Enrolled</span>';

      const totalCredits = r.total_credits || subs.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);

      return `
        <tr style="border-bottom: 1px solid #F1F5F9; transition: background 0.15s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#ffffff'">
          <td style="padding: 10px 12px; font-size: 0.82rem;">
            <div style="font-weight: 700; color: #0284C7; font-family: monospace;">
              ${escapeHtml(r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`)}
            </div>
            <div style="font-size: 0.7rem; color: #94A3B8; margin-top: 2px;">
              ${r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-IN') : '2026-10-01'}
            </div>
          </td>
          <td style="padding: 10px 12px;">
            <div style="font-weight: 800; color: #0F172A; font-size: 0.88rem;">${escapeHtml(candYear)}</div>
            <div style="font-size: 0.76rem; color: #0B63C5; font-weight: 700;">${escapeHtml(r.department_code || 'CSE')} &bull; ${escapeHtml(r.program_name || 'B.Tech')}</div>
          </td>
          <td style="padding: 10px 12px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 0.88rem;">${escapeHtml(r.full_name || 'Student')}</div>
            <div style="font-family: monospace; font-size: 0.8rem; color: #334155; font-weight: 600;">Roll: ${escapeHtml(r.roll_number || r.reg_no || '-')}</div>
            <div style="font-size: 0.72rem; color: #64748B;">Cat: ${escapeHtml(r.student_category || 'GENERAL')}</div>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="font-weight: 800; color: #0B63C5; font-size: 0.9rem;">Sem ${r.semester}</span>
          </td>
          <td style="padding: 10px 12px;">
            <div style="display: flex; flex-wrap: wrap; gap: 2px; max-width: 380px;">
              ${subItemsHtml}
            </div>
            <div style="font-size: 0.72rem; color: #475569; margin-top: 4px; font-weight: 600;">
              Total Subjects: ${subs.length} | Credits: ${totalCredits}
            </div>
          </td>
          <td style="padding: 10px 12px;">
            <div style="font-size: 0.78rem; font-weight: 600; color: #006644;">✓ HOD &amp; Director Cleared</div>
            <div style="font-size: 0.7rem; color: #64748B;">HOD: ${escapeHtml(r.hod_name || 'Verified')}</div>
            <div style="font-size: 0.7rem; color: #64748B;">Director: ${escapeHtml(r.director_name || 'Approved')}</div>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            ${examFeeHtml}
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            ${statusBadge}
          </td>
          <td style="padding: 10px 12px; text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
              ${isFeePaid ? `
                <button class="btn btn-sm" onclick="examRegistrations.markReceived(${r.id})" style="background: #006644; color: #ffffff; border: none; padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" title="Mark candidate form Received &amp; Confirmed">
                  ✓ Mark Received
                </button>
              ` : ''}
              ${isConfirmed ? `
                <span style="color: #006644; font-size: 0.78rem; font-weight: 700; margin-right: 4px;">Confirmed ✓</span>
              ` : ''}
              <button class="btn btn-sm btn-secondary" onclick="examRegistrations.viewDetail(${r.id})" style="padding: 0.35rem 0.6rem; font-size: 0.78rem;" title="View official Gen-Z registration card &amp; slip">
                📄 View Slip
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async markReceived(regId) {
    const reg = this.queue.find(r => r.id === regId);
    const stuName = reg ? reg.full_name : 'Candidate';

    const confirmed = confirm(
      `Mark Gen-Z Examination Form as RECEIVED & CONFIRMED for ${stuName}?\n\n` +
      `• Verified Gen-Z Exam Fee: ₹1,550 (Receipt: ${reg?.exam_receipt_no || 'Paid'})\n` +
      `• Verified HOD & Director Academic Clearances\n` +
      `• Digital University Exam Slip will be issued to student.`
    );
    if (!confirmed) return;

    try {
      const res = await api.put(`/registration/exam-section/${regId}/mark-received`, {
        remarks: 'Gen-Z University examination form fillup and board fee verified. Application officially Received & Confirmed by Examination Cell.'
      });

      if (res && res.success) {
        ui.showToast(`Application #${regId} Marked Received & Confirmed!`, 'success');
        await this.loadQueue();
      } else {
        throw new Error(res?.message || 'Action failed.');
      }
    } catch (err) {
      console.error('Mark Received error:', err);
      alert(`Could not confirm application: ${err.message || 'Server error'}`);
    }
  },

  async viewDetail(regId) {
    let r = this.queue.find(item => item.id === regId) || {};
    let fin = {};
    let trail = {};

    try {
      const res = await api.get(`/registration/detail/${regId}`);
      if (res && res.data && res.data.registration) {
        r = res.data.registration;
        fin = res.data.financialSummary || {};
        trail = res.data.clearanceTrail || {};
      }
    } catch (e) {
      console.warn('Could not fetch full registration detail, using queue data:', e);
    }

    const modal = document.getElementById('examDetailModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
    const candYear = r.candidate_year || `${Math.ceil(r.semester / 2)}${Math.ceil(r.semester / 2) === 1 ? 'st' : Math.ceil(r.semester / 2) === 2 ? 'nd' : Math.ceil(r.semester / 2) === 3 ? 'rd' : 'th'} Year`;

    // 1. Compute Subject Statistics
    const subs = r.subjects || [];
    const totalSubs = subs.length;
    const theorySubs = subs.filter(s => (s.type || '').toUpperCase() === 'THEORY').length;
    const labSubs = subs.filter(s => (s.type || '').toUpperCase() !== 'THEORY').length;
    const backlogSubs = subs.filter(s => s.is_backlog).length;
    const regularSubs = totalSubs - backlogSubs;
    const totalCredits = r.total_credits || subs.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);

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
    const isExamPaid = fin.examFeeStatus === 'PAID' || r.status === 'CONFIRMED' || r.status === 'EXAM_FEE_PAID';
    const examReceiptNo = fin.examReceiptNo || r.exam_receipt_no || (isExamPaid ? `EXAM-REC-${r.id}` : 'PENDING');
    const examTxnId = fin.examTransactionId || r.exam_transaction_id || (isExamPaid ? `pay_gtw_${r.id}` : '-');
    const examFeePaidAt = fin.examFeePaidAt ? new Date(fin.examFeePaidAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    const totalOverallPaid = fin.totalPaidOverall || (totalCollegePaid + (isExamPaid ? examFeeAmount : 0));

    if (title) title.textContent = `Gen-Z University Registration & Clearance Dossier — ${r.full_name}`;

    modal.style.display = 'flex';

    body.innerHTML = `
      <div id="printableBputSlip" style="padding: 4px;">
        <!-- University Letterhead -->
        <div style="border-bottom: 2px solid #006644; padding-bottom: 0.85rem; margin-bottom: 1.15rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display:flex; align-items:center; gap: 0.85rem;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #006644; color: #fff; font-weight: 900; display:flex; align-items:center; justify-content:center; font-size: 1.25rem;">
              GENZ
            </div>
            <div>
              <h2 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A;">GEN-Z UNIVERSITY</h2>
              <div style="font-size: 0.75rem; color: #475569;">Affiliated to Gen-Z Autonomous University, Rourkela, Odisha</div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #006644; margin-top: 2px;">OFFICIAL SEMESTER SUBJECT REGISTRATION &amp; CLEARANCE CARD</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: #64748B;">Reference No.</div>
            <div style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: #0284C7;">${escapeHtml(refNo)}</div>
            <div style="font-size: 0.72rem; color: #64748B; margin-top: 2px;">Printed: ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <!-- Student & Academic Snapshot with Photo -->
        <div style="display:grid; grid-template-columns:auto 1fr; gap:1.25rem; background:#F8FAFC; padding:1.15rem; border-radius:8px; border:1px solid #E2E8F0; margin-bottom:1.25rem; align-items:center;">
          <div style="width:82px; height:96px; border:2px solid #CBD5E1; border-radius:6px; overflow:hidden; background:#E2E8F0; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.05); flex-shrink:0;">
            ${r.photo_url && r.photo_url.startsWith('http') 
              ? `<img src="${r.photo_url}" alt="${escapeHtml(r.full_name)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='🎓'"/>` 
              : `<div style="font-size:2.2rem;color:#0284C7;font-weight:800;">${(r.full_name || 'S').charAt(0)}</div>`
            }
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.6rem; font-size:0.86rem;">
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">STUDENT NAME</span><strong style="color:#0F172A;font-size:0.95rem;">${escapeHtml(r.full_name)}</strong></div>
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">UNIVERSITY ROLL / REG NO.</span><strong style="color:#0F172A;font-family:monospace;font-size:0.95rem;">${escapeHtml(r.roll_number || r.reg_no)}</strong></div>
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">PROGRAM &amp; BRANCH</span><span style="font-weight:600;color:#1E293B;">${escapeHtml(r.program_name || 'B.Tech')} &mdash; ${escapeHtml(r.department_name || r.department_code || 'CSE')}</span></div>
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">ACADEMIC TERM</span><span style="font-weight:700;color:#0B63C5;">Semester ${r.semester} (${escapeHtml(candYear)})</span></div>
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">STUDENT CATEGORY</span><span style="font-weight:600;">${escapeHtml(r.student_category || 'General')} | ${r.hostel_opted ? 'Hosteller' : 'Day Scholar'}</span></div>
            <div><span style="font-size:0.72rem;color:#64748B;display:block;">REGISTRATION TYPE</span><span style="font-weight:700;color:#006644;">${escapeHtml(r.registration_type || 'REGULAR')} (${r.academic_year || '2025-2026'})</span></div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 1: REGISTERED SUBJECTS ("KON KON SA SUBJECT") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.35rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="font-weight:800; color:#0F172A; font-size:0.92rem; display:flex; align-items:center; gap:0.45rem;">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#006644" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              1. Gen-Z Registered Subjects Particulars (${totalSubs} Subjects, ${totalCredits} Credits)
            </div>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; font-size:0.75rem;">
              <span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:12px;font-weight:700;">Theory: ${theorySubs}</span>
              <span style="background:#F0FDF4;color:#15803D;padding:2px 8px;border-radius:12px;font-weight:700;">Lab / Practical: ${labSubs}</span>
              <span style="background:#F1F5F9;color:#334155;padding:2px 8px;border-radius:12px;font-weight:700;">Regular: ${regularSubs}</span>
              ${backlogSubs > 0 ? `<span style="background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:12px;font-weight:800;">Backlog: ${backlogSubs}</span>` : ''}
            </div>
          </div>

          <div style="border:1px solid #CBD5E1; border-radius:8px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse; font-size:0.83rem;">
              <thead>
                <tr style="background:#006644; color:#ffffff; text-align:left;">
                  <th style="padding:7px 10px; text-align:center; width:40px;">#</th>
                  <th style="padding:7px 10px; width:120px;">Subject Code</th>
                  <th style="padding:7px 10px;">Subject Title</th>
                  <th style="padding:7px 10px; text-align:center; width:95px;">Category</th>
                  <th style="padding:7px 10px; text-align:center; width:75px;">Credits</th>
                  <th style="padding:7px 10px; text-align:center; width:95px;">Paper Type</th>
                </tr>
              </thead>
              <tbody>
                ${subjectsHtml.length ? subjectsHtml : '<tr><td colspan="6" style="padding:1.25rem;text-align:center;color:#94A3B8;">No subjects registered.</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background:#F8FAFC; font-weight:800; border-top:2px solid #006644; color:#0F172A;">
                  <td colspan="4" style="padding:7px 12px; text-align:right;">TOTAL REGISTERED CREDITS:</td>
                  <td style="padding:7px 10px; text-align:center; color:#006644; font-size:0.95rem;">${totalCredits}</td>
                  <td style="padding:7px 10px; text-align:center; font-size:0.75rem; color:#64748B;">Gen-Z Approved</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 2: PAYMENT AUDIT & BALANCE ("KITNA PAYMENT KYA" & "TOTAL KITNA HE") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.35rem;">
          <div style="font-weight:800; color:#0F172A; font-size:0.92rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.45rem;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            2. Payment Audit &amp; Balance Dues Breakdown ("Kitna Payment Kya" &amp; "Total Kitna He")
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:0.85rem;">
            <!-- College Fee Balance Card -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:8px; padding:0.95rem; border-left:4px solid #0B63C5; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:#64748B; font-weight:700; letter-spacing:0.5px;">Institutional College Fee Ledger</div>
              <div style="display:flex; justify-content:space-between; margin-top:0.4rem; font-size:0.82rem;">
                <span style="color:#64748B;">Total College Fee:</span>
                <strong style="color:#0F172A;">₹${Number(totalCollegeFee).toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:0.25rem; font-size:0.82rem;">
                <span style="color:#16A34A;font-weight:600;">College Paid:</span>
                <strong style="color:#16A34A;">₹${Number(totalCollegePaid).toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:0.25rem; font-size:0.82rem; border-top:1px dashed #CBD5E1; padding-top:0.35rem;">
                <span style="color:${collegeBalanceDue > 0 ? '#DC2626' : '#15803D'};font-weight:700;">Outstanding Balance:</span>
                <strong style="color:${collegeBalanceDue > 0 ? '#DC2626' : '#15803D'};">₹${Number(collegeBalanceDue).toLocaleString('en-IN')}</strong>
              </div>
              <div style="margin-top:0.55rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-bottom:2px;">
                  <span style="color:#64748B;">Clearance Level:</span>
                  <span style="font-weight:800; color:${clearancePercent >= 100 ? '#15803D' : clearancePercent >= 60 ? '#D97706' : '#DC2626'};">${clearancePercent}%</span>
                </div>
                <div style="background:#E2E8F0; height:6px; border-radius:3px; overflow:hidden;">
                  <div style="background:${clearancePercent >= 100 ? '#16A34A' : clearancePercent >= 60 ? '#F59E0B' : '#DC2626'}; height:100%; width:${Math.min(100, clearancePercent)}%;"></div>
                </div>
              </div>
            </div>

            <!-- Gen-Z Exam Fee Card -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:8px; padding:0.95rem; border-left:4px solid #16A34A; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:0.72rem; text-transform:uppercase; color:#64748B; font-weight:700; letter-spacing:0.5px;">Gen-Z Exam Registration Fee</div>
                ${isExamPaid 
                  ? '<span style="background:#DCFCE7;color:#15803D;font-weight:800;font-size:0.72rem;padding:2px 6px;border-radius:4px;border:1px solid #86EFAC;">✓ PAID</span>' 
                  : '<span style="background:#FEF2F2;color:#DC2626;font-weight:800;font-size:0.72rem;padding:2px 6px;border-radius:4px;border:1px solid #FECACA;">PENDING</span>'
                }
              </div>
              <div style="margin-top:0.4rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                  <span style="color:#64748B;">Amount Payable:</span>
                  <strong style="color:#0F172A; font-size:0.92rem;">₹${Number(examFeeAmount).toLocaleString('en-IN')}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:0.25rem; font-size:0.78rem;">
                  <span style="color:#64748B;">Receipt Voucher:</span>
                  <span style="font-family:monospace; font-weight:700; color:#0B63C5;">${escapeHtml(examReceiptNo)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:0.25rem; font-size:0.78rem;">
                  <span style="color:#64748B;">Transaction ID:</span>
                  <span style="font-family:monospace; color:#475569;">${escapeHtml(examTxnId)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:0.25rem; font-size:0.75rem; color:#64748B;">
                  <span>Payment Date:</span>
                  <span>${examFeePaidAt}</span>
                </div>
              </div>
            </div>

            <!-- Total Combined Payment Summary -->
            <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:0.95rem; border-left:4px solid #006644; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:#15803D; font-weight:700; letter-spacing:0.5px;">Total Overall Receipts Cleared</div>
              <div style="margin-top:0.5rem; text-align:center;">
                <div style="font-size:1.4rem; font-weight:800; color:#006644;">₹${Number(totalOverallPaid).toLocaleString('en-IN')}</div>
                <div style="font-size:0.75rem; color:#166534; font-weight:600; margin-top:2px;">College Fees + University Exam Fees</div>
              </div>
              <div style="margin-top:0.75rem; border-top:1px dashed #86EFAC; padding-top:0.4rem; font-size:0.78rem; text-align:center; color:#15803D; font-weight:700;">
                ✓ Accounts Section Audited &amp; Reconciled
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 3: 5-STAGE INSTITUTIONAL CLEARANCE TRAIL ("TOTAL CLEARANCE DEAI") -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:1.35rem;">
          <div style="font-weight:800; color:#0F172A; font-size:0.92rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.45rem;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            3. Institutional 5-Stage Clearance Trail ("Total Clearance Details")
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:0.6rem;">
            <!-- Stage 1: Submission -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:6px; padding:0.75rem; border-top:3px solid #16A34A;">
              <div style="font-size:0.7rem; font-weight:800; color:#16A34A; text-transform:uppercase;">1. Student Submission</div>
              <div style="font-weight:700; color:#0F172A; font-size:0.8rem; margin-top:2px;">Online Self-Applied</div>
              <div style="font-size:0.72rem; color:#64748B; margin-top:3px;">${trail.submission && trail.submission.date ? new Date(trail.submission.date).toLocaleDateString('en-IN') : new Date(r.submitted_at || Date.now()).toLocaleDateString('en-IN')}</div>
              <div style="font-size:0.7rem; color:#16A34A; font-weight:600; margin-top:4px;">✓ Verified Application</div>
            </div>

            <!-- Stage 2: HOD Endorsement -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:6px; padding:0.75rem; border-top:3px solid ${trail.hod && trail.hod.status === 'FORWARDED' ? '#16A34A' : '#F59E0B'};">
              <div style="font-size:0.7rem; font-weight:800; color:${trail.hod && trail.hod.status === 'FORWARDED' ? '#16A34A' : '#D97706'}; text-transform:uppercase;">2. HOD Academic</div>
              <div style="font-weight:700; color:#0F172A; font-size:0.8rem; margin-top:2px;">${escapeHtml((trail.hod && trail.hod.officer) || r.hod_name || 'HOD Department')}</div>
              <div style="font-size:0.72rem; color:#64748B; margin-top:3px;">${trail.hod && trail.hod.date ? new Date(trail.hod.date).toLocaleDateString('en-IN') : 'Cleared'}</div>
              <div style="font-size:0.7rem; color:${trail.hod && trail.hod.status === 'FORWARDED' ? '#16A34A' : '#D97706'}; font-weight:600; margin-top:4px;">
                ${trail.hod && trail.hod.status === 'FORWARDED' ? '✓ Academic Endorsed' : 'Pending HOD'}
              </div>
            </div>

            <!-- Stage 3: Directorate Approval -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:6px; padding:0.75rem; border-top:3px solid ${trail.director && trail.director.status === 'APPROVED' ? '#16A34A' : '#F59E0B'};">
              <div style="font-size:0.7rem; font-weight:800; color:${trail.director && trail.director.status === 'APPROVED' ? '#16A34A' : '#D97706'}; text-transform:uppercase;">3. Directorate Approval</div>
              <div style="font-weight:700; color:#0F172A; font-size:0.8rem; margin-top:2px;">${escapeHtml((trail.director && trail.director.officer) || r.director_name || 'Director GENZ')}</div>
              <div style="font-size:0.72rem; color:#64748B; margin-top:3px;">${trail.director && trail.director.date ? new Date(trail.director.date).toLocaleDateString('en-IN') : 'Cleared'}</div>
              <div style="font-size:0.7rem; color:${trail.director && trail.director.status === 'APPROVED' ? '#16A34A' : '#D97706'}; font-weight:600; margin-top:4px;">
                ${trail.director && trail.director.status === 'APPROVED' ? '✓ Director Approved' : 'Pending Approval'}
              </div>
            </div>

            <!-- Stage 4: Accounts Fee Clearance -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:6px; padding:0.75rem; border-top:3px solid #16A34A;">
              <div style="font-size:0.7rem; font-weight:800; color:#16A34A; text-transform:uppercase;">4. Accounts Audit</div>
              <div style="font-weight:700; color:#0F172A; font-size:0.8rem; margin-top:2px;">${escapeHtml((trail.accounts && trail.accounts.officer) || r.accounts_name || 'Accounts Officer')}</div>
              <div style="font-size:0.72rem; color:#64748B; margin-top:3px;">Clearance: <strong>${clearancePercent}%</strong></div>
              <div style="font-size:0.7rem; color:#16A34A; font-weight:600; margin-top:4px;">✓ Fee Reconciled</div>
            </div>

            <!-- Stage 5: Exam Cell Confirmation -->
            <div style="background:#ffffff; border:1px solid #E2E8F0; border-radius:6px; padding:0.75rem; border-top:3px solid ${r.status === 'CONFIRMED' ? '#16A34A' : '#3B82F6'};">
              <div style="font-size:0.7rem; font-weight:800; color:${r.status === 'CONFIRMED' ? '#16A34A' : '#2563EB'}; text-transform:uppercase;">5. Gen-Z Exam Cell</div>
              <div style="font-weight:700; color:#0F172A; font-size:0.8rem; margin-top:2px;">Controller of Exams</div>
              <div style="font-size:0.72rem; color:#64748B; margin-top:3px;">${r.status === 'CONFIRMED' ? 'Confirmed &amp; Dispatched' : 'Desk Processing'}</div>
              <div style="font-size:0.7rem; color:${r.status === 'CONFIRMED' ? '#16A34A' : '#2563EB'}; font-weight:600; margin-top:4px;">
                ${r.status === 'CONFIRMED' ? '✓ Gen-Z Confirmed' : 'Ready to Confirm'}
              </div>
            </div>
          </div>
        </div>

        <!-- Official Signatures Section for Printing -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:1.5rem; padding-top:1rem; border-top:1px solid #CBD5E1; font-size:0.78rem; color:#475569;">
          <div style="text-align: center;">
            <div style="font-weight: 600; color: #0F172A;">${escapeHtml(r.full_name)}</div>
            <div style="border-top: 1px dashed #64748B; width: 140px; margin: 4px auto 0;">Candidate Signature</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 600; color: #0F172A;">${escapeHtml(r.hod_name || 'Head of Department')}</div>
            <div style="border-top: 1px dashed #64748B; width: 140px; margin: 4px auto 0;">Department Endorsement</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 700; color: #006644;">Dr. Ramesh Chandra Sahoo</div>
            <div style="border-top: 1px dashed #64748B; width: 160px; margin: 4px auto 0;">Controller of Examinations, GENZ</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.25rem; border-top:1px solid #E2E8F0; padding-top:1rem;">
        <button class="btn btn-secondary" onclick="examRegistrations.closeDetailModal()">Close</button>
        <button class="btn btn-primary" onclick="examRegistrations.printRegistrationSlip()" style="background:#006644; border:none; color:#fff; font-weight:700;">
          🖨️ Print Registration Slip
        </button>
        ${['EXAM_FEE_PAID', 'DIRECTOR_APPROVED'].includes(r.status) ? `
          <button class="btn" onclick="examRegistrations.closeDetailModal(); examRegistrations.markReceived(${r.id})" style="background: #15803D; color: #fff; font-weight: 700;">
            ✓ Mark Received &amp; Confirmed
          </button>
        ` : ''}
      </div>
    `;
  },

  closeDetailModal() {
    const modal = document.getElementById('examDetailModal');
    if (modal) modal.style.display = 'none';
  },

  printRegistrationSlip() {
    const el = document.getElementById('printableBputSlip');
    if (!el) return;
    const printWin = window.open('', '', 'width=800,height=700');
    printWin.document.write(`
      <html>
        <head>
          <title>Gen-Z Registration Slip</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px 10px; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 400);
  },

  showSubjectSummaryModal() {
    const modal = document.getElementById('subjectSummaryModal');
    const body = document.getElementById('subjectSummaryBody');
    if (!modal || !body) return;

    // Aggregate subjects from this.queue
    const subjectMap = {};

    this.queue.forEach(r => {
      const branch = r.department_code || 'CSE';
      const sem = r.semester;
      const yr = r.candidate_year || `${Math.ceil(sem / 2)} Year`;

      (r.subjects || []).forEach(s => {
        const key = `${branch}_${sem}_${s.code}`;
        if (!subjectMap[key]) {
          subjectMap[key] = {
            branch,
            semester: sem,
            year: yr,
            code: s.code,
            name: s.name,
            credits: s.credits,
            type: s.type || 'Theory',
            total: 0,
            regular: 0,
            backlog: 0
          };
        }
        subjectMap[key].total += 1;
        if (s.is_backlog) {
          subjectMap[key].backlog += 1;
        } else {
          subjectMap[key].regular += 1;
        }
      });
    });

    const list = Object.values(subjectMap);
    list.sort((a, b) => a.semester - b.semester || a.branch.localeCompare(b.branch) || a.code.localeCompare(b.code));

    modal.style.display = 'flex';

    if (!list.length) {
      body.innerHTML = `
        <div style="text-align:center;padding:2rem;color:#64748B;">
          No subject registrations loaded in current queue filter. Clear filters to view full enrollment summary.
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.85rem; color: #475569;">
          Showing enrolled student counts across <strong>${list.length} distinct subjects</strong> in current queue:
        </div>
      </div>
      <div style="max-height: 480px; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
          <thead>
            <tr style="background: #F8FAFC; border-bottom: 2px solid #CBD5E1; text-align: left; position: sticky; top: 0;">
              <th style="padding: 8px 10px;">Branch</th>
              <th style="padding: 8px 10px; text-align: center;">Semester</th>
              <th style="padding: 8px 10px;">Subject Code</th>
              <th style="padding: 8px 10px;">Subject Title</th>
              <th style="padding: 8px 10px; text-align: center;">Credits</th>
              <th style="padding: 8px 10px; text-align: center;">Regular</th>
              <th style="padding: 8px 10px; text-align: center;">Backlog</th>
              <th style="padding: 8px 10px; text-align: center; background: #DCFCE7; color: #15803D;">Total Candidates</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(s => `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 10px; font-weight: 700; color: #0F172A;">${escapeHtml(s.branch)}</td>
                <td style="padding: 8px 10px; text-align: center; color: #0B63C5; font-weight: 600;">Sem ${s.semester}</td>
                <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #0284C7;">${escapeHtml(s.code)}</td>
                <td style="padding: 8px 10px; font-weight: 600;">${escapeHtml(s.name)}</td>
                <td style="padding: 8px 10px; text-align: center;">${s.credits}</td>
                <td style="padding: 8px 10px; text-align: center; color: #15803D; font-weight: 600;">${s.regular}</td>
                <td style="padding: 8px 10px; text-align: center; color: ${s.backlog ? '#DC2626' : '#94A3B8'}; font-weight: 700;">${s.backlog}</td>
                <td style="padding: 8px 10px; text-align: center; font-weight: 800; font-size: 0.95rem; color: #15803D; background: #F0FDF4;">
                  ${s.total}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:1rem;">
        <button class="btn btn-secondary" onclick="document.getElementById('subjectSummaryModal').style.display='none'">Close</button>
      </div>
    `;
  },

  exportExcel(mode = 'ALL') {
    if (!this.queue || !this.queue.length) {
      ui.showToast('No registrations to export.', 'warning');
      return;
    }

    if (typeof XLSX === 'undefined') {
      ui.showToast('Excel exporter loading... please try again.', 'info');
      return;
    }

    const dataToExport = this.queue.map((r, i) => {
      const subs = (r.subjects || []).map(s => `${s.code} (${s.name})`).join(', ');
      return {
        'Sl No': i + 1,
        'Reference No': r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`,
        'Program': r.program_name || 'B.Tech',
        'Branch / Department': r.department_code || 'CSE',
        'Academic Year': r.candidate_year || `${Math.ceil(r.semester / 2)} Year`,
        'Semester': `Semester ${r.semester}`,
        'Student Name': r.full_name,
        'Roll Number': r.roll_number || r.reg_no,
        'Registered Subjects': subs,
        'Total Credits': r.total_credits || 0,
        'HOD Clearance': r.hod_name || 'Verified',
        'Director Approval': r.director_name || 'Approved',
        'Gen-Z Exam Fee Status': r.exam_fee_status || (['EXAM_FEE_PAID', 'CONFIRMED'].includes(r.status) ? 'PAID' : 'PENDING'),
        'Exam Fee Amount (INR)': r.exam_fee_amount || 1550,
        'Receipt No': r.exam_receipt_no || '',
        'Gateway Txn ID': r.exam_transaction_id || '',
        'Examination Section Status': r.status,
        'Submission Date': r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-IN') : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BPUT_Candidate_Register');

    XLSX.writeFile(workbook, 'BEC_BPUT_Examination_Subject_Registrations.xlsx');
    ui.showToast('University examination list downloaded successfully.', 'success');
  }
};
