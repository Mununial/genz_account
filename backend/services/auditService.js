/**
 * Immutable Audit Logging Service
 * Bhubaneswar Engineering College (BEC) Accounts System
 */

const { query } = require('../config/db');

async function logAudit(arg1, arg2 = {}) {
  try {
    let payload = arg1 || {};
    if (arg1 && arg1.headers && (arg1.user || arg1.ip)) {
      // First argument is req
      payload = {
        userId: arg1.user ? arg1.user.id : null,
        role: arg1.user ? arg1.user.role : null,
        ipAddress: arg1.ip,
        ...arg2
      };
    }

    const {
      userId = null,
      role = null,
      action = 'AUDIT_ACTION',
      module = 'SYSTEM',
      recordId = null,
      oldValue = null,
      newValue = null,
      reason = null,
      ipAddress = null
    } = payload;

    const oldValJson = oldValue ? JSON.stringify(oldValue) : null;
    const newValJson = newValue ? JSON.stringify(newValue) : null;

    await query(
      `INSERT INTO audit_logs (user_id, role, action, module, record_id, old_value, new_value, reason, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, role, action || 'AUDIT_ACTION', module || 'SYSTEM', recordId, oldValJson, newValJson, reason, ipAddress]
    );
  } catch (error) {
    console.error('[AuditService Error]', error.message);
  }
}

module.exports = {
  logAudit
};
