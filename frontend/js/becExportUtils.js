/**
 * Bhubaneswar Engineering College (BEC) - Master Unified Export & Reporting Engine
 * Provides standard, institutional-grade Excel (.xlsx / CSV) and PDF / Print generation
 * with official college letterheads, verified metadata, summary KPIs, and audit blocks.
 */

const becExportUtils = {
  institution: {
    name: 'BHUBANESWAR ENGINEERING COLLEGE (BEC)',
    affiliation: 'Affiliated to BPUT, Odisha & Approved by AICTE, New Delhi',
    address: 'At-Paniora, NK Nagar, Pittapally, Bhubaneswar, Odisha 752054',
    contact: 'Email: accounts@bec.ac.in | Phone: +91-674-2970000 | Web: www.becbbsr.ac.in',
    session: 'Academic Session: 2026-27'
  },

  formatCurrency(amount) {
    const val = parseFloat(amount) || 0;
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatNumber(amount) {
    const val = parseFloat(amount) || 0;
    return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  /**
   * Export structured dataset to Excel (CSV with UTF-8 BOM and Institutional Header)
   */
  exportToExcel({ filename = 'BEC_Report', title = 'OFFICIAL REPORT', filterSummary = 'All Records', stats = {}, headers = [], rows = [] }) {
    if (!rows || rows.length === 0) {
      if (typeof ui !== 'undefined') ui.showToast('No records available to export.', 'warning');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel

    // Institutional Header
    csv += `"${this.institution.name}"\n`;
    csv += `"${this.institution.affiliation}"\n`;
    csv += `"${this.institution.address}"\n`;
    csv += `"${title.toUpperCase()} — ${this.institution.session}"\n`;
    csv += `"Generated On: ${dateStr} | Prepared By: Accounts Office | Filter Scope: ${filterSummary}"\n`;

    // Summary KPI Row if provided
    if (Object.keys(stats).length > 0) {
      const statsStr = Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join('  |  ');
      csv += `"SUMMARY METRICS: ${statsStr}"\n`;
    }
    csv += '\n'; // Spacer

    // Column Headers
    csv += headers.map(h => escapeCsv(h.label || h)).join(',') + '\n';

    // Rows
    rows.forEach(row => {
      const line = headers.map(h => {
        const key = typeof h === 'object' ? h.key : h;
        let val = row[key];
        if (h.type === 'currency') {
          val = parseFloat(val) || 0;
          return val.toFixed(2);
        }
        return escapeCsv(val !== undefined && val !== null ? val : '');
      });
      csv += line.join(',') + '\n';
    });

    // Summary Totals Row at the bottom
    csv += '\n';
    const totalLine = headers.map((h, idx) => {
      if (idx === 0) return '"TOTALS"';
      const key = typeof h === 'object' ? h.key : h;
      if (h.type === 'currency' || h.isTotal) {
        const sum = rows.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0);
        return sum.toFixed(2);
      }
      return '""';
    });
    csv += totalLine.join(',') + '\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${now.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof ui !== 'undefined') ui.showToast(`Excel export created: ${rows.length} records exported!`, 'success');
  },

  /**
   * Export structured dataset to PDF / High-Resolution Official Printable Register
   */
  exportToPDF({ title = 'OFFICIAL REPORT', subtitle = '', filterSummary = 'All Records', stats = {}, headers = [], rows = [], filename = 'BEC_Report' }) {
    if (!rows || rows.length === 0) {
      if (typeof ui !== 'undefined') ui.showToast('No records available to export to PDF.', 'warning');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const docRef = `BEC/ACC/REP/${now.getFullYear()}/${String(Math.floor(1000 + Math.random() * 9000))}`;

    let statCardsHtml = '';
    if (Object.keys(stats).length > 0) {
      statCardsHtml = `
        <div style="display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;">
          ${Object.entries(stats).map(([k, v]) => `
            <div style="flex: 1; min-width: 140px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px;">
              <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">${k}</div>
              <div style="font-size: 17px; font-weight: 800; color: #0F172A; margin-top: 2px;">${v}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Totals calculation
    const totals = {};
    headers.forEach(h => {
      const key = typeof h === 'object' ? h.key : h;
      if (h.type === 'currency' || h.isTotal) {
        totals[key] = rows.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0);
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - ${this.institution.name}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm 10mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 12px;
            font-size: 11px;
            line-height: 1.4;
            background: #FFFFFF;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #1E3A8A;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .bec-logo-cell {
            width: 70px;
            vertical-align: middle;
          }
          .bec-title-cell {
            vertical-align: middle;
            text-align: left;
            padding-left: 12px;
          }
          .bec-meta-cell {
            vertical-align: middle;
            text-align: right;
            font-size: 10px;
            color: #475569;
          }
          .inst-name {
            font-size: 18px;
            font-weight: 800;
            color: #1E3A8A;
            letter-spacing: 0.02em;
            margin: 0;
          }
          .inst-affil {
            font-size: 10.5px;
            font-weight: 600;
            color: #475569;
            margin: 2px 0;
          }
          .inst-addr {
            font-size: 9.5px;
            color: #64748B;
            margin: 0;
          }
          .report-title-strip {
            background: #F1F5F9;
            border: 1px solid #CBD5E1;
            border-radius: 6px;
            padding: 8px 14px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .report-main-title {
            font-size: 14px;
            font-weight: 800;
            color: #0F172A;
            margin: 0;
          }
          .report-sub-title {
            font-size: 10px;
            color: #64748B;
            margin-top: 1px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            margin-bottom: 20px;
          }
          .data-table th {
            background: #1E3A8A;
            color: #FFFFFF;
            font-weight: 700;
            padding: 8px 8px;
            text-align: left;
            border: 1px solid #1E3A8A;
            white-space: nowrap;
          }
          .data-table th.num, .data-table td.num {
            text-align: right;
          }
          .data-table th.center, .data-table td.center {
            text-align: center;
          }
          .data-table td {
            padding: 6px 8px;
            border: 1px solid #E2E8F0;
            vertical-align: middle;
          }
          .data-table tr:nth-child(even) {
            background: #F8FAFC;
          }
          .totals-row td {
            background: #E2E8F0 !important;
            font-weight: 800;
            border-top: 2px solid #0F172A;
            border-bottom: 2px solid #0F172A;
          }
          .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .badge-paid { background: #DCFCE7; color: #166534; }
          .badge-unpaid { background: #FEE2E2; color: #991B1B; }
          .badge-partial { background: #FEF3C7; color: #92400E; }
          .badge-info { background: #E0F2FE; color: #0369A1; }
          .signature-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sign-box {
            width: 28%;
            text-align: center;
            border-top: 1px solid #94A3B8;
            padding-top: 8px;
            font-size: 10.5px;
            color: #334155;
            font-weight: 700;
          }
          .sign-sub {
            font-size: 9px;
            color: #64748B;
            font-weight: normal;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td class="bec-logo-cell">
              <div style="width: 52px; height: 52px; border-radius: 8px; background: #1E3A8A; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900;">
                🎓
              </div>
            </td>
            <td class="bec-title-cell">
              <h1 class="inst-name">${this.institution.name}</h1>
              <div class="inst-affil">${this.institution.affiliation}</div>
              <div class="inst-addr">${this.institution.address} &bull; accounts@bec.ac.in</div>
            </td>
            <td class="bec-meta-cell">
              <div><strong>DOC REF:</strong> ${docRef}</div>
              <div><strong>DATE:</strong> ${dateStr}</div>
              <div><strong>SESSION:</strong> 2026-27</div>
              <div><strong>OFFICIAL ACCOUNTS REGISTER</strong></div>
            </td>
          </tr>
        </table>

        <!-- Report Title Strip -->
        <div class="report-title-strip">
          <div>
            <div class="report-main-title">${title}</div>
            <div class="report-sub-title">${subtitle || filterSummary}</div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <span>Scope: <strong>${filterSummary}</strong></span> &bull; 
            <span>Total Records: <strong>${rows.length}</strong></span>
          </div>
        </div>

        <!-- Summary KPIs Banner -->
        ${statCardsHtml}

        <!-- Table -->
        <table class="data-table">
          <thead>
            <tr>
              ${headers.map(h => {
                const alignClass = h.align ? h.align : (h.type === 'currency' ? 'num' : '');
                return `<th class="${alignClass}" style="${h.width ? 'width:' + h.width + ';' : ''}">${h.label || h}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, rowIdx) => `
              <tr>
                ${headers.map((h, colIdx) => {
                  const key = typeof h === 'object' ? h.key : h;
                  let val = r[key];
                  const alignClass = h.align ? h.align : (h.type === 'currency' ? 'num' : '');

                  if (h.isSerial) {
                    return `<td class="center" style="font-weight: 700; color: #64748B;">${rowIdx + 1}</td>`;
                  }
                  if (h.type === 'currency') {
                    const num = parseFloat(val) || 0;
                    return `<td class="num" style="font-weight: 600;">₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
                  }
                  if (h.type === 'status') {
                    const st = String(val || '').toUpperCase();
                    let cls = 'badge-info';
                    if (st === 'PAID' || st === 'CLEARED' || st === 'ELIGIBLE' || st === 'APPROVED' || st === 'SUCCESS') cls = 'badge-paid';
                    else if (st === 'UNPAID' || st === 'DUE' || st === 'DEFAULTER' || st === 'BLOCKED') cls = 'badge-unpaid';
                    else if (st === 'PARTIAL' || st === 'PARTIALLY_PAID') cls = 'badge-partial';
                    return `<td><span class="badge ${cls}">${st}</span></td>`;
                  }
                  return `<td class="${alignClass}">${val !== undefined && val !== null ? val : '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}

            <!-- Bottom Totals Row -->
            <tr class="totals-row">
              ${headers.map((h, idx) => {
                if (idx === 0) return `<td colspan="${h.isSerial ? 2 : 1}" style="font-weight: 800;">TOTALS (${rows.length} Records)</td>`;
                if (idx === 1 && headers[0].isSerial) return '';
                const key = typeof h === 'object' ? h.key : h;
                if (h.type === 'currency' || h.isTotal) {
                  const totalVal = totals[key] || 0;
                  return `<td class="num" style="font-weight: 800; color: #1E3A8A;">₹${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
                }
                return `<td></td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>

        <!-- Signatures Section -->
        <div class="signature-section">
          <div class="sign-box">
            <div>Prepared by: Cashier / Desk Operator</div>
            <div class="sign-sub">Official Cash Desk &bull; BEC Accounts</div>
          </div>
          <div class="sign-box">
            <div>Verified by: Senior Accounts Officer</div>
            <div class="sign-sub">Finance &amp; Statutory Audit Department</div>
          </div>
          <div class="sign-box">
            <div>Approved by: Accounts Head / Principal</div>
            <div class="sign-sub">Bhubaneswar Engineering College</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Inject into hidden iframe to trigger print without disrupting the active page view
    let iframe = document.getElementById('becPrintExportIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'becPrintExportIframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        if (typeof ui !== 'undefined') ui.showToast('Official PDF print dialog generated.', 'info');
      }, 350);
    };

    // Fallback if onload already triggered
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {}
    }, 600);
  }
};

window.becExportUtils = becExportUtils;
