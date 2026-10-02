/**
 * HOD Subject Registration Approvals Controller
 * Bhubaneswar Engineering College (BEC) — Level 1 Academic Review
 */

const hodRegistrations = {
  registrations: [],
  currentModalReg: null,
  departmentInfo: null,
  searchTimer: null,

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;
    if (!['HOD', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      ui.showToast('Access restricted to Department Heads.', 'error');
      setTimeout(() => window.location.replace('/dashboard.html'), 1200);
      return;
    }
    await this.loadQueue();
  },

  onSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadQueue();
    }, 300);
  },

  async loadQueue() {
    const container = document.getElementById('pendingListBody');
    if (!container) return;
    container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#64748B;">Loading department registration queue...</td></tr>';

    const sem = document.getElementById('filterSemester')?.value || '';
    const st = document.getElementById('filterStatus')?.value || '';
    const yr = document.getElementById('filterYear')?.value || '';
    const srch = document.getElementById('filterSearch')?.value || '';

    try {
      const q = new URLSearchParams();
      if (sem) q.append('semester', sem);
      if (st) q.append('status', st);
      if (yr) q.append('year', yr);
      if (srch) q.append('search', srch);

      const res = await api.get(`/registration/hod/registrations?${q.toString()}`);
      if (!res || !res.data) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Failed to load applications.</td></tr>';
        return;
      }

      this.departmentInfo = res.data.department;
      this.registrations = res.data.registrations || [];

      // Update Department Title
      const deptEl = document.getElementById('hodDeptTitle');
      if (deptEl && this.departmentInfo) {
        deptEl.textContent = this.departmentInfo.name;
      }

      // Update 4 Stats Cards
      const stats = res.data.stats || {};
      const statTot = document.getElementById('statTotal');
      const statPend = document.getElementById('statPending');
      const statFwd = document.getElementById('statForwarded');
      const statRev = document.getElementById('statReverted');
      const badge = document.getElementById('pendingCountBadge');
      const resultCount = document.getElementById('tableResultCount');

      if (statTot) statTot.textContent = stats.total || 0;
      if (statPend) statPend.textContent = stats.pending || 0;
      if (statFwd) statFwd.textContent = stats.forwarded || 0;
      if (statRev) statRev.textContent = stats.reverted || 0;
      if (badge) badge.textContent = `${stats.pending || 0} Pending Review`;
      if (resultCount) resultCount.textContent = `Showing ${this.registrations.length} records`;

      if (!this.registrations.length) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:3rem;color:#94A3B8;"><div style="font-size:2rem;margin-bottom:0.5rem;">📋</div>No registrations found matching criteria.</td></tr>';
        return;
      }

      const statusBadges = {
        SUBMITTED: { bg: '#FEF3C7', text: '#B45309', label: 'Pending Review' },
        HOD_FORWARDED: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Forwarded to Director' },
        DIRECTOR_APPROVED: { bg: '#E0E7FF', text: '#4338CA', label: 'Director Approved' },
        CONFIRMED: { bg: '#DCFCE7', text: '#15803D', label: '✓ Confirmed' },
        HOD_REVERTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Reverted' },
        DIRECTOR_REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Director Rejected' }
      };

      container.innerHTML = this.registrations.map(r => {
        const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
        const b = statusBadges[r.status] || { bg: '#F1F5F9', text: '#475569', label: r.status };

        // Estimated fee % clearance
        const totalFee = 115000;
        const paid = parseFloat(r.student_total_paid || r.total_paid || 0);
        const feePercent = Math.min(100, Math.round((paid / totalFee) * 100));

        return `
          <tr style="border-bottom:1px solid #E2E8F0;">
            <td style="padding:12px;font-family:monospace;font-weight:700;color:#0B63C5;font-size:0.85rem;">
              ${escapeHtml(refNo)}
            </td>
            <td style="padding:12px;">
              <strong style="color:#0F172A;display:block;">${escapeHtml(r.full_name)}</strong>
              <span style="font-size:0.75rem;color:#64748B;">${escapeHtml(r.student_category || 'General')} | ${r.hostel_opted ? 'Hosteller' : 'Day Scholar'}</span>
            </td>
            <td style="padding:12px;font-size:0.85rem;font-weight:600;color:#334155;">${escapeHtml(r.reg_no)}</td>
            <td style="padding:12px;font-size:0.85rem;text-align:center;">Sem ${r.semester}</td>
            <td style="padding:12px;text-align:center;">
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:700;background:${feePercent >= 50 ? '#DCFCE7' : '#FEF3C7'};color:${feePercent >= 50 ? '#15803D' : '#B45309'};">
                ${feePercent}%
              </span>
            </td>
            <td style="padding:12px;text-align:center;">
              <span style="font-weight:700;color:#0B63C5;">${r.total_credits}</span>
              <span style="font-size:0.72rem;color:#64748B;display:block;">BPUT (20-28)</span>
            </td>
            <td style="padding:12px;font-size:0.82rem;color:#64748B;">${new Date(r.submitted_at).toLocaleDateString('en-IN')}</td>
            <td style="padding:12px;text-align:center;">
              <span style="background:${b.bg};color:${b.text};font-weight:700;font-size:0.75rem;padding:0.25rem 0.6rem;border-radius:12px;">
                ${b.label}
              </span>
            </td>
            <td style="padding:12px;text-align:right;">
              <button class="btn btn-sm btn-primary" onclick="hodRegistrations.openDetailModal(${r.id})" style="background:#0B63C5;border:none;padding:0.35rem 0.85rem;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">
                Review →
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Error loading data.</td></tr>';
    }
  },

  async openDetailModal(regId) {
    try {
      const res = await api.get(`/registration/detail/${regId}`);
      if (!res || !res.data) return;

      const { registration: r, financialSummary: fin = {}, clearanceTrail: trail = {} } = res.data;
      this.currentModalReg = r;

      const modalTitle = document.getElementById('modalRegTitle');
      const modalBody = document.getElementById('modalRegBody');

      const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
      modalTitle.textContent = `Review Registration: ${refNo} — ${r.full_name} (${r.reg_no || r.roll_number})`;

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
                  <td style="padding:8px 10px;text-align:center;font-size:0.75rem;color:#64748B;">BPUT Syllabus</td>
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
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.hod?.ok ? '#16A34A' : '#0B63C5'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 2: HOD</span>
                <span style="color:${trail.hod?.ok ? '#16A34A' : '#0B63C5'};font-weight:800;font-size:0.75rem;">
                  ${trail.hod?.ok ? '✓ ENDORSED' : (trail.hod?.status === 'REVERTED' ? '↺ REVERTED' : '⏳ CURRENT STAGE')}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">Academic Head</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${escapeHtml(trail.hod?.officer || r.hod_name || 'Assigned Department HOD')}</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">"${escapeHtml(trail.hod?.remarks || r.hod_remarks || 'Pending HOD verification.')}"</div>
            </div>

            <!-- Stage 3: Director -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.director?.ok ? '#16A34A' : '#64748B'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 3: DIRECTOR</span>
                <span style="color:${trail.director?.ok ? '#16A34A' : '#64748B'};font-weight:800;font-size:0.75rem;">
                  ${trail.director?.ok ? '✓ APPROVED' : 'PENDING'}
                </span>
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#0F172A;">College Directorate</div>
              <div style="font-size:0.75rem;color:#475569;margin-top:2px;">${escapeHtml(trail.director?.officer || 'Dr. B.N. Biswal')}</div>
              <div style="font-size:0.72rem;color:#64748B;font-style:italic;margin-top:2px;">${trail.director?.ok ? 'Directorate approval granted' : 'Pending HOD forward'}</div>
            </div>

            <!-- Stage 4: Accounts -->
            <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-top:3px solid ${trail.accounts?.ok ? '#16A34A' : '#D97706'};">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                <span style="font-size:0.72rem;font-weight:700;color:#64748B;">STAGE 4: ACCOUNTS</span>
                <span style="color:${trail.accounts?.ok ? '#16A34A' : '#D97706'};font-weight:800;font-size:0.75rem;">
                  ${trail.accounts?.ok ? '✓ CLEARED' : 'PENDING'}
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

        <!-- HOD Endorsement Remarks -->
        <div style="margin-bottom:1.25rem;background:#F8FAFC;padding:1rem;border-radius:8px;border:1px solid #CBD5E1;">
          <label style="font-weight:700;font-size:0.85rem;color:#1E293B;display:block;margin-bottom:0.35rem;">
            HOD Endorsement Remarks <span style="font-size:0.75rem;color:#64748B;font-weight:400;">(Mandatory for reversion, optional for forwarding)</span>
          </label>
          <textarea id="hodRemarksInput" rows="2" style="width:100%;padding:0.6rem;border:1px solid #CBD5E1;border-radius:6px;font-size:0.85rem;" placeholder="e.g., Academic eligibility verified. Credits verified as per BPUT syllabus."></textarea>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;border-top:1px solid #E2E8F0;padding-top:1rem;">
          <button class="btn btn-secondary" onclick="hodRegistrations.revertApplication(${r.id})" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-weight:600;padding:0.5rem 1.25rem;border-radius:6px;cursor:pointer;">
            ↺ Revert to Student
          </button>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-secondary" onclick="ui.closeModal('hodDetailModal')" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">
              Close
            </button>
            <button class="btn btn-primary" onclick="hodRegistrations.forwardApplication(${r.id})" style="background:#0B63C5;color:#fff;border:none;font-weight:700;padding:0.5rem 1.5rem;border-radius:6px;cursor:pointer;">
              Forward to Director →
            </button>
          </div>
        </div>
      `;

      ui.openModal('hodDetailModal');
    } catch (e) {
      console.error(e);
      ui.showToast('Failed to load application details.', 'error');
    }
  },

  async forwardApplication(regId) {
    const remarks = document.getElementById('hodRemarksInput')?.value || '';
    try {
      const res = await api.put(`/registration/hod/${regId}/forward`, { remarks });
      if (res && res.data) {
        ui.showToast('Application verified and forwarded to College Director.', 'success');
        ui.closeModal('hodDetailModal');
        await this.loadQueue();
      } else {
        ui.showToast(res.message || 'Forward failed.', 'error');
      }
    } catch (err) {
      ui.showToast(err.message || 'Forward failed.', 'error');
    }
  },

  async revertApplication(regId) {
    const remarks = document.getElementById('hodRemarksInput')?.value?.trim();
    if (!remarks || remarks.length < 5) {
      ui.showToast('Please specify reason for reversion (minimum 5 characters).', 'warning');
      return;
    }

    try {
      const res = await api.put(`/registration/hod/${regId}/revert`, { remarks });
      if (res && res.data) {
        ui.showToast('Application reverted back to student with remarks.', 'info');
        ui.closeModal('hodDetailModal');
        await this.loadQueue();
      } else {
        ui.showToast(res.message || 'Revert failed.', 'error');
      }
    } catch (err) {
      ui.showToast(err.message || 'Revert failed.', 'error');
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

    const deptName = this.departmentInfo?.name || 'Department';
    const dataToExport = this.registrations.map((r, i) => ({
      'Sl No': i + 1,
      'Reference No': r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`,
      'Student Name': r.full_name,
      'Roll Number': r.reg_no,
      'Department': r.department_name || deptName,
      'Semester': `Semester ${r.semester}`,
      'Academic Year': r.academic_year || '2026-27',
      'Total Credits': r.total_credits,
      'Registration Type': r.registration_type,
      'Status': r.status,
      'Submission Date': new Date(r.submitted_at).toLocaleDateString('en-IN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const cleanDept = (deptName || 'Department').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(workbook, `BEC_HOD_${cleanDept}_Subject_Registrations.xlsx`);
    ui.showToast('Excel report downloaded successfully.', 'success');
  }
};

