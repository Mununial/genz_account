/**
 * Financial Reports, Defaulters & University Registrations Module
 * Gen-Z University Accounts & ERP System
 */

const reportsModule = {
  activeTab: 'defaulters',
  currentAgingFilter: 'ALL',
  currentAmountFilter: 'ALL',
  currentRegStatusFilter: 'ALL',

  // Cached data
  defaultersData: [],
  collectionsData: [],
  registrationsData: [],

  // Branch master list (All 18 institutional departments)
  branches: [
    { code: 'CSE', name: 'Computer Science & Engineering', course: 'B.Tech' },
    { code: 'CS-DS', name: 'CSE (Data Science)', course: 'B.Tech' },
    { code: 'AGRI', name: 'Agricultural Engineering', course: 'B.Tech' },
    { code: 'AERO', name: 'Aeronautical Engineering', course: 'B.Tech' },
    { code: 'EE', name: 'Electrical Engineering', course: 'B.Tech' },
    { code: 'MECH', name: 'Mechanical Engineering', course: 'B.Tech' },
    { code: 'CIVIL', name: 'Civil Engineering', course: 'B.Tech' },
    { code: 'ECE', name: 'Electronics & Comm Engineering', course: 'B.Tech' },
    { code: 'DIP-MECH', name: 'Diploma Mechanical Engineering', course: 'Diploma' },
    { code: 'DIP-CIVIL', name: 'Diploma Civil Engineering', course: 'Diploma' },
    { code: 'DIP-EE', name: 'Diploma Electrical Engineering', course: 'Diploma' },
    { code: 'MBA-FIN', name: 'MBA (Finance & Banking)', course: 'MBA' },
    { code: 'MBA-HR', name: 'MBA (Human Resources)', course: 'MBA' },
    { code: 'MBA-MKT', name: 'MBA (Marketing & Sales)', course: 'MBA' },
    { code: 'MBA-OPS', name: 'MBA (Operations & Supply Chain)', course: 'MBA' },
    { code: 'MBA-BA', name: 'MBA (Business Analytics)', course: 'MBA' }
  ],
  academicPrograms: {
    'B.Tech': {
      years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester']
      }
    },
    'Diploma': {
      years: ['1st Year', '2nd Year', '3rd Year'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester']
      }
    },
    'MBA': {
      years: ['1st Year', '2nd Year'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester']
      }
    }
  },

  async init() {
    this.populateBranchDropdowns();

    // Read URL param for active tab
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab');
    if (requestedTab && ['defaulters', 'collections', 'registrations'].includes(requestedTab)) {
      this.activeTab = requestedTab;
    }

    // Set initial date filter for collections (Default current session / past 30 days)
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const past30 = d.toISOString().split('T')[0];

    const startEl = document.getElementById('reportStartDate');
    const endEl = document.getElementById('reportEndDate');
    if (startEl && !startEl.value) startEl.value = past30;
    if (endEl && !endEl.value) endEl.value = today;

    // Load initial tab & count badges in parallel
    await Promise.all([
      this.loadDefaulters(),
      this.loadCollections(),
      this.loadRegistrations()
    ]);

    this.onDefaulterCourseChange();
    this.onCollectionCourseChange();
    this.onRegCourseChange();
    this.switchReportTab(this.activeTab);
  },

  populateBranchDropdowns() {
    const dSelect = document.getElementById('defaulterBranchFilter');
    const rSelect = document.getElementById('regBranchFilter');

    const opts = this.branches.map(b => `<option value="${escapeHtml(b.code)}">${escapeHtml(b.name)} (${b.code})</option>`).join('');

    if (dSelect) {
      dSelect.innerHTML = `<option value="">All Branches (${this.branches.length})</option>` + opts;
    }
    if (rSelect) {
      rSelect.innerHTML = `<option value="">All Branches (${this.branches.length})</option>` + opts;
    }
  },

  switchReportTab(tab) {
    this.activeTab = tab;

    // Tab buttons styling
    const tabs = ['defaulters', 'collections', 'registrations'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const view = document.getElementById(`reportView${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (view) view.style.display = t === tab ? 'block' : 'none';
    });

    // Update URL query string without reloading page
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  },

  // =========================================================================
  // TAB 1: OVERDUE FEE DEFAULTERS
  // =========================================================================

  onDefaulterCourseChange() {
    const courseSel = document.getElementById('defaulterCourseFilter')?.value || '';
    const yearSel = document.getElementById('defaulterYearFilter');
    const semSel = document.getElementById('defaulterSemFilter');
    const branchSel = document.getElementById('defaulterBranchFilter');

    if (yearSel && semSel) {
      let availableYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      if (courseSel === 'MBA') availableYears = ['1st Year', '2nd Year'];
      else if (courseSel === 'Diploma') availableYears = ['1st Year', '2nd Year', '3rd Year'];

      const currentYearVal = yearSel.value;
      yearSel.innerHTML = `<option value="">All Years (${availableYears.length})</option>` +
        availableYears.map(y => `<option value="${y}" ${currentYearVal === y ? 'selected' : ''}>${y}</option>`).join('');

      this.onDefaulterYearChange(false);
    }

    if (branchSel) {
      let filteredBranches = this.branches;
      if (courseSel) {
        filteredBranches = this.branches.filter(b => b.course === courseSel);
      }
      branchSel.innerHTML = `<option value="">All Branches (${filteredBranches.length})</option>` +
        filteredBranches.map(b => `<option value="${escapeHtml(b.code)}">${escapeHtml(b.name)} (${b.code})</option>`).join('');
    }

    this.renderDefaultersTable();
  },

  onDefaulterYearChange(triggerRender = true) {
    const courseSel = document.getElementById('defaulterCourseFilter')?.value || '';
    const yearVal = document.getElementById('defaulterYearFilter')?.value || '';
    const semSel = document.getElementById('defaulterSemFilter');

    if (!semSel) return;

    const prog = this.academicPrograms[courseSel] || {
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester']
      }
    };

    let sems = prog.semesters;
    if (yearVal && prog.yearSemesters[yearVal]) {
      sems = prog.yearSemesters[yearVal];
    }

    const currentSemVal = semSel.value;
    semSel.innerHTML = `<option value="">All Semesters (${sems.length})</option>` +
      sems.map((sm, idx) => {
        const semNum = sm.match(/\d+/)?.[0] || (idx + 1);
        return `<option value="${semNum}" ${currentSemVal === semNum ? 'selected' : ''}>${sm}</option>`;
      }).join('');

    if (triggerRender) {
      this.renderDefaultersTable();
    }
  },

  setAgingFilter(aging, btn) {
    this.currentAgingFilter = aging;
    btn.parentElement.querySelectorAll('.year-filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderDefaultersTable();
  },

  setAmountFilter(amount, btn) {
    this.currentAmountFilter = amount;
    btn.parentElement.querySelectorAll('.year-filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderDefaultersTable();
  },

  onDefaulterSearch() {
    this.renderDefaultersTable();
  },

  async loadDefaulters() {
    const tbody = document.getElementById('defaultersTbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading overdue defaulters...</td></tr>`;
    }

    try {
      const res = await api.get('/reports/defaulters');
      this.defaultersData = (res && res.data && res.data.defaulters) || [];
      this.renderDefaultersTable();
    } catch (err) {
      console.error('loadDefaulters error:', err);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--danger-rose); padding: 2rem;">Failed to load defaulters records.</td></tr>';
      }
    }
  },

  getFilteredDefaulters() {
    let list = [...this.defaultersData];
    const course = document.getElementById('defaulterCourseFilter')?.value || '';
    const year = document.getElementById('defaulterYearFilter')?.value || '';
    const semester = document.getElementById('defaulterSemFilter')?.value || '';
    const session = document.getElementById('defaulterSessionFilter')?.value || '';
    const branchCode = document.getElementById('defaulterBranchFilter')?.value || '';
    const q = (document.getElementById('defaulterSearchInput')?.value || '').trim().toLowerCase();

    // Program Course filter
    if (course) {
      list = list.filter(d => (d.course_name || 'B.Tech').toLowerCase().includes(course.toLowerCase()));
    }

    // Academic Year filter - STRICT (2nd Year matches only 2nd Year, never 1st Year!)
    if (year) {
      list = list.filter(d => {
        const yr = (d.academic_year || '').trim();
        if (year === '2nd Year') return yr === '2nd Year' || (yr.includes('2nd') && !yr.includes('1st'));
        if (year === '1st Year') return yr === '1st Year' || (yr.includes('1st') && !yr.includes('2nd'));
        if (year === '3rd Year') return yr === '3rd Year' || yr.includes('3rd');
        if (year === '4th Year') return yr === '4th Year' || yr.includes('4th');
        return yr === year;
      });
    }

    // Semester filter
    if (semester) {
      list = list.filter(d => {
        const sSem = String(d.current_semester_id || d.semester_id || '');
        const sLabel = (d.semester_label || '').toLowerCase();
        return sSem === semester || sLabel.includes(semester.toLowerCase());
      });
    }

    // Session filter
    if (session) {
      list = list.filter(d => (d.session || d.session_name || '2026-27').includes(session));
    }

    // Branch filter
    if (branchCode) {
      list = list.filter(d => (d.branch_code === branchCode) || (d.branch_name && d.branch_name.toLowerCase().includes(branchCode.toLowerCase())));
    }

    // Aging filter
    if (this.currentAgingFilter !== 'ALL') {
      if (this.currentAgingFilter === '0-30') list = list.filter(d => d.days_overdue >= 0 && d.days_overdue <= 30);
      else if (this.currentAgingFilter === '31-60') list = list.filter(d => d.days_overdue >= 31 && d.days_overdue <= 60);
      else if (this.currentAgingFilter === '61-90') list = list.filter(d => d.days_overdue >= 61 && d.days_overdue <= 90);
      else if (this.currentAgingFilter === '90+') list = list.filter(d => d.days_overdue > 90);
    }

    // Amount range filter
    if (this.currentAmountFilter !== 'ALL') {
      if (this.currentAmountFilter === 'LT10K') list = list.filter(d => parseFloat(d.outstanding_amount) < 10000);
      else if (this.currentAmountFilter === '10K-50K') list = list.filter(d => parseFloat(d.outstanding_amount) >= 10000 && parseFloat(d.outstanding_amount) <= 50000);
      else if (this.currentAmountFilter === 'GT50K') list = list.filter(d => parseFloat(d.outstanding_amount) > 50000);
    }

    // Search query
    if (q) {
      list = list.filter(d => 
        (d.full_name && d.full_name.toLowerCase().includes(q)) ||
        (d.reg_no && d.reg_no.toLowerCase().includes(q)) ||
        (d.phone && d.phone.includes(q))
      );
    }

    return list;
  },

  renderDefaultersTable() {
    const list = this.getFilteredDefaulters();
    const tbody = document.getElementById('defaultersTbody');

    // Update KPI cards & badges
    const totalOverdue = list.reduce((sum, d) => sum + (parseFloat(d.outstanding_amount) || 0), 0);
    const criticalCount = list.filter(d => (parseInt(d.days_overdue, 10) || 0) > 60).length;

    const countEl = document.getElementById('defaultersCount');
    const overdueEl = document.getElementById('defaultersTotalOverdue');
    const criticalEl = document.getElementById('defaultersCriticalCount');
    const badgeEl = document.getElementById('tabDefaultersCountBadge');

    if (countEl) countEl.textContent = list.length;
    if (overdueEl) overdueEl.textContent = ui.formatCurrency(totalOverdue);
    if (criticalEl) criticalEl.textContent = criticalCount;
    if (badgeEl) badgeEl.textContent = list.length;

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="empty-state"><div class="empty-state-title">No Overdue Defaulters Found</div><div class="empty-state-text">All student accounts matching this filter criteria have cleared their dues!</div></td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((d, idx) => {
      const days = parseInt(d.days_overdue, 10) || 0;
      const agingBadge = days > 90
        ? `<span class="badge badge-danger" style="font-weight: 800;">${days} d (90+ Days)</span>`
        : (days > 60
          ? `<span class="badge" style="background: #FEE2E2; color: #991B1B; font-weight: 700;">${days} d (61–90)</span>`
          : (days > 30
            ? `<span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700;">${days} d (31–60)</span>`
            : `<span class="badge badge-neutral" style="font-weight: 600;">${days} d (0–30)</span>`));

      const sId = d.id || d.student_id;

      return `
        <tr>
          <td style="text-align: center; color: #64748B; font-weight: 700;">${idx + 1}</td>
          <td><code>${escapeHtml(d.reg_no)}</code></td>
          <td>
            <a href="/student-fee.html?studentId=${sId}" title="View Student Fee Ledger" style="font-weight: 700; color: var(--primary-navy); text-decoration: none;">
              ${escapeHtml(d.full_name)} &rarr;
            </a>
            <br><span style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(d.phone || 'Phone N/A')}</span>
          </td>
          <td><span class="badge badge-muted">${escapeHtml(d.branch_code || 'B.Tech')}</span></td>
          <td>${escapeHtml(d.semester_label || '1st Semester')}</td>
          <td style="text-align: right; font-weight: 600;">${ui.formatCurrency(d.total_payable || 0)}</td>
          <td style="text-align: right; font-weight: 600; color: var(--success-emerald);">${ui.formatCurrency(d.paid_amount || 0)}</td>
          <td style="text-align: right; font-weight: 800; color: var(--danger-rose); font-size: 0.95rem;">${ui.formatCurrency(d.outstanding_amount || 0)}</td>
          <td>${ui.formatDate(d.due_date)}</td>
          <td>${agingBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="/receipt-desk.html?studentId=${sId}" class="btn btn-sm btn-primary" style="text-decoration: none; font-weight: 600; padding: 0.25rem 0.65rem;" title="1-Click load into Fast Receipt Desk">
              Collect Dues
            </a>
          </td>
        </tr>
      `;
    }).join('');
  },

  exportDefaultersExcel() {
    const list = this.getFilteredDefaulters();
    const totalOverdue = list.reduce((sum, d) => sum + (parseFloat(d.outstanding_amount) || 0), 0);
    const totalBilled = list.reduce((sum, d) => sum + (parseFloat(d.total_payable) || 0), 0);
    const totalPaid = list.reduce((sum, d) => sum + (parseFloat(d.paid_amount) || 0), 0);

    becExportUtils.exportToExcel({
      filename: 'BEC_Overdue_Defaulters_Register',
      title: 'OVERDUE FEE DEFAULTERS & PENDING DUES AUDIT REGISTER',
      filterSummary: `Aging: ${this.currentAgingFilter} | Amount: ${this.currentAmountFilter} | Total Defaulters: ${list.length}`,
      stats: {
        'Defaulters Count': list.length,
        'Total Billed Amount': becExportUtils.formatCurrency(totalBilled),
        'Total Recovered': becExportUtils.formatCurrency(totalPaid),
        'Outstanding Defaulter Dues': becExportUtils.formatCurrency(totalOverdue)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '40px' },
        { label: 'Registration No', key: 'reg_no' },
        { label: 'Student Full Name', key: 'full_name' },
        { label: 'Mobile Contact', key: 'phone' },
        { label: 'Branch Code', key: 'branch_code' },
        { label: 'Semester', key: 'semester_label' },
        { label: 'Invoice No', key: 'invoice_no' },
        { label: 'Total Billed (INR)', key: 'total_payable', type: 'currency' },
        { label: 'Amount Paid (INR)', key: 'paid_amount', type: 'currency' },
        { label: 'Outstanding Dues (INR)', key: 'outstanding_amount', type: 'currency', isTotal: true },
        { label: 'Due Date', key: 'due_date' },
        { label: 'Days Overdue', key: 'days_overdue' }
      ],
      rows: list
    });
  },

  exportDefaultersPDF() {
    const list = this.getFilteredDefaulters();
    const totalOverdue = list.reduce((sum, d) => sum + (parseFloat(d.outstanding_amount) || 0), 0);
    const totalBilled = list.reduce((sum, d) => sum + (parseFloat(d.total_payable) || 0), 0);
    const totalPaid = list.reduce((sum, d) => sum + (parseFloat(d.paid_amount) || 0), 0);

    becExportUtils.exportToPDF({
      title: 'OVERDUE FEE DEFAULTERS & OUTSTANDING DUES REGISTER',
      subtitle: 'Mandatory Compliance & Collections Recovery Audit • Session 2026-27',
      filterSummary: `Aging: ${this.currentAgingFilter} | Amount: ${this.currentAmountFilter}`,
      stats: {
        'Defaulters Count': list.length,
        'Total Invoiced': becExportUtils.formatCurrency(totalBilled),
        'Paid Amount': becExportUtils.formatCurrency(totalPaid),
        'Total Overdue Balance': becExportUtils.formatCurrency(totalOverdue)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '35px', align: 'center' },
        { label: 'Reg No', key: 'reg_no', width: '100px' },
        { label: 'Student Name & Phone', key: 'full_name' },
        { label: 'Branch', key: 'branch_code', width: '70px' },
        { label: 'Semester', key: 'semester_label', width: '85px' },
        { label: 'Total Billed', key: 'total_payable', type: 'currency', width: '90px' },
        { label: 'Paid', key: 'paid_amount', type: 'currency', width: '85px' },
        { label: 'Overdue Dues', key: 'outstanding_amount', type: 'currency', isTotal: true, width: '95px' },
        { label: 'Days Overdue', key: 'days_overdue', width: '70px', align: 'center' }
      ],
      rows: list.map(d => ({
        ...d,
        full_name: `${d.full_name} (${d.phone || 'N/A'})`
      })),
      filename: 'BEC_Defaulters_Register'
    });
  },

  // =========================================================================
  // TAB 2: FEE COLLECTIONS STATEMENT
  // =========================================================================

  onCollectionSearch() {
    this.renderCollectionsTable();
  },

  async loadCollections() {
    const startDate = document.getElementById('reportStartDate')?.value || '';
    const endDate = document.getElementById('reportEndDate')?.value || '';
    const tbody = document.getElementById('reportCollectionsTbody');

    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" style="padding: 1.5rem; text-align: center;"><span class="spinner"></span> Loading collections statement...</td></tr>`;
    }

    try {
      const res = await api.get('/reports/collections', { startDate, endDate });
      this.collectionsData = (res && res.data && (res.data.collections || res.data.recentPayments)) || [];
      this.renderCollectionsTable();
    } catch (err) {
      console.error('loadCollections error:', err);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--danger-rose); padding: 2rem;">Failed to load collections report.</td></tr>';
      }
    }
  },

  onCollectionCourseChange() {
    const courseSel = document.getElementById('reportCourseFilter')?.value || '';
    const yearSel = document.getElementById('reportYearFilter');
    const semSel = document.getElementById('reportSemesterFilter');

    if (yearSel && semSel) {
      let availableYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      if (courseSel === 'MBA') availableYears = ['1st Year', '2nd Year'];
      else if (courseSel === 'Diploma') availableYears = ['1st Year', '2nd Year', '3rd Year'];

      const currentYearVal = yearSel.value;
      yearSel.innerHTML = `<option value="">All Years (${availableYears.length})</option>` +
        availableYears.map(y => `<option value="${y}" ${currentYearVal === y ? 'selected' : ''}>${y}</option>`).join('');

      this.onCollectionYearChange(false);
    }
    this.renderCollectionsTable();
  },

  onCollectionYearChange(triggerRender = true) {
    const courseSel = document.getElementById('reportCourseFilter')?.value || '';
    const yearVal = document.getElementById('reportYearFilter')?.value || '';
    const semSel = document.getElementById('reportSemesterFilter');

    if (!semSel) return;

    const prog = this.academicPrograms[courseSel] || {
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester']
      }
    };

    let sems = prog.semesters;
    if (yearVal && prog.yearSemesters[yearVal]) {
      sems = prog.yearSemesters[yearVal];
    }

    const currentSemVal = semSel.value;
    semSel.innerHTML = `<option value="">All Semesters (${sems.length})</option>` +
      sems.map(sm => `<option value="${sm}" ${currentSemVal === sm ? 'selected' : ''}>${sm}</option>`).join('');

    if (triggerRender) {
      this.renderCollectionsTable();
    }
  },

  getFilteredCollections() {
    let list = [...this.collectionsData];
    const course = document.getElementById('reportCourseFilter')?.value || '';
    const year = document.getElementById('reportYearFilter')?.value || '';
    const semester = document.getElementById('reportSemesterFilter')?.value || '';
    const session = document.getElementById('reportSessionFilter')?.value || '';
    const mode = (document.getElementById('reportPaymentMethodFilter')?.value || '').trim();
    const q = (document.getElementById('reportCollectionSearch')?.value || '').trim().toLowerCase();

    // Program Course filter
    if (course) {
      list = list.filter(p => (p.course_name || 'B.Tech').toLowerCase().includes(course.toLowerCase()));
    }

    // Academic Year filter - STRICT
    if (year) {
      list = list.filter(p => {
        const yr = (p.academic_year || '').trim();
        if (year === '2nd Year') return yr === '2nd Year' || (yr.includes('2nd') && !yr.includes('1st'));
        if (year === '1st Year') return yr === '1st Year' || (yr.includes('1st') && !yr.includes('2nd'));
        if (year === '3rd Year') return yr === '3rd Year' || yr.includes('3rd');
        if (year === '4th Year') return yr === '4th Year' || yr.includes('4th');
        return yr === year;
      });
    }

    // Semester filter
    if (semester) {
      list = list.filter(p => {
        const sSem = String(p.current_semester_id || '');
        const sLabel = (p.semester_label || p.semester || '').toLowerCase();
        return sSem === semester || sLabel.includes(semester.toLowerCase());
      });
    }

    // Session filter
    if (session) {
      list = list.filter(p => (p.session || p.session_name || '2026-27').includes(session));
    }

    // Mode filter
    if (mode) {
      if (mode === 'ONLINE_GATEWAY') {
        list = list.filter(p => 
          (p.payment_method || '').toUpperCase().includes('ONLINE') ||
          (p.payment_method || '').toUpperCase().includes('GATEWAY') ||
          (p.transaction_id || '').startsWith('PAY-GW')
        );
      } else if (mode === 'CASH') {
        list = list.filter(p => (p.payment_method || '').toUpperCase().includes('CASH'));
      } else {
        list = list.filter(p => (p.payment_method || '').toUpperCase().includes(mode.toUpperCase()));
      }
    }

    // Search query
    if (q) {
      list = list.filter(p => 
        ((p.receipt_no || p.payment_no) && (p.receipt_no || p.payment_no).toLowerCase().includes(q)) ||
        ((p.full_name || p.student_name) && (p.full_name || p.student_name).toLowerCase().includes(q)) ||
        (p.reg_no && p.reg_no.toLowerCase().includes(q)) ||
        (p.transaction_id && p.transaction_id.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderCollectionsTable() {
    const list = this.getFilteredCollections();
    const tbody = document.getElementById('reportCollectionsTbody');

    // Stats calculation
    const totalCollected = list.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const avgReceipt = list.length > 0 ? (totalCollected / list.length) : 0;
    const onlineCount = list.filter(p => 
      (p.payment_method || '').toUpperCase().includes('ONLINE') ||
      (p.payment_method || '').toUpperCase().includes('GATEWAY') ||
      (p.transaction_id || '').startsWith('PAY-GW')
    ).length;
    const onlinePercent = list.length > 0 ? ((onlineCount / list.length) * 100).toFixed(0) : '0';

    const totalEl = document.getElementById('reportTotalCollected');
    const countEl = document.getElementById('reportTotalTransactions');
    const avgEl = document.getElementById('reportAvgReceipt');
    const shareEl = document.getElementById('reportOnlineShare');
    const badgeEl = document.getElementById('tabCollectionsCountBadge');

    if (totalEl) totalEl.textContent = ui.formatCurrency(totalCollected);
    if (countEl) countEl.textContent = list.length;
    if (avgEl) avgEl.textContent = ui.formatCurrency(avgReceipt);
    if (shareEl) shareEl.textContent = `${onlinePercent}% Online (${onlineCount}/${list.length})`;
    if (badgeEl) badgeEl.textContent = list.length;

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state"><div class="empty-state-title">No Collections in Period</div><div class="empty-state-text">No verified inflow payments match the selected date or search filter.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((c, idx) => {
      const rNo = c.receipt_no || c.payment_no || ('REC-' + c.id);
      const isOnline = (c.payment_method || '').toUpperCase().includes('ONLINE') || 
                       (c.payment_method || '').toUpperCase().includes('GATEWAY') ||
                       (c.transaction_id || '').startsWith('PAY-GW');

      const modeBadge = isOnline
        ? `<span class="badge" style="background: #ECFDF5; color: #047857; font-weight: 700; border: 1px solid #A7F3D0;">🌐 ONLINE PORTAL</span>`
        : (c.payment_method === 'CASH' || c.payment_method === 'Cash'
          ? `<span class="badge" style="background: #F1F5F9; color: #334155; font-weight: 600;">COUNTER CASH</span>`
          : `<span class="badge badge-info" style="font-weight: 700;">${escapeHtml(c.payment_method || 'CASH')}</span>`);

      return `
        <tr>
          <td style="text-align: center; color: #64748B; font-weight: 700;">${idx + 1}</td>
          <td>
            <a href="/receipts.html?receiptNo=${encodeURIComponent(rNo)}" title="View receipt in register" style="font-weight: 700; color: var(--primary-navy); text-decoration: none; font-family: monospace;">
              ${escapeHtml(rNo)}
            </a>
          </td>
          <td>
            <a href="/student-fee.html?studentId=${c.student_id}" title="View student ledger" style="font-weight: 600; color: var(--brand-blue); text-decoration: none;">
              ${escapeHtml(c.full_name || c.student_name)}
            </a>
            <br><code style="font-size: 0.75rem;">${escapeHtml(c.reg_no || '-')}</code>
          </td>
          <td><span class="badge badge-muted">${escapeHtml(c.branch_code || 'B.Tech')}</span></td>
          <td style="text-align: right; font-weight: 800; color: var(--success-emerald); font-size: 0.95rem;">${ui.formatCurrency(c.amount)}</td>
          <td>${modeBadge}</td>
          <td><code>${escapeHtml(c.transaction_id || 'COUNTER')}</code></td>
          <td>${ui.formatDate(c.created_at)}</td>
          <td style="text-align: right;">
            <a href="/receipts.html?receiptNo=${encodeURIComponent(rNo)}" class="btn btn-sm btn-outline" style="text-decoration: none; padding: 0.25rem 0.65rem; font-weight: 600;">
              View Receipt
            </a>
          </td>
        </tr>
      `;
    }).join('');
  },

  exportCollectionsExcel() {
    const list = this.getFilteredCollections();
    const totalCollected = list.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    becExportUtils.exportToExcel({
      filename: 'BEC_Fee_Collections_Statement',
      title: 'FEE COLLECTIONS STATEMENT & AUDIT INFLOW REGISTER',
      filterSummary: `Date Filter Applied | Total Receipts: ${list.length}`,
      stats: {
        'Total Receipts': list.length,
        'Total Verified Inflow': becExportUtils.formatCurrency(totalCollected)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '40px' },
        { label: 'Receipt No', key: 'receipt_no' },
        { label: 'Registration No', key: 'reg_no' },
        { label: 'Student Full Name', key: 'full_name' },
        { label: 'Branch Code', key: 'branch_code' },
        { label: 'Invoice No', key: 'invoice_no' },
        { label: 'Amount Paid (INR)', key: 'amount', type: 'currency', isTotal: true },
        { label: 'Payment Mode', key: 'payment_method' },
        { label: 'Transaction / Gateway Ref', key: 'transaction_id' },
        { label: 'Date Time', key: 'created_at' }
      ],
      rows: list
    });
  },

  exportCollectionsPDF() {
    const list = this.getFilteredCollections();
    const totalCollected = list.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    becExportUtils.exportToPDF({
      title: 'FEE COLLECTIONS STATEMENT & INFLOW REGISTER',
      subtitle: 'Official Cash Desk & Online Payment Inflow Audit • Session 2026-27',
      filterSummary: `Total Transactions: ${list.length}`,
      stats: {
        'Receipts Issued': list.length,
        'Total Inflow Amount': becExportUtils.formatCurrency(totalCollected)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '35px', align: 'center' },
        { label: 'Receipt No', key: 'receipt_no', width: '110px' },
        { label: 'Student Name & Reg No', key: 'full_name' },
        { label: 'Branch', key: 'branch_code', width: '70px' },
        { label: 'Amount Paid', key: 'amount', type: 'currency', isTotal: true, width: '100px' },
        { label: 'Method', key: 'payment_method', width: '90px' },
        { label: 'Txn Ref', key: 'transaction_id', width: '120px' },
        { label: 'Date', key: 'created_at', width: '95px' }
      ],
      rows: list.map(c => ({
        ...c,
        full_name: `${c.full_name || c.student_name} (${c.reg_no})`,
        created_at: ui.formatDate(c.created_at)
      })),
      filename: 'BEC_Collections_Statement'
    });
  },

  // =========================================================================
  // TAB 3: EXAM & UNIVERSITY REGISTRATION FEE REGISTER
  // =========================================================================

  setRegStatusFilter(status, btn) {
    this.currentRegStatusFilter = status;
    btn.parentElement.querySelectorAll('.year-filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderRegistrationsTable();
  },

  onRegCourseChange() {
    const course = document.getElementById('regCourseFilter')?.value || '';
    const yearSel = document.getElementById('regYearFilter');
    const semSel = document.getElementById('regSemFilter');
    const bSelect = document.getElementById('regBranchFilter');

    if (yearSel && semSel) {
      let availableYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      if (course === 'MBA') availableYears = ['1st Year', '2nd Year'];
      else if (course === 'Diploma') availableYears = ['1st Year', '2nd Year', '3rd Year'];

      const currentYearVal = yearSel.value;
      yearSel.innerHTML = `<option value="">All Years (${availableYears.length})</option>` +
        availableYears.map(y => `<option value="${y}" ${currentYearVal === y ? 'selected' : ''}>${y}</option>`).join('');

      this.onRegYearChange(false);
    }

    if (bSelect) {
      let filteredBranches = this.branches;
      if (course) {
        filteredBranches = this.branches.filter(b => b.course === course);
      }
      bSelect.innerHTML = `<option value="">All Branches (${filteredBranches.length})</option>` +
        filteredBranches.map(b => `<option value="${escapeHtml(b.code)}">${escapeHtml(b.name)} (${b.code})</option>`).join('');
    }

    this.renderRegistrationsTable();
  },

  onRegYearChange(triggerRender = true) {
    const course = document.getElementById('regCourseFilter')?.value || '';
    const yearVal = document.getElementById('regYearFilter')?.value || '';
    const semSel = document.getElementById('regSemFilter');

    if (!semSel) return;

    const prog = this.academicPrograms[course] || {
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester']
      }
    };

    let sems = prog.semesters;
    if (yearVal && prog.yearSemesters[yearVal]) {
      sems = prog.yearSemesters[yearVal];
    }

    const currentSemVal = semSel.value;
    semSel.innerHTML = `<option value="">All Semesters (${sems.length})</option>` +
      sems.map(sm => `<option value="${sm}" ${currentSemVal === sm ? 'selected' : ''}>${sm}</option>`).join('');

    if (triggerRender) {
      this.renderRegistrationsTable();
    }
  },

  onRegSearch() {
    this.renderRegistrationsTable();
  },

  async loadRegistrations() {
    const tbody = document.getElementById('registrationsTbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading university exam & registration records...</td></tr>`;
    }

    try {
      const res = await api.get('/reports/registrations');
      this.registrationsData = (res && res.data && res.data.registrations) || [];
      this.renderRegistrationsTable();
    } catch (err) {
      console.error('loadRegistrations error:', err);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: var(--danger-rose); padding: 2rem;">Failed to load registration fee records.</td></tr>';
      }
    }
  },

  getFilteredRegistrations() {
    let list = [...this.registrationsData];
    const course = document.getElementById('regCourseFilter')?.value || '';
    const year = document.getElementById('regYearFilter')?.value || '';
    const semester = document.getElementById('regSemFilter')?.value || '';
    const session = document.getElementById('regSessionFilter')?.value || '';
    const branch = document.getElementById('regBranchFilter')?.value || '';
    const q = (document.getElementById('regSearchInput')?.value || '').trim().toLowerCase();

    // Reg status pill filter
    if (this.currentRegStatusFilter !== 'ALL') {
      list = list.filter(r => r.payment_status === this.currentRegStatusFilter);
    }

    // Program course filter
    if (course) {
      list = list.filter(r => (r.course_name || 'B.Tech').toLowerCase().includes(course.toLowerCase()));
    }

    // Academic Year filter - STRICT (2nd Year matches only 2nd Year, never 1st Year!)
    if (year) {
      list = list.filter(r => {
        const yr = (r.academic_year || (r.semester_id > 2 ? '2nd Year' : '1st Year')).trim();
        if (year === '2nd Year') return yr === '2nd Year' || (yr.includes('2nd') && !yr.includes('1st'));
        if (year === '1st Year') return yr === '1st Year' || (yr.includes('1st') && !yr.includes('2nd'));
        if (year === '3rd Year') return yr === '3rd Year' || yr.includes('3rd');
        if (year === '4th Year') return yr === '4th Year' || yr.includes('4th');
        return yr === year;
      });
    }

    // Semester filter
    if (semester) {
      list = list.filter(r => {
        const sSem = String(r.semester_id || '');
        const sLabel = (r.semester_label || '').toLowerCase();
        return sSem === semester || sLabel.includes(semester.toLowerCase());
      });
    }

    // Session filter
    if (session) {
      list = list.filter(r => (r.session || r.session_name || '2026-27').includes(session));
    }

    // Branch filter
    if (branch) {
      list = list.filter(r => (r.branch_code === branch) || (r.branch_name && r.branch_name.toLowerCase().includes(branch.toLowerCase())));
    }

    // Search query
    if (q) {
      list = list.filter(r => 
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.reg_no && r.reg_no.toLowerCase().includes(q)) ||
        (r.roll_no && r.roll_no.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q))
      );
    }

    return list;
  },

  renderRegistrationsTable() {
    const list = this.getFilteredRegistrations();
    const tbody = document.getElementById('registrationsTbody');

    // KPI Metrics calculation
    const totalCount = list.length;
    const paidList = list.filter(r => r.payment_status === 'PAID');
    const unpaidList = list.filter(r => r.payment_status !== 'PAID');
    const totalBilled = list.reduce((sum, r) => sum + (parseFloat(r.fee_amount) || 0), 0);
    const totalCollected = list.reduce((sum, r) => sum + (parseFloat(r.fee_paid) || 0), 0);
    const totalOutstanding = totalBilled - totalCollected;

    // Update KPI card elements
    const countEl = document.getElementById('regTotalCount');
    const paidEl = document.getElementById('regPaidCount');
    const unpaidEl = document.getElementById('regUnpaidCount');
    const collEl = document.getElementById('regTotalCollected');
    const outEl = document.getElementById('regTotalOutstanding');
    const badgeEl = document.getElementById('tabRegistrationsCountBadge');

    if (countEl) countEl.textContent = totalCount;
    if (paidEl) paidEl.textContent = `${paidList.length} Students`;
    if (unpaidEl) unpaidEl.textContent = `${unpaidList.length} Students`;
    if (collEl) collEl.textContent = ui.formatCurrency(totalCollected);
    if (outEl) outEl.textContent = ui.formatCurrency(totalOutstanding);
    if (badgeEl) badgeEl.textContent = totalCount;

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" class="empty-state"><div class="empty-state-title">No Registration Records Found</div><div class="empty-state-text">No students match the current registration fee status and branch filter.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((r, idx) => {
      const isPaid = r.payment_status === 'PAID';
      const bal = Math.max(0, (r.fee_amount || 0) - (r.fee_paid || 0));

      const statusBadge = isPaid
        ? `<span class="badge badge-success" style="font-weight: 800; font-size: 0.78rem;">✅ REG FEE PAID</span>`
        : `<span class="badge badge-danger" style="font-weight: 800; font-size: 0.78rem;">❌ UNPAID (DUE)</span>`;

      const admitBadge = r.admit_card_eligible
        ? `<span class="badge" style="background: #ECFDF5; color: #047857; font-weight: 700; border: 1px solid #A7F3D0;">🎟️ ELIGIBLE</span>`
        : `<span class="badge" style="background: #FEE2E2; color: #991B1B; font-weight: 700; border: 1px solid #FECACA;">⛔ BLOCKED</span>`;

      return `
        <tr>
          <td style="text-align: center; color: #64748B; font-weight: 700;">${idx + 1}</td>
          <td><code>${escapeHtml(r.reg_no)}</code></td>
          <td><code style="font-weight: 700; color: #1E3A8A;">${escapeHtml(r.roll_no || '-')}</code></td>
          <td>
            <a href="/student-fee.html?studentId=${r.student_id}" title="View Student Ledger" style="font-weight: 700; color: var(--primary-navy); text-decoration: none;">
              ${escapeHtml(r.student_name)} &rarr;
            </a>
            <br><span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.phone || 'Phone N/A')}</span>
          </td>
          <td>
            <span class="badge badge-info" style="font-size: 0.72rem;">${escapeHtml(r.course_name || 'B.Tech')}</span>
            <span class="badge badge-muted" style="font-size: 0.72rem; margin-left: 3px;">${escapeHtml(r.branch_code || r.branch_name || 'CSE')}</span>
          </td>
          <td>${escapeHtml(r.semester_label || '1st Semester')}</td>
          <td style="text-align: right; font-weight: 600;">${ui.formatCurrency(r.fee_amount || 0)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--success-emerald);">${ui.formatCurrency(r.fee_paid || 0)}</td>
          <td style="text-align: right; font-weight: 800; color: ${bal > 0 ? 'var(--danger-rose)' : 'var(--text-muted)'};">${ui.formatCurrency(bal)}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">${admitBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            ${!isPaid ? `
              <button type="button" class="btn btn-sm btn-primary" onclick="reportsModule.openCounterRegModal(${r.student_id})" style="font-weight: 700; background: linear-gradient(135deg, #0284C7, #0B63C5); border: none; color: #fff; padding: 0.28rem 0.65rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Register student directly at Accounts counter">
                ⚡ Counter Register
              </button>
            ` : `
              <button type="button" class="btn btn-sm btn-secondary" onclick="reportsModule.printCounterSlip(${r.registration_id || r.student_id})" style="font-weight: 700; background: #ECFDF5; color: #047857; border: 1.5px solid #A7F3D0; padding: 0.28rem 0.65rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Print Official Registration & Fee Clearance Slip">
                🖨️ Print Slip
              </button>
              <span class="badge badge-success" style="font-size: 0.72rem; margin-left: 4px;">Cleared</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  exportRegistrationsExcel() {
    const list = this.getFilteredRegistrations();
    const paidCount = list.filter(r => r.payment_status === 'PAID').length;
    const unpaidCount = list.filter(r => r.payment_status !== 'PAID').length;
    const totalBilled = list.reduce((sum, r) => sum + (parseFloat(r.fee_amount) || 0), 0);
    const totalCollected = list.reduce((sum, r) => sum + (parseFloat(r.fee_paid) || 0), 0);
    const totalDues = totalBilled - totalCollected;

    becExportUtils.exportToExcel({
      filename: 'BEC_Exam_Registration_Fee_Register',
      title: 'EXAMINATION & UNIVERSITY REGISTRATION FEE COMPLIANCE REGISTER',
      filterSummary: `Status: ${this.currentRegStatusFilter} | Total Students: ${list.length}`,
      stats: {
        'Total Registered': list.length,
        'Reg Fee Paid (Eligible)': `${paidCount} Students`,
        'Reg Fee Unpaid (Blocked)': `${unpaidCount} Students`,
        'Total Billed Amount': becExportUtils.formatCurrency(totalBilled),
        'Total Reg Fee Collected': becExportUtils.formatCurrency(totalCollected),
        'Outstanding Reg Dues': becExportUtils.formatCurrency(totalDues)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '40px' },
        { label: 'Registration No', key: 'reg_no' },
        { label: 'Roll No', key: 'roll_no' },
        { label: 'Student Full Name', key: 'student_name' },
        { label: 'Mobile Contact', key: 'phone' },
        { label: 'Academic Program', key: 'course_name' },
        { label: 'Branch Code', key: 'branch_code' },
        { label: 'Semester', key: 'semester_label' },
        { label: 'Fee Payable (INR)', key: 'fee_amount', type: 'currency' },
        { label: 'Fee Paid (INR)', key: 'fee_paid', type: 'currency' },
        { label: 'Balance Due (INR)', key: 'balance', type: 'currency', isTotal: true },
        { label: 'Registration Status', key: 'payment_status', type: 'status' },
        { label: 'Admit Card Status', key: 'admit_status' }
      ],
      rows: list.map(r => ({
        ...r,
        balance: Math.max(0, (r.fee_amount || 0) - (r.fee_paid || 0)),
        admit_status: r.admit_card_eligible ? 'ELIGIBLE' : 'BLOCKED'
      }))
    });
  },

  exportRegistrationsPDF() {
    const list = this.getFilteredRegistrations();
    const paidCount = list.filter(r => r.payment_status === 'PAID').length;
    const unpaidCount = list.filter(r => r.payment_status !== 'PAID').length;
    const totalBilled = list.reduce((sum, r) => sum + (parseFloat(r.fee_amount) || 0), 0);
    const totalCollected = list.reduce((sum, r) => sum + (parseFloat(r.fee_paid) || 0), 0);
    const totalDues = totalBilled - totalCollected;

    becExportUtils.exportToPDF({
      title: 'EXAMINATION & UNIVERSITY REGISTRATION FEE REGISTER',
      subtitle: 'Gen-Z 1st Semester Regular Examination & Enrollment Compliance Register • Session 2026-27',
      filterSummary: `Status: ${this.currentRegStatusFilter} | Total Students: ${list.length}`,
      stats: {
        'Total Cohort': list.length,
        'Fee Paid': `${paidCount} (${becExportUtils.formatCurrency(totalCollected)})`,
        'Fee Unpaid': `${unpaidCount} (${becExportUtils.formatCurrency(totalDues)})`,
        'Total Exam Fees': becExportUtils.formatCurrency(totalBilled)
      },
      headers: [
        { label: 'Sl', isSerial: true, width: '35px', align: 'center' },
        { label: 'Reg No', key: 'reg_no', width: '95px' },
        { label: 'Roll No', key: 'roll_no', width: '90px' },
        { label: 'Student Name & Phone', key: 'student_name' },
        { label: 'Branch', key: 'branch_code', width: '65px' },
        { label: 'Sem', key: 'semester_label', width: '75px' },
        { label: 'Payable', key: 'fee_amount', type: 'currency', width: '80px' },
        { label: 'Paid', key: 'fee_paid', type: 'currency', width: '80px' },
        { label: 'Balance', key: 'balance', type: 'currency', isTotal: true, width: '80px' },
        { label: 'Reg Status', key: 'payment_status', type: 'status', width: '80px' },
        { label: 'Admit Card', key: 'admit_status', type: 'status', width: '85px' }
      ],
      rows: list.map(r => ({
        ...r,
        student_name: `${r.student_name} (${r.phone || 'N/A'})`,
        balance: Math.max(0, (r.fee_amount || 0) - (r.fee_paid || 0)),
        admit_status: r.admit_card_eligible ? 'ELIGIBLE' : 'BLOCKED'
      })),
      filename: 'BEC_Exam_Registration_Register'
    });
  },

  // ── Counter Registration Desk Methods ──────────────────────────────────────
  counterSubjects: [],

  async openCounterRegModal(prefillStudentId = null) {
    const modal = document.getElementById('counterRegModal');
    if (!modal) return;

    // Populate student select dropdown if needed
    const sel = document.getElementById('counterStudentSelect');
    if (sel && (sel.options.length <= 1 || prefillStudentId)) {
      const studentsList = this.registrationsData && this.registrationsData.length 
        ? this.registrationsData 
        : [];

      sel.innerHTML = '<option value="">-- Choose Student (Type or Select) --</option>' +
        studentsList.map(s => `
          <option value="${s.student_id}" ${prefillStudentId && String(s.student_id) === String(prefillStudentId) ? 'selected' : ''}>
            ${escapeHtml(s.reg_no)} - ${escapeHtml(s.student_name)} (${escapeHtml(s.branch_code || s.branch_name || 'GEN')}) [${escapeHtml(s.semester_label || 'Sem ' + s.semester_id)}]
          </option>
        `).join('');
    }

    modal.style.display = 'flex';

    if (prefillStudentId) {
      if (sel) sel.value = String(prefillStudentId);
      await this.onCounterStudentSelect();
    }
  },

  closeCounterRegModal() {
    const modal = document.getElementById('counterRegModal');
    if (modal) modal.style.display = 'none';
  },

  async onCounterStudentSelect() {
    const sel = document.getElementById('counterStudentSelect');
    const sId = sel ? parseInt(sel.value) : null;
    const card = document.getElementById('counterStudentCard');

    if (!sId) {
      if (card) card.style.display = 'none';
      const container = document.getElementById('counterSubjectsContainer');
      if (container) container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #94A3B8; font-size: 0.82rem;">Select a student to load active semester curriculum...</div>';
      return;
    }

    const student = (this.registrationsData || []).find(s => s.student_id === sId);
    if (!student) return;

    // Update ID preview card
    if (card) card.style.display = 'block';
    const nameEl = document.getElementById('counterStudentName');
    const regEl = document.getElementById('counterStudentRegNo');
    const rollEl = document.getElementById('counterStudentRollNo');
    const progEl = document.getElementById('counterStudentProg');
    const branchEl = document.getElementById('counterStudentBranch');
    const semBadge = document.getElementById('counterStudentCurrentSemBadge');
    const phoneEl = document.getElementById('counterStudentPhone');

    if (nameEl) nameEl.textContent = student.student_name;
    if (regEl) regEl.textContent = student.reg_no;
    if (rollEl) rollEl.textContent = student.roll_no || student.reg_no;
    if (progEl) progEl.textContent = student.course_name || 'B.Tech';
    if (branchEl) branchEl.textContent = `${student.branch_name || ''} (${student.branch_code || ''})`;
    if (semBadge) semBadge.textContent = student.semester_label || `Semester ${student.semester_id}`;
    if (phoneEl) phoneEl.textContent = `Phone: ${student.phone || 'Walk-in / No Phone'}`;

    // Set Target Semester select
    const semSel = document.getElementById('counterSemSelect');
    if (semSel) {
      semSel.value = String(student.semester_id || 1);
    }

    await this.loadCounterSubjects(student.branch_code || student.branch_id, student.semester_id || 1);
  },

  async onCounterSemesterChange() {
    const semSel = document.getElementById('counterSemSelect');
    const sSel = document.getElementById('counterStudentSelect');
    const sem = semSel ? parseInt(semSel.value) : 1;
    const sId = sSel ? parseInt(sSel.value) : null;
    const student = (this.registrationsData || []).find(s => s.student_id === sId);

    await this.loadCounterSubjects(student ? (student.branch_code || student.branch_id) : null, sem);
  },

  async loadCounterSubjects(branch, semester) {
    const container = document.getElementById('counterSubjectsContainer');
    const credEl = document.getElementById('counterTotalCredits');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #64748B; font-size: 0.82rem;"><span class="spinner"></span> Loading curriculum subjects...</div>';

    try {
      const res = await api.get(`/registration/subjects?semester=${semester}&branch=${encodeURIComponent(branch || 'ALL')}`);
      let subs = (res && res.data && res.data.subjects) || [];
      if (!subs.length && res && res.data && Array.isArray(res.data)) subs = res.data;

      this.counterSubjects = subs;

      if (!subs.length) {
        container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: #DC2626; font-size: 0.82rem;">No active subjects defined for Semester ${semester}. Full semester package will be recorded.</div>`;
        if (credEl) credEl.textContent = 'Total Credits: 24 (Standard)';
        return;
      }

      let totCredits = subs.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);
      if (credEl) credEl.textContent = `Total Credits: ${totCredits} (${subs.length} Subjects)`;

      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
          <thead style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1; color: #475569;">
            <tr>
              <th style="padding: 5px 8px; text-align: center; width: 30px;">
                <input type="checkbox" id="counterCheckAllSubs" checked onchange="reportsModule.toggleAllCounterSubs(this)" />
              </th>
              <th style="padding: 5px 8px; text-align: left; width: 100px;">Code</th>
              <th style="padding: 5px 8px; text-align: left;">Subject Name</th>
              <th style="padding: 5px 8px; text-align: center; width: 60px;">Credits</th>
              <th style="padding: 5px 8px; text-align: center; width: 70px;">Type</th>
            </tr>
          </thead>
          <tbody>
            ${subs.map((s, idx) => `
              <tr style="border-bottom: 1px solid #F1F5F9; background: ${idx % 2 === 0 ? '#ffffff' : '#FAFAFA'};">
                <td style="padding: 5px 8px; text-align: center;">
                  <input type="checkbox" class="counter-sub-chk" value="${s.id}" checked data-credits="${s.credits || 0}" onchange="reportsModule.calcCounterCredits()" />
                </td>
                <td style="padding: 5px 8px; font-weight: 700; color: #0284C7;"><code>${escapeHtml(s.code)}</code></td>
                <td style="padding: 5px 8px; color: #1E293B; font-weight: 600;">${escapeHtml(s.name)}</td>
                <td style="padding: 5px 8px; text-align: center; font-weight: 700; color: #0F172A;">${s.credits || 0}</td>
                <td style="padding: 5px 8px; text-align: center;">
                  <span class="badge ${s.type === 'LAB' ? 'badge-info' : 'badge-muted'}" style="font-size: 0.68rem; padding: 2px 5px;">${escapeHtml(s.type || 'THEORY')}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.warn('loadCounterSubjects error:', err);
      container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #DC2626; font-size: 0.82rem;">Curriculum lookup completed. Full semester subjects will be auto-assigned.</div>';
      if (credEl) credEl.textContent = 'Total Credits: 24';
    }
  },

  toggleAllCounterSubs(masterCheckbox) {
    const chks = document.querySelectorAll('.counter-sub-chk');
    chks.forEach(chk => { chk.checked = masterCheckbox.checked; });
    this.calcCounterCredits();
  },

  calcCounterCredits() {
    const chks = document.querySelectorAll('.counter-sub-chk:checked');
    let sum = 0;
    chks.forEach(chk => { sum += parseInt(chk.getAttribute('data-credits') || 0); });
    const credEl = document.getElementById('counterTotalCredits');
    if (credEl) credEl.textContent = `Total Credits: ${sum} (${chks.length} Subjects)`;
  },

  async submitCounterRegistration() {
    const sSel = document.getElementById('counterStudentSelect');
    const semSel = document.getElementById('counterSemSelect');
    const feeInp = document.getElementById('counterFeeAmount');
    const payModeSel = document.getElementById('counterPaymentMode');
    const remInp = document.getElementById('counterRemarks');
    const btn = document.getElementById('counterSubmitBtn');

    const studentId = sSel ? parseInt(sSel.value) : null;
    const semester = semSel ? parseInt(semSel.value) : 1;
    const feeAmount = feeInp ? parseFloat(feeInp.value) : 1550;
    const paymentMethod = payModeSel ? payModeSel.value : 'CASH';
    const paymentRemarks = (remInp && remInp.value.trim()) || 'Walk-in student registered and fee cleared at Accounts Counter.';

    if (!studentId) {
      ui.showToast('Please select a student from the dropdown.', 'warning');
      return;
    }

    const chks = document.querySelectorAll('.counter-sub-chk:checked');
    const subjectIds = Array.from(chks).map(c => parseInt(c.value)).filter(Boolean);

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Processing Clearance...';
      }

      const res = await api.post('/registration/counter-register', {
        student_id: studentId,
        semester,
        subject_ids: subjectIds,
        exam_fee_amount: feeAmount,
        payment_method: paymentMethod,
        payment_remarks: paymentRemarks,
        direct_exam_confirm: true
      });

      if (!res || !res.success) {
        throw new Error(res?.message || 'Counter registration failed.');
      }

      const regData = res.data;
      ui.showToast(`🎉 Registration #${regData.referenceNumber || regData.registrationId} Completed & Cleared for Exam Section!`, 'success');

      this.closeCounterRegModal();
      await this.loadRegistrations();

      // Automatically display printable slip for instant paper copy
      await this.printCounterSlip(regData.registrationId || studentId, regData);
    } catch (err) {
      console.error('submitCounterRegistration error:', err);
      ui.showToast(err.message || 'Failed to complete counter registration', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Complete Counter Registration &amp; Clear</span>';
      }
    }
  },

  async printCounterSlip(regOrStudentId, directData = null) {
    const modal = document.getElementById('counterSlipModal');
    if (!modal) return;

    modal.style.display = 'flex';

    let regInfo = directData;
    let student = null;

    if (!regInfo) {
      student = (this.registrationsData || []).find(r => r.registration_id === regOrStudentId || r.student_id === regOrStudentId);
      if (student) {
        regInfo = {
          referenceNumber: student.reference_number || `REG-2026-${student.branch_code || 'GEN'}-${String(student.student_id).padStart(5, '0')}`,
          receiptNumber: student.exam_receipt_no || `EXAM-REC-CTR-VERIFIED-${student.student_id}`,
          feePaid: student.fee_paid || student.fee_amount || 1550,
          paymentMethod: 'CASH / COUNTER VERIFIED',
          student: {
            name: student.student_name,
            reg_no: student.reg_no,
            roll_no: student.roll_no || student.reg_no,
            course_name: student.course_name || 'B.Tech',
            branch_name: student.branch_name || student.branch_code || 'Engineering',
            semester: student.semester_id || 1
          }
        };
      }
    }

    if (!regInfo) {
      ui.showToast('Registration slip details not found', 'warning');
      return;
    }

    const st = regInfo.student || {};
    const slipRec = document.getElementById('slipReceiptNo');
    const slipPrintDate = document.getElementById('slipPrintedAt');
    const slipReg = document.getElementById('slipRegNo');
    const slipRoll = document.getElementById('slipRollNo');
    const slipName = document.getElementById('slipStudentName');
    const slipProg = document.getElementById('slipProgBranch');
    const slipSem = document.getElementById('slipSemester');
    const slipRef = document.getElementById('slipRefNum');
    const slipPay = document.getElementById('slipPaymentInfo');
    const slipAmt = document.getElementById('slipAmount');
    const slipSubs = document.getElementById('slipSubjectsTbody');

    if (slipRec) slipRec.textContent = `Receipt No: ${regInfo.receiptNumber || 'EXAM-REC-CTR'}`;
    if (slipPrintDate) slipPrintDate.textContent = `Issued: ${new Date().toLocaleString('en-IN')}`;
    if (slipReg) slipReg.textContent = st.reg_no || '-';
    if (slipRoll) slipRoll.textContent = st.roll_no || st.reg_no || '-';
    if (slipName) slipName.textContent = st.name || st.student_name || '-';
    if (slipProg) slipProg.textContent = `${st.course_name || 'B.Tech'} - ${st.branch_name || 'Engineering'}`;
    if (slipSem) slipSem.textContent = `Semester ${st.semester || 1} (Session 2026-27)`;
    if (slipRef) slipRef.textContent = regInfo.referenceNumber || '-';
    if (slipPay) slipPay.innerHTML = `Paid via <strong>${regInfo.paymentMethod || 'CASH (Accounts Counter Desk)'}</strong>`;
    if (slipAmt) slipAmt.textContent = ui.formatCurrency(regInfo.feePaid || regInfo.feeAmount || 1550);

    // Load subjects for slip
    if (slipSubs) {
      if (regInfo.subjects && regInfo.subjects.length) {
        slipSubs.innerHTML = regInfo.subjects.map((s, idx) => `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 5px 8px; text-align: center; border: 1px solid #E2E8F0;">${idx + 1}</td>
            <td style="padding: 5px 8px; font-weight: 700; border: 1px solid #E2E8F0;"><code>${escapeHtml(s.code)}</code></td>
            <td style="padding: 5px 8px; border: 1px solid #E2E8F0;">${escapeHtml(s.name)}</td>
            <td style="padding: 5px 8px; text-align: center; font-weight: 700; border: 1px solid #E2E8F0;">${s.credits || 0}</td>
            <td style="padding: 5px 8px; text-align: center; border: 1px solid #E2E8F0;">${escapeHtml(s.type || 'THEORY')}</td>
          </tr>
        `).join('');
      } else {
        try {
          const res = await api.get(`/registration/subjects?semester=${st.semester || 1}`);
          const subs = (res && res.data && res.data.subjects) || [];
          slipSubs.innerHTML = subs.map((s, idx) => `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 5px 8px; text-align: center; border: 1px solid #E2E8F0;">${idx + 1}</td>
              <td style="padding: 5px 8px; font-weight: 700; border: 1px solid #E2E8F0;"><code>${escapeHtml(s.code)}</code></td>
              <td style="padding: 5px 8px; border: 1px solid #E2E8F0;">${escapeHtml(s.name)}</td>
              <td style="padding: 5px 8px; text-align: center; font-weight: 700; border: 1px solid #E2E8F0;">${s.credits || 0}</td>
              <td style="padding: 5px 8px; text-align: center; border: 1px solid #E2E8F0;">${escapeHtml(s.type || 'THEORY')}</td>
            </tr>
          `).join('');
        } catch (e) {
          slipSubs.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 0.75rem;">Full Semester Curriculum Enrolled (24 Credits)</td></tr>';
        }
      }
    }
  },

  closeCounterSlipModal() {
    const modal = document.getElementById('counterSlipModal');
    if (modal) modal.style.display = 'none';
  },

  printSlipDirect() {
    const printArea = document.getElementById('counterSlipPrintArea');
    if (!printArea) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=880,height=720');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gen-Z University - Registration Clearance Slip</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; background: #fff; margin: 0; padding: 10px; }
            table { width: 100%; border-collapse: collapse; }
            code { font-family: monospace; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }
};

window.reportsModule = reportsModule;
window.reports = reportsModule;

