/**
 * Director Education Loan Approvals & 3-Letter Dossier Controller
 * Gen-Z University Accounts System
 */

const directorLoans = {
  loans: [],
  selectedLoanId: null,
  activeStatusFilter: 'ALL',
  cachedLettersData: null,
  currentPreviewMode: 'ALL',

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;

    if (!['DIRECTOR', 'ADMIN', 'ACCOUNTS_HEAD'].includes(user.role)) {
      window.location.replace('/index.html');
      return;
    }

    await this.loadLoansQueue();
  },

  async loadLoansQueue() {
    if (typeof ui !== 'undefined' && typeof ui.showLoading === 'function') ui.showLoading('Loading Applications...');
    try {
      const res = await api.get('/admin/loan-requests');
      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      this.loans = (res && res.data) ? res.data : [];
      this.updateStats();
      this.renderTable();
    } catch (err) {
      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      console.error('loadLoansQueue error:', err);
      if (typeof ui !== 'undefined' && typeof ui.showToast === 'function') ui.showToast('Failed to load education loan requests: ' + err.message, 'error');
    }
  },

  updateStats() {
    const total = this.loans.length;
    const pending = this.loans.filter(l => l.status === 'PENDING').length;
    const approved = this.loans.filter(l => l.status === 'APPROVED').length;
    const rejected = this.loans.filter(l => l.status === 'REJECTED').length;

    const elTotal = document.getElementById('statTotalLoans');
    const elPending = document.getElementById('statPendingLoans');
    const elApproved = document.getElementById('statApprovedLoans');
    const elRejected = document.getElementById('statRejectedLoans');
    const elBadge = document.getElementById('loanPendingBadge');

    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pending;
    if (elApproved) elApproved.textContent = approved;
    if (elRejected) elRejected.textContent = rejected;

    if (elBadge) {
      elBadge.textContent = `${pending} Awaiting Sanction`;
      if (pending > 0) {
        elBadge.style.background = '#FEF3C7';
        elBadge.style.color = '#B45309';
        elBadge.style.borderColor = '#FCD34D';
      } else {
        elBadge.style.background = '#DCFCE7';
        elBadge.style.color = '#15803D';
        elBadge.style.borderColor = '#86EFAC';
      }
    }
  },

  setStatusFilter(status) {
    this.activeStatusFilter = status;
    const btns = document.querySelectorAll('.filter-status-btn');
    btns.forEach(b => {
      b.classList.remove('active');
      b.style.background = '#fff';
      b.style.color = '#334155';
      b.style.borderColor = '#CBD5E1';
    });

    const activeBtn = document.getElementById(`btnFilter${status === 'ALL' ? 'All' : (status.charAt(0) + status.slice(1).toLowerCase())}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.background = '#0B63C5';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#0B63C5';
    }

    this.renderTable();
  },

  filterTable() {
    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('loanTableBody');
    if (!tbody) return;

    const query = (document.getElementById('loanSearchInput')?.value || '').toLowerCase().trim();

    let list = this.loans;
    if (this.activeStatusFilter !== 'ALL') {
      list = list.filter(l => l.status === this.activeStatusFilter);
    }

    if (query) {
      list = list.filter(l => 
        (l.student_name && l.student_name.toLowerCase().includes(query)) ||
        (l.reg_no && l.reg_no.toLowerCase().includes(query)) ||
        (l.bank_name && l.bank_name.toLowerCase().includes(query)) ||
        (l.course_name && l.course_name.toLowerCase().includes(query)) ||
        (l.reference_no && l.reference_no.toLowerCase().includes(query))
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: #94A3B8; font-size: 0.9rem;">
            No loan applications found matching the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(l => {
      const dt = new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const amt = parseFloat(l.loan_amount || 0).toLocaleString('en-IN');
      
      let statusBadge = '';
      if (l.status === 'PENDING') {
        statusBadge = `<span style="background:#FEF3C7;color:#B45309;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:800;border:1px solid #FCD34D;">PENDING</span>`;
      } else if (l.status === 'APPROVED') {
        statusBadge = `<span style="background:#DCFCE7;color:#15803D;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:800;border:1px solid #86EFAC;">APPROVED</span>`;
      } else {
        statusBadge = `<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:800;border:1px solid #FCA5A5;">REJECTED</span>`;
      }

      let actions = '';
      if (l.status === 'PENDING') {
        actions = `
          <div style="display:flex;gap:0.4rem;justify-content:center;">
            <button class="btn btn-sm" onclick="directorLoans.openApproveModal(${l.id})" style="background:#15803D;color:#fff;border:none;font-weight:700;font-size:0.78rem;padding:0.35rem 0.75rem;border-radius:4px;cursor:pointer;">
              ✓ Sanction
            </button>
            <button class="btn btn-sm btn-ghost-danger" onclick="directorLoans.openRejectModal(${l.id})" style="font-weight:700;font-size:0.78rem;padding:0.35rem 0.6rem;border-radius:4px;border:1px solid #FECACA;color:#DC2626;cursor:pointer;">
              ✕ Reject
            </button>
          </div>
        `;
      } else if (l.status === 'APPROVED') {
        actions = `
          <div style="display:flex;gap:0.4rem;justify-content:center;">
            <button class="btn btn-sm" onclick="directorLoans.openLettersModal(${l.id})" style="background:#0B63C5;color:#fff;border:none;font-weight:700;font-size:0.78rem;padding:0.35rem 0.85rem;border-radius:4px;display:inline-flex;align-items:center;gap:0.3rem;cursor:pointer;">
              📜 View 3 Letters
            </button>
          </div>
        `;
      } else {
        actions = `<span style="font-size:0.75rem;color:#94A3B8;">Decline Logged</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid #F1F5F9; font-size: 0.85rem;">
          <td style="padding: 10px 14px;">
            <div style="font-weight:800;color:#0B63C5;font-family:monospace;font-size:0.82rem;">${l.reference_no || 'GZU/DIR/LOAN/' + l.id}</div>
            <div style="font-size:0.75rem;color:#64748B;">${dt}</div>
          </td>
          <td style="padding: 10px 14px;">
            <div style="font-weight:800;color:#0F172A;">${l.student_name}</div>
            <div style="font-size:0.78rem;color:#475569;">Reg: <strong>${l.reg_no}</strong></div>
          </td>
          <td style="padding: 10px 14px;">
            <div style="font-weight:600;color:#334155;">${l.course_name || 'B.Tech'}</div>
            <div style="font-size:0.75rem;color:#64748B;">${l.branch_name || 'CSE'} &bull; ${l.current_semester || 'Sem'}</div>
          </td>
          <td style="padding: 10px 14px;">
            <div style="font-weight:800;color:#1E3A8A;">${l.bank_name}</div>
            <div style="font-size:0.75rem;color:#64748B;">${l.bank_branch || 'Branch'}</div>
          </td>
          <td style="padding: 10px 14px; text-align: right;">
            <div style="font-weight:900;color:#0B63C5;font-size:0.95rem;">₹${amt}</div>
            <div style="font-size:0.72rem;color:#64748B;">${l.loan_purpose || 'Tuition'}</div>
          </td>
          <td style="padding: 10px 14px;">
            <div style="font-weight:600;color:#334155;">${l.co_applicant_name || 'Parent'}</div>
            <div style="font-size:0.75rem;color:#64748B;">${l.co_applicant_relation || 'Father'} &bull; ${l.co_applicant_phone || ''}</div>
          </td>
          <td style="padding: 10px 14px; text-align: center;">
            ${statusBadge}
          </td>
          <td style="padding: 10px 14px; text-align: center;">
            ${actions}
          </td>
        </tr>
      `;
    }).join('');
  },

  openApproveModal(id) {
    this.selectedLoanId = id;
    const loan = this.loans.find(l => l.id === id);
    if (!loan) return;

    const detailsEl = document.getElementById('approveModalDetails');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
          <span style="color:#64748B;">Student:</span>
          <strong>${loan.student_name} (${loan.reg_no})</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
          <span style="color:#64748B;">Academic Branch:</span>
          <span>${loan.course_name} - ${loan.branch_name} (${loan.current_semester})</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
          <span style="color:#64748B;">Target Bank:</span>
          <strong style="color:#1E3A8A;">${loan.bank_name} (${loan.bank_branch || 'Main'})</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#64748B;">Requested Loan:</span>
          <strong style="color:#0B63C5;font-size:1rem;">₹${parseFloat(loan.loan_amount).toLocaleString('en-IN')}</strong>
        </div>
      `;
    }

    const remarksInp = document.getElementById('directorApproveRemarks');
    if (remarksInp) {
      remarksInp.value = 'Recommended and approved for Bank Education Loan Scheme. Official 3-letter university dossier sanctioned.';
    }

    ui.openModal('directorApproveModal');
  },

  async confirmApprove() {
    if (!this.selectedLoanId) return;
    const btn = document.getElementById('btnConfirmApprove');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Sanctioning & Signing...';
    }

    const remarks = (document.getElementById('directorApproveRemarks')?.value || '').trim();

    try {
      const res = await api.patch(`/admin/loan-requests/${this.selectedLoanId}/status`, {
        status: 'APPROVED',
        director_remarks: remarks || 'Approved by Directorate for Bank Education Loan processing.'
      });

      ui.closeModal('directorApproveModal');
      ui.showToast('🎉 Education Loan successfully sanctioned! 3 Official Bank Letters generated.', 'success');
      await this.loadLoansQueue();
    } catch (err) {
      console.error('confirmApprove error:', err);
      ui.showToast('Failed to approve loan: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '✓ Sanction & Sign Letters';
      }
    }
  },

  openRejectModal(id) {
    this.selectedLoanId = id;
    ui.openModal('directorRejectLoanModal');
  },

  async confirmReject() {
    if (!this.selectedLoanId) return;
    const reason = (document.getElementById('directorRejectLoanReason')?.value || '').trim();

    try {
      await api.patch(`/admin/loan-requests/${this.selectedLoanId}/status`, {
        status: 'REJECTED',
        director_remarks: reason || 'Declined by Directorate.'
      });

      ui.closeModal('directorRejectLoanModal');
      ui.showToast('Loan request marked as rejected.', 'warning');
      await this.loadLoansQueue();
    } catch (err) {
      console.error('confirmReject error:', err);
      ui.showToast('Failed to reject loan: ' + err.message, 'error');
    }
  },

  async openLettersModal(id) {
    if (typeof ui !== 'undefined' && typeof ui.showLoading === 'function') ui.showLoading('Preparing Letters...');
    try {
      // Fetch loan info and student
      const loan = this.loans.find(l => l.id === id);
      if (!loan) throw new Error('Loan record not found');

      const courseDuration = loan.course_name && loan.course_name.toLowerCase().includes('diploma') ? 3 : 4;
      const annualTuition = 55000;
      const annualDev = 12000;
      const annualExam = 6000;
      const annualHostel = 35000;
      const annualTotal = annualTuition + annualDev + annualExam + annualHostel;

      const yearlyBreakdown = [];
      for (let yr = 1; yr <= courseDuration; yr++) {
        yearlyBreakdown.push({
          year_label: `Year ${yr} (Sem ${yr * 2 - 1} & ${yr * 2})`,
          tuition: annualTuition,
          development_lab: annualDev,
          exam_reg: annualExam,
          hostel_mess: annualHostel,
          total: annualTotal
        });
      }

      this.cachedLettersData = {
        reference_no: loan.reference_no,
        approved_at: loan.approved_at || new Date().toISOString(),
        university: {
          name: 'GEN-Z UNIVERSITY',
          sub_title: 'Approved by UGC & AICTE, New Delhi | Autonomous Higher Education Institution',
          campus: 'Gen-Z Knowledge City, InfoValley-II, Bhubaneswar, Odisha - 752054',
          email: 'director@genz.edu.in | accounts@genz.edu.in',
          phone: '+91-674-2970000',
          website: 'https://genz.edu.in',
          bank_details: {
            beneficiary_name: 'GEN-Z UNIVERSITY ACCOUNTS',
            bank_name: 'State Bank of India (SBI)',
            branch: 'Capital Commercial Branch, Bhubaneswar',
            account_number: '398200140029',
            account_type: 'Current Account',
            ifsc_code: 'SBIN0001234',
            micr_code: '751002018'
          }
        },
        student: {
          name: loan.student_name,
          reg_no: loan.reg_no,
          roll_no: loan.reg_no,
          father_name: loan.father_name || loan.co_applicant_name || 'Father',
          course: loan.course_name || 'Bachelor of Technology',
          branch: loan.branch_name || 'Computer Science & Engineering',
          current_semester: loan.current_semester || '1st Semester',
          session: loan.academic_year || '2026-27',
          duration_years: courseDuration,
          address: 'Bhubaneswar, Odisha'
        },
        loan: {
          bank_name: loan.bank_name,
          bank_branch: loan.bank_branch,
          loan_amount: parseFloat(loan.loan_amount),
          loan_purpose: loan.loan_purpose,
          co_applicant_name: loan.co_applicant_name,
          co_applicant_relation: loan.co_applicant_relation
        },
        fee_structure: {
          yearlyBreakdown,
          grandTotal: annualTotal * courseDuration,
          totalPaid: 45000,
          requestedLoanAmount: parseFloat(loan.loan_amount)
        }
      };

      this.currentPreviewMode = 'ALL';
      this.updateDirLetterTabButtons('ALL');

      const container = document.getElementById('printableDirectorLettersContainer');
      if (container) {
        container.innerHTML = this.renderLettersHtml(this.cachedLettersData, 'ALL');
      }

      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      if (typeof ui !== 'undefined' && typeof ui.openModal === 'function') {
        ui.openModal('directorLettersModal');
      }
    } catch (err) {
      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      console.error('openLettersModal error:', err);
      if (typeof ui !== 'undefined' && typeof ui.showToast === 'function') {
        ui.showToast('Could not load letters: ' + err.message, 'error');
      }
    }
  },

  switchLetterPreview(mode) {
    this.currentPreviewMode = mode;
    this.updateDirLetterTabButtons(mode);
    const container = document.getElementById('printableDirectorLettersContainer');
    if (container && this.cachedLettersData) {
      container.innerHTML = this.renderLettersHtml(this.cachedLettersData, mode);
    }
  },

  updateDirLetterTabButtons(mode) {
    const btnAll = document.getElementById('dirTabBtnAll');
    const btn1 = document.getElementById('dirTabBtn1');
    const btn2 = document.getElementById('dirTabBtn2');
    const btn3 = document.getElementById('dirTabBtn3');

    const reset = (btn) => {
      if (!btn) return;
      btn.style.background = '#fff';
      btn.style.color = '#334155';
      btn.style.borderColor = '#CBD5E1';
    };
    const setActive = (btn) => {
      if (!btn) return;
      btn.style.background = '#0B63C5';
      btn.style.color = '#fff';
      btn.style.borderColor = '#0B63C5';
    };

    reset(btnAll);
    reset(btn1);
    reset(btn2);
    reset(btn3);

    if (mode === 'ALL') setActive(btnAll);
    else if (mode === 1) setActive(btn1);
    else if (mode === 2) setActive(btn2);
    else if (mode === 3) setActive(btn3);
  },

  downloadCurrentLetterPdf() {
    this.downloadLoanLetterPdf(this.currentPreviewMode || 'ALL');
  },

  async downloadLoanLetterPdf(mode = 'ALL') {
    if (typeof ui !== 'undefined' && typeof ui.showLoading === 'function') {
      ui.showLoading('Generating Official PDF...');
    }

    try {
      if (!this.cachedLettersData) {
        throw new Error('Letters data not loaded');
      }

      const data = this.cachedLettersData;
      const regNo = (data.student && data.student.reg_no) ? data.student.reg_no.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Student';

      const sandbox = document.createElement('div');
      sandbox.style.position = 'fixed';
      sandbox.style.left = '-9999px';
      sandbox.style.top = '0';
      sandbox.style.width = '794px';
      sandbox.style.background = '#FFFFFF';
      sandbox.style.zIndex = '-9999';
      sandbox.innerHTML = this.renderLettersHtml(data, mode);
      document.body.appendChild(sandbox);

      await new Promise(r => setTimeout(r, 200));

      const cards = sandbox.querySelectorAll('.printable-letter-card');
      if (!cards || cards.length === 0) {
        throw new Error('No letter cards found to render');
      }

      const hasHtml2Canvas = typeof html2canvas !== 'undefined';
      const jsPdfClass = (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) || (typeof window.jsPDF !== 'undefined' && window.jsPDF);

      if (!hasHtml2Canvas || !jsPdfClass) {
        if (document.body.contains(sandbox)) document.body.removeChild(sandbox);
        if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
        window.print();
        return;
      }

      const pdf = new jsPdfClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        card.style.margin = '0';
        card.style.boxShadow = 'none';
        card.style.borderRadius = '0';

        const canvas = await html2canvas(card, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          width: 794,
          windowWidth: 794
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        const marginX = 8;
        const targetWidth = pageWidth - (marginX * 2);
        let targetHeight = (canvas.height * targetWidth) / canvas.width;
        let marginY = 8;

        const maxAvailableHeight = pageHeight - 16;
        if (targetHeight > maxAvailableHeight) {
          const scaleFactor = maxAvailableHeight / targetHeight;
          targetHeight = maxAvailableHeight;
          const adjustedWidth = targetWidth * scaleFactor;
          const adjustedMarginX = (pageWidth - adjustedWidth) / 2;
          pdf.addImage(imgData, 'JPEG', adjustedMarginX, marginY, adjustedWidth, targetHeight, undefined, 'FAST');
        } else {
          pdf.addImage(imgData, 'JPEG', marginX, marginY, targetWidth, targetHeight, undefined, 'FAST');
        }
      }

      if (document.body.contains(sandbox)) {
        document.body.removeChild(sandbox);
      }

      let fileName = `GENZ_Director_Sanction_Loan_Dossier_${regNo}.pdf`;
      if (mode === 1) fileName = `GENZ_Bonafide_Certificate_${regNo}.pdf`;
      else if (mode === 2) fileName = `GENZ_Fee_Estimate_${regNo}.pdf`;
      else if (mode === 3) fileName = `GENZ_University_NOC_${regNo}.pdf`;

      pdf.save(fileName);

      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      if (typeof ui !== 'undefined' && typeof ui.showToast === 'function') {
        ui.showToast(`✅ Downloaded: ${fileName}`, 'success');
      }
    } catch (err) {
      if (typeof ui !== 'undefined' && typeof ui.hideLoading === 'function') ui.hideLoading();
      console.error('downloadLoanLetterPdf error:', err);
      if (typeof ui !== 'undefined' && typeof ui.showToast === 'function') {
        ui.showToast('PDF download failed: ' + err.message, 'error');
      }
    }
  },

  renderLettersHtml(data, mode = 'ALL') {
    if (!data) return '';
    const u = data.university || {};
    const s = data.student || {};
    const l = data.loan || {};
    const f = data.fee_structure || {};
    const refNo = data.reference_no || 'GZU/DIR/LOAN/2026/0001';
    const approvedDate = new Date(data.approved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const renderLetterhead = () => `
      <div style="border-bottom:2.5px solid #0B63C5;padding-bottom:12px;margin-bottom:16px;display:flex;align-items:center;gap:16px;">
        <img src="/assets/genz-logo.jpg" alt="University Crest" style="width:78px;height:78px;object-fit:contain;border-radius:8px;">
        <div style="flex:1;text-align:center;">
          <div style="font-family:'Times New Roman',Georgia,serif;font-size:22px;font-weight:900;color:#0F172A;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:2px;">
            ${u.name}
          </div>
          <div style="font-size:10.5px;color:#475569;font-weight:600;margin-bottom:3px;">
            ${u.sub_title}
          </div>
          <div style="font-size:10px;color:#64748B;line-height:1.3;">
            ${u.campus}<br>
            Tel: ${u.phone} &bull; Web: ${u.website} &bull; Email: ${u.email}
          </div>
          <div style="display:inline-block;margin-top:4px;background:#0F172A;color:#fff;font-size:9px;font-weight:800;padding:2px 10px;border-radius:3px;text-transform:uppercase;letter-spacing:0.06em;">
            OFFICE OF THE DIRECTORATE
          </div>
        </div>
        <div style="width:78px;text-align:right;">
          <div style="border:1.5px solid #CBD5E1;border-radius:4px;padding:4px;font-size:8px;color:#475569;text-align:center;line-height:1.2;">
            <div style="font-weight:800;color:#0B63C5;">OFFICIAL</div>
            <div>VERIFIED</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;color:#334155;margin-bottom:18px;border-bottom:1px dashed #CBD5E1;padding-bottom:6px;">
        <div>Ref. No.: <span style="color:#0B63C5;font-family:monospace;font-size:11.5px;">${refNo}</span></div>
        <div>Date of Issue: <span>${approvedDate}</span></div>
      </div>
    `;

    const renderSignatures = () => `
      <div style="margin-top:30px;display:flex;justify-content:space-between;align-items:flex-end;padding-top:15px;border-top:1px solid #E2E8F0;">
        <div style="text-align:center;">
          <div style="width:100px;height:100px;border:2.5px solid #1D4ED8;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1D4ED8;font-size:8px;font-weight:900;text-transform:uppercase;line-height:1.2;margin:0 auto;box-shadow:inset 0 0 0 2px #DBEAFE;">
            <div style="font-size:7.5px;">* DIRECTORATE *</div>
            <div style="font-weight:900;font-size:8.5px;color:#0F172A;margin:2px 0;">GEN-Z</div>
            <div style="font-size:7.5px;">UNIVERSITY</div>
            <div style="font-size:6.5px;color:#1E40AF;">BHUBANESWAR</div>
          </div>
          <div style="font-size:9px;font-weight:700;color:#64748B;margin-top:4px;">Official Institutional Seal</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Brush Script MT',cursive,'Caveat',cursive;font-size:24px;font-weight:700;color:#0B63C5;margin-bottom:2px;">
            Dr. S. K. Mahapatra
          </div>
          <div style="font-size:12px;font-weight:800;color:#0F172A;">Prof. (Dr.) S. K. Mahapatra, Ph.D. (IIT)</div>
          <div style="font-size:10.5px;font-weight:700;color:#1D4ED8;">Director</div>
          <div style="font-size:10px;color:#475569;">Gen-Z University, Bhubaneswar</div>
        </div>
      </div>
    `;

    const letter1Html = `
      <div class="printable-letter-card print-page-break" style="background:#ffffff;color:#000000;font-family:'Times New Roman',Georgia,serif;padding:36px 42px;margin:0 auto 28px;max-width:780px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,0.18);box-sizing:border-box;">
        ${renderLetterhead()}
        <div style="text-align:center;margin:15px 0 22px;">
          <div style="display:inline-block;font-size:15px;font-weight:900;text-transform:uppercase;color:#0F172A;border-bottom:2px solid #000;padding-bottom:3px;letter-spacing:0.04em;">
            BONAFIDE STUDENT CERTIFICATE FOR EDUCATION LOAN
          </div>
          <div style="font-size:11px;font-style:italic;color:#475569;margin-top:3px;">
            (Issued to facilitate processing of Bank Education Loan Scheme)
          </div>
        </div>
        <div style="font-size:12.5px;line-height:1.75;text-align:justify;color:#0F172A;">
          <p style="margin-bottom:14px;text-indent:2em;">
            This is to certify that <strong>Mr. / Ms. ${s.name}</strong>, Son/Daughter of <strong>Mr. ${s.father_name}</strong>, residing at ${s.address}, is a bonafide student of <strong>GEN-Z UNIVERSITY</strong>.
          </p>
          <p style="margin-bottom:14px;text-indent:2em;">
            He/She is officially admitted and currently enrolled in the regular, full-time <strong>${s.course}</strong> degree programme in the branch of <strong>${s.branch}</strong> under University Registration Number <strong>${s.reg_no}</strong> for the Academic Session <strong>${s.session}</strong>.
          </p>
          <p style="margin-bottom:14px;text-indent:2em;">
            He/She is currently pursuing studies in <strong>${s.current_semester}</strong> of the total prescribed course duration of <strong>${s.duration_years} Years</strong>. The student has maintained satisfactory academic records and excellent moral character throughout his/her tenure at this University.
          </p>
          <p style="margin-bottom:14px;text-indent:2em;">
            This institutional certificate is being issued upon the specific requisition of the student and parent to enable them to avail an <strong>Education Loan</strong> from <strong>${l.bank_name}</strong>, ${l.bank_branch || ''} for academic purposes.
          </p>
          <p style="margin-bottom:14px;text-indent:2em;">
            The Directorate of Gen-Z University has <strong>NO OBJECTION</strong> whatsoever to the student availing education loan assistance from the bank.
          </p>
        </div>
        ${renderSignatures()}
      </div>
    `;

    const breakdownRows = (f.yearlyBreakdown || []).map(row => `
      <tr style="text-align:center;font-size:11px;">
        <td style="border:1px solid #334155;padding:6px;font-weight:700;text-align:left;">${row.year_label}</td>
        <td style="border:1px solid #334155;padding:6px;">₹${row.tuition.toLocaleString('en-IN')}</td>
        <td style="border:1px solid #334155;padding:6px;">₹${row.development_lab.toLocaleString('en-IN')}</td>
        <td style="border:1px solid #334155;padding:6px;">₹${row.exam_reg.toLocaleString('en-IN')}</td>
        <td style="border:1px solid #334155;padding:6px;">₹${row.hostel_mess.toLocaleString('en-IN')}</td>
        <td style="border:1px solid #334155;padding:6px;font-weight:800;background:#F8FAFC;">₹${row.total.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const letter2Html = `
      <div class="printable-letter-card print-page-break" style="background:#ffffff;color:#000000;font-family:'Times New Roman',Georgia,serif;padding:36px 42px;margin:0 auto 28px;max-width:780px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,0.18);box-sizing:border-box;">
        ${renderLetterhead()}
        <div style="text-align:center;margin:15px 0 20px;">
          <div style="display:inline-block;font-size:15px;font-weight:900;text-transform:uppercase;color:#0F172A;border-bottom:2px solid #000;padding-bottom:3px;letter-spacing:0.04em;">
            INSTITUTIONAL FEE STRUCTURE &amp; EXPENDITURE ESTIMATE
          </div>
          <div style="font-size:11px;font-style:italic;color:#475569;margin-top:3px;">
            (Official Academic Cost Estimate for Education Loan Sanction by ${l.bank_name})
          </div>
        </div>
        <div style="font-size:12px;line-height:1.65;margin-bottom:14px;">
          Certified that <strong>Mr. / Ms. ${s.name}</strong> (Reg. No: <strong>${s.reg_no}</strong>), admitted to <strong>${s.course} - ${s.branch}</strong>, is required to pay the following standard institutional academic fees during the entire duration of the course (${s.duration_years} Years) as per the approved fee schedule of Gen-Z University:
        </div>
        <table style="width:100%;border-collapse:collapse;border:1.5px solid #000;margin-bottom:16px;">
          <thead>
            <tr style="background:#F1F5F9;font-size:10.5px;font-weight:800;text-transform:uppercase;">
              <th style="border:1px solid #334155;padding:7px;text-align:left;">Academic Term</th>
              <th style="border:1px solid #334155;padding:7px;">Tuition Fee</th>
              <th style="border:1px solid #334155;padding:7px;">Dev &amp; Lab</th>
              <th style="border:1px solid #334155;padding:7px;">Exam &amp; Reg</th>
              <th style="border:1px solid #334155;padding:7px;">Hostel/Mess</th>
              <th style="border:1px solid #334155;padding:7px;background:#E2E8F0;">Annual Total</th>
            </tr>
          </thead>
          <tbody>
            ${breakdownRows}
            <tr style="font-size:11.5px;font-weight:900;background:#E2E8F0;border-top:2px solid #000;">
              <td colspan="5" style="border:1px solid #000;padding:8px 10px;text-align:right;">TOTAL INSTITUTIONAL EXPENDITURE ESTIMATE:</td>
              <td style="border:1px solid #000;padding:8px;text-align:center;color:#0B63C5;font-size:12px;">₹${(f.grandTotal || 0).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:6px;padding:10px 14px;font-size:11.5px;margin-bottom:14px;line-height:1.6;">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:3px;margin-bottom:3px;">
            <span>1. Total Estimated Academic Expenditure (Full Course):</span>
            <strong>₹${(f.grandTotal || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:3px;margin-bottom:3px;">
            <span>2. Fee Already Deposited by Student:</span>
            <strong>₹${(f.totalPaid || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;color:#0B63C5;font-weight:800;font-size:12px;">
            <span>3. Net Balance Required to be Financed via Education Loan:</span>
            <span>₹${(f.requestedLoanAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
        ${renderSignatures()}
      </div>
    `;

    const b = u.bank_details || {};
    const letter3Html = `
      <div class="printable-letter-card" style="background:#ffffff;color:#000000;font-family:'Times New Roman',Georgia,serif;padding:36px 42px;margin:0 auto;max-width:780px;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,0.18);box-sizing:border-box;">
        ${renderLetterhead()}
        <div style="text-align:center;margin:15px 0 20px;">
          <div style="display:inline-block;font-size:14.5px;font-weight:900;text-transform:uppercase;color:#0F172A;border-bottom:2px solid #000;padding-bottom:3px;letter-spacing:0.04em;">
            NO OBJECTION CERTIFICATE &amp; DIRECT DISBURSEMENT UNDERTAKING
          </div>
        </div>
        <div style="font-size:12px;line-height:1.5;margin-bottom:14px;color:#0F172A;">
          To,<br>
          <strong>The Branch Manager</strong>,<br>
          ${l.bank_name || 'Bank'},<br>
          ${l.bank_branch || 'Branch'}.
        </div>
        <div style="font-size:12px;font-weight:800;margin-bottom:14px;background:#F1F5F9;padding:6px 10px;border-left:3px solid #0B63C5;">
          Sub: University Undertaking &amp; Bank Account Particulars for Education Loan in respect of ${s.name} (Reg. No: ${s.reg_no})
        </div>
        <div style="font-size:12px;line-height:1.7;text-align:justify;color:#0F172A;">
          <p style="margin-bottom:10px;">Dear Sir / Madam,</p>
          <p style="margin-bottom:10px;text-indent:1.5em;">
            With reference to the Education Loan application submitted by our student <strong>Mr. / Ms. ${s.name}</strong> along with co-applicant <strong>${l.co_applicant_name || s.father_name} (${l.co_applicant_relation || 'Parent'})</strong>, the University hereby submits the following formal confirmations and undertaking:
          </p>
          <ol style="margin-left:18px;margin-bottom:14px;padding-left:6px;">
            <li style="margin-bottom:6px;"><strong>Institutional Recognition:</strong> Gen-Z University is an established university recognized under statutory authority and approved by UGC / AICTE, New Delhi.</li>
            <li style="margin-bottom:6px;"><strong>No Objection:</strong> The University Directorate has <strong>NO OBJECTION</strong> to your bank sanctioning an Education Loan facility of <strong>₹${(l.loan_amount || 0).toLocaleString('en-IN')}</strong> to the aforementioned student.</li>
            <li style="margin-bottom:6px;"><strong>Direct Fund Credit:</strong> You are requested to release and disburse the sanctioned education loan installments directly in favor of the University official institutional bank account as specified below:</li>
          </ol>
        </div>
        <div style="background:#F0FDF4;border:1.5px solid #16A34A;border-radius:6px;padding:12px 18px;margin:14px 0;font-size:12px;line-height:1.65;">
          <div style="font-weight:900;color:#166534;margin-bottom:6px;text-transform:uppercase;font-size:11.5px;letter-spacing:0.04em;">
            Official University Bank Account Particulars for Electronic Transfer:
          </div>
          <table style="width:100%;font-size:11.5px;color:#0F172A;">
            <tr><td style="width:190px;font-weight:700;">Beneficiary Name:</td><td style="font-weight:800;color:#0B63C5;">${b.beneficiary_name}</td></tr>
            <tr><td style="font-weight:700;">Bank Name:</td><td><strong>${b.bank_name}</strong></td></tr>
            <tr><td style="font-weight:700;">Branch Name:</td><td>${b.branch}</td></tr>
            <tr><td style="font-weight:700;">Account Number:</td><td style="font-family:monospace;font-size:13px;font-weight:900;color:#000;">${b.account_number}</td></tr>
            <tr><td style="font-weight:700;">Account Type:</td><td>${b.account_type}</td></tr>
            <tr><td style="font-weight:700;">IFSC Code:</td><td style="font-family:monospace;font-size:12.5px;font-weight:800;color:#166534;">${b.ifsc_code}</td></tr>
            <tr><td style="font-weight:700;">MICR Code:</td><td>${b.micr_code}</td></tr>
          </table>
        </div>
        ${renderSignatures()}
      </div>
    `;

    if (mode === 1) return letter1Html;
    if (mode === 2) return letter2Html;
    if (mode === 3) return letter3Html;

    return `
      ${letter1Html}
      ${letter2Html}
      ${letter3Html}
    `;
  }
};
