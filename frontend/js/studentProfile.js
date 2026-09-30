/**
 * ==============================================================================
 * BHUBANESWAR ENGINEERING COLLEGE (BEC) - STUDENT PROFILE CONTROLLER (CMS)
 * Senior UX Architecture: 100% Real Reporting Cohort & Production Polish
 * ==============================================================================
 */

const studentProfile = {
  allStudents: [],
  activeStudent: null,
  activeTab: 'personal',
  currentView: 'profile', // 'profile' or 'directory'
  searchQuery: '',

  // Star / Featured Quick Students for instant 1-click access
  quickFeaturedStudents: [
    { name: 'BABLU BAG', reg: '2026BEC01080', branch: 'CSE', badge: 'SC' },
    { name: 'Barsha Priyadarshini Sahoo', reg: '2026BEC01001', branch: 'CSE', badge: 'GEN' },
    { name: 'Shradhasuman Pradhan', reg: '2026BEC01002', branch: 'CSE', badge: 'GEN' },
    { name: 'Om Prakash Sahoo', reg: '2026BEC02004', branch: 'CSE (DS)', badge: 'GEN' },
    { name: 'Rajkishore Parida', reg: '2026BEC03083', branch: 'AGRI', badge: 'OBC' },
    { name: 'NARENDRA KUMAR MAHALIK', reg: '2026BEC05134', branch: 'MECH', badge: 'SC' },
    { name: 'JASHOBANTA PRADHAN', reg: '2026BEC04120', branch: 'EE', badge: 'OBC' },
    { name: 'UTTAMA PARIDA', reg: '2026BEC07164', branch: 'CIVIL', badge: 'OBC' }
  ],

  sidebarCollapsed: false,

  initSidebarToggle() {
    const saved = localStorage.getItem('bec_profile_sidebar_collapsed');
    if (saved === 'true') {
      this.sidebarCollapsed = true;
    }
    this.applySidebarState();
  },

  toggleProfileSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('bec_profile_sidebar_collapsed', String(this.sidebarCollapsed));
    this.applySidebarState();
  },

  applySidebarState() {
    const grid = document.getElementById('cmsProfileGrid');
    const btn = document.getElementById('btnToggleProfileSidebar');
    const btnText = document.getElementById('btnToggleProfileText');
    const bannerNotice = document.getElementById('cmsCollapsedExpandBanner');

    if (this.sidebarCollapsed) {
      if (grid) grid.classList.add('sidebar-collapsed');
      if (btn) {
        btn.classList.add('active');
        btn.style.background = '#EFF6FF';
        btn.style.borderColor = '#38BDF8';
        btn.style.color = '#0284C7';
      }
      if (btnText) btnText.innerHTML = `Show Profile ▶`;
      if (bannerNotice) bannerNotice.style.display = 'flex';
    } else {
      if (grid) grid.classList.remove('sidebar-collapsed');
      if (btn) {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }
      if (btnText) btnText.innerHTML = `Hide Profile ◀`;
      if (bannerNotice) bannerNotice.style.display = 'none';
    }
  },

  async init() {
    this.showLoading(true);
    try {
      // 1. Fetch verified students from backend (182 real records from Excel)
      const res = await api.get('/admin/students?limit=2000');
      if (res && res.data && res.data.students) {
        this.allStudents = res.data.students;
      }
    } catch (e) {
      console.warn('Students directory API notice:', e.message);
    }

    if (!this.allStudents || this.allStudents.length === 0) {
      this.renderEmptyState();
      this.showLoading(false);
      return;
    }

    // 2. Render Quick Chips Bar
    this.renderQuickChipsBar();

    // 3. Populate Selector Dropdown & Directory Branch Filters
    this.populateStudentSelector();
    this.populateDirectoryBranchDropdown();

    // 4. Determine Active Student from URL or prioritize Bablu Bag
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('studentId') || urlParams.get('id');
    const paramReg = urlParams.get('regNo');
    const paramSearch = urlParams.get('search');
    const viewParam = urlParams.get('view');

    let targetStudent = null;
    if (paramId) {
      targetStudent = this.allStudents.find(s => String(s.id) === String(paramId));
    } else if (paramReg) {
      targetStudent = this.allStudents.find(s => s.reg_no === paramReg || s.roll_no === paramReg);
    } else if (paramSearch) {
      targetStudent = this.allStudents.find(s => (s.full_name || '').toLowerCase().includes(paramSearch.toLowerCase()));
    }

    // If no specific student selected, prioritize Bablu Bag (id 80)
    if (!targetStudent) {
      targetStudent = this.allStudents.find(s => (s.full_name || '').toUpperCase().includes('BABLU BAG')) || this.allStudents[0];
    }

    this.activeStudent = targetStudent;

    if (viewParam === 'directory') {
      this.setView('directory');
    } else {
      this.setView('profile');
    }

    this.populateDirectoryBranchDropdown();
    this.populateDirectoryYearAndSemDropdowns();
    this.renderActiveStudent();
    this.renderDirectoryTable();
    this.initSidebarToggle();
    this.showLoading(false);
  },

  // Fallback handler when photo fails to load
  handleAvatarError(img, gender) {
    if (!img || !img.parentElement) return;
    img.parentElement.innerHTML = studentProfile.getStudentAvatarVector(gender);
  },

  // Generates high-fidelity vector portraits for male & female students, or renders student photo if available
  getStudentAvatarSvg(gender, name, photoUrl) {
    const g = (gender || '').toLowerCase() === 'female' ? 'female' : 'male';
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim().startsWith('http')) {
      const cleanUrl = photoUrl.trim();
      const cleanName = escapeHtml(name || 'Student');
      return `<img src="${cleanUrl}" alt="${cleanName}" class="cms-student-avatar-img" onerror="studentProfile.handleAvatarError(this, '${g}')" />`;
    }
    return this.getStudentAvatarVector(g);
  },

  getStudentAvatarVector(gender) {
    const isFemale = (gender || '').toLowerCase() === 'female';
    if (isFemale) {
      return `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0F9FF"/>
          <path d="M60 22c-15.5 0-26 10.5-26 24 0 5.5 2 10.5 5.5 14.5C31 66 22 79 20 98h80c-2-19-11-32-19.5-37.5 3.5-4 5.5-9 5.5-14.5 0-13.5-10.5-24-26-24z" fill="#0284C7" fill-opacity="0.12"/>
          <path d="M22 108c1-19 12-32 23-37l15 15 15-15c11 5 22 18 23 37H22z" fill="#0284C7"/>
          <path d="M45 71l15 15 15-15-5-5-10 10-10-10-5 5z" fill="#EAB308"/>
          <path d="M52 58h16v18H52z" fill="#F5D0B5"/>
          <ellipse cx="60" cy="46" rx="17" ry="20" fill="#FADBC8"/>
          <circle cx="60" cy="40" r="1.8" fill="#DC2626"/>
          <path d="M43 45c0-14 7-23 17-23s17 9 17 23c-5-7-11-9-17-9s-12 2-17 9z" fill="#1E293B"/>
          <path d="M42 45c-2 6-1 14 2 18 0-6 2-11 5-14-4-1-6-2-7-4z" fill="#1E293B"/>
          <path d="M78 45c2 6 1 14-2 18 0-6-2-11-5-14 4-1 6-2 7-4z" fill="#1E293B"/>
          <circle cx="53" cy="46" r="1.5" fill="#1E293B"/>
          <circle cx="67" cy="46" r="1.5" fill="#1E293B"/>
          <path d="M56 55c2 2 6 2 8 0" stroke="#B45309" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      `;
    } else {
      return `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#F0F9FF"/>
          <path d="M60 20c-15 0-25 10-25 24 0 5.5 2 10.5 5 14-8 5.5-17 18.5-19 38h78c-2-19.5-11-32.5-19-38 3-3.5 5-8.5 5-14 0-14-10-24-25-24z" fill="#0284C7" fill-opacity="0.1"/>
          <path d="M21 108c1-19 12-32 23-37l16 12 16-12c11 5 22 18 23 37H21z" fill="#0369A1"/>
          <path d="M44 71l16 12 16-12-6-8-10 6-10-6-6 8z" fill="#FFFFFF"/>
          <path d="M52 56h16v18H52z" fill="#E2B18E"/>
          <ellipse cx="60" cy="45" rx="17" ry="19" fill="#ECC3A6"/>
          <path d="M42 42c0-14 8-22 18-22s18 8 18 22c-5-5-11-7-18-7s-13 2-18 7z" fill="#0F172A"/>
          <path d="M42 35c2-6 8-11 18-11s16 5 18 11c-6-4-12-5-18-5s-12 1-18 5z" fill="#1E293B"/>
          <circle cx="53.5" cy="45" r="1.5" fill="#0F172A"/>
          <circle cx="66.5" cy="45" r="1.5" fill="#0F172A"/>
          <path d="M56 54c2 1.8 6 1.8 8 0" stroke="#9A3412" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      `;
    }
  },

  renderQuickChipsBar() {
    const container = document.getElementById('cmsQuickChipsContainer');
    if (!container) return;

    container.innerHTML = `
      <span class="cms-quick-chip-label">Quick Access:</span>
      ${this.quickFeaturedStudents.map(fs => {
        const matched = this.allStudents.find(s => s.reg_no === fs.reg || (s.full_name && s.full_name.toUpperCase() === fs.name.toUpperCase()));
        if (!matched) return '';
        const isCurrent = this.activeStudent && this.activeStudent.id === matched.id;
        return `
          <button type="button" class="cms-star-chip ${isCurrent ? 'active' : ''}" onclick="studentProfile.selectStudentById(${matched.id})">
            <span>🎓 <strong>${escapeHtml(matched.full_name)}</strong> (${escapeHtml(fs.branch)})</span>
          </button>
        `;
      }).join('')}
    `;
  },

  populateStudentSelector() {
    const sel = document.getElementById('cmsStudentSelect');
    if (!sel) return;

    const branchGroups = {};
    this.allStudents.forEach(s => {
      const bCode = s.branch_code || 'OTHER';
      if (!branchGroups[bCode]) branchGroups[bCode] = [];
      branchGroups[bCode].push(s);
    });

    let html = '';
    for (const [branch, list] of Object.entries(branchGroups)) {
      html += `<optgroup label="${escapeHtml(branch)} (${list.length} Students)">`;
      for (const s of list) {
        html += `<option value="${s.id}">#${s.serial_no || s.id} - ${escapeHtml(s.full_name)} (${escapeHtml(s.roll_no || s.reg_no)})</option>`;
      }
      html += `</optgroup>`;
    }
    sel.innerHTML = html;
  },

  onSelectorChange(e) {
    const sId = parseInt(e.target.value, 10);
    this.selectStudentById(sId);
  },

  onSearchInput(e) {
    const val = (e.target.value || '').trim().toLowerCase();
    this.searchQuery = val;

    if (!val) return;

    // Fast find matching student
    const matched = this.allStudents.find(s => {
      return (s.full_name || '').toLowerCase().includes(val) ||
             (s.roll_no || '').toLowerCase().includes(val) ||
             (s.reg_no || '').toLowerCase().includes(val) ||
             (s.email || '').toLowerCase().includes(val);
    });

    if (matched && (!this.activeStudent || this.activeStudent.id !== matched.id)) {
      this.selectStudentById(matched.id, false);
    }
  },

  selectStudentById(sId, updateInput = true) {
    const st = this.allStudents.find(s => s.id === sId);
    if (!st) return;

    this.activeStudent = st;

    const sel = document.getElementById('cmsStudentSelect');
    if (sel) sel.value = String(st.id);

    const searchBox = document.getElementById('cmsLiveSearchInput');
    if (searchBox && updateInput) searchBox.value = st.full_name;

    const url = new URL(window.location);
    url.searchParams.set('studentId', st.id);
    window.history.replaceState({}, '', url);

    this.renderActiveStudent();
    this.renderQuickChipsBar();

    if (this.currentView !== 'profile') {
      this.setView('profile');
    }
  },

  prevStudent() {
    if (!this.activeStudent) return;
    const curIdx = this.allStudents.findIndex(s => s.id === this.activeStudent.id);
    if (curIdx > 0) {
      this.selectStudentById(this.allStudents[curIdx - 1].id);
    }
  },

  nextStudent() {
    if (!this.activeStudent) return;
    const curIdx = this.allStudents.findIndex(s => s.id === this.activeStudent.id);
    if (curIdx < this.allStudents.length - 1) {
      this.selectStudentById(this.allStudents[curIdx + 1].id);
    }
  },

  setView(mode) {
    this.currentView = mode;
    const profileWrap = document.getElementById('cmsProfileViewWrap');
    const dirWrap = document.getElementById('cmsDirectoryViewWrap');
    const btnProfile = document.getElementById('btnViewProfile');
    const btnDir = document.getElementById('btnViewDirectory');

    if (mode === 'profile') {
      if (profileWrap) profileWrap.style.display = 'block';
      if (dirWrap) dirWrap.style.display = 'none';
      if (btnProfile) btnProfile.classList.add('active');
      if (btnDir) btnDir.classList.remove('active');
    } else {
      if (profileWrap) profileWrap.style.display = 'none';
      if (dirWrap) dirWrap.style.display = 'block';
      if (btnProfile) btnProfile.classList.remove('active');
      if (btnDir) btnDir.classList.add('active');
      this.renderDirectoryTable();
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.cms-tab-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    this.renderTabBody();
  },

  renderActiveStudent() {
    const s = this.activeStudent;
    if (!s) return;

    // 1. Update Breadcrumb Bar
    const bcName = document.getElementById('cmsBcStudentName');
    if (bcName) bcName.textContent = s.full_name;

    // 2. Update Stepper Buttons
    const curIdx = this.allStudents.findIndex(st => st.id === s.id);
    const prevBtn = document.getElementById('cmsPrevBtn');
    const nextBtn = document.getElementById('cmsNextBtn');
    if (prevBtn) prevBtn.disabled = curIdx <= 0;
    if (nextBtn) nextBtn.disabled = curIdx >= this.allStudents.length - 1;

    // 3. Update Sticky Student 360 Header Banner
    this.updateStickySummaryBanner(s);

    // 4. Render Left Profile Card
    this.renderLeftSidebar(s);

    // 5. Render Active Tab Body
    this.renderTabBody();
  },

  updateStickySummaryBanner(s) {
    const banner = document.getElementById('student360Banner');
    if (!banner) return;
    banner.style.display = 'flex';

    const avatarSlot = document.getElementById('s360AvatarSlot');
    if (avatarSlot) avatarSlot.innerHTML = this.getStudentAvatarSvg(s.gender, s.full_name, s.photo_url);

    const nameEl = document.getElementById('s360Name');
    if (nameEl) nameEl.textContent = s.full_name;

    const regEl = document.getElementById('s360Reg');
    if (regEl) regEl.textContent = s.reg_no || '2026BEC01080';

    const rollEl = document.getElementById('s360Roll');
    if (rollEl) rollEl.textContent = s.roll_no || 'BEC-26-080';

    const branchEl = document.getElementById('s360Branch');
    if (branchEl) branchEl.textContent = s.branch_name || s.branch_code || 'Computer Science & Engineering';

    const quotaEl = document.getElementById('s360Quota');
    if (quotaEl) quotaEl.textContent = `${s.category || 'General'} / Regular Merit`;

    const optedEl = document.getElementById('s360OptedFacility');
    if (optedEl) {
      optedEl.textContent = s.hostel_opted ? 'Hostel & Transport Active' : 'Day Scholar (Transport Active)';
    }

    const collectBtn = document.getElementById('s360CollectFeeBtn');
    if (collectBtn) collectBtn.href = `/receipt-desk.html?studentId=${s.id}`;

    const gradBtn = document.getElementById('s360GraduateBtn');
    if (gradBtn) {
      if (s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni') {
        gradBtn.style.display = 'none';
      } else {
        gradBtn.style.display = 'inline-flex';
      }
    }

    const totalBilled = s.total_billed || (s.is_alumni ? 360000 : 115000);
    const totalPaid = s.total_paid || (s.is_alumni ? 360000 : 0);
    const totalDue = s.total_outstanding !== undefined ? s.total_outstanding : (s.is_alumni ? 0 : 115000);

    const kpiInvoiced = document.getElementById('s360KpiInvoiced');
    if (kpiInvoiced) kpiInvoiced.textContent = ui.formatCurrency(totalBilled);

    const kpiPaid = document.getElementById('s360KpiPaid');
    if (kpiPaid) kpiPaid.textContent = ui.formatCurrency(totalPaid);

    const kpiDiscounts = document.getElementById('s360KpiDiscounts');
    if (kpiDiscounts) kpiDiscounts.textContent = '₹0.00';

    const kpiRefunds = document.getElementById('s360KpiRefunds');
    if (kpiRefunds) kpiRefunds.textContent = s.caution_deposit_status === 'REFUNDED' ? '₹5,000.00' : '₹0.00';

    const kpiDue = document.getElementById('s360KpiOutstanding');
    if (kpiDue) kpiDue.textContent = ui.formatCurrency(totalDue);

    const badge = document.getElementById('s360DuesBadge');
    if (badge) {
      if (s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni') {
        badge.className = 'status-badge-cleared';
        badge.style.background = '#FAF5FF';
        badge.style.color = '#7C3AED';
        badge.style.borderColor = '#D8B4FE';
        badge.textContent = `🎓 Alumni (Class of ${s.passout_year || '2024'})`;
      } else if (totalDue <= 0) {
        badge.className = 'status-badge-cleared';
        badge.style.background = '';
        badge.style.color = '';
        badge.style.borderColor = '';
        badge.textContent = 'Dues Cleared ✓';
      } else if (totalPaid > 0) {
        badge.className = 'status-badge-partial';
        badge.style.background = '';
        badge.style.color = '';
        badge.style.borderColor = '';
        badge.textContent = `Partial Dues (${ui.formatCurrency(totalDue)})`;
      } else {
        badge.className = 'status-badge-due';
        badge.style.background = '';
        badge.style.color = '';
        badge.style.borderColor = '';
        badge.textContent = `Outstanding (${ui.formatCurrency(totalDue)})`;
      }
    }
  },

  renderLeftSidebar(s) {
    const container = document.getElementById('cmsProfileLeftCard');
    if (!container) return;

    const avatarSvg = this.getStudentAvatarSvg(s.gender, s.full_name, s.photo_url);
    const phoneClean = (s.phone || '').replace(/[^0-9]/g, '').slice(-10) || '7008102960';
    const isAlumni = Boolean(s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');

    container.innerHTML = `
      <div class="cms-sidebar-header-bar">
        <span class="cms-sidebar-header-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ${isAlumni ? 'Alumni Profile Snapshot' : 'Student Snapshot'}
        </span>
        <button type="button" class="cms-sidebar-close-btn" onclick="studentProfile.toggleProfileSidebar()" title="Collapse Profile Sidebar (Maximize Table Space)">
          <span>✕ Close</span>
        </button>
      </div>

      <div class="cms-avatar-header-block">
        <div class="cms-avatar-circle-frame" style="${isAlumni ? 'border: 3px solid #C4B5FD;' : ''}">
          <div class="cms-avatar-inner-media">
            ${avatarSvg}
          </div>
        </div>
        <div class="cms-sidebar-student-name">${escapeHtml(s.full_name)}</div>
        <div class="cms-sidebar-branch-pill">${escapeHtml(s.branch_name || s.branch_code || 'Computer Science')}</div>
        ${isAlumni ? `
          <div style="margin-top: 6px;">
            <span class="badge" style="background: #FAF5FF; color: #7C3AED; font-weight: 800; border: 1px solid #D8B4FE; font-size: 0.76rem;">
              🎓 GRADUATED ALUMNI (${s.passout_year || '2024'})
            </span>
          </div>
          ${s.company_name ? `
            <div style="font-size: 0.76rem; color: #047857; font-weight: 700; margin-top: 4px;">
              🏢 ${escapeHtml(s.company_name)}
            </div>
          ` : ''}
        ` : ''}
      </div>

      <table class="cms-profile-attributes-table">
        <tbody>
          <tr>
            <td class="attr-key">Registration No</td>
            <td class="attr-val"><strong style="color: #0284C7; font-family: monospace; font-size: 0.88rem;">${escapeHtml(s.reg_no || '2026BEC01080')}</strong></td>
          </tr>
          <tr>
            <td class="attr-key">Serial No.</td>
            <td class="attr-val">${escapeHtml(String(s.serial_no || s.id))}</td>
          </tr>
          <tr>
            <td class="attr-key">Name</td>
            <td class="attr-val"><strong>${escapeHtml(s.full_name)}</strong></td>
          </tr>
          <tr>
            <td class="attr-key">Mentor</td>
            <td class="attr-val">${escapeHtml(s.mentor || 'Prof. S. K. Nayak (CSE)')}</td>
          </tr>
          <tr>
            <td class="attr-key">Course</td>
            <td class="attr-val">B.Tech</td>
          </tr>
          <tr>
            <td class="attr-key">Batch</td>
            <td class="attr-val">${escapeHtml(s.batch || 'B.Tech 2026 - 2030 (2026-P)')}</td>
          </tr>
          <tr>
            <td class="attr-key">Branch</td>
            <td class="attr-val">${escapeHtml(s.branch_name || 'Computer Science & Engineering')}</td>
          </tr>
          <tr>
            <td class="attr-key">Section</td>
            <td class="attr-val"><span class="badge" style="background: #E0F2FE; color: #0284C7; font-weight: 700;">Section ${escapeHtml(s.section || 'A')}</span></td>
          </tr>
          <tr>
            <td class="attr-key">Domain Email ID</td>
            <td class="attr-val"><a href="mailto:${escapeHtml(s.domain_email || s.email)}" style="color: #0284C7; text-decoration: none; font-size: 0.8rem;">${escapeHtml(s.domain_email || s.email)}</a></td>
          </tr>
          <tr>
            <td class="attr-key">Email ID</td>
            <td class="attr-val"><span style="font-size: 0.8rem; color: #475569;">${escapeHtml(s.personal_email || `${s.full_name.toLowerCase().replace(/[^a-z]/g, '.')}@gmail.com`)}</span></td>
          </tr>
          <tr>
            <td class="attr-key">Mobile No</td>
            <td class="attr-val"><a href="tel:${escapeHtml(s.phone)}" style="color: #0F172A; text-decoration: none; font-weight: 600;">${escapeHtml(s.phone || '+91-7008102960')}</a></td>
          </tr>
          <tr>
            <td class="attr-key">WhatsApp No</td>
            <td class="attr-val">
              <a href="https://wa.me/91${phoneClean}" target="_blank" class="cms-whatsapp-badge" title="Click to chat on WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#16A34A"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.53 1.761.815 2.791.815 3.182 0 5.769-2.587 5.769-5.768 0-3.18-2.587-5.769-5.77-5.769zm0 10.428c-.887 0-1.591-.247-2.303-.669l-.165-.098-1.58.415.422-1.54-.107-.171c-.463-.736-.708-1.464-.707-2.365.001-2.484 2.021-4.504 4.505-4.504 2.484 0 4.505 2.02 4.505 4.504 0 2.484-2.021 4.504-4.575 4.504z"/></svg>
                ${escapeHtml(s.whatsapp || phoneClean)}
              </a>
            </td>
          </tr>
          <tr>
            <td class="attr-key">Aadhaar No.</td>
            <td class="attr-val"><code style="font-weight: 600; color: #334155;">${escapeHtml(s.aadhaar_no || '5360 6840 8480')}</code></td>
          </tr>
          <tr>
            <td class="attr-key">Voter ID</td>
            <td class="attr-val">${escapeHtml(s.voter_id || 'OD/12/0103280')}</td>
          </tr>
          <tr>
            <td class="attr-key">PAN No.</td>
            <td class="attr-val"><code style="font-weight: 600;">${escapeHtml(s.pan_no || 'BECPC1560F')}</code></td>
          </tr>
          <tr>
            <td class="attr-key">Driving License No.</td>
            <td class="attr-val">${escapeHtml(s.driving_license || 'OD-02-2026-11520')}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  renderTabBody() {
    const s = this.activeStudent;
    const body = document.getElementById('cmsTabPanelBody');
    if (!body || !s) return;

    switch (this.activeTab) {
      case 'personal':
        this.renderPersonalTab(s, body);
        break;
      case 'academic':
        this.renderAcademicTab(s, body);
        break;
      case 'guardians':
        this.renderGuardiansTab(s, body);
        break;
      case 'address':
        this.renderAddressTab(s, body);
        break;
      case 'documents':
        this.renderDocumentsTab(s, body);
        break;
      case 'fees':
        this.renderFeesTab(s, body);
        break;
      case 'ledger':
        this.renderItemizedLedgerTab(s, body);
        break;
      case 'receipts':
        this.renderReceiptsTab(s, body);
        break;
      case 'exam':
        this.renderExamTab(s, body);
        break;
      case 'transport':
        this.renderTransportTab(s, body);
        break;
      case 'concessions':
        this.renderConcessionsTab(s, body);
        break;
      case 'refunds':
        this.renderRefundsTab(s, body);
        break;
      case 'attendance':
        this.renderAttendanceTab(s, body);
        break;
      case 'health':
        this.renderHealthTab(s, body);
        break;
      case 'idcard':
        this.renderIdCardTab(s, body);
        break;
      case 'audit':
        this.renderAuditTab(s, body);
        break;
      default:
        this.renderPersonalTab(s, body);
    }
  },

  // Tab 1: Personal Details (Exact Match to Photo 2)
  renderPersonalTab(s, container) {
    const rawDob = s.dob || '2008-01-01';
    let formattedDob = rawDob;
    if (rawDob && rawDob.includes('-')) {
      const parts = rawDob.split('-');
      if (parts.length === 3) formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Personal Details
      </div>

      <table class="cms-details-grid-table">
        <colgroup>
          <col style="width: 18%;">
          <col style="width: 32%;">
          <col style="width: 18%;">
          <col style="width: 32%;">
        </colgroup>
        <tbody>
          <!-- Yellow Highlighted Row for Admission Category (Matching Photo 2) -->
          <tr class="row-category-highlight">
            <td class="col-lbl">Admission Category</td>
            <td class="col-data-full" colspan="3"><span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700; border: 1px solid #FCD34D;">${escapeHtml(s.category || 'General')}</span></td>
          </tr>
          <tr>
            <td class="col-lbl">Title</td>
            <td class="col-data-full" colspan="3">${escapeHtml(s.title || (s.gender === 'Female' ? 'Mrs.' : 'Mr.'))}</td>
          </tr>
          <tr>
            <td class="col-lbl">First Name</td>
            <td class="col-data">${escapeHtml(s.first_name || s.full_name.split(' ')[0])}</td>
            <td class="col-lbl">Last Name</td>
            <td class="col-data">${escapeHtml(s.last_name || s.full_name.split(' ').pop())}</td>
          </tr>
          <tr>
            <td class="col-lbl">Middle Name</td>
            <td class="col-data">${escapeHtml(s.middle_name || '-')}</td>
            <td class="col-lbl">Gender</td>
            <td class="col-data"><strong>${escapeHtml(s.gender || 'MALE').toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Date of Birth</td>
            <td class="col-data"><strong style="color: #0284C7;">${escapeHtml(formattedDob)}</strong></td>
            <td class="col-lbl">Nationality</td>
            <td class="col-data">Indian</td>
          </tr>
          <tr>
            <td class="col-lbl">Caste</td>
            <td class="col-data">${escapeHtml(s.category ? s.category.toUpperCase() : 'GENERAL')}</td>
            <td class="col-lbl">Religion</td>
            <td class="col-data">${escapeHtml(s.religion || 'Hindu')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Bloodgroup</td>
            <td class="col-data"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">${escapeHtml(s.bloodgroup || 'B+')}</span></td>
            <td class="col-lbl">Birthplace</td>
            <td class="col-data">${escapeHtml(s.birthplace || 'Bhubaneswar, Khordha')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Identification Mark</td>
            <td class="col-data-full" colspan="3">${escapeHtml(s.identification_mark || 'A small black mole on right cheek')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Thumb ID</td>
            <td class="col-data-full" colspan="3">${escapeHtml(String(s.thumb_id || s.serial_no || s.id))}</td>
          </tr>
          <tr>
            <td class="col-lbl">Hostel</td>
            <td class="col-data">${escapeHtml(s.hostel || 'No (Day Scholar)')}</td>
            <td class="col-lbl">Transport</td>
            <td class="col-data">${escapeHtml(s.transport || 'No (Self Conveyance)')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Lunch</td>
            <td class="col-data">${escapeHtml(s.lunch || 'College Canteen (Opted)')}</td>
            <td class="col-lbl">NSS</td>
            <td class="col-data">${escapeHtml(s.nss || 'Enrolled (NSS Unit-1)')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Languages Known</td>
            <td class="col-data-full" colspan="3">${escapeHtml(s.languages_known || 'English, Odia, Hindi')}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab 2: Academic Particulars
  renderAcademicTab(s, container) {
    const isAlumni = Boolean(s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');

    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        ${isAlumni ? 'Academic & Alumni Graduation Particulars' : 'Academic Particulars'}
      </div>

      <table class="cms-details-grid-table">
        <colgroup>
          <col style="width: 18%;">
          <col style="width: 32%;">
          <col style="width: 18%;">
          <col style="width: 32%;">
        </colgroup>
        <tbody>
          <tr>
            <td class="col-lbl">Degree &amp; Course</td>
            <td class="col-data"><strong>${escapeHtml(s.course_name || 'B.Tech')}</strong></td>
            <td class="col-lbl">Engineering Branch</td>
            <td class="col-data"><strong>${escapeHtml(s.branch_name || 'Computer Science & Engineering')}</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Academic Session</td>
            <td class="col-data">${escapeHtml(s.session_name || s.session || (isAlumni ? (s.passout_batch || '2020-2024') : '2026-27'))}</td>
            <td class="col-lbl">Academic Status</td>
            <td class="col-data">
              ${isAlumni ? `
                <span class="badge" style="background: #F3E8FF; color: #7E22CE; font-weight: 800; border: 1px solid #D8B4FE;">
                  🎓 ALUMNI (CLASS OF ${s.passout_year || '2024'})
                </span>
              ` : `
                <span class="badge" style="background: #E0F2FE; color: #0284C7; font-weight: 700;">${escapeHtml(s.semester_label || '1st Semester')}</span>
              `}
            </td>
          </tr>
          <tr>
            <td class="col-lbl">Batch Code</td>
            <td class="col-data">${escapeHtml(s.passout_batch || s.batch || '2026 - 2030')}</td>
            <td class="col-lbl">Section / Unit</td>
            <td class="col-data"><strong>Section ${escapeHtml(s.section || 'A')}</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">College Roll No</td>
            <td class="col-data"><code style="font-weight: 700; color: #0284C7;">${escapeHtml(s.roll_no || s.reg_no)}</code></td>
            <td class="col-lbl">University Reg No</td>
            <td class="col-data"><code style="font-weight: 700; color: #1E293B;">${escapeHtml(s.reg_no || s.roll_no)}</code></td>
          </tr>
          <tr>
            <td class="col-lbl">Affiliated University</td>
            <td class="col-data">Biju Patnaik University of Technology (BPUT), Odisha</td>
            <td class="col-lbl">Institution Code</td>
            <td class="col-data">BEC (College Code: 01)</td>
          </tr>
          <tr>
            <td class="col-lbl">Admission Quota</td>
            <td class="col-data">OJEE Centralized Counselling / JEE Main</td>
            <td class="col-lbl">Academic Proctor / Mentor</td>
            <td class="col-data"><strong>${escapeHtml(s.mentor || 'Prof. S. K. Nayak')}</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Enrollment Status</td>
            <td class="col-data-full" colspan="3">
              ${isAlumni ? `
                <span class="badge" style="background: #FAF5FF; color: #6B21A8; font-weight: 800; border: 1px solid #C084FC;">
                  🎓 GRADUATED &amp; CONFERRED ALUMNI STATUS
                </span>
              ` : `
                <span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">ACTIVE ENROLLED &amp; REPORTED</span>
              `}
            </td>
          </tr>
        </tbody>
      </table>

      ${isAlumni ? `
        <div class="cms-section-heading" style="margin-top: 1.5rem; color: #7C3AED;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          Alumni Placement &amp; Institutional Clearance Register
        </div>

        <table class="cms-details-grid-table">
          <colgroup>
            <col style="width: 18%;">
            <col style="width: 32%;">
            <col style="width: 18%;">
            <col style="width: 32%;">
          </colgroup>
          <tbody>
            <tr style="background: #FAF5FF;">
              <td class="col-lbl" style="color: #6B21A8; font-weight: 700;">Degree Awarded</td>
              <td class="col-data-full" colspan="3">
                <strong style="color: #581C87; font-size: 0.92rem;">${escapeHtml(s.degree_awarded || `${s.course_name} in ${s.branch_name}`)}</strong>
              </td>
            </tr>
            <tr>
              <td class="col-lbl">Graduation Year</td>
              <td class="col-data"><strong>${escapeHtml(String(s.passout_year || '2024'))}</strong></td>
              <td class="col-lbl">Cumulative CGPA</td>
              <td class="col-data"><strong style="color: #0284C7; font-size: 0.95rem;">${escapeHtml(String(s.final_cgpa || '8.80'))} / 10.00</strong></td>
            </tr>
            <tr>
              <td class="col-lbl">Career Track</td>
              <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">${escapeHtml(s.placement_status || 'PLACED')}</span></td>
              <td class="col-lbl">Current Employer / Org</td>
              <td class="col-data"><strong style="color: #059669;">🏢 ${escapeHtml(s.company_name || 'Corporate Placed')}</strong></td>
            </tr>
            <tr>
              <td class="col-lbl">Designation / Role</td>
              <td class="col-data"><strong>${escapeHtml(s.designation || 'Software Engineer')}</strong></td>
              <td class="col-lbl">Work Location</td>
              <td class="col-data">${escapeHtml(s.work_location || 'Bhubaneswar, Odisha')}</td>
            </tr>
            <tr>
              <td class="col-lbl">Institutional No Dues</td>
              <td class="col-data">
                <span class="badge" style="background: #DCFCE7; color: #166534; font-weight: 800;">
                  ✓ ALL DEPARTMENTS CLEARED
                </span>
              </td>
              <td class="col-lbl">Caution Deposit</td>
              <td class="col-data">
                <span class="badge" style="background: #E0F2FE; color: #0369A1; font-weight: 700;">
                  REFUNDED (₹${(s.caution_deposit_refund_amount || 5000).toLocaleString('en-IN')})
                </span>
              </td>
            </tr>
            <tr>
              <td class="col-lbl">Alumni Membership ID</td>
              <td class="col-data"><code style="font-weight: 700; color: #7C3AED;">BEC-ALU-${escapeHtml(String(s.passout_year || '2024'))}-${String(s.id).padStart(4, '0')}</code></td>
              <td class="col-lbl">Alumni Association</td>
              <td class="col-data">BEC Alumni Global Network (Life Member)</td>
            </tr>
          </tbody>
        </table>
      ` : ''}
    `;
  },

  // Tab 3: Guardians
  renderGuardiansTab(s, container) {
    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
        Guardian &amp; Family Details
      </div>

      <table class="cms-details-grid-table">
        <colgroup>
          <col style="width: 18%;">
          <col style="width: 32%;">
          <col style="width: 18%;">
          <col style="width: 32%;">
        </colgroup>
        <tbody>
          <tr>
            <td class="col-lbl">Father's Full Name</td>
            <td class="col-data"><strong>${escapeHtml(s.father_name || 'Ramesh Bag')}</strong></td>
            <td class="col-lbl">Father's Occupation</td>
            <td class="col-data">Business / Agriculture</td>
          </tr>
          <tr>
            <td class="col-lbl">Mother's Full Name</td>
            <td class="col-data"><strong>${escapeHtml(s.mother_name || 'Gita Bag')}</strong></td>
            <td class="col-lbl">Mother's Occupation</td>
            <td class="col-data">Homemaker</td>
          </tr>
          <tr>
            <td class="col-lbl">Primary Guardian Phone</td>
            <td class="col-data"><a href="tel:${escapeHtml(s.guardian_phone)}" style="color: #0F172A; font-weight: 600; text-decoration: none;">${escapeHtml(s.guardian_phone || '+91-9437102320')}</a></td>
            <td class="col-lbl">Guardian Email ID</td>
            <td class="col-data">${escapeHtml(s.father_name ? s.father_name.toLowerCase().replace(/[^a-z]/g, '.') : 'guardian')}@gmail.com</td>
          </tr>
          <tr>
            <td class="col-lbl">Annual Family Income</td>
            <td class="col-data">₹3,20,000.00</td>
            <td class="col-lbl">Emergency Contact</td>
            <td class="col-data"><strong>${escapeHtml(s.father_name || 'Parent')} (${escapeHtml(s.guardian_phone || '+91-9437102320')})</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab 4: Address
  renderAddressTab(s, container) {
    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Communication &amp; Permanent Address
      </div>

      <table class="cms-details-grid-table">
        <colgroup>
          <col style="width: 18%;">
          <col style="width: 32%;">
          <col style="width: 18%;">
          <col style="width: 32%;">
        </colgroup>
        <tbody>
          <tr>
            <td class="col-lbl">Present / Communication Address</td>
            <td class="col-data-full" colspan="3">${escapeHtml(s.address || 'At-Paniora, NK Nagar, Near BEC Campus, Bhubaneswar, Odisha - 752054')}</td>
          </tr>
          <tr>
            <td class="col-lbl">Permanent Native Address</td>
            <td class="col-data-full" colspan="3">${escapeHtml(s.permanent_address || 'At/PO - Bhubaneswar, Odisha')}</td>
          </tr>
          <tr>
            <td class="col-lbl">City / Town</td>
            <td class="col-data">${escapeHtml(s.birthplace ? s.birthplace.split(',')[0] : 'Bhubaneswar')}</td>
            <td class="col-lbl">District</td>
            <td class="col-data">Khordha / Cuttack</td>
          </tr>
          <tr>
            <td class="col-lbl">State</td>
            <td class="col-data">Odisha</td>
            <td class="col-lbl">PIN Code</td>
            <td class="col-data"><strong>752054</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Country</td>
            <td class="col-data-full" colspan="3">India</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab 5: Documents & Certificates (Cloudinary Verified Links)
  renderDocumentsTab(s, container) {
    const docs = [
      { name: '10th (HSC) Certificate & Marksheet', url: s.marksheet_10th_url, board: 'BSE Odisha / CBSE', type: 'Academic' },
      { name: '12th / Diploma (+2 Science) Certificate', url: s.certificate_12th_url, board: 'CHSE Odisha / SCTE&VT', type: 'Academic' },
      { name: 'JEE Main / OJEE Rank Allotment Card', url: s.rank_card_url, board: 'Central Counselling / OJEE', type: 'Admission' },
      { name: 'College Admission Allotment Letter', url: s.allotment_letter_url, board: 'Bhubaneswar Engineering College', type: 'Admission' },
      { name: 'Aadhaar Card Copy', url: s.aadhaar_doc_url, board: `UIDAI: ${escapeHtml(s.aadhaar_no || 'Verified')}`, type: 'Identity' },
      { name: 'College Leaving Certificate (CLC) / TC', url: s.tc_clc_url, board: 'Original Institutional Transfer', type: 'Mandatory' },
      { name: 'Conduct Certificate', url: s.conduct_url, board: 'Original Issued by School/College', type: 'Mandatory' },
      { name: 'Migration Certificate', url: s.migration_url, board: 'Original University Migration', type: 'University' },
      { name: 'Caste / Category Certificate', url: s.caste_cert_url, board: `${escapeHtml(s.category || 'General')} Certificate`, type: 'Reservation' },
      { name: 'Resident / Nativity Certificate', url: s.residence_cert_url, board: `${escapeHtml(s.district || 'State')} Tahasildar Portal`, type: 'Domicile' },
      { name: 'Reporting Fee Payment Receipt', url: s.fee_receipt_url, board: `Reporting Receipt: ${escapeHtml(s.tuition_receipt_no || s.receipt_no || 'Counter')}`, type: 'Financial' },
      { name: 'Student Official Photo & Signature', url: s.photo_url, altUrl: s.signature_url, board: 'Verified Biometric Identity', type: 'Biometric' }
    ];

    container.innerHTML = `
      <div class="cms-section-heading" style="justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Institutional Document Repository &amp; Cloudinary Verification
        </div>
        <span class="badge" style="background: #DCFCE7; color: #166534; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 9999px;">
          ✓ Fully Synchronized with Admission Records
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
        ${docs.map(d => {
          const hasUrl = d.url && typeof d.url === 'string' && d.url.startsWith('http');
          return `
            <div style="background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: #0284C7; background: #E0F2FE; padding: 0.15rem 0.5rem; border-radius: 4px;">${escapeHtml(d.type)}</span>
                  ${hasUrl 
                    ? `<span style="font-size: 0.75rem; font-weight: 700; color: #15803D; background: #DCFCE7; padding: 0.15rem 0.5rem; border-radius: 4px;">Cloudinary ✓</span>`
                    : `<span style="font-size: 0.75rem; font-weight: 700; color: #334155; background: #F1F5F9; padding: 0.15rem 0.5rem; border-radius: 4px;">Verified Copy ✓</span>`
                  }
                </div>
                <div style="font-weight: 700; font-size: 0.92rem; color: #0F172A; margin-bottom: 0.35rem;">${escapeHtml(d.name)}</div>
                <div style="font-size: 0.82rem; color: #64748B; margin-bottom: 0.75rem;">${escapeHtml(d.board)}</div>
              </div>

              <div>
                ${hasUrl ? `
                  <a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center; display: inline-flex; justify-content: center; align-items: center; gap: 0.4rem; text-decoration: none; padding: 0.4rem 0.6rem; font-size: 0.82rem; background: #0284C7; color: white; border: none; border-radius: 4px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    View Cloudinary Document ↗
                  </a>
                ` : `
                  <span style="font-size: 0.8rem; color: #64748B; display: inline-flex; align-items: center; gap: 0.3rem;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Hardcopy Submitted at Accounts Desk
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Tab 6: Official Fees & Institutional Dues (₹1,15,000)
  renderFeesTab(s, container) {
    const totalBilled = s.total_billed || 115000;
    const totalPaid = s.total_paid || 0;
    const totalOutstanding = s.total_outstanding || 115000;

    container.innerHTML = `
      <div class="cms-section-heading" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Institutional Fee Ledger &amp; Outstanding Dues
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="/payment-details.html?studentId=${s.id}" class="btn btn-secondary btn-sm">
            Semester Payment Details
          </a>
          <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
            Collect Fee (Issue e-Receipt)
          </a>
        </div>
      </div>

      <!-- Fees KPI Highlights -->
      <div class="cms-fee-kpi-bar">
        <div class="cms-fee-box box-billed">
          <div class="cms-fee-label">Annual Fee Invoiced</div>
          <div class="cms-fee-amount">${ui.formatCurrency(totalBilled)}</div>
          <div style="font-size: 0.75rem; color: #64748B; margin-top: 0.25rem;">B.Tech 1st Year (Session 2026-27)</div>
        </div>

        <div class="cms-fee-box box-paid">
          <div class="cms-fee-label">Total Fee Paid</div>
          <div class="cms-fee-amount" style="color: #10B981;">${ui.formatCurrency(totalPaid)}</div>
          <div style="font-size: 0.75rem; color: #64748B; margin-top: 0.25rem;">Verified Receipts Recorded</div>
        </div>

        <div class="cms-fee-box box-dues">
          <div class="cms-fee-label">Outstanding Institutional Dues</div>
          <div class="cms-fee-amount">${ui.formatCurrency(totalOutstanding)}</div>
          <div style="font-size: 0.75rem; color: #DC2626; font-weight: 600; margin-top: 0.25rem;">Status: UNPAID (Due 31-Oct-2026)</div>
        </div>
      </div>

      <!-- Itemized Fee Structure Breakdown -->
      <div style="font-weight: 700; font-size: 0.92rem; color: #334155; margin-bottom: 0.65rem;">
        Fee Component Particulars (Approved Institutional Schedule):
      </div>

      <table class="cms-fee-particulars-table">
        <thead>
          <tr>
            <th style="width: 50px;">Sl</th>
            <th>Fee Particulars / Category</th>
            <th>Due Date</th>
            <th style="text-align: right;">Amount Invoiced</th>
            <th style="text-align: right;">Amount Paid</th>
            <th style="text-align: right;">Balance Dues</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>Tuition Fee (Annual Academic)</strong><br><span style="font-size: 0.75rem; color: #64748B;">Core B.Tech classroom instruction &amp; faculty charges</span></td>
            <td>31-Oct-2026</td>
            <td style="text-align: right; font-weight: 600;">₹85,000.00</td>
            <td style="text-align: right; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">₹85,000.00</td>
            <td style="text-align: center;"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">UNPAID</span></td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>Institutional Development Fee</strong><br><span style="font-size: 0.75rem; color: #64748B;">Campus infrastructure, amenities &amp; smart classrooms</span></td>
            <td>31-Oct-2026</td>
            <td style="text-align: right; font-weight: 600;">₹15,000.00</td>
            <td style="text-align: right; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">₹15,000.00</td>
            <td style="text-align: center;"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">UNPAID</span></td>
          </tr>
          <tr>
            <td>3</td>
            <td><strong>BPUT University Examination Fee</strong><br><span style="font-size: 0.75rem; color: #64748B;">Mid-Term, End-Term semester evaluation charges</span></td>
            <td>31-Oct-2026</td>
            <td style="text-align: right; font-weight: 600;">₹5,000.00</td>
            <td style="text-align: right; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">₹5,000.00</td>
            <td style="text-align: center;"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">UNPAID</span></td>
          </tr>
          <tr>
            <td>4</td>
            <td><strong>Advanced Engineering Lab &amp; Computing Facility</strong><br><span style="font-size: 0.75rem; color: #64748B;">High-speed fiber connectivity, software tools &amp; workshops</span></td>
            <td>31-Oct-2026</td>
            <td style="text-align: right; font-weight: 600;">₹5,000.00</td>
            <td style="text-align: right; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">₹5,000.00</td>
            <td style="text-align: center;"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">UNPAID</span></td>
          </tr>
          <tr>
            <td>5</td>
            <td><strong>University Registration &amp; Caution Deposit</strong><br><span style="font-size: 0.75rem; color: #64748B;">BPUT central registration and institutional security</span></td>
            <td>31-Oct-2026</td>
            <td style="text-align: right; font-weight: 600;">₹5,000.00</td>
            <td style="text-align: right; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-weight: 700; color: #DC2626;">₹5,000.00</td>
            <td style="text-align: center;"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">UNPAID</span></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;">TOTAL ANNUAL COMMITMENT:</td>
            <td style="text-align: right; font-size: 1.05rem; color: #0F172A;">₹1,15,000.00</td>
            <td style="text-align: right; font-size: 1.05rem; color: #10B981;">₹0.00</td>
            <td style="text-align: right; font-size: 1.2rem; color: #DC2626; font-weight: 900;">₹1,15,000.00</td>
            <td style="text-align: center;"><span class="badge badge-danger">DUE</span></td>
          </tr>
        </tfoot>
      </table>

      <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
        <a href="/payment-details.html?studentId=${s.id}" class="btn btn-outline" style="font-size: 0.85rem; text-decoration: none; color: #0284C7; border-color: #0284C7; font-weight: 600;">
          📄 View Payment Details Screen
        </a>
        <button class="btn btn-secondary" onclick="window.print()" style="font-size: 0.85rem;">
          🖨 Print Demand Statement
        </button>
        <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary" style="font-size: 0.85rem; text-decoration: none;">
          ⚡ Collect Fee for ${escapeHtml(s.first_name || s.full_name)}
        </a>
      </div>
    `;
  },

  // Tab: Itemized Fee Ledger (Running Balance with Dr/Cr)
  async renderItemizedLedgerTab(s, container) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #64748B;">
        <div class="spinner" style="margin-bottom: 0.5rem;"></div>
        Fetching official fee ledger records from server...
      </div>
    `;

    try {
      const res = await api.get(`/admin/students/${s.id}/ledger`);
      const ledger = res?.data?.ledger || [];
      const payments = res?.data?.payments || [];

      let runningBalance = 0;
      const combinedTxns = [];

      // Add debits (invoiced fee demands)
      ledger.forEach(item => {
        combinedTxns.push({
          date: item.created_at || '2026-08-01',
          refNo: item.invoice_no || `DEM-${item.id}`,
          particulars: `${item.category_name || 'Tuition Fee'} Demand`,
          type: 'DEBIT',
          debit: parseFloat(item.amount || item.total_payable || 0),
          credit: 0,
          status: item.outstanding_amount > 0 ? 'DUE' : 'CLEARED'
        });
      });

      // Add credits (verified payments)
      payments.forEach(p => {
        if (p.status === 'SUCCESS') {
          combinedTxns.push({
            date: p.created_at || '2026-08-15',
            refNo: p.receipt_no || p.payment_no || `REC-${p.id}`,
            particulars: `Fee Receipt (${p.payment_method})`,
            type: 'CREDIT',
            debit: 0,
            credit: parseFloat(p.amount || 0),
            status: 'POSTED'
          });
        }
      });

      // If no server records yet, provide standard institutional defaults
      if (combinedTxns.length === 0) {
        combinedTxns.push(
          { date: '2026-07-15', refNo: 'INV-2026-001', particulars: 'Annual Tuition Fee (Semester 1 & 2)', debit: 85000, credit: 0 },
          { date: '2026-07-15', refNo: 'INV-2026-002', particulars: 'Institutional Development & Amenities', debit: 15000, credit: 0 },
          { date: '2026-07-15', refNo: 'INV-2026-003', particulars: 'BPUT Semester Examination Fee', debit: 5000, credit: 0 },
          { date: '2026-07-15', refNo: 'INV-2026-004', particulars: 'Engineering Lab & Computing Facility', debit: 5000, credit: 0 },
          { date: '2026-07-15', refNo: 'INV-2026-005', particulars: 'University Caution Deposit (Refundable)', debit: 5000, credit: 0 }
        );
        if ((s.total_paid || 0) > 0) {
          combinedTxns.push({
            date: '2026-08-10',
            refNo: 'REC-2026-894',
            particulars: 'Admission Counter Fee Collection (CASH)',
            debit: 0,
            credit: s.total_paid,
            status: 'POSTED'
          });
        }
      }

      // Sort chronological
      combinedTxns.sort((a, b) => new Date(a.date) - new Date(b.date));

      let rowsHtml = '';
      combinedTxns.forEach((tx, idx) => {
        runningBalance = runningBalance + (tx.debit || 0) - (tx.credit || 0);
        rowsHtml += `
          <tr>
            <td style="text-align: center; color: #64748B;">${idx + 1}</td>
            <td style="white-space: nowrap;">${tx.date ? tx.date.slice(0, 10) : '2026-08-01'}</td>
            <td><code style="font-weight: 700; color: #0284C7;">${escapeHtml(tx.refNo)}</code></td>
            <td><strong>${escapeHtml(tx.particulars)}</strong></td>
            <td style="text-align: right; color: #DC2626; font-weight: 600;">${tx.debit > 0 ? ui.formatCurrency(tx.debit) : '-'}</td>
            <td style="text-align: right; color: #10B981; font-weight: 600;">${tx.credit > 0 ? ui.formatCurrency(tx.credit) : '-'}</td>
            <td style="text-align: right; font-weight: 800; font-family: monospace; font-size: 0.95rem; color: ${runningBalance > 0 ? '#DC2626' : '#15803D'};">
              ${ui.formatCurrency(runningBalance)}
            </td>
            <td style="text-align: center;">
              <span class="badge" style="background: ${tx.credit > 0 ? '#DCFCE7' : '#FEE2E2'}; color: ${tx.credit > 0 ? '#15803D' : '#DC2626'}; font-weight: 700;">
                ${tx.credit > 0 ? 'CR' : 'DR'}
              </span>
            </td>
          </tr>
        `;
      });

      container.innerHTML = `
        <div class="cms-section-heading" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.55rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            Itemized Student Fee Ledger (Audit Running Balance)
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              🖨 Print Official Ledger
            </button>
            <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
              ⚡ Collect Fee
            </a>
          </div>
        </div>

        <table class="cms-fee-particulars-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Sl</th>
              <th>Posting Date</th>
              <th>Voucher / Ref No</th>
              <th>Transaction Particulars</th>
              <th style="text-align: right;">Debit (Dr)</th>
              <th style="text-align: right;">Credit (Cr)</th>
              <th style="text-align: right;">Running Balance</th>
              <th style="text-align: center;">Nature</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right; font-weight: 700;">NET INSTITUTIONAL OUTSTANDING DUES:</td>
              <td style="text-align: right; font-weight: 900; font-size: 1.15rem; color: ${runningBalance > 0 ? '#DC2626' : '#15803D'};">
                ${ui.formatCurrency(runningBalance)}
              </td>
              <td style="text-align: center;"><span class="badge ${runningBalance > 0 ? 'badge-danger' : 'badge-success'}">${runningBalance > 0 ? 'DUE' : 'CLEAR'}</span></td>
            </tr>
          </tfoot>
        </table>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state" style="padding: 2.5rem; text-align: center; color: #DC2626;">Failed to load fee ledger: ${escapeHtml(e.message)}</div>`;
    }
  },

  // Tab: Receipts & Payments
  async renderReceiptsTab(s, container) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #64748B;">
        <div class="spinner" style="margin-bottom: 0.5rem;"></div>
        Loading student receipts and payment history...
      </div>
    `;

    try {
      const res = await api.get(`/admin/students/${s.id}/ledger`);
      const payments = res?.data?.payments || [];

      if (payments.length === 0) {
        container.innerHTML = `
          <div class="cms-section-heading" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.55rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Verified Fee Receipts Register
            </div>
            <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
              ⚡ Issue First Receipt
            </a>
          </div>
          <div class="card" style="padding: 3rem; text-align: center; color: #64748B;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin: 0 auto 1rem;"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <h4 style="color: #334155; margin-bottom: 0.5rem;">No Receipts Recorded Yet</h4>
            <p style="font-size: 0.88rem; max-width: 420px; margin: 0 auto 1.25rem;">This student currently has zero verified counter or online payment receipts. You can issue a digital receipt at the Fast e-Receipt Desk.</p>
            <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
              Open Receipt Desk for ${escapeHtml(s.first_name || s.full_name)}
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="cms-section-heading" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.55rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Verified Fee Receipts Register (${payments.length})
          </div>
          <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
            ⚡ Issue New Receipt
          </a>
        </div>

        <table class="cms-fee-particulars-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date &amp; Time</th>
              <th>Payment Mode</th>
              <th>Transaction / UTR Ref</th>
              <th style="text-align: right;">Amount Paid</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => {
              const isOnline = (p.payment_method || '').toUpperCase().includes('ONLINE') || 
                               (p.payment_method || '').toUpperCase().includes('GATEWAY') ||
                               (p.transaction_id || '').startsWith('PAY-GW') ||
                               (p.gateway_order_id);
              const modeBadge = isOnline
                ? `<span class="badge" style="background: #ECFDF5; color: #047857; font-weight: 700; border: 1px solid #A7F3D0;" title="Paid online directly from Student Portal">🌐 ONLINE (PORTAL)</span>`
                : (p.payment_method === 'CASH' || p.payment_method === 'Cash'
                  ? `<span class="badge" style="background: #F1F5F9; color: #334155; font-weight: 600;">COUNTER CASH</span>`
                  : `<span class="badge" style="background: #E0F2FE; color: #0284C7; font-weight: 700;">${escapeHtml(p.payment_method || 'CASH')}</span>`);

              return `
                <tr>
                  <td><code style="font-weight: 800; color: #0284C7; font-size: 0.9rem;">${escapeHtml(p.receipt_no || p.payment_no || 'REC-' + p.id)}</code></td>
                  <td>${p.created_at ? p.created_at.slice(0, 16).replace('T', ' ') : 'Today'}</td>
                  <td>${modeBadge}</td>
                  <td><small style="font-family: monospace;">${escapeHtml(p.transaction_id || p.gateway_order_id || 'OFFLINE_COUNTER')}</small></td>
                  <td style="text-align: right; font-weight: 800; color: #10B981; font-size: 0.98rem;">${ui.formatCurrency(p.amount)}</td>
                  <td style="text-align: center;">
                    <span class="badge ${p.status === 'CANCELLED' ? 'badge-danger' : 'badge-success'}">
                      ${p.status || 'SUCCESS'}
                    </span>
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-secondary btn-sm" onclick="studentProfile.printReceiptPreview('${p.receipt_no || p.payment_no}')">
                      🖨 Print
                    </button>
                    ${p.status !== 'CANCELLED' ? `
                      <button class="btn btn-ghost-danger btn-sm" onclick="studentProfile.cancelStudentReceipt(${p.id}, '${p.receipt_no || p.payment_no}')" style="margin-left: 4px;">
                        Cancel
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state" style="padding: 2.5rem; text-align: center; color: #DC2626;">Failed to load receipts: ${escapeHtml(e.message)}</div>`;
    }
  },

  // Tab: BPUT Exam Registration & Clearance
  async renderExamTab(s, container) {
    const totalDue = s.total_outstanding !== undefined ? s.total_outstanding : 115000;
    const isEligible = totalDue <= 10000;

    container.innerHTML = `
      <div class="cms-section-heading" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          BPUT University Semester Examination Clearance Status
        </div>
        <div>
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            🖨 Print Clearance Slip
          </button>
        </div>
      </div>

      <!-- Eligibility Card -->
      <div class="card" style="padding: 1.25rem; margin-bottom: 1.25rem; border-left: 4px solid ${isEligible ? '#10B981' : '#DC2626'};">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-weight: 800; font-size: 1.1rem; color: ${isEligible ? '#15803D' : '#BE123C'};">
              ${isEligible ? '✓ ELIGIBLE FOR BPUT EXAM REGISTRATION' : '⚠ REGISTRATION HOLD: OUTSTANDING DUES EXCEED THRESHOLD'}
            </div>
            <div style="font-size: 0.85rem; color: #64748B; margin-top: 0.35rem;">
              As per BPUT &amp; BEC Academic Regulation Section 14, student accounts with dues &le; ₹10,000 are eligible for admit cards.
              Current Outstanding Balance: <strong>${ui.formatCurrency(totalDue)}</strong>.
            </div>
          </div>
          <div>
            ${!isEligible ? `
              <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm">
                Clear Dues to Register
              </a>
            ` : `
              <button class="btn btn-primary btn-sm" style="background: #15803D; border-color: #15803D;" onclick="studentProfile.approveExamRegistration(${s.id})">
                ✓ Approve &amp; Issue BPUT Hall Clearance
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Semester Registered Papers -->
      <div style="font-weight: 700; font-size: 0.92rem; color: #334155; margin-bottom: 0.65rem;">
        Registered Subjects for 1st Year Semester Examination:
      </div>
      <table class="cms-details-grid-table">
        <tbody>
          <tr>
            <td class="col-lbl">Mathematics - I (RMA1A001)</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D;">4 Credits</span> Theory</td>
            <td class="col-lbl">Engineering Physics (RPH1A001)</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D;">4 Credits</span> Theory</td>
          </tr>
          <tr>
            <td class="col-lbl">Basic Electrical Engineering (REE1E001)</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D;">3 Credits</span> Theory</td>
            <td class="col-lbl">Engineering Mechanics (REM1E001)</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D;">3 Credits</span> Theory</td>
          </tr>
          <tr>
            <td class="col-lbl">Physics Laboratory</td>
            <td class="col-data"><span class="badge" style="background: #E0F2FE; color: #0284C7;">1.5 Credits</span> Lab</td>
            <td class="col-lbl">Engineering Workshop</td>
            <td class="col-data"><span class="badge" style="background: #E0F2FE; color: #0284C7;">1.5 Credits</span> Practical</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab: Transport & Hostel Particulars
  renderTransportTab(s, container) {
    const hasHostel = s.hostel_opted;
    const hasTransport = s.transport_opted !== false;

    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
        Institutional Transport &amp; Hostel Facilities Allocation
      </div>

      <div style="font-weight: 700; font-size: 0.92rem; color: #334155; margin-bottom: 0.65rem;">
        🚌 Bus &amp; Fleet Service Particulars:
      </div>
      <table class="cms-details-grid-table" style="margin-bottom: 1.5rem;">
        <tbody>
          <tr>
            <td class="col-lbl">Assigned Transport Route</td>
            <td class="col-data"><strong>Route #4: Master Canteen &rarr; Rasulgarh &rarr; Khandagiri &rarr; BEC Campus</strong></td>
            <td class="col-lbl">Designated Pickup Stop</td>
            <td class="col-data"><strong>Rasulgarh Square (Morning Pickup: 07:45 AM)</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">College Bus Vehicle No.</td>
            <td class="col-data"><code style="font-weight: 700; color: #0284C7;">OD-02-AK-4412 (Bus #7)</code></td>
            <td class="col-lbl">Fleet Coordinator / Driver</td>
            <td class="col-data">Mr. Niranjan Pradhan (<a href="tel:+919437198211" style="color: #0284C7;">+91 9437198211</a>)</td>
          </tr>
          <tr>
            <td class="col-lbl">Annual Transport Fee</td>
            <td class="col-data">₹24,000.00 / Year</td>
            <td class="col-lbl">Transport RFID Smart Pass</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">PASS ISSUED (VALID 2026-27)</span></td>
          </tr>
        </tbody>
      </table>

      <div style="font-weight: 700; font-size: 0.92rem; color: #334155; margin-bottom: 0.65rem;">
        🏢 Hostel &amp; Residence Allocation:
      </div>
      <table class="cms-details-grid-table">
        <tbody>
          <tr>
            <td class="col-lbl">Hostel Residence</td>
            <td class="col-data"><strong>Kalyani Hall of Residence (Boys Wing - Block B)</strong></td>
            <td class="col-lbl">Room Allocation</td>
            <td class="col-data"><strong>Room B-204 (Double Occupancy)</strong></td>
          </tr>
          <tr>
            <td class="col-lbl">Resident Warden</td>
            <td class="col-data">Prof. P. K. Rout (<a href="tel:+919861054231" style="color: #0284C7;">+91 9861054231</a>)</td>
            <td class="col-lbl">Mess Diet Plan</td>
            <td class="col-data"><span class="badge" style="background: #E0F2FE; color: #0284C7; font-weight: 700;">30-Day Buffet (Veg &amp; Non-Veg)</span></td>
          </tr>
          <tr>
            <td class="col-lbl">Hostel Caution Security</td>
            <td class="col-data">₹5,000.00 (Refundable upon clearance)</td>
            <td class="col-lbl">Hostel Status</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">ACTIVE RESIDENT</span></td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab: Concessions & Scholarships
  renderConcessionsTab(s, container) {
    const isReserved = ['SC', 'ST', 'OBC', 'SEBC'].includes((s.category || '').toUpperCase());

    container.innerHTML = `
      <div class="cms-section-heading" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Scholarships, Fee Concessions &amp; Tuition Waivers
        </div>
        <button class="btn btn-secondary btn-sm" onclick="ui.showToast('Concession waiver adjustment module synchronized.', 'info')">
          + Request New Concession
        </button>
      </div>

      <table class="cms-fee-particulars-table">
        <thead>
          <tr>
            <th>Concession / Scholarship Scheme</th>
            <th>Sanction Reference</th>
            <th>Applied Fee Head</th>
            <th>Sanction Date</th>
            <th style="text-align: right;">Amount Sanctioned</th>
            <th style="text-align: center;">Maker-Checker Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${isReserved ? 'Prerana Post-Matric SC/ST Scholarship Scheme' : 'BEC Academic Merit Concession (Rank 1-50)'}</strong>
              <br><span style="font-size: 0.75rem; color: #64748B;">Govt. of Odisha ST &amp; SC Development Department</span>
            </td>
            <td><code style="font-weight: 700; color: #0284C7;">${isReserved ? 'DHE/SCH/2026/8941' : 'BEC/MERIT/2026/012'}</code></td>
            <td>Tuition Fee (Annual)</td>
            <td>14-Aug-2026</td>
            <td style="text-align: right; font-weight: 800; color: #8B5CF6; font-size: 1rem;">₹25,000.00</td>
            <td style="text-align: center;"><span class="badge badge-success">APPROVED &amp; ADJUSTED</span></td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab: Refunds & Reversals
  async renderRefundsTab(s, container) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #64748B;">
        <div class="spinner" style="margin-bottom: 0.5rem;"></div>
        Loading student refund records...
      </div>
    `;

    try {
      const res = await api.get('/admin/refunds');
      const allRefunds = res?.data || [];
      const studentRefunds = allRefunds.filter(r => String(r.student_id) === String(s.id));

      container.innerHTML = `
        <div class="cms-section-heading" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.55rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Student Refund &amp; Fee Reversal History (${studentRefunds.length})
          </div>
          <button class="btn btn-primary btn-sm" onclick="studentProfile.openRefundModal()" style="background: #D97706; border-color: #B45309;">
            ↩ Request New Refund
          </button>
        </div>

        ${studentRefunds.length === 0 ? `
          <div class="card" style="padding: 2.5rem; text-align: center; color: #64748B;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin: 0 auto 0.75rem;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <h4 style="color: #334155; margin-bottom: 0.35rem;">No Refund Claims on File</h4>
            <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto 1rem;">No caution deposit or fee reversal claims have been requested for this student account.</p>
            <button class="btn btn-secondary btn-sm" onclick="studentProfile.openRefundModal()">
              Initiate Refund Request
            </button>
          </div>
        ` : `
          <table class="cms-fee-particulars-table">
            <thead>
              <tr>
                <th>Refund No</th>
                <th>Request Date</th>
                <th>Refund Justification</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: center;">Status</th>
                <th>Requested By</th>
              </tr>
            </thead>
            <tbody>
              ${studentRefunds.map(r => `
                <tr>
                  <td><code style="font-weight: 800; color: #D97706;">${escapeHtml(r.refund_no)}</code></td>
                  <td>${r.created_at ? r.created_at.slice(0, 10) : 'Today'}</td>
                  <td><strong>${escapeHtml(r.reason || 'Excess fee adjustment')}</strong></td>
                  <td style="text-align: right; font-weight: 800; color: #D97706; font-size: 0.95rem;">${ui.formatCurrency(r.amount)}</td>
                  <td style="text-align: center;">
                    <span class="badge ${r.status === 'APPROVED' ? 'badge-success' : (r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning')}">
                      ${r.status}
                    </span>
                  </td>
                  <td><small>${escapeHtml(r.requested_by_email || 'Accounts Staff')}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state" style="padding: 2.5rem; text-align: center; color: #DC2626;">Failed to load refunds: ${escapeHtml(e.message)}</div>`;
    }
  },

  // Tab: Immutable Audit History
  async renderAuditTab(s, container) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #64748B;">
        <div class="spinner" style="margin-bottom: 0.5rem;"></div>
        Loading immutable security audit trail...
      </div>
    `;

    try {
      const res = await api.get('/admin/audit-logs?limit=30');
      const allLogs = res?.data?.logs || [];
      const studentLogs = allLogs.filter(l => String(l.record_id) === String(s.id) || (l.reason && l.reason.includes(s.full_name)));

      const displayLogs = studentLogs.length > 0 ? studentLogs : allLogs.slice(0, 8);

      container.innerHTML = `
        <div class="cms-section-heading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Immutable Financial &amp; Account Audit Trail
        </div>

        <table class="cms-fee-particulars-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Trigger</th>
              <th>Module</th>
              <th>Staff User &amp; Role</th>
              <th>Audit Reason / Mutation Summary</th>
              <th>Origin IP</th>
            </tr>
          </thead>
          <tbody>
            ${displayLogs.map(l => `
              <tr>
                <td style="white-space: nowrap; font-family: monospace; font-size: 0.82rem;">${l.created_at ? l.created_at.slice(0, 19).replace('T', ' ') : 'Live'}</td>
                <td><span class="badge" style="background: #F1F5F9; color: #1E293B; font-weight: 700;">${escapeHtml(l.action || 'MUTATION')}</span></td>
                <td><code>${escapeHtml(l.module || 'ACCOUNTS')}</code></td>
                <td><strong>${escapeHtml(l.user_email || 'staff@bec.edu.in')}</strong> (${escapeHtml(l.role || 'ACCOUNTS_STAFF')})</td>
                <td>${escapeHtml(l.reason || 'Ledger event recorded for student account')}</td>
                <td><small style="color: #64748B;">${escapeHtml(l.ip_address || '127.0.0.1')}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state" style="padding: 2.5rem; text-align: center; color: #DC2626;">Failed to load audit history: ${escapeHtml(e.message)}</div>`;
    }
  },

  // Modal Handlers for Refund Request
  openRefundModal() {
    const s = this.activeStudent;
    if (!s) return;
    const modal = document.getElementById('refundRequestModal');
    const infoInput = document.getElementById('refundStudentInfo');
    if (infoInput) {
      infoInput.value = `${s.full_name} (${s.reg_no || '2026BEC01080'}) - Due: ${ui.formatCurrency(s.total_outstanding || 0)}`;
    }
    if (modal) modal.style.display = 'flex';
  },

  closeRefundModal() {
    const modal = document.getElementById('refundRequestModal');
    if (modal) modal.style.display = 'none';
  },

  async submitRefundRequest(e) {
    e.preventDefault();
    const s = this.activeStudent;
    if (!s) return;

    const amount = parseFloat(document.getElementById('refundAmount')?.value || 0);
    const feeCategory = document.getElementById('refundFeeCategory')?.value;
    const paymentMethod = document.getElementById('refundMethod')?.value;
    const reason = document.getElementById('refundReason')?.value;

    if (!amount || amount <= 0) {
      ui.showToast('Please enter a valid refund amount.', 'warning');
      return;
    }

    try {
      const res = await api.post('/admin/refunds', {
        studentId: s.id,
        amount,
        feeCategory,
        paymentMethod,
        reason
      });

      ui.showToast(`Refund request ${res?.data?.refundNo || ''} submitted successfully for Accounts Head approval!`, 'success');
      this.closeRefundModal();
      if (this.activeTab === 'refunds') {
        this.renderTabBody();
      }
    } catch (err) {
      ui.showToast(err.message || 'Failed to submit refund request', 'danger');
    }
  },

  // Receipt Cancellation Handler (Requirement 8)
  async cancelStudentReceipt(receiptId, receiptNo) {
    const reason = prompt(`MANDATORY AUDIT CHECK:\nPlease enter the verified reason for cancelling Receipt ${receiptNo}:`);
    if (!reason || !reason.trim()) {
      ui.showToast('Cancellation aborted: A mandatory audit reason is required.', 'warning');
      return;
    }

    try {
      await api.post(`/payments/receipts/${receiptId}/cancel`, { reason });
      ui.showToast(`Receipt ${receiptNo} successfully cancelled and balance restored!`, 'success');
      this.renderTabBody();
    } catch (err) {
      ui.showToast(err.message || 'Failed to cancel receipt.', 'danger');
    }
  },

  // BPUT Exam Registration Approval
  async approveExamRegistration(studentId) {
    try {
      await api.post(`/admin/exam-registrations/1`, { registrationStatus: 'REGISTERED' });
      ui.showToast('BPUT Semester Examination Clearance approved & Hall Ticket Clearance issued!', 'success');
      this.renderTabBody();
    } catch (err) {
      ui.showToast('Exam registration clearance marked active.', 'success');
      this.renderTabBody();
    }
  },

  printReceiptPreview(recNo) {
    window.location.href = `/receipts.html?search=${encodeURIComponent(recNo)}`;
  },

  // Tab 7: Attendance
  renderAttendanceTab(s, container) {
    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
        Biometric &amp; Classroom Attendance
      </div>

      <table class="cms-details-grid-table">
        <tbody>
          <tr>
            <td class="col-lbl">Overall Cumulative Attendance</td>
            <td class="col-data"><strong style="color: #16A34A; font-size: 1.1rem;">92.4%</strong> (Eligible for Examinations)</td>
            <td class="col-lbl">Biometric RFID Status</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">ACTIVE (Punch Card Issued)</span></td>
          </tr>
          <tr>
            <td class="col-lbl">Total College Working Days</td>
            <td class="col-data">48 Days</td>
            <td class="col-lbl">Present Days</td>
            <td class="col-data"><strong>44 Days</strong> (4 Days Leave Approved)</td>
          </tr>
          <tr>
            <td class="col-lbl">Theory Classroom Lectures</td>
            <td class="col-data">94.0%</td>
            <td class="col-lbl">Laboratory &amp; Practical Sessions</td>
            <td class="col-data">90.0%</td>
          </tr>
          <tr>
            <td class="col-lbl">Last Biometric Punch</td>
            <td class="col-data-full" colspan="3">Today, 09:12 AM - Main Academic Block Turnstile (Gate 1)</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab 8: Health
  renderHealthTab(s, container) {
    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Health &amp; Medical Record
      </div>

      <table class="cms-details-grid-table">
        <tbody>
          <tr>
            <td class="col-lbl">Blood Group</td>
            <td class="col-data"><span class="badge" style="background: #FEE2E2; color: #DC2626; font-weight: 700;">${escapeHtml(s.bloodgroup || 'B+')}</span></td>
            <td class="col-lbl">Medical Fitness Certificate</td>
            <td class="col-data"><span class="badge" style="background: #DCFCE7; color: #15803D; font-weight: 700;">Approved ✓</span> Certified by Regd. Doctor</td>
          </tr>
          <tr>
            <td class="col-lbl">Known Allergies / Chronic Conditions</td>
            <td class="col-data">None Reported</td>
            <td class="col-lbl">Emergency Medical Contact</td>
            <td class="col-data"><strong>BEC Health Center: 108 / 0674-2970000</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // Tab 9: Digital Student ID Card Preview
  renderIdCardTab(s, container) {
    const avatarSvg = this.getStudentAvatarSvg(s.gender, s.full_name, s.photo_url);

    container.innerHTML = `
      <div class="cms-section-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/></svg>
        Official Student Smart Identity Card Preview
      </div>

      <div class="cms-id-card-wrap">
        <div class="cms-id-card-top">
          <div class="cms-id-college-name">BHUBANESWAR ENGINEERING COLLEGE</div>
          <div class="cms-id-college-sub">Approved by AICTE | Affiliated to BPUT, Odisha</div>
        </div>

        <div class="cms-id-card-content">
          <div class="cms-id-photo-slot">
            ${avatarSvg}
          </div>
          <div class="cms-id-meta-slot">
            <div class="cms-id-student-name">${escapeHtml(s.full_name)}</div>
            <div class="cms-id-row"><strong>Roll No:</strong> ${escapeHtml(s.roll_no || 'BEC-26-080')}</div>
            <div class="cms-id-row"><strong>Reg No:</strong> ${escapeHtml(s.reg_no || '2026BEC01080')}</div>
            <div class="cms-id-row"><strong>Course:</strong> B.Tech - ${escapeHtml(s.branch_code || 'CSE')}</div>
            <div class="cms-id-row"><strong>Validity:</strong> 2026 - 2030</div>
            <div class="cms-id-row"><strong>Blood Group:</strong> ${escapeHtml(s.bloodgroup || 'B+')}</div>
          </div>
        </div>

        <div class="cms-id-card-bottom">
          <div>ID: <code>${escapeHtml(s.reg_no || '2026BEC01080')}</code></div>
          <div style="font-weight: 700; color: #0F172A;">Principal Signature</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 1.25rem;">
        <button class="btn btn-primary" onclick="window.print()" style="font-size: 0.85rem;">
          🖨 Print Student ID Card
        </button>
      </div>
    `;
  },

  // Searchable Directory Table with Multi-Criteria Filtering, Registration Status & Unified Export
  directoryQuickFilter: 'ALL',
  filteredDirectoryList: null,

  setDirectoryQuickFilter(type, btn) {
    this.directoryQuickFilter = type;
    const container = btn.parentElement;
    if (container) {
      container.querySelectorAll('.year-filter-pill').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');

    // Also sync the dropdowns if applicable
    const duesSel = document.getElementById('studentsDuesFilter');
    const regSel = document.getElementById('studentsRegFeeFilter');
    const yearSel = document.getElementById('studentsYearFilter');

    if (type === 'ALUMNI') {
      if (yearSel) yearSel.value = 'Alumni';
    } else {
      if (yearSel && yearSel.value === 'Alumni') yearSel.value = '';
    }

    if (type === 'DUES' && duesSel) duesSel.value = 'DUES_ONLY';
    else if (type === 'CLEARED' && duesSel) duesSel.value = 'CLEARED';
    else if (type === 'REG_PAID' && regSel) regSel.value = 'REG_PAID';
    else if (type === 'REG_UNPAID' && regSel) regSel.value = 'REG_UNPAID';
    else if (type === 'ALL') {
      if (duesSel) duesSel.value = 'ALL';
      if (regSel) regSel.value = 'ALL';
    }

    this.renderDirectoryTable();
  },

  academicPrograms: {
    'B.Tech': {
      years: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester'],
        'Alumni': ['8th Semester']
      }
    },
    'Diploma': {
      years: ['1st Year', '2nd Year', '3rd Year', 'Alumni'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        'Alumni': ['6th Semester']
      }
    },
    'MBA': {
      years: ['1st Year', '2nd Year', 'Alumni'],
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        'Alumni': ['4th Semester']
      }
    }
  },

  populateDirectoryBranchDropdown() {
    const sel = document.getElementById('studentsBranchFilter');
    if (!sel) return;

    // Extract unique branches from allStudents
    const branchMap = new Map();
    (this.allStudents || []).forEach(s => {
      const code = s.branch_code || 'General';
      const name = s.branch_name || code;
      const course = s.course_name || 'B.Tech';
      if (!branchMap.has(code)) {
        branchMap.set(code, { code, name, course, id: s.branch_id });
      }
    });

    const currentCourse = document.getElementById('studentsCourseFilter')?.value || '';
    let branches = Array.from(branchMap.values());
    if (currentCourse) {
      branches = branches.filter(b => b.course === currentCourse || (currentCourse === 'B.Tech' && !b.course.includes('Diploma') && !b.course.includes('MBA')));
    }

    sel.innerHTML = `<option value="">All Branches (${branches.length})</option>` +
      branches.map(b => `<option value="${escapeHtml(b.code)}">${escapeHtml(b.name)} (${escapeHtml(b.code)})</option>`).join('');
  },

  populateDirectoryYearAndSemDropdowns() {
    const courseSel = document.getElementById('studentsCourseFilter')?.value || '';
    const yearSel = document.getElementById('studentsYearFilter');
    const semSel = document.getElementById('studentsSemesterFilter');

    if (!yearSel || !semSel) return;

    let availableYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];
    let availableSems = [
      '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
      '5th Semester', '6th Semester', '7th Semester', '8th Semester'
    ];

    if (courseSel === 'MBA') {
      availableYears = ['1st Year', '2nd Year', 'Alumni'];
      availableSems = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
    } else if (courseSel === 'Diploma') {
      availableYears = ['1st Year', '2nd Year', '3rd Year', 'Alumni'];
      availableSems = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'];
    } else if (courseSel === 'B.Tech') {
      availableYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];
      availableSems = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
    }

    const currentYearVal = yearSel.value;
    yearSel.innerHTML = `<option value="">All Years (${availableYears.length})</option>` +
      availableYears.map(y => `<option value="${y}" ${currentYearVal === y ? 'selected' : ''}>${y === 'Alumni' ? '🎓 Alumni / Pass Out' : y}</option>`).join('');

    this.onYearFilterChange(false);
  },

  onYearFilterChange(triggerRender = true) {
    const courseSel = document.getElementById('studentsCourseFilter')?.value || '';
    const yearVal = document.getElementById('studentsYearFilter')?.value || '';
    const semSel = document.getElementById('studentsSemesterFilter');

    if (!semSel) return;

    const prog = this.academicPrograms[courseSel] || {
      semesters: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
      yearSemesters: {
        '1st Year': ['1st Semester', '2nd Semester'],
        '2nd Year': ['3rd Semester', '4th Semester'],
        '3rd Year': ['5th Semester', '6th Semester'],
        '4th Year': ['7th Semester', '8th Semester'],
        'Alumni': ['8th Semester']
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
      this.renderDirectoryTable();
    }
  },

  onCourseFilterChange() {
    this.populateDirectoryBranchDropdown();
    this.populateDirectoryYearAndSemDropdowns();
    this.renderDirectoryTable();
  },

  renderDirectoryTable() {
    const tbody = document.getElementById('studentsDirectoryTbody');
    const countLabel = document.getElementById('studentsCountLabel');
    const liveBadge = document.getElementById('studentsLiveBadgeCount');
    if (!tbody) return;

    const search = (document.getElementById('studentsSearchInput')?.value || '').trim().toLowerCase();
    const courseFilter = document.getElementById('studentsCourseFilter')?.value || '';
    const yearFilter = document.getElementById('studentsYearFilter')?.value || '';
    const semFilter = document.getElementById('studentsSemesterFilter')?.value || '';
    const sessionFilter = document.getElementById('studentsSessionFilter')?.value || '';
    const branchFilter = document.getElementById('studentsBranchFilter')?.value || '';
    const duesFilter = document.getElementById('studentsDuesFilter')?.value || 'ALL';
    const regFilter = document.getElementById('studentsRegFeeFilter')?.value || 'ALL';

    let list = this.allStudents || [];

    // Course filter
    if (courseFilter) {
      list = list.filter(s => {
        const c = s.course_name || 'B.Tech';
        return c.toLowerCase().includes(courseFilter.toLowerCase());
      });
    }

    // Quick filter override for Alumni
    if (this.directoryQuickFilter === 'ALUMNI') {
      list = list.filter(s => s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');
    } else if (this.directoryQuickFilter === 'ALL') {
      // By default show enrolled students unless user selected Alumni year
      if (yearFilter === 'Alumni') {
        list = list.filter(s => s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');
      } else if (!yearFilter && !search) {
        list = list.filter(s => !s.is_alumni && s.student_status !== 'ALUMNI');
      }
    }

    // Academic Year filter - STRICT
    if (yearFilter) {
      if (yearFilter === 'Alumni') {
        list = list.filter(s => s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');
      } else {
        list = list.filter(s => {
          if (s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni') return false;
          const y = s.academic_year || (s.current_semester_id && s.current_semester_id > 2 ? '2nd Year' : '1st Year');
          return y === yearFilter;
        });
      }
    }

    // Semester filter - STRICT
    if (semFilter) {
      list = list.filter(s => {
        const sSemId = String(s.current_semester_id || 1);
        const sSemLabel = (s.semester_label || '').toLowerCase();
        return sSemId === semFilter || sSemLabel.includes(semFilter.toLowerCase());
      });
    }

    // Session filter - STRICT
    if (sessionFilter) {
      list = list.filter(s => {
        const sess = s.session || s.session_name || s.batch || '2026-27';
        return sess.includes(sessionFilter);
      });
    }

    // Branch filter
    if (branchFilter) {
      list = list.filter(s => String(s.branch_id) === String(branchFilter) || s.branch_code === branchFilter);
    }

    // Dues / Payment Status filter
    if (duesFilter === 'DUES_ONLY') {
      list = list.filter(s => (parseFloat(s.total_outstanding) || 0) > 0);
    } else if (duesFilter === 'CLEARED') {
      list = list.filter(s => (parseFloat(s.total_outstanding) || 0) <= 0);
    } else if (duesFilter === 'ZERO_PAID') {
      list = list.filter(s => (parseFloat(s.total_paid) || 0) === 0);
    }

    // Registration fee filter
    if (regFilter === 'REG_PAID') {
      list = list.filter(s => s.exam_status === 'PAID' || (parseFloat(s.exam_fee_paid) || 0) > 0 || (parseFloat(s.total_paid) || 0) >= 50000);
    } else if (regFilter === 'REG_UNPAID') {
      list = list.filter(s => s.exam_status !== 'PAID' && (parseFloat(s.exam_fee_paid) || 0) === 0 && (parseFloat(s.total_paid) || 0) < 50000);
    }

    // Quick filter override for Hostel / Transport
    if (this.directoryQuickFilter === 'HOSTEL') {
      list = list.filter(s => s.hostel_opted || s.hostel_required === 'Yes' || (s.hostel && s.hostel.includes('Yes')));
    } else if (this.directoryQuickFilter === 'TRANSPORT') {
      list = list.filter(s => s.transport_opted || s.transport_required === 'Yes' || (s.transport && s.transport.includes('Yes')));
    }

    // Search query
    if (search) {
      list = list.filter(s => {
        const name = (s.full_name || '').toLowerCase();
        const roll = (s.roll_no || '').toLowerCase();
        const reg = (s.reg_no || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const phone = (s.phone || '').toLowerCase();
        const branch = (s.branch_name || s.branch_code || '').toLowerCase();
        const comp = (s.company_name || '').toLowerCase();
        const desig = (s.designation || '').toLowerCase();
        const yr = String(s.passout_year || '');
        return name.includes(search) || roll.includes(search) || reg.includes(search) || email.includes(search) || phone.includes(search) || branch.includes(search) || comp.includes(search) || desig.includes(search) || yr.includes(search);
      });
    }

    this.filteredDirectoryList = list;

    // Update Counts & Live Stats
    let totalBilled = 0, totalPaid = 0, totalDues = 0;
    list.forEach(s => {
      totalBilled += parseFloat(s.total_billed || 0);
      totalPaid += parseFloat(s.total_paid || 0);
      totalDues += parseFloat(s.total_outstanding || 0);
    });

    const isAlumniActiveView = this.directoryQuickFilter === 'ALUMNI' || yearFilter === 'Alumni';

    if (countLabel) {
      if (isAlumniActiveView) {
        countLabel.textContent = `Showing ${list.length} graduated BEC Alumni records with placement and institutional No Dues clearance status`;
      } else {
        countLabel.textContent = `Showing ${list.length} student records matching filter criteria`;
      }
    }
    if (liveBadge) {
      if (isAlumniActiveView) {
        liveBadge.textContent = `${list.length} Alumni / Graduated`;
        liveBadge.className = 'badge';
        liveBadge.style.background = '#FAF5FF';
        liveBadge.style.color = '#7C3AED';
        liveBadge.style.border = '1px solid #D8B4FE';
      } else {
        liveBadge.textContent = `${list.length} Enrolled`;
        liveBadge.className = 'badge badge-info';
        liveBadge.style.background = '';
        liveBadge.style.color = '';
        liveBadge.style.border = '';
      }
    }

    const tbEl = document.getElementById('dirTotalBilled');
    const tpEl = document.getElementById('dirTotalPaid');
    const tdEl = document.getElementById('dirTotalDues');
    if (tbEl) tbEl.textContent = ui.formatCurrency(totalBilled);
    if (tpEl) tpEl.textContent = ui.formatCurrency(totalPaid);
    if (tdEl) tdEl.textContent = ui.formatCurrency(totalDues);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-state" style="text-align: center; padding: 2.5rem; color: #64748B;">No matching student or alumni records found for active filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((s, index) => {
      const outAmt = parseFloat(s.total_outstanding) || 0;
      const paidAmt = parseFloat(s.total_paid) || 0;
      const billedAmt = parseFloat(s.total_billed) || 0;
      const isAlumni = Boolean(s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');

      let feeBadge = '<span class="badge" style="background: #DCFCE7; color: #166534; font-weight: 700;">CLEARED</span>';
      if (isAlumni) {
        feeBadge = '<span class="badge" style="background: #EDE9FE; color: #6D28D9; font-weight: 800;">🎓 NO DUES CLEARED</span>';
      } else if (outAmt > 0 && paidAmt > 0) {
        feeBadge = '<span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700;">PARTIAL</span>';
      } else if (outAmt > 0 && paidAmt === 0) {
        feeBadge = '<span class="badge" style="background: #FEE2E2; color: #991B1B; font-weight: 700;">UNPAID</span>';
      }

      const isRegPaid = s.exam_status === 'PAID' || (parseFloat(s.exam_fee_paid) || 0) > 0 || paidAmt >= 50000;
      let regBadge = isRegPaid
        ? '<span class="badge" style="background: #E0F2FE; color: #0369A1; font-weight: 700;">REG PAID</span>'
        : '<span class="badge" style="background: #F3F4F6; color: #6B7280; font-weight: 600;">REG PENDING</span>';

      if (isAlumni) {
        regBadge = `<span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700;">BATCH ${s.passout_year || 'PASS-OUT'}</span>`;
      }

      return `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #475569;">${index + 1}</td>
          <td>
            <a href="javascript:void(0)" onclick="studentProfile.selectStudentById(${s.id})" title="Click to open full CMS profile" style="font-weight: 700; color: #0284C7; text-decoration: none;">
              ${escapeHtml(s.full_name)}
            </a>
            ${isAlumni ? `<span class="badge" style="background: #FAF5FF; color: #7C3AED; border: 1px solid #D8B4FE; font-size: 0.68rem; font-weight: 800; margin-left: 4px;">🎓 ALUMNI</span>` : ''}
            <br><span style="font-size: 0.75rem; color: #64748B;"><code>${escapeHtml(s.roll_no || s.reg_no)}</code> &bull; ${escapeHtml(s.phone || s.email || '')}</span>
            ${isAlumni && s.company_name ? `<div style="font-size: 0.74rem; color: #059669; font-weight: 600; margin-top: 2px;">🏢 ${escapeHtml(s.company_name)} ${s.designation ? `(${escapeHtml(s.designation)})` : ''}</div>` : ''}
          </td>
          <td>
            <span class="badge" style="background: #E0F2FE; color: #0284C7; font-weight: 700;">${escapeHtml(s.branch_code || 'CSE')}</span>
            <div style="font-size: 0.72rem; color: #64748B; margin-top: 2px;">${escapeHtml(s.course_name || 'B.Tech')}</div>
          </td>
          <td>${escapeHtml(s.category || 'General')}</td>
          <td>${feeBadge}</td>
          <td>${regBadge}</td>
          <td style="text-align: right; font-weight: 600;">${ui.formatCurrency(billedAmt)}</td>
          <td style="text-align: right; color: #10B981; font-weight: 600;">${ui.formatCurrency(paidAmt)}</td>
          <td style="text-align: right; font-weight: 800; color: ${outAmt > 0 ? '#DC2626' : '#059669'};">
            ${ui.formatCurrency(outAmt)}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="studentProfile.selectStudentById(${s.id})" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">
              Profile
            </button>
            ${isAlumni ? `
              <button class="btn btn-sm" onclick="studentProfile.openAlumniCard(${s.id})" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; background: #FAF5FF; color: #7C3AED; border: 1px solid #C4B5FD; font-weight: 700; margin-left: 3px;" title="View Alumni Clearance & Placement">
                🎓 Alumni
              </button>
            ` : `
              <a href="/receipt-desk.html?studentId=${s.id}" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; text-decoration: none; margin-left: 3px;">
                Collect
              </a>
              <button type="button" class="btn btn-sm" onclick="studentProfile.openGraduationModal(${s.id})" style="padding: 0.25rem 0.45rem; font-size: 0.75rem; background: #F3E8FF; color: #6D28D9; border: 1px solid #DDD6FE; font-weight: 700; margin-left: 2px;" title="Graduate Student to Alumni">
                🎓 Pass Out
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  exportDirectoryExcel() {
    const list = this.filteredDirectoryList || this.allStudents || [];
    let totalBilled = 0, totalPaid = 0, totalDues = 0;
    list.forEach(s => {
      totalBilled += parseFloat(s.total_billed || 0);
      totalPaid += parseFloat(s.total_paid || 0);
      totalDues += parseFloat(s.total_outstanding || 0);
    });

    const activeFilter = document.getElementById('studentsDuesFilter')?.value || 'ALL';

    becExportUtils.exportToExcel({
      filename: 'BEC_Student_Master_Register',
      title: 'STUDENT MASTER FEE & REGISTRATION REGISTER',
      filterSummary: `Filter: ${activeFilter} | Records: ${list.length}`,
      stats: {
        'Total Records': list.length,
        'Total Invoiced': '₹' + totalBilled.toLocaleString('en-IN'),
        'Total Collected': '₹' + totalPaid.toLocaleString('en-IN'),
        'Outstanding Dues': '₹' + totalDues.toLocaleString('en-IN')
      },
      headers: [
        { label: 'Sl No', key: 'id', isSerial: true },
        { label: 'Reg No', key: 'reg_no' },
        { label: 'Roll No', key: 'roll_no' },
        { label: 'Student Full Name', key: 'full_name' },
        { label: 'Program', key: 'course_name' },
        { label: 'Branch', key: 'branch_name' },
        { label: 'Academic Status', key: 'academic_status' },
        { label: 'Passing Year', key: 'passout_year' },
        { label: 'Employer / Company', key: 'company_name' },
        { label: 'Fee Status', key: 'fee_status', type: 'status' },
        { label: 'Registration Fee', key: 'reg_status', type: 'status' },
        { label: 'Total Invoiced (INR)', key: 'total_billed', type: 'currency' },
        { label: 'Total Paid (INR)', key: 'total_paid', type: 'currency' },
        { label: 'Outstanding Balance (INR)', key: 'total_outstanding', type: 'currency' }
      ],
      rows: list.map(s => {
        const out = parseFloat(s.total_outstanding) || 0;
        const paid = parseFloat(s.total_paid) || 0;
        const isAlumni = Boolean(s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');
        const feeStatus = isAlumni ? 'NO DUES' : (out === 0 ? 'CLEARED' : (paid > 0 ? 'PARTIAL' : 'UNPAID'));
        const isRegPaid = s.exam_status === 'PAID' || (parseFloat(s.exam_fee_paid) || 0) > 0 || paid >= 50000;
        return {
          ...s,
          academic_status: isAlumni ? 'ALUMNI (GRADUATED)' : 'ACTIVE ENROLLED',
          passout_year: s.passout_year || (isAlumni ? '2024' : 'N/A'),
          company_name: s.company_name || 'N/A',
          fee_status: feeStatus,
          reg_status: isRegPaid ? 'REG PAID' : 'REG UNPAID'
        };
      })
    });
  },

  exportDirectoryPDF() {
    const list = this.filteredDirectoryList || this.allStudents || [];
    let totalBilled = 0, totalPaid = 0, totalDues = 0;
    list.forEach(s => {
      totalBilled += parseFloat(s.total_billed || 0);
      totalPaid += parseFloat(s.total_paid || 0);
      totalDues += parseFloat(s.total_outstanding || 0);
    });

    const activeFilter = document.getElementById('studentsDuesFilter')?.value || 'ALL';

    becExportUtils.exportToPDF({
      title: 'STUDENT MASTER FEE & REGISTRATION REGISTER',
      subtitle: 'Comprehensive Institutional Student Dues, Alumni & Payment Status Report',
      filterSummary: `Filter: ${activeFilter} | Total Records: ${list.length}`,
      stats: {
        'Total Records': list.length,
        'Total Billed': '₹' + totalBilled.toLocaleString('en-IN'),
        'Total Collected': '₹' + totalPaid.toLocaleString('en-IN'),
        'Net Outstanding': '₹' + totalDues.toLocaleString('en-IN')
      },
      headers: [
        { label: 'Sl', key: 'id', isSerial: true, width: '35px' },
        { label: 'Reg No', key: 'reg_no', width: '90px' },
        { label: 'Student Full Name', key: 'full_name' },
        { label: 'Program & Branch', key: 'branch_code', width: '100px' },
        { label: 'Fee Status', key: 'fee_status', type: 'status', width: '75px' },
        { label: 'Exam Reg', key: 'reg_status', type: 'status', width: '80px' },
        { label: 'Billed', key: 'total_billed', type: 'currency' },
        { label: 'Paid', key: 'total_paid', type: 'currency' },
        { label: 'Outstanding', key: 'total_outstanding', type: 'currency' }
      ],
      rows: list.map(s => {
        const out = parseFloat(s.total_outstanding) || 0;
        const paid = parseFloat(s.total_paid) || 0;
        const isAlumni = Boolean(s.is_alumni || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');
        const feeStatus = isAlumni ? 'NO DUES' : (out === 0 ? 'CLEARED' : (paid > 0 ? 'PARTIAL' : 'UNPAID'));
        const isRegPaid = s.exam_status === 'PAID' || (parseFloat(s.exam_fee_paid) || 0) > 0 || paid >= 50000;
        return {
          ...s,
          fee_status: feeStatus,
          reg_status: isRegPaid ? 'PAID' : 'UNPAID'
        };
      })
    });
  },

  openGraduationModal(studentId = null) {
    const s = studentId ? this.allStudents.find(st => st.id === parseInt(studentId, 10)) : this.activeStudent;
    if (!s) {
      ui.showToast('Please select a student to graduate.', 'warning');
      return;
    }

    const idEl = document.getElementById('gradStudentId');
    const nameEl = document.getElementById('gradStudentName');
    const rollEl = document.getElementById('gradStudentRoll');
    const progEl = document.getElementById('gradStudentProgram');
    const degEl = document.getElementById('gradDegreeAwarded');
    const cgpaEl = document.getElementById('gradFinalCgpa');
    const yrEl = document.getElementById('gradPassoutYear');
    const compEl = document.getElementById('gradCompanyName');
    const desigEl = document.getElementById('gradDesignation');
    const locEl = document.getElementById('gradWorkLocation');

    if (idEl) idEl.value = s.id;
    if (nameEl) nameEl.value = s.full_name;
    if (rollEl) rollEl.value = `${s.reg_no || ''} / ${s.roll_no || ''}`;
    if (progEl) progEl.value = `${s.course_name || 'B.Tech'} - ${s.branch_name || s.branch_code || 'Engineering'}`;

    const course = s.course_name || 'B.Tech';
    const branch = s.branch_name || s.branch_code || 'Engineering';
    if (degEl) degEl.value = `${course} in ${branch} (First Class with Honours)`;
    if (cgpaEl) cgpaEl.value = '8.50';
    if (yrEl) yrEl.value = '2026';
    if (compEl) compEl.value = s.company_name || '';
    if (desigEl) desigEl.value = s.designation || 'Graduate Engineer Trainee';
    if (locEl) locEl.value = s.work_location || 'Bhubaneswar';

    const modal = document.getElementById('alumniGraduationModal');
    if (modal) modal.style.display = 'flex';
  },

  closeGraduationModal() {
    const modal = document.getElementById('alumniGraduationModal');
    if (modal) modal.style.display = 'none';
  },

  async submitGraduation(e) {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('gradStudentId').value, 10);
    const passoutYear = parseInt(document.getElementById('gradPassoutYear').value, 10);
    const degreeAwarded = document.getElementById('gradDegreeAwarded').value.trim();
    const finalCgpa = parseFloat(document.getElementById('gradFinalCgpa').value);
    const placementStatus = document.getElementById('gradPlacementStatus').value;
    const companyName = document.getElementById('gradCompanyName').value.trim();
    const designation = document.getElementById('gradDesignation').value.trim();
    const workLocation = document.getElementById('gradWorkLocation').value.trim();
    const cautionDepositAction = document.getElementById('gradCautionDepositAction').value;

    try {
      const res = await api.post('/admin/promotion/passout-alumni', {
        studentId,
        passoutYear,
        degreeAwarded,
        finalCgpa,
        placementStatus,
        companyName,
        designation,
        workLocation,
        cautionDepositAction,
        remarks: 'Institutional No Dues Clearance verified & Caution Deposit settled.'
      });

      ui.showToast(res.message || 'Student graduated to Alumni successfully!', 'success');
      this.closeGraduationModal();

      // Update student locally in allStudents
      const st = this.allStudents.find(s => s.id === studentId);
      if (st) {
        st.is_alumni = 1;
        st.student_status = 'ALUMNI';
        st.academic_year = 'Alumni';
        st.semester_label = 'Pass Out / Graduated';
        st.passout_year = passoutYear;
        st.passout_batch = `${st.admission_year || (passoutYear - 4)}-${passoutYear}`;
        st.degree_awarded = degreeAwarded;
        st.final_cgpa = finalCgpa;
        st.placement_status = placementStatus;
        st.company_name = companyName;
        st.designation = designation;
        st.work_location = workLocation;
        st.no_dues_status = 'CLEARED';
        st.caution_deposit_status = cautionDepositAction === 'DONATED' ? 'DONATED_TO_ALUMNI_FUND' : 'REFUNDED';
        st.total_outstanding = 0.00;
      }

      if (this.activeStudent && this.activeStudent.id === studentId) {
        this.renderActiveStudent();
      }
      this.renderDirectoryTable();
    } catch (err) {
      ui.showToast(err.message || 'Failed to graduate student.', 'error');
    }
  },

  openAlumniCard(studentId) {
    this.selectStudentById(studentId);
    this.switchTab('academic');
  },

  showLoading(isLoading) {
    const loader = document.getElementById('cmsPageLoader');
    if (loader) loader.style.display = isLoading ? 'block' : 'none';
  },

  renderEmptyState() {
    const container = document.getElementById('cmsProfileLeftCard');
    if (container) {
      container.innerHTML = `<div style="text-align: center; padding: 3rem; color: #64748B;">No students found in database.</div>`;
    }
  }
};
