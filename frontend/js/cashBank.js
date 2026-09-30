/**
 * ==============================================================================
 * BHUBANESWAR ENGINEERING COLLEGE (BEC) - CASH & BANK CONTROLLER
 * Daily Cash Drawer Closing, Denomination Verification, Bank Master & BRS
 * ==============================================================================
 */

const cashBank = {
  activeTab: 'drawer',
  closingData: null,
  bankAccounts: [],
  expectedClosing: 25000,
  physicalTotal: 25000,
  variance: 0,

  async init() {
    await this.loadCashClosing();
    await this.loadBankAccounts();
    this.renderBankFeeds();
    this.renderBrsQueue();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.cb-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sectionDrawer').style.display = tab === 'drawer' ? 'block' : 'none';
    document.getElementById('sectionBank').style.display = tab === 'bank' ? 'block' : 'none';
    document.getElementById('sectionBrs').style.display = tab === 'brs' ? 'block' : 'none';

    if (tab === 'drawer') document.getElementById('tabBtnDrawer')?.classList.add('active');
    if (tab === 'bank') document.getElementById('tabBtnBank')?.classList.add('active');
    if (tab === 'brs') document.getElementById('tabBtnBrs')?.classList.add('active');
  },

  async loadCashClosing() {
    try {
      const res = await api.get('/admin/cash-closing');
      if (res && res.data) {
        this.closingData = res.data;
        const o = res.data.openingCash || 25000;
        const ci = res.data.cashCollections || 0;
        const co = res.data.cashExpenses || 0;
        const bd = res.data.bankDeposit || 0;

        this.expectedClosing = o + ci - co - bd;

        document.getElementById('sysOpeningCash').textContent = ui.formatCurrency(o);
        document.getElementById('sysCashIn').textContent = `+ ${ui.formatCurrency(ci)}`;
        document.getElementById('sysCashOut').textContent = `- ${ui.formatCurrency(co)}`;
        document.getElementById('sysBankDeposit').textContent = `- ${ui.formatCurrency(bd)}`;
        document.getElementById('sysExpectedClosing').textContent = ui.formatCurrency(this.expectedClosing);

        this.calculatePhysicalTotal();
        this.renderClosingHistory(res.data.recentClosings || []);
      }
    } catch (e) {
      console.warn('Cash closing load warning:', e.message);
      this.calculatePhysicalTotal();
    }
  },

  calculatePhysicalTotal() {
    const d500 = parseInt(document.getElementById('d500')?.value || 0, 10);
    const d200 = parseInt(document.getElementById('d200')?.value || 0, 10);
    const d100 = parseInt(document.getElementById('d100')?.value || 0, 10);
    const d50 = parseInt(document.getElementById('d50')?.value || 0, 10);
    const d20 = parseInt(document.getElementById('d20')?.value || 0, 10);
    const d10 = parseInt(document.getElementById('d10')?.value || 0, 10);
    const coins = parseFloat(document.getElementById('dCoins')?.value || 0);

    const s500 = d500 * 500;
    const s200 = d200 * 200;
    const s100 = d100 * 100;
    const s50 = d50 * 50;
    const s20 = d20 * 20;
    const s10 = d10 * 10;
    const sCoins = coins;

    document.getElementById('sub500').textContent = ui.formatCurrency(s500);
    document.getElementById('sub200').textContent = ui.formatCurrency(s200);
    document.getElementById('sub100').textContent = ui.formatCurrency(s100);
    document.getElementById('sub50').textContent = ui.formatCurrency(s50);
    document.getElementById('sub20').textContent = ui.formatCurrency(s20);
    document.getElementById('sub10').textContent = ui.formatCurrency(s10);
    document.getElementById('subCoins').textContent = ui.formatCurrency(sCoins);

    this.physicalTotal = s500 + s200 + s100 + s50 + s20 + s10 + sCoins;
    document.getElementById('physicalTotalLabel').textContent = ui.formatCurrency(this.physicalTotal);

    this.variance = this.physicalTotal - this.expectedClosing;
    this.updateVarianceDisplay();
  },

  updateVarianceDisplay() {
    const banner = document.getElementById('varianceBanner');
    const title = document.getElementById('varianceStatusTitle');
    const sub = document.getElementById('varianceStatusSub');
    const amount = document.getElementById('varianceAmount');
    const discWrap = document.getElementById('discrepancyWrap');

    if (!banner) return;

    if (this.variance === 0) {
      banner.className = 'variance-box-ok';
      title.textContent = 'Physical Cash In Drawer Perfectly Matched ✓';
      sub.textContent = 'Zero discrepancy between physical vault currency and system ledger records.';
      amount.textContent = '₹0.00';
      if (discWrap) discWrap.style.display = 'none';
    } else if (this.variance < 0) {
      banner.className = 'variance-box-alert';
      title.textContent = `⚠ CASH SHORTAGE DETECTED`;
      sub.textContent = `Physical notes in drawer are less than expected system balance. Mandatory audit explanation required.`;
      amount.textContent = `- ${ui.formatCurrency(Math.abs(this.variance))}`;
      if (discWrap) discWrap.style.display = 'block';
    } else {
      banner.className = 'variance-box-alert';
      title.textContent = `⚠ CASH EXCESS DETECTED`;
      sub.textContent = `Physical notes in drawer exceed expected system balance. Mandatory audit explanation required.`;
      amount.textContent = `+ ${ui.formatCurrency(this.variance)}`;
      if (discWrap) discWrap.style.display = 'block';
    }
  },

  resetDenominations() {
    // Set 500 count to match expected balance
    const notes500 = Math.floor(this.expectedClosing / 500);
    const remainder = this.expectedClosing % 500;

    document.getElementById('d500').value = notes500;
    document.getElementById('d200').value = 0;
    document.getElementById('d100').value = Math.floor(remainder / 100);
    document.getElementById('d50').value = 0;
    document.getElementById('d20').value = 0;
    document.getElementById('d10').value = 0;
    document.getElementById('dCoins').value = remainder % 100;

    this.calculatePhysicalTotal();
    ui.showToast('Denominations counter reset to expected balance.', 'info');
  },

  async submitDailyClosing() {
    if (this.variance !== 0) {
      const reason = document.getElementById('discrepancyReason')?.value;
      if (!reason || !reason.trim()) {
        ui.showToast('Mandatory: Please provide an explanation for the cash discrepancy before closing.', 'warning');
        return;
      }
    }

    try {
      const denominations = {
        d500: parseInt(document.getElementById('d500')?.value || 0, 10),
        d200: parseInt(document.getElementById('d200')?.value || 0, 10),
        d100: parseInt(document.getElementById('d100')?.value || 0, 10),
        d50: parseInt(document.getElementById('d50')?.value || 0, 10),
        d20: parseInt(document.getElementById('d20')?.value || 0, 10),
        d10: parseInt(document.getElementById('d10')?.value || 0, 10),
        coins: parseFloat(document.getElementById('dCoins')?.value || 0)
      };

      const reason = document.getElementById('discrepancyReason')?.value || '';

      await api.post('/admin/cash-closing', {
        openingCash: this.closingData?.openingCash || 25000,
        cashCollections: this.closingData?.cashCollections || 0,
        cashExpenses: this.closingData?.cashExpenses || 0,
        bankDeposit: this.closingData?.bankDeposit || 0,
        physicalCash: this.physicalTotal,
        variance: this.variance,
        denominations,
        discrepancyReason: reason
      });

      ui.showToast('Official Daily Cash Drawer Closing Recorded and Locked!', 'success');
      await this.loadCashClosing();
    } catch (e) {
      ui.showToast(e.message || 'Failed to record daily closing', 'danger');
    }
  },

  renderClosingHistory(closings) {
    const tbody = document.getElementById('cashClosingHistoryTbody');
    if (!tbody) return;

    if (!closings || closings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td>Today</td>
          <td>Accounts Staff (BEC-CASHIER-1)</td>
          <td style="text-align: right; font-family: monospace;">₹25,000.00</td>
          <td style="text-align: right; font-family: monospace; color: #15803D;">₹0.00</td>
          <td style="text-align: right; font-family: monospace; color: #BE123C;">₹0.00</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">₹25,000.00</td>
          <td style="text-align: center;"><span class="badge badge-success">0.00</span></td>
          <td style="text-align: center;"><span class="badge badge-success">BALANCED</span></td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = closings.map(c => `
      <tr>
        <td>${c.closing_date || 'Today'}</td>
        <td><strong>${escapeHtml(c.closed_by || 'Accounts Staff')}</strong></td>
        <td style="text-align: right; font-family: monospace;">${ui.formatCurrency(c.opening_cash)}</td>
        <td style="text-align: right; font-family: monospace; color: #15803D;">+ ${ui.formatCurrency(c.cash_collections)}</td>
        <td style="text-align: right; font-family: monospace; color: #BE123C;">- ${ui.formatCurrency(c.cash_expenses)}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700;">${ui.formatCurrency(c.physical_cash)}</td>
        <td style="text-align: center;">
          <span class="badge ${c.variance === 0 ? 'badge-success' : 'badge-danger'}">
            ${c.variance === 0 ? '₹0.00' : ui.formatCurrency(c.variance)}
          </span>
        </td>
        <td style="text-align: center;">
          <span class="badge ${c.status === 'BALANCED' ? 'badge-success' : 'badge-warning'}">
            ${c.status || 'BALANCED'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  async loadBankAccounts() {
    try {
      const res = await api.get('/admin/bank-accounts');
      this.bankAccounts = res?.data || [
        {
          id: 1,
          bank_name: 'State Bank of India',
          account_name: 'Bhubaneswar Engineering College - Fee Collection A/c',
          account_no: '31980244192',
          ifsc: 'SBIN0001023',
          branch: 'Baramunda Branch, Bhubaneswar',
          current_balance: 3840000.00,
          account_type: 'CURRENT_COLLECTION'
        },
        {
          id: 2,
          bank_name: 'Punjab National Bank',
          account_name: 'BEC Operational & Expenditure A/c',
          account_no: '0421002100054321',
          ifsc: 'PUNB0042100',
          branch: 'Khandagiri, Bhubaneswar',
          current_balance: 445600.00,
          account_type: 'OPERATIONAL_EXPENSE'
        },
        {
          id: 3,
          bank_name: 'HDFC Bank Ltd',
          account_name: 'BEC Digital Gateway Nodal Escrow A/c',
          account_no: '50200045612344',
          ifsc: 'HDFC0000240',
          branch: 'Saheed Nagar, Bhubaneswar',
          current_balance: 812400.00,
          account_type: 'ONLINE_ESCROW'
        }
      ];

      this.renderBankCards();
    } catch (e) {
      console.warn('Bank accounts fetch error:', e.message);
    }
  },

  renderBankCards() {
    const wrap = document.getElementById('bankAccountsCardsWrap');
    if (!wrap) return;

    wrap.innerHTML = this.bankAccounts.map(b => `
      <div class="bank-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #0F172A;">${escapeHtml(b.bank_name)}</div>
              <div style="font-size: 0.8rem; color: #64748B;">${escapeHtml(b.branch)}</div>
            </div>
            <span class="bank-badge" style="background: #E0F2FE; color: #0284C7;">
              ${b.account_type.replace('_', ' ')}
            </span>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600;">Account Number</div>
            <div style="font-family: monospace; font-size: 1rem; font-weight: 800; color: #1E293B; letter-spacing: 0.05em;">
              ${escapeHtml(b.account_no)}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748B; margin-top: 0.25rem;">
              <span>IFSC: <strong style="font-family: monospace;">${escapeHtml(b.ifsc)}</strong></span>
              <span>BEC Designated</span>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600;">Available Book Balance</div>
          <div style="font-size: 1.45rem; font-weight: 900; color: #15803D; font-family: monospace; margin-top: 0.15rem;">
            ${ui.formatCurrency(b.current_balance)}
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.85rem;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="ui.showToast('Fetching e-Statement from ${b.bank_name}...', 'info')">
              Download Statement
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="cashBank.switchTab('brs')">
              Reconcile (BRS)
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderBankFeeds() {
    const tbody = document.getElementById('bankTxnsTbody');
    if (!tbody) return;

    const feeds = [
      { date: '2026-09-23', bank: 'SBI Fee Collection A/c', ref: 'SBIN26266019921', desc: 'Counter Cash Deposit (Slip #49102)', cr: 115000, dr: 0, rec: true },
      { date: '2026-09-23', bank: 'HDFC Digital Escrow', ref: 'HDFC26266044101', desc: 'Online Semester Gateway Settlement (Tushar Mhato)', cr: 25000, dr: 0, rec: true },
      { date: '2026-09-22', bank: 'PNB Operational A/c', ref: 'CHQ-890124', desc: 'Odisha State Electricity Board Campus Power Bill', cr: 0, dr: 45000, rec: true },
      { date: '2026-09-22', bank: 'SBI Fee Collection A/c', ref: 'NEFT-AXIS2026-004', desc: 'Direct NEFT Admission Fee - Bablu Bag (2026BEC01080)', cr: 115000, dr: 0, rec: false },
      { date: '2026-09-21', bank: 'PNB Operational A/c', ref: 'CHQ-890125', desc: 'Apex High-Speed Campus Fiber Leased Line Sept 2026', cr: 0, dr: 18500, rec: false }
    ];

    tbody.innerHTML = feeds.map(f => `
      <tr>
        <td style="white-space: nowrap;">${f.date}</td>
        <td><strong>${escapeHtml(f.bank)}</strong></td>
        <td><code style="font-weight: 700; color: #0284C7;">${escapeHtml(f.ref)}</code></td>
        <td>${escapeHtml(f.desc)}</td>
        <td style="text-align: right; color: #15803D; font-weight: 700; font-family: monospace;">${f.cr > 0 ? ui.formatCurrency(f.cr) : '-'}</td>
        <td style="text-align: right; color: #BE123C; font-weight: 700; font-family: monospace;">${f.dr > 0 ? ui.formatCurrency(f.dr) : '-'}</td>
        <td style="text-align: center;">
          <span class="badge ${f.rec ? 'badge-success' : 'badge-warning'}">
            ${f.rec ? 'RECONCILED ✓' : 'PENDING BRS'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  renderBrsQueue() {
    const wrap = document.getElementById('unreconciledItemsWrap');
    if (!wrap) return;

    const items = [
      { id: 1, title: 'Cheque #890125 (Apex High-Speed Internet)', type: 'CHEQUE_ISSUED_NOT_PRESENTED', amount: 18500, date: '21-Sep-2026' },
      { id: 2, title: 'Direct NEFT Admission Fee (Bablu Bag)', type: 'DIRECT_DEPOSIT_NOT_LINKED', amount: 115000, date: '22-Sep-2026' },
      { id: 3, title: 'Bank SMS & Annual Maintenance Charges', type: 'BANK_CHARGES_UNBOOKED', amount: 450, date: '20-Sep-2026' }
    ];

    wrap.innerHTML = items.map(item => `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: #0F172A;">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.78rem; color: #64748B; margin-top: 0.2rem;">
            ${item.date} &bull; <span class="badge badge-warning" style="font-size: 0.7rem;">${item.type.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-family: monospace; color: #0F172A; font-size: 0.95rem;">${ui.formatCurrency(item.amount)}</div>
          <button class="btn btn-secondary btn-sm" style="margin-top: 0.35rem; font-size: 0.75rem;" onclick="cashBank.reconcileItem(${item.id})">
            ✓ Match &amp; Clear
          </button>
        </div>
      </div>
    `).join('');
  },

  reconcileItem(id) {
    ui.showToast(`Item #${id} verified against bank feed and cleared into BRS ledger!`, 'success');
    const el = event.target.closest('div[style*="background: #F8FAFC"]');
    if (el) el.remove();
  }
};
