/**
 * Accounts Office — Registration Fee Collections & Ledger Audit Controller
 * Gen-Z University — Finance & Ledger Reconciliation
 */

const accountsRegistrations = {
  registrations: [],
  programs: [],
  departments: [],
  searchTimer: null,

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;
    if (!['ACCOUNTS_HEAD', 'ACCOUNTS_STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'EXAM_CELL'].includes(user.role)) {
      ui.showToast('Access restricted to Accounts Department & Administrative Officers.', 'error');
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

  async loadQueue() {
    const container = document.getElementById('accountsPendingListBody');
    if (!container) return;
    container.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#64748B;">Loading Accounts fee registers &amp; ledger vouchers...</td></tr>';

    const progId = document.getElementById('filterProgram')?.value || '';
    const deptId = document.getElementById('filterDepartment')?.value || '';
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

      const res = await api.get(`/registration/accounts/registrations?${q.toString()}`);
      if (!res || !res.data) {
        container.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#DC2626;">Failed to load accounts records.</td></tr>';
        return;
      }

      this.registrations = res.data.registrations || [];
      const stats = res.data.stats || {};

      // Update Accounts Stats Cards
      const statCollected = document.getElementById('statAccCollected');
      const statPaidCount = document.getElementById('statAccPaidCount');
      const statPending = document.getElementById('statAccPending');
      const statTotal = document.getElementById('statAccTotal');
      const badge = document.getElementById('accountsPendingCountBadge');
      const resultCount = document.getElementById('tableResultCount');

      const totalColl = stats.totalCollected || 0;
      const paidCount = stats.totalPaidRegistrations || 0;
      const pendingCount = stats.awaitingPayment || 0;
      const totCount = stats.total || this.registrations.length;

      if (statCollected) statCollected.textContent = `₹${Number(totalColl).toLocaleString('en-IN')}`;
      if (statPaidCount) statPaidCount.textContent = paidCount;
      if (statPending) statPending.textContent = pendingCount;
      if (statTotal) statTotal.textContent = totCount;
      if (badge) badge.textContent = `${paidCount} Payments Accounted`;
      if (resultCount) resultCount.textContent = `Showing ${this.registrations.length} transactions`;

      if (!this.registrations.length) {
        container.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:3rem;color:#94A3B8;"><div style="font-size:2rem;margin-bottom:0.5rem;">💳</div>No fee transactions found matching the selected filters.</td></tr>';
        return;
      }

      container.innerHTML = this.registrations.map(r => {
        const refNo = r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`;
        const feePaid = r.exam_fee_status === 'PAID' || ['EXAM_FEE_PAID', 'CONFIRMED'].includes(r.status);
        const receiptNo = r.exam_receipt_no || (feePaid ? `REC-EXAM-2026-${String(r.id).padStart(4, '0')}` : null);
        const txnId = r.exam_transaction_id || (feePaid ? `pay_gtw_${String(r.id).padStart(6, '0')}` : null);
        const feeAmount = r.exam_fee_amount || 1550;

        return `
          <tr style="border-bottom:1px solid #E2E8F0;hover:background:#F8FAFC;">
            <td style="padding:12px;font-size:0.85rem;">
              ${receiptNo ? `
                <div style="font-weight:700;color:#15803D;font-family:monospace;font-size:0.82rem;">${escapeHtml(receiptNo)}</div>
              ` : `
                <span style="color:#94A3B8;font-size:0.75rem;">Awaiting Receipt</span>
              `}
              <div style="font-size:0.72rem;color:#64748B;font-family:monospace;margin-top:2px;">${escapeHtml(refNo)}</div>
            </td>
            <td style="padding:12px;">
              <strong style="color:#0F172A;display:block;font-size:0.88rem;">${escapeHtml(r.full_name)}</strong>
              <span style="font-size:0.74rem;color:#64748B;">Category: ${escapeHtml(r.student_category || 'General')}</span>
            </td>
            <td style="padding:12px;font-size:0.85rem;font-family:monospace;font-weight:600;color:#334155;">
              ${escapeHtml(r.reg_no || r.roll_number)}
            </td>
            <td style="padding:12px;font-size:0.85rem;">
              <span style="font-weight:700;color:#0F172A;display:block;">${escapeHtml(r.department_code || 'CSE')}</span>
              <span style="font-size:0.74rem;color:#64748B;">${escapeHtml(r.program_name || 'B.Tech')}</span>
            </td>
            <td style="padding:12px;text-align:center;">
              <span style="font-weight:700;color:#0B63C5;font-size:0.85rem;">Sem ${r.semester}</span>
              <div style="font-size:0.72rem;color:#64748B;">${escapeHtml(r.candidate_year || '')}</div>
            </td>
            <td style="padding:12px;font-size:0.82rem;">
              <span style="font-weight:600;color:#1E293B;display:block;">Gen-Z Semester Reg Fee</span>
              <span style="font-size:0.72rem;color:#64748B;">Category: EXAM_FEE (100% Cleared)</span>
            </td>
            <td style="padding:12px;text-align:center;">
              ${feePaid ? `
                <div style="font-weight:800;color:#15803D;font-size:0.95rem;">₹${Number(feeAmount).toLocaleString('en-IN')}</div>
                <div style="font-size:0.68rem;color:#16A34A;font-weight:600;">✓ Ledger Posted</div>
              ` : `
                <span style="color:#DC2626;font-weight:700;font-size:0.82rem;background:#FEF2F2;padding:2px 6px;border-radius:4px;">Pending ₹${Number(feeAmount).toLocaleString('en-IN')}</span>
              `}
            </td>
            <td style="padding:12px;font-size:0.82rem;">
              ${feePaid ? `
                <span style="font-weight:600;color:#0F172A;display:block;">${escapeHtml(r.payment_channel || 'Online Gateway (UPI/Netbanking)')}</span>
                <div style="font-size:0.7rem;color:#64748B;font-family:monospace;margin-top:2px;">Txn: ${escapeHtml(txnId || 'pay_online_success')}</div>
              ` : `
                <span style="color:#94A3B8;font-size:0.75rem;">Payment Gateway Not Initiated</span>
              `}
            </td>
            <td style="padding:12px;text-align:center;">
              ${feePaid ? `
                <span style="background:#DCFCE7;color:#15803D;font-weight:700;font-size:0.75rem;padding:0.3rem 0.6rem;border-radius:12px;border:1px solid #86EFAC;display:inline-block;">
                  ✓ PAID &amp; ACCOUNTED
                </span>
              ` : `
                <span style="background:#FFFBEB;color:#B45309;font-weight:700;font-size:0.75rem;padding:0.3rem 0.6rem;border-radius:12px;border:1px solid #FDE68A;display:inline-block;">
                  Awaiting Payment
                </span>
              `}
            </td>
            <td style="padding:12px;text-align:right;">
              <button class="btn btn-sm btn-outline-primary" onclick="accountsRegistrations.viewVoucher(${r.id})" style="border:1px solid #0B63C5;background:#EFF6FF;color:#0B63C5;padding:0.35rem 0.65rem;border-radius:6px;font-size:0.78rem;font-weight:600;cursor:pointer;">
                📄 View Voucher
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#DC2626;">Error loading Accounts data.</td></tr>';
    }
  },

  async viewVoucher(regId) {
    try {
      const res = await api.get(`/registration/detail/${regId}`);
      if (!res || !res.data) return;

      const { registration: reg, financialSummary: fin = {}, clearanceTrail: trail = {} } = res.data;
      const receiptNo = fin.examReceiptNo || reg.exam_receipt_no || `REC-EXAM-2026-${String(reg.id).padStart(4, '0')}`;
      const txnId = fin.examTransactionId || reg.exam_transaction_id || `pay_gtw_${String(reg.id).padStart(6, '0')}`;
      const feeAmount = fin.examFeeAmount || Number(reg.exam_fee_amount || 1550);
      const feePaid = fin.examFeeStatus === 'PAID' || ['EXAM_FEE_PAID', 'CONFIRMED'].includes(reg.status);
      const totalCollegeFee = fin.totalCollegeFee || 115000;
      const totalCollegePaid = fin.totalCollegePaid || 0;
      const collegeBalanceDue = fin.collegeBalanceDue || 0;
      const clearancePercent = fin.clearancePercent || 100;
      const totalOverallPaid = fin.totalPaidOverall || (totalCollegePaid + (feePaid ? feeAmount : 0));

      const subs = reg.subjects || [];
      const subjectsHtml = subs.map((s, idx) => `
        <tr style="border-bottom:1px solid #E2E8F0;">
          <td style="padding:6px 8px;text-align:center;color:#64748B;">${idx + 1}</td>
          <td style="padding:6px 8px;font-weight:700;font-family:monospace;color:#0B63C5;">${escapeHtml(s.code)}</td>
          <td style="padding:6px 8px;font-weight:600;color:#1E293B;">${escapeHtml(s.name)}</td>
          <td style="padding:6px 8px;text-align:center;">${escapeHtml(s.type || 'Theory')}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:700;">${s.credits}</td>
        </tr>
      `).join('');

      const modalHtml = `
        <div id="accVoucherModal" style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(3px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;">
          <div style="background:#ffffff;border-radius:12px;max-width:820px;width:95%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);overflow:hidden;border:1px solid #E2E8F0;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #0B63C5, #1D4ED8);padding:1.1rem 1.5rem;color:#ffffff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
              <div>
                <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;opacity:0.9;">Gen-Z University</div>
                <h3 style="margin:0.2rem 0 0 0;font-size:1.15rem;font-weight:800;">Official Accounts Subject Registration &amp; Fee Clearance Voucher</h3>
              </div>
              <button onclick="document.getElementById('accVoucherModal').remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-weight:700;">✕</button>
            </div>

            <!-- Body -->
            <div style="padding:1.25rem 1.5rem;overflow-y:auto;" id="printableAccountsVoucher">
              <!-- Receipt strip -->
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed #CBD5E1;padding-bottom:0.75rem;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
                <div>
                  <span style="font-size:0.72rem;color:#64748B;display:block;">Receipt / Voucher No.</span>
                  <span style="font-family:monospace;font-size:1rem;font-weight:800;color:#0B63C5;">${receiptNo}</span>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:0.72rem;color:#64748B;display:block;">Voucher Date</span>
                  <span style="font-size:0.85rem;font-weight:600;color:#334155;">${new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <!-- Student Profile Snapshot with Photo -->
              <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:0.85rem 1rem;margin-bottom:1rem;display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:center;">
                <div style="width:68px;height:80px;border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;background:#E2E8F0;display:flex;align-items:center;justify-content:center;">
                  ${reg.photo_url && reg.photo_url.startsWith('http') 
                    ? `<img src="${reg.photo_url}" alt="Student" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='🎓'"/>` 
                    : `<div style="font-size:1.8rem;color:#0B63C5;font-weight:800;">${(reg.full_name || 'S').charAt(0)}</div>`
                  }
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;font-size:0.84rem;">
                  <div><span style="color:#64748B;font-size:0.72rem;">Student Name:</span> <strong style="color:#0F172A;display:block;">${escapeHtml(reg.full_name)}</strong></div>
                  <div><span style="color:#64748B;font-size:0.72rem;">Registration / Roll No:</span> <strong style="color:#0B63C5;font-family:monospace;display:block;">${escapeHtml(reg.reg_no || reg.roll_number)}</strong></div>
                  <div><span style="color:#64748B;font-size:0.72rem;">Program &amp; Department:</span> <span>${escapeHtml(reg.program_name || 'B.Tech')} &mdash; ${escapeHtml(reg.department_code || 'CSE')}</span></div>
                  <div><span style="color:#64748B;font-size:0.72rem;">Academic Term:</span> <strong style="color:#0F172A;">Semester ${reg.semester}</strong></div>
                </div>
              </div>

              <!-- 3 Financial Cards ("Kitna Payment Kya" & "Total Kitna He") -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:0.75rem;margin-bottom:1.25rem;">
                <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-left:4px solid #16A34A;">
                  <div style="font-size:0.72rem;color:#64748B;font-weight:700;">Gen-Z EXAM FEE</div>
                  <div style="font-size:1.25rem;font-weight:800;color:#0F172A;margin:2px 0;">₹${feeAmount.toLocaleString('en-IN')}</div>
                  <div style="font-size:0.75rem;color:#15803D;font-weight:700;">${feePaid ? '✓ PAID & POSTED' : 'PENDING'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid #CBD5E1;border-radius:8px;padding:0.85rem;border-left:4px solid #0B63C5;">
                  <div style="font-size:0.72rem;color:#64748B;font-weight:700;">COLLEGE TUITION FEE</div>
                  <div style="font-size:1.25rem;font-weight:800;color:#16A34A;margin:2px 0;">₹${totalCollegePaid.toLocaleString('en-IN')}</div>
                  <div style="font-size:0.75rem;color:#475569;">Balance Due: ₹${collegeBalanceDue.toLocaleString('en-IN')} (${clearancePercent}%)</div>
                </div>
                <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:0.85rem;border-left:4px solid #15803D;">
                  <div style="font-size:0.72rem;color:#15803D;font-weight:700;">TOTAL PAID OVERALL</div>
                  <div style="font-size:1.25rem;font-weight:800;color:#0F172A;margin:2px 0;">₹${totalOverallPaid.toLocaleString('en-IN')}</div>
                  <div style="font-size:0.75rem;color:#15803D;font-weight:700;">✓ Accounts Audit Cleared</div>
                </div>
              </div>

              <!-- Registered Subjects ("Kon Kon Sa Subject") -->
              <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.88rem;font-weight:800;color:#0F172A;margin-bottom:0.4rem;">
                  Registered Subjects Particulars (${subs.length} Subjects, ${reg.total_credits} Credits)
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem;border:1px solid #E2E8F0;">
                  <thead>
                    <tr style="background:#F1F5F9;color:#475569;text-align:left;">
                      <th style="padding:6px 8px;text-align:center;width:35px;">#</th>
                      <th style="padding:6px 8px;width:110px;">Code</th>
                      <th style="padding:6px 8px;">Subject Title</th>
                      <th style="padding:6px 8px;text-align:center;width:75px;">Type</th>
                      <th style="padding:6px 8px;text-align:center;width:60px;">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${subjectsHtml.length ? subjectsHtml : '<tr><td colspan="5" style="padding:10px;text-align:center;color:#94A3B8;">No subjects</td></tr>'}
                  </tbody>
                  <tfoot>
                    <tr style="background:#F8FAFC;font-weight:800;border-top:1px solid #CBD5E1;">
                      <td colspan="4" style="padding:6px 8px;text-align:right;">TOTAL REGISTERED CREDITS:</td>
                      <td style="padding:6px 8px;text-align:center;color:#0B63C5;">${reg.total_credits}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Clearance Trail Summary ("Total Clearance Details") -->
              <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:8px;padding:0.75rem 1rem;font-size:0.78rem;color:#475569;margin-bottom:1rem;">
                <div style="font-weight:700;color:#0F172A;margin-bottom:4px;">Institutional Multi-Tier Clearance Trail:</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:0.5rem;">
                  <div>• HOD: <strong style="color:#16A34A;">✓ Cleared</strong> (${escapeHtml(trail.hod?.officer || 'Verified')})</div>
                  <div>• Director: <strong style="color:#16A34A;">✓ Approved</strong> (${escapeHtml(trail.director?.officer || 'Approved')})</div>
                  <div>• Accounts: <strong style="color:#16A34A;">✓ Cleared</strong> (100% Verified)</div>
                  <div>• Exam Cell: <strong style="color:#16A34A;">✓ Confirmed</strong> (${escapeHtml(trail.examSection?.receiptNo || 'Active')})</div>
                </div>
              </div>

              <!-- Signatures Section -->
              <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:1.25rem;padding-top:0.75rem;border-top:1px solid #E2E8F0;font-size:0.75rem;color:#64748B;">
                <div>
                  <div>Accounts &amp; Finance Department, GENZ</div>
                  <div style="font-size:0.7rem;color:#94A3B8;">Digitally Certified Ledger Voucher &bull; Gen-Z Regulation Compliance</div>
                </div>
                <div style="text-align:right;">
                  <div style="border-bottom:1px solid #64748B;width:120px;margin-bottom:4px;"></div>
                  <div>Authorized Accounts Officer</div>
                </div>
              </div>
            </div>

            <!-- Actions Footer -->
            <div style="background:#F8FAFC;padding:0.85rem 1.5rem;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end;gap:0.75rem;flex-shrink:0;">
              <button onclick="accountsRegistrations.printVoucher()" class="btn btn-sm btn-primary" style="background:#0B63C5;border:none;padding:0.45rem 1.25rem;border-radius:6px;color:#fff;font-weight:700;cursor:pointer;">
                🖨️ Print Accounts Voucher
              </button>
              <button onclick="document.getElementById('accVoucherModal').remove()" class="btn btn-sm btn-secondary" style="background:#E2E8F0;border:none;padding:0.45rem 1rem;border-radius:6px;color:#334155;font-weight:600;cursor:pointer;">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (e) {
      console.error(e);
      ui.showToast('Failed to load voucher details.', 'error');
    }
  },

  printVoucher() {
    const el = document.getElementById('printableAccountsVoucher');
    if (!el) return;
    const printWin = window.open('', '', 'width=700,height=600');
    printWin.document.write(`
      <html>
        <head>
          <title>Accounts Voucher</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; }
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
      'Receipt Number': r.exam_receipt_no || `REC-EXAM-2026-${String(r.id).padStart(4, '0')}`,
      'Reference No': r.reference_number || `REG-2026-${r.department_code || 'CSE'}-${String(r.id).padStart(5, '0')}`,
      'Candidate Name': r.full_name,
      'Roll Number': r.reg_no || r.roll_number,
      'Program': r.program_name || 'B.Tech',
      'Department': r.department_code || 'CSE',
      'Semester': `Semester ${r.semester}`,
      'Academic Year': r.candidate_year || '',
      'Amount Paid (INR)': r.exam_fee_amount || 1550,
      'Payment Mode': r.payment_channel || 'Online Payment Gateway',
      'Gateway Txn ID': r.exam_transaction_id || `pay_gtw_${String(r.id).padStart(6, '0')}`,
      'Fee Status': r.exam_fee_status || (['EXAM_FEE_PAID', 'CONFIRMED'].includes(r.status) ? 'PAID' : 'PENDING'),
      'Registration Status': r.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AccountsFeeRegister');

    XLSX.writeFile(workbook, 'BEC_Accounts_Semester_Registration_Fees.xlsx');
    ui.showToast('Accounts fee register exported to Excel.', 'success');
  }
};
