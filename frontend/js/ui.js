/**
 * UI Utilities, Modal Manager, Toast Notifications, & Native Canvas Charts
 * Bhubaneswar Engineering College (BEC) Accounts System
 */

const ui = {
  /**
   * Display Toast Notification
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration
   */
  showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066CC" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Modal Controls
   */
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Formatting Helpers
   */
  formatCurrency(amount) {
    const val = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  },

  numberToWords(num) {
    num = Math.round(Number(num) || 0);
    if (num === 0) return 'Rupees Zero Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function convertLessThanOneThousand(n) {
      let s = '';
      if (n >= 100) {
        s += a[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        s += b[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        s += a[n] + ' ';
      }
      return s.trim();
    }
    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    let res = '';
    if (crore > 0) res += convertLessThanOneThousand(crore) + ' Crore ';
    if (lakh > 0) res += convertLessThanOneThousand(lakh) + ' Lakh ';
    if (thousand > 0) res += convertLessThanOneThousand(thousand) + ' Thousand ';
    if (num > 0) res += convertLessThanOneThousand(num) + ' ';
    return res.trim() + ' Rupees Only';
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  },

  renderStatusBadge(status) {
    if (!status) return '<span class="badge badge-muted">-</span>';
    const s = String(status).toUpperCase();

    if (['PAID', 'SUCCESS', 'ACTIVE', 'APPROVED', 'MATCHED'].includes(s)) {
      return `<span class="badge badge-success">${s.replace('_', ' ')}</span>`;
    }
    if (['PENDING', 'PARTIALLY_PAID', 'ISSUED', 'REQUESTED', 'INVESTIGATION'].includes(s)) {
      return `<span class="badge badge-warning">${s.replace('_', ' ')}</span>`;
    }
    if (['OVERDUE', 'FAILED', 'CANCELLED', 'REJECTED', 'UNMATCHED'].includes(s)) {
      return `<span class="badge badge-danger">${s.replace('_', ' ')}</span>`;
    }
    return `<span class="badge badge-info">${s.replace('_', ' ')}</span>`;
  },

  /**
   * Native HTML5 Canvas Bar Chart
   * Zero external dependencies, sharp retina rendering
   */
  drawBarChart(canvasId, labels, dataValues, color = '#0066CC') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!dataValues || dataValues.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(...dataValues, 1000) * 1.15;
    const paddingBottom = 35;
    const paddingTop = 25;
    const paddingLeft = 60;
    const chartW = w - paddingLeft - 20;
    const chartH = h - paddingTop - paddingBottom;
    const barWidth = Math.max(16, (chartW / dataValues.length) * 0.45);
    const step = chartW / dataValues.length;

    // Draw Grid Lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
      ctx.fillText(`₹${(val / 1000).toFixed(0)}k`, paddingLeft - 8, y + 3);
    }

    // Draw Bars
    dataValues.forEach((val, idx) => {
      const barH = (val / maxVal) * chartH;
      const x = paddingLeft + idx * step + (step - barWidth) / 2;
      const y = paddingTop + chartH - barH;

      // Gradient Bar
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, '#0A2540');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label below bar
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const lbl = labels[idx] || '';
      ctx.fillText(lbl, x + barWidth / 2, h - 10);
    });
  },

  /**
   * Two-Step High-Risk Authorization Modal (Requirement 14)
   * Mandatory for Refund, Fee Waiver, Receipt Reversal, Staff Deactivation
   */
  promptTwoStepAuth({ title, actionName = 'Confirm Action', description, onConfirm }) {
    let existing = document.getElementById('twoStepAuthModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'twoStepAuthModal';
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 480px; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <div class="modal-header" style="background: #0F172A; color: #FFFFFF; padding: 1rem 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style="font-weight: 800; font-size: 1rem;">Two-Step Security Authorization</span>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('twoStepAuthModal').remove()" style="color: #94A3B8;">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem;">
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem; color: #92400E; font-size: 0.85rem;">
            <strong>${escapeHtml(title || 'High-Risk Financial Action')}</strong>
            <div style="margin-top: 0.25rem;">${escapeHtml(description || 'This operation modifies audit registers or financial ledgers and requires mandatory maker-checker authorization.')}</div>
          </div>

          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-weight: 700; color: #1E293B;">
              Step 1: Mandatory Audit Reason / Justification *
            </label>
            <textarea id="twoStepReasonInput" class="form-control" rows="2" placeholder="State official business justification (recorded in immutable audit log)..."></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label class="form-label" style="font-weight: 700; color: #1E293B;">
              Step 2: Account Password Re-Authentication *
            </label>
            <input type="password" id="twoStepPasswordInput" class="form-control" placeholder="Enter your login password to authorize">
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="document.getElementById('twoStepAuthModal').remove()">
              Cancel
            </button>
            <button type="button" id="twoStepSubmitBtn" class="btn btn-primary" style="flex: 1.5; font-weight: 700; background: #DC2626; border-color: #DC2626;">
              ${escapeHtml(actionName)}
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const reasonInput = document.getElementById('twoStepReasonInput');
    const passInput = document.getElementById('twoStepPasswordInput');
    const submitBtn = document.getElementById('twoStepSubmitBtn');
    reasonInput.focus();

    submitBtn.onclick = async () => {
      const reason = reasonInput.value.trim();
      const password = passInput.value;

      if (!reason || reason.length < 5) {
        ui.showToast('Please provide a meaningful audit justification (min 5 characters).', 'warning');
        reasonInput.focus();
        return;
      }
      if (!password) {
        ui.showToast('Please enter your account password to authorize.', 'warning');
        passInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-sm"></span> Verifying...';

      try {
        const verifyRes = await api.post('/auth/verify-password', { password });
        if (verifyRes && verifyRes.success) {
          modal.remove();
          await onConfirm(reason);
        } else {
          ui.showToast(verifyRes.message || 'Authorization failed. Incorrect password.', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = actionName;
        }
      } catch (err) {
        ui.showToast(err.message || 'Password verification failed.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = actionName;
      }
    };
  },

  /**
   * Skeletons & State Renderers (Requirement 27)
   */
  renderTableSkeleton(columns = 6, rows = 5) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < columns; j++) {
        const width = 50 + ((j * 17 + i * 23) % 45);
        html += `<td style="padding: 0.85rem;"><div style="height: 14px; width: ${width}%; background: #E2E8F0; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out;"></div></td>`;
      }
      html += '</tr>';
    }
    return html;
  },

  renderCardSkeleton() {
    return `
      <div style="padding: 1.25rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; animation: pulse 1.5s infinite ease-in-out;">
        <div style="height: 16px; width: 40%; background: #E2E8F0; border-radius: 4px; margin-bottom: 0.75rem;"></div>
        <div style="height: 28px; width: 60%; background: #CBD5E1; border-radius: 4px; margin-bottom: 0.5rem;"></div>
        <div style="height: 12px; width: 80%; background: #F1F5F9; border-radius: 4px;"></div>
      </div>
    `;
  },

  renderEmptyState(message = 'No records found matching current criteria.', retryFn = null) {
    return `
      <div style="text-align: center; padding: 2.5rem 1.5rem; color: #64748B;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📂</div>
        <div style="font-size: 0.95rem; font-weight: 600; color: #1E293B;">${escapeHtml(message)}</div>
        ${retryFn ? `<button type="button" class="btn btn-sm btn-outline" style="margin-top: 0.75rem;" onclick="${retryFn}">Reset Filters / Retry</button>` : ''}
      </div>
    `;
  },

  renderErrorState(message = 'Failed to load records from server.', retryFn = null) {
    return `
      <div style="text-align: center; padding: 2.5rem 1.5rem; color: #DC2626;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
        <div style="font-size: 0.95rem; font-weight: 600;">${escapeHtml(message)}</div>
        ${retryFn ? `<button type="button" class="btn btn-sm btn-danger" style="margin-top: 0.75rem;" onclick="${retryFn}">Retry Loading</button>` : ''}
      </div>
    `;
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.ui = ui;
window.escapeHtml = escapeHtml;
