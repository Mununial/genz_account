/**
 * Database Connection Manager & Query Executor
 * Gen-Z University Accounts System
 * 
 * Supports:
 * 1. Live Hostinger-hosted MySQL via mysql2 connection pool (Production Standard)
 * 2. Automatic In-Memory Simulation Fallback for local offline developer testing
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mockDb = require('./mockDb');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'genz_accounts_db',
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
  timezone: '+05:30',
  dateStrings: true,
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = null;
let useSimulationMode = false;
let simulationInitialized = false;

function getPool() {
  if (!pool && !useSimulationMode) {
    try {
      pool = mysql.createPool(dbConfig);
      pool.on('error', (err) => {
        console.warn('[MySQL Pool Warning]', err.message);
      });
    } catch (e) {
      pool = null;
    }
  }
  return pool;
}

/**
 * Execute parameterized query
 * @param {string} sql
 * @param {Array} params
 */
async function query(sql, params = []) {
  if (!useSimulationMode) {
    try {
      const p = getPool();
      if (p) {
        return await p.query(sql, params);
      }
    } catch (err) {
      if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        try {
          const p = getPool();
          if (p) return await p.query(sql, params);
        } catch (retryErr) {
          err = retryErr;
        }
      }
      if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_BAD_DB_ERROR') {
        if (!useSimulationMode) {
          console.warn(`[Database Notice] MySQL server (${dbConfig.host}:${dbConfig.port}) not reachable (${err.code}).`);
          console.warn(`  Switching seamlessly to In-Memory Preview Mode for local development.`);
          console.warn(`  To use Hostinger MySQL, ensure credentials in backend/.env are set.`);
          useSimulationMode = true;
          await mockDb.init();
        }
      } else {
        throw err;
      }
    }
  }

  // Simulation Fallback Executor
  if (!simulationInitialized) {
    await mockDb.init();
    simulationInitialized = true;
  }
  return executeMockQuery(sql, params);
}

/**
 * Get dedicated connection or mock connection
 */
async function getConnection() {
  if (!useSimulationMode) {
    try {
      const p = getPool();
      if (p) {
        return await p.getConnection();
      }
    } catch (err) {
      useSimulationMode = true;
      await mockDb.init();
    }
  }

  // Return mock transaction-compatible connection
  return {
    query: async (sql, params) => query(sql, params),
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {}
  };
}

/**
 * Execute callback within an ACID transaction
 */
async function withTransaction(callback) {
  const connection = await getConnection();
  try {
    if (connection.beginTransaction) await connection.beginTransaction();
    const result = await callback(connection);
    if (connection.commit) await connection.commit();
    return result;
  } catch (error) {
    if (connection.rollback) await connection.rollback();
    throw error;
  } finally {
    if (connection.release) connection.release();
  }
}

/**
 * Test connectivity
 */
async function testConnection() {
  try {
    const p = getPool();
    if (!p) throw new Error('Pool not created');
    const [rows] = await p.query('SELECT 1 + 1 AS result, NOW() as server_time');
    return {
      connected: true,
      mode: 'HOSTINGER_MYSQL',
      serverTime: rows[0].server_time,
      database: dbConfig.database,
      host: dbConfig.host
    };
  } catch (error) {
    // Check if fallback mode is operational
    if (!simulationInitialized) {
      await mockDb.init();
      simulationInitialized = true;
    }
    return {
      connected: true,
      mode: 'SIMULATION_FALLBACK',
      message: 'Operating in in-memory preview mode (MySQL server not detected on localhost). Set DB_HOST in .env for production Hostinger MySQL.',
      database: 'genz_accounts_memory',
      host: 'localhost (in-memory)'
    };
  }
}

/**
 * Emulated Query Parser for Mock Store
 */
function executeMockQuery(sql, params) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT Users by Email
  if (/FROM users u .* WHERE u\.email = \?/i.test(cleanSql)) {
    const rawEmail = String(params[0] || '').toLowerCase().trim();
    const cleanNoDomain = rawEmail.split('@')[0].replace(/[^a-z0-9]/g, '');

    // 1a. Direct User table match
    let user = mockDb.users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uDotted = (u.dotted_email || '').toLowerCase();
      const uAlt = (u.alt_email || '').toLowerCase();
      const uClean = uEmail.split('@')[0].replace(/[^a-z0-9]/g, '');

      return uEmail === rawEmail ||
             uDotted === rawEmail ||
             uAlt === rawEmail ||
             (cleanNoDomain && uClean === cleanNoDomain);
    });

    // 1b. Match by Student meta (reg_no, roll_no, phone, or name)
    if (!user) {
      const student = mockDb.students.find(s => {
        const reg = (s.reg_no || '').toLowerCase();
        const roll = (s.roll_no || '').toLowerCase();
        const phone = (s.phone || '').replace(/[^0-9]/g, '');
        const cleanPhone = rawEmail.replace(/[^0-9]/g, '');
        const sNameClean = (s.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        return reg === rawEmail ||
               roll === rawEmail ||
               (cleanPhone.length >= 10 && phone.includes(cleanPhone)) ||
               (cleanNoDomain && sNameClean === cleanNoDomain);
      });
      if (student) {
        user = mockDb.users.find(u => u.id === student.user_id);
      }
    }

    if (user) {
      const role = mockDb.roles.find(r => r.id === user.role_id);
      return [[{ ...user, role_name: role ? role.name : 'STUDENT' }]];
    }
    return [[]];
  }

  // 1b. SELECT Student User by reg_no or full_name (for login lookup)
  if (/WHERE LOWER\(s\.reg_no\) = \? OR LOWER\(s\.full_name\) LIKE \?/i.test(cleanSql)) {
    const term = String(params[0] || '').toLowerCase().replace(/%/g, '').trim();
    const cleanTerm = term.split('@')[0].replace(/[^a-z0-9]/g, '');
    const student = mockDb.students.find(s => {
      const reg = (s.reg_no || '').toLowerCase();
      const roll = (s.roll_no || '').toLowerCase();
      const name = (s.full_name || '').toLowerCase();
      const nameClean = name.replace(/[^a-z0-9]/g, '');
      const sEmail = (s.email || '').toLowerCase();
      const sAlt = (s.domain_email || '').toLowerCase();

      return reg === term ||
             roll === term ||
             name.includes(term) ||
             (cleanTerm && nameClean === cleanTerm) ||
             sEmail === term ||
             sAlt === term;
    });
    if (student) {
      const user = mockDb.users.find(u => u.id === student.user_id);
      if (user) {
        const role = mockDb.roles.find(r => r.id === user.role_id);
        return [[{ ...user, role_name: role ? role.name : 'STUDENT' }]];
      }
    }
    return [[]];
  }

  // 2. SELECT User by ID
  if (/FROM users u .* WHERE u\.id = \?/i.test(cleanSql) || /FROM users WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const user = mockDb.users.find(u => u.id === id);
    if (user) {
      const role = mockDb.roles.find(r => r.id === user.role_id);
      return [[{ ...user, role_name: role ? role.name : 'STUDENT' }]];
    }
    return [[]];
  }

  // 3. SELECT Student by User ID or ID
  if (/FROM students(?:\s+s)?\s+.*WHERE\s+(?:s\.)?user_id = \?/i.test(cleanSql) || /FROM students WHERE user_id = \?/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const st = mockDb.students.find(s => s.user_id === userId);
    if (st) {
      const b = mockDb.branches.find(br => br.id === st.branch_id);
      const c = mockDb.courses.find(cr => cr.id === st.course_id);
      const sem = mockDb.semesters.find(sm => sm.id === st.current_semester_id);
      const sess = mockDb.academicSessions.find(as => as.id === st.academic_session_id);
      return [[{
        ...st,
        branch_name: b ? b.name : 'CSE',
        branch_code: b ? b.code : 'CSE',
        course_name: c ? c.name : 'B.Tech',
        course_code: 'B.TECH',
        semester_label: sem ? sem.label : '1st Semester',
        session_name: sess ? sess.name : '2026-27'
      }]];
    }
    return [[]];
  }

  if (/FROM students(?:\s+s)?\s+.*WHERE\s+(?:s\.)?id = \?/i.test(cleanSql) || /FROM students WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const st = mockDb.students.find(s => s.id === id);
    if (st) {
      const b = mockDb.branches.find(br => br.id === st.branch_id);
      const c = mockDb.courses.find(cr => cr.id === st.course_id);
      const sem = mockDb.semesters.find(sm => sm.id === st.current_semester_id);
      const sess = mockDb.academicSessions.find(as => as.id === st.academic_session_id);
      const u = mockDb.users.find(usr => usr.id === st.user_id);
      return [[{
        ...st,
        email: u ? u.email : '',
        branch_name: b ? b.name : 'CSE',
        branch_code: b ? b.code : 'CSE',
        course_name: c ? c.name : 'B.Tech',
        course_code: 'B.TECH',
        semester_label: sem ? sem.label : '1st Semester',
        session_name: sess ? sess.name : '2026-27'
      }]];
    }
    return [[]];
  }

  // 4. SELECT Staff by User ID
  if (/FROM staff WHERE user_id = \?/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const stf = mockDb.staff.find(s => s.user_id === userId);
    return [stf ? [stf] : []];
  }

  // 5. SELECT Student Ledger
  if (/FROM student_fee_ledgers l .* WHERE l\.student_id = \?/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const rows = mockDb.ledgers
      .filter(l => l.student_id === studentId)
      .map(l => {
        const cat = mockDb.feeCategories.find(c => c.id === l.fee_category_id);
        const inv = mockDb.invoices.find(i => i.id === l.invoice_id);
        return {
          ...l,
          fee_category: cat ? cat.name : 'Fee Item',
          category_code: cat ? cat.code : 'FEE',
          invoice_no: inv ? inv.invoice_no : 'INV-GEN',
          semester_label: '1st Semester',
          session_name: '2026-27'
        };
      });
    return [rows];
  }

  // 5.b SELECT Ledger row by invoice and category FOR UPDATE
  if (/FROM student_fee_ledgers/i.test(cleanSql) && cleanSql.includes('invoice_id =') && cleanSql.includes('fee_category_id =')) {
    const invId = parseInt(params[0], 10);
    const catId = parseInt(params[1], 10);
    const row = mockDb.ledgers.find(l => l.invoice_id === invId && l.fee_category_id === catId);
    return [row ? [row] : []];
  }

  // 6. Student Balance Aggregate Query
  if (/total_charged.*FROM student_fee_ledgers/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const list = mockDb.ledgers.filter(l => l.student_id === studentId);
    let charged = 0, scholarship = 0, discount = 0, fine = 0, adjustment = 0, paid = 0, outstanding = 0;
    list.forEach(l => {
      charged += parseFloat(l.amount_charged || 0);
      scholarship += parseFloat(l.scholarship_amount || 0);
      discount += parseFloat(l.discount_amount || 0);
      fine += parseFloat(l.fine_amount || 0);
      adjustment += parseFloat(l.adjustment_amount || 0);
      paid += parseFloat(l.amount_paid || 0);
      outstanding += parseFloat(l.outstanding_amount || 0);
    });
    return [[{
      total_charged: charged,
      total_scholarship: scholarship,
      total_discount: discount,
      total_fine: fine,
      total_adjustment: adjustment,
      total_paid: paid,
      total_outstanding: outstanding
    }]];
  }

  // 7. Student Overdue Ledger Query
  if (/overdue_amount.*FROM student_fee_ledgers/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const list = mockDb.ledgers.filter(l => l.student_id === studentId && l.outstanding_amount > 0);
    const overdue = list.reduce((sum, l) => sum + parseFloat(l.outstanding_amount), 0);
    return [[{ overdue_amount: overdue, overdue_items: list.length }]];
  }

  // 8. Pending Invoices for Student
  if (/FROM invoices(?:\s+.*)?\s+WHERE\s+(?:i\.)?student_id = \?\s+AND\s+(?:i\.)?status IN/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const rows = mockDb.invoices.filter(i => i.student_id === studentId && ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE', 'UNPAID'].includes(i.status));
    return [rows];
  }

  // 9. All Invoices for Student
  if (/FROM invoices(?:\s+.*)?\s+WHERE\s+(?:i\.)?student_id = \?/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const rows = mockDb.invoices
      .filter(i => i.student_id === studentId)
      .map(i => ({ ...i, semester_label: '1st Semester', session_name: '2026-27' }));
    return [rows];
  }

  // Payments for Student
  if (/FROM payments(?:\s+.*)?\s+WHERE\s+(?:p\.)?student_id = \?/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const rows = mockDb.payments
      .filter(p => p.student_id === studentId)
      .map(p => {
        const rec = mockDb.receipts.find(r => r.payment_id === p.id);
        const inv = mockDb.invoices.find(i => i.id === p.invoice_id);
        return {
          ...p,
          receipt_no: rec ? rec.receipt_no : null,
          invoice_no: inv ? inv.invoice_no : ''
        };
      });
    return [rows];
  }

  // Payments by gateway_order_id
  if (/FROM payments/i.test(cleanSql) && cleanSql.includes('gateway_order_id')) {
    const orderId = params[0];
    const p = mockDb.payments.find(pay => pay.gateway_order_id === orderId);
    return [p ? [p] : []];
  }

  // Payments by ID
  if (/FROM payments/i.test(cleanSql) && /WHERE\s+(?:p\.)?id =/i.test(cleanSql)) {
    const payId = parseInt(params[0], 10);
    const p = mockDb.payments.find(pay => pay.id === payId);
    if (p) {
      const inv = mockDb.invoices.find(i => i.id === p.invoice_id);
      const st = mockDb.students.find(s => s.id === p.student_id);
      const rec = mockDb.receipts.find(r => r.payment_id === p.id);
      return [[{
        ...p,
        invoice_no: inv ? inv.invoice_no : '',
        reg_no: st ? st.reg_no : '',
        full_name: st ? st.full_name : '',
        receipt_no: rec ? rec.receipt_no : null,
        receipt_id: rec ? rec.id : null
      }]];
    }
    return [[]];
  }

  // Receipts by payment_id
  if (/FROM receipts WHERE payment_id = \?/i.test(cleanSql)) {
    const pId = parseInt(params[0], 10);
    const r = mockDb.receipts.find(rec => rec.payment_id === pId);
    return [r ? [r] : []];
  }

  // Invoices FOR UPDATE by ID or student
  if (/FROM invoices/i.test(cleanSql) && /WHERE\s+(?:i\.)?id =/i.test(cleanSql)) {
    const invId = parseInt(params[0], 10);
    const inv = mockDb.invoices.find(i => i.id === invId);
    if (inv) {
      const st = mockDb.students.find(s => s.id === inv.student_id);
      const u = st ? mockDb.users.find(usr => usr.id === st.user_id) : null;
      return [[{
        ...inv,
        reg_no: st ? st.reg_no : '',
        full_name: st ? st.full_name : '',
        gender: st ? st.gender : 'Male',
        category: st ? st.category : 'General',
        branch_name: 'Computer Science & Engineering',
        course_name: 'B.Tech',
        semester_label: '1st Semester',
        session_name: '2026-27',
        email: u ? u.email : '',
        student_email: u ? u.email : '',
        user_id: u ? u.id : 1
      }]];
    }
    return [[]];
  }

  // Student user_id lookup
  if (/SELECT user_id FROM students WHERE id = \?/i.test(cleanSql)) {
    const stId = parseInt(params[0], 10);
    const st = mockDb.students.find(s => s.id === stId);
    return [st ? [{ user_id: st.user_id }] : []];
  }

  // 11. Invoice Items
  if (/FROM invoice_items\b/i.test(cleanSql) && /WHERE\s+(?:it\.)?invoice_id = \?/i.test(cleanSql)) {
    const invId = parseInt(params[0], 10);
    const items = mockDb.invoiceItems.filter(it => it.invoice_id === invId).map(it => {
      const cat = mockDb.feeCategories.find(c => c.id === it.fee_category_id);
      return {
        ...it,
        category_name: cat ? cat.name : 'Fee Category',
        category_code: cat ? cat.code : 'FEE'
      };
    });
    return [items];
  }

  // 12. Student Payments
  if (/FROM payments p .* WHERE p\.student_id = \?/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const seenPaymentIds = new Set();
    const rows = mockDb.payments
      .filter(p => p.student_id === studentId)
      .map(p => {
        seenPaymentIds.add(p.id);
        const inv = mockDb.invoices.find(i => i.id === p.invoice_id);
        const rec = mockDb.receipts.find(r => r.payment_id === p.id || r.id === p.id);
        return {
          ...p,
          invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
          receipt_no: rec ? rec.receipt_no : null,
          receipt_id: rec ? rec.id : null
        };
      });

    // Also include any receipts that belong to this student without a linked payment
    mockDb.receipts
      .filter(r => r.student_id === studentId && (!r.payment_id || !seenPaymentIds.has(r.payment_id)))
      .forEach(r => {
        const inv = mockDb.invoices.find(i => i.id === r.invoice_id);
        const amt = parseFloat(r.amount_paid !== undefined ? r.amount_paid : (r.receipt_amount !== undefined ? r.receipt_amount : (r.amount || 0)));
        rows.push({
          id: r.id,
          payment_no: r.payment_no || `PAY-${r.receipt_no || r.id}`,
          invoice_id: r.invoice_id || 1,
          student_id: r.student_id,
          amount: amt,
          payment_method: r.payment_method || r.payment_mode || 'CASH',
          transaction_id: r.transaction_id || `CTR-${r.receipt_no}`,
          status: r.status || 'SUCCESS',
          created_at: r.created_at || r.issued_date || r.receipt_date || new Date().toISOString(),
          invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
          receipt_no: r.receipt_no || `REC-${r.id}`,
          receipt_id: r.id
        });
      });

    rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return [rows];
  }

  // 13. Student Receipts
  if (/FROM receipts r .* WHERE r\.student_id = \?/i.test(cleanSql)) {
    const studentId = parseInt(params[0], 10);
    const rows = mockDb.receipts
      .filter(r => r.student_id === studentId)
      .map(r => {
        const p = mockDb.payments.find(pay => pay.id === r.payment_id);
        const inv = mockDb.invoices.find(iv => iv.id === r.invoice_id);
        const rawAmt = r.amount_paid !== undefined ? r.amount_paid : (r.receipt_amount !== undefined ? r.receipt_amount : (r.amount !== undefined ? r.amount : (p ? p.amount : 0)));
        const numAmt = parseFloat(rawAmt) || 0;
        const dt = r.issued_date || r.receipt_date || r.created_at || (p ? p.created_at : new Date().toISOString());
        return {
          ...r,
          amount_paid: numAmt,
          receipt_amount: numAmt,
          amount: numAmt,
          issued_date: dt,
          receipt_date: dt,
          discount_amount: parseFloat(r.discount_amount !== undefined ? r.discount_amount : (r.discount !== undefined ? r.discount : 0)),
          payment_method: r.payment_method || r.payment_mode || (p ? p.payment_method : 'Online UPI / QR'),
          transaction_id: r.transaction_id || (p ? p.transaction_id : `TXN-${r.id}`),
          invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
          payment_no: p ? p.payment_no : `PAY-${r.id}`,
          semester: r.semester || '1st Semester'
        };
      })
      .sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date));
    return [rows];
  }

  // 13.b Receipts by ID
  if (/FROM receipts r/i.test(cleanSql) && /WHERE\s+r\.id = \?/i.test(cleanSql)) {
    const rId = parseInt(params[0], 10);
    const r = mockDb.receipts.find(rec => rec.id === rId);
    if (r) {
      const s = mockDb.students.find(st => st.id === r.student_id);
      const b = s ? mockDb.branches.find(br => br.id === s.branch_id) : null;
      const c = s ? mockDb.courses.find(cr => cr.id === s.course_id) : null;
      const inv = mockDb.invoices.find(i => i.id === r.invoice_id);
      return [[{
        ...r,
        reg_no: s ? s.reg_no : 'N/A',
        full_name: s ? s.full_name : 'Student',
        branch_name: b ? b.name : 'Engineering',
        course_name: c ? c.name : 'B.Tech',
        semester_label: '1st Semester',
        session_name: '2026-27',
        invoice_no: inv ? inv.invoice_no : 'INV-2026-0001'
      }]];
    }
    return [[]];
  }

  if (/FROM receipts r .* WHERE r\.id = \?/i.test(cleanSql)) {
    const recId = parseInt(params[0], 10);
    const rec = mockDb.receipts.find(r => r.id === recId);
    if (rec) {
      const st = mockDb.students.find(s => s.id === rec.student_id);
      const inv = mockDb.invoices.find(i => i.id === rec.invoice_id);
      return [[{
        ...rec,
        reg_no: st ? st.reg_no : '',
        full_name: st ? st.full_name : '',
        branch_name: 'Computer Science & Engineering',
        course_name: 'B.Tech',
        semester_label: '1st Semester',
        session_name: '2026-27',
        invoice_no: inv ? inv.invoice_no : ''
      }]];
    }
    return [[]];
  }

  // 14. Notifications
  if (/FROM notifications WHERE user_id = \?/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const rows = mockDb.notifications.filter(n => n.user_id === userId);
    return [rows];
  }

  if (/SELECT COUNT\(\*\) AS unread_count FROM notifications WHERE user_id = \?/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const count = mockDb.notifications.filter(n => n.user_id === userId && n.is_read === 0).length;
    return [[{ unread_count: count }]];
  }

  // 15. Admin Executive Dashboard KPIs
  if (/SELECT \(SELECT COALESCE\(SUM\(amount\), 0\) FROM payments WHERE status = 'SUCCESS' AND DATE\(created_at\) = CURDATE\(\)\)/i.test(cleanSql)) {
    let totalColl = 0;
    mockDb.payments.filter(p => p.status === 'SUCCESS').forEach(p => totalColl += parseFloat(p.amount));
    let totalOut = 0;
    mockDb.invoices.filter(i => i.status !== 'CANCELLED').forEach(i => totalOut += parseFloat(i.outstanding_amount));
    let totalExp = 0;
    mockDb.expenses.forEach(e => totalExp += parseFloat(e.amount || 0));

    const todayColl = 65000.00;
    const todayExp = 4500.00;
    const cashColl = 45000.00;
    const onlineColl = 20000.00;

    return [[{
      today_collection: todayColl,
      today_expenses: todayExp,
      today_net_flow: todayColl - todayExp,
      cash_collection: cashColl,
      online_collection: onlineColl,
      today_receipts_count: 2,
      today_payments_count: 1,
      month_collection: totalColl,
      month_expenses: totalExp,
      total_collection: totalColl,
      total_outstanding: totalOut,
      overdue_amount: totalOut * 0.45,
      pending_payments_count: mockDb.payments.filter(p => p.status === 'PENDING').length,
      pending_refunds_count: mockDb.refunds.filter(r => r.status === 'REQUESTED').length,
      pending_approvals_count: mockDb.refunds.filter(r => r.status === 'REQUESTED').length + mockDb.adjustments.filter(a => a.status === 'PENDING').length + 1,
      pending_recon_count: mockDb.reconciliations.filter(r => r.status === 'UNMATCHED').length,
      students_with_dues_count: mockDb.invoices.filter(i => i.outstanding_amount > 0).length,
      total_students_count: mockDb.students.filter(s => !s.is_alumni).length,
      total_enrolled_count: mockDb.students.filter(s => !s.is_alumni).length,
      alumni_count: mockDb.students.filter(s => s.is_alumni === 1).length
    }]];
  }

  // 16. Branch-wise Collection Stats
  if (/FROM branches b LEFT JOIN students s ON s\.branch_id = b\.id/i.test(cleanSql)) {
    const stats = mockDb.branches.map(b => {
      const stList = mockDb.students.filter(s => s.branch_id === b.id);
      let coll = 0, out = 0;
      stList.forEach(s => {
        const invs = mockDb.invoices.filter(i => i.student_id === s.id);
        invs.forEach(i => {
          coll += parseFloat(i.paid_amount || 0);
          out += parseFloat(i.outstanding_amount || 0);
        });
      });
      return {
        branch_name: b.name,
        branch_code: b.code,
        branch_collected: coll,
        branch_outstanding: out
      };
    });
    return [stats];
  }

  // 17. Fee Category Stats
  if (/FROM fee_categories fc LEFT JOIN invoice_items ii/i.test(cleanSql)) {
    const stats = mockDb.feeCategories.map(fc => {
      const items = mockDb.invoiceItems.filter(it => it.fee_category_id === fc.id);
      let billed = 0, paid = 0;
      items.forEach(it => {
        billed += parseFloat(it.amount || 0);
        paid += parseFloat(it.paid_amount || 0);
      });
      return {
        category_name: fc.name,
        billed_amount: billed || 50000.00,
        collected_amount: paid || 20000.00
      };
    });
    return [stats];
  }

  // 18. Monthly Trend
  if (/SELECT DATE_FORMAT\(created_at, '%b %Y'\) AS month_label/i.test(cleanSql)) {
    return [[
      { month_label: 'May 2026', collection_amount: 150000.00, transaction_count: 5 },
      { month_label: 'Jun 2026', collection_amount: 280000.00, transaction_count: 9 },
      { month_label: 'Jul 2026', collection_amount: 450000.00, transaction_count: 14 },
      { month_label: 'Aug 2026', collection_amount: 620000.00, transaction_count: 22 },
      { month_label: 'Sep 2026', collection_amount: 380000.00, transaction_count: 18 }
    ]];
  }

  // 19. Recent Transactions
  if (/FROM payments p JOIN students s ON p\.student_id = s\.id .* LIMIT 10/i.test(cleanSql)) {
    const txns = mockDb.payments.slice(-10).reverse().map(p => {
      const s = mockDb.students.find(st => st.id === p.student_id);
      const b = s ? mockDb.branches.find(br => br.id === s.branch_id) : null;
      const inv = mockDb.invoices.find(i => i.id === p.invoice_id);
      const rec = mockDb.receipts.find(r => r.payment_id === p.id);
      return {
        ...p,
        reg_no: s ? s.reg_no : '260101001',
        full_name: s ? s.full_name : 'Student',
        branch_code: b ? b.code : 'CSE',
        invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
        receipt_no: rec ? rec.receipt_no : null
      };
    });
    return [txns];
  }

  // 20. Intelligence Alerts
  if (/WHERE i\.outstanding_amount > 0 AND i\.status != 'CANCELLED' AND i\.due_date BETWEEN/i.test(cleanSql)) {
    const dues = mockDb.invoices.filter(i => i.outstanding_amount > 0).slice(0, 5).map(i => {
      const s = mockDb.students.find(st => st.id === i.student_id);
      return {
        id: s ? s.id : 1,
        reg_no: s ? s.reg_no : '',
        full_name: s ? s.full_name : '',
        branch_code: 'CSE',
        invoice_no: i.invoice_no,
        outstanding_amount: i.outstanding_amount,
        due_date: i.due_date
      };
    });
    return [dues];
  }

  if (/WHERE i\.outstanding_amount > 0 AND i\.status != 'CANCELLED' AND i\.due_date < DATE_SUB/i.test(cleanSql)) {
    return [[]];
  }

  if (/FROM reconciliation_records WHERE status IN/i.test(cleanSql)) {
    return [[{ count: 0, total_discrepancy: 0.00 }]];
  }

  // 21. Students Directory
  if (/FROM students s/i.test(cleanSql) && (cleanSql.includes('s.user_id = u.id') || cleanSql.includes('users u'))) {
    let filteredStudents = [...mockDb.students];
    const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const q = searchParam.replace(/%/g, '').toLowerCase().trim();
      if (q) {
        filteredStudents = filteredStudents.filter(s => {
          const u = mockDb.users.find(usr => usr.id === s.user_id);
          const b = mockDb.branches.find(br => br.id === s.branch_id);
          return (
            (s.full_name && s.full_name.toLowerCase().includes(q)) ||
            (s.reg_no && s.reg_no.toLowerCase().includes(q)) ||
            (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
            (s.phone && String(s.phone).includes(q)) ||
            (s.guardian_phone && String(s.guardian_phone).includes(q)) ||
            (s.parent_phone && String(s.parent_phone).includes(q)) ||
            (b && b.name && b.name.toLowerCase().includes(q)) ||
            (b && b.code && b.code.toLowerCase().includes(q)) ||
            (u && u.email && u.email.toLowerCase().includes(q))
          );
        });
      }
    }

    if (/SELECT COUNT\(\*\) AS total/i.test(cleanSql)) {
      return [[{ total: filteredStudents.length }]];
    }

    let rows = filteredStudents.map(s => {
      const u = mockDb.users.find(usr => usr.id === s.user_id);
      const b = mockDb.branches.find(br => br.id === s.branch_id);
      const sem = mockDb.semesters.find(sm => sm.id === s.current_semester_id);
      const sess = mockDb.academicSessions.find(as => as.id === s.academic_session_id);
      const invs = mockDb.invoices.filter(i => i.student_id === s.id);
      let billed = 0, paid = 0, out = 0;
      invs.forEach(i => {
        billed += parseFloat(i.total_payable || 0);
        paid += parseFloat(i.paid_amount || 0);
        out += parseFloat(i.outstanding_amount || 0);
      });
      return {
        ...s,
        id: s.id,
        reg_no: s.reg_no,
        roll_no: s.roll_no || s.reg_no,
        full_name: s.full_name,
        gender: s.gender,
        dob: s.dob,
        category: s.category,
        admission_year: s.admission_year || 2026,
        academic_year: s.academic_year || (s.current_semester_id && s.current_semester_id > 2 ? '2nd Year' : '1st Year'),
        current_semester_id: s.current_semester_id || 1,
        phone: s.phone || '',
        parent_phone: s.parent_phone || s.guardian_phone || '',
        branch_name: b ? b.name : (s.branch_name || 'Engineering'),
        branch_code: b ? b.code : (s.branch_code || 'ENG'),
        semester_label: sem ? sem.label : (s.semester_label || (s.current_semester_id ? `${s.current_semester_id === 1 ? '1st' : (s.current_semester_id === 2 ? '2nd' : (s.current_semester_id === 3 ? '3rd' : `${s.current_semester_id}th`))} Semester` : '1st Semester')),
        session_name: sess ? sess.name : (s.session_name || s.session || '2026-27'),
        session: s.session || s.session_name || (sess ? sess.name : '2026-27'),
        email: u ? u.email : (s.email || ''),
        is_active: u ? u.is_active : 1,
        total_billed: billed,
        total_paid: paid,
        total_outstanding: out,
        course_name: s.course_name || 'B.Tech',
        exam_fee_paid: s.exam_fee_paid || 0,
        exam_status: s.exam_status || 'UNPAID',
        hostel_opted: Boolean(s.hostel_required === 'Yes' || s.hostel === 'Yes'),
        transport_opted: Boolean(s.transport_required === 'Yes' || s.transport === 'Yes'),
        is_alumni: s.is_alumni ? 1 : 0,
        student_status: s.student_status || (s.is_alumni ? 'ALUMNI' : 'ACTIVE'),
        passout_year: s.passout_year || null,
        passout_batch: s.passout_batch || null,
        degree_awarded: s.degree_awarded || null,
        final_cgpa: s.final_cgpa || null,
        placement_status: s.placement_status || null,
        company_name: s.company_name || null,
        designation: s.designation || null,
        work_location: s.work_location || null,
        linkedin_url: s.linkedin_url || null,
        no_dues_status: s.no_dues_status || (s.is_alumni ? 'CLEARED' : 'PENDING'),
        caution_deposit_status: s.caution_deposit_status || (s.is_alumni ? 'REFUNDED' : 'HELD'),
        caution_deposit_refund_amount: s.caution_deposit_refund_amount || 0.00,
        graduated_at: s.graduated_at || null
      };
    });

    // Check for LIMIT and OFFSET in params
    const numericParams = params.filter(p => typeof p === 'number');
    if (numericParams.length >= 2 && cleanSql.includes('LIMIT ? OFFSET ?')) {
      const limit = numericParams[numericParams.length - 2];
      const offset = numericParams[numericParams.length - 1];
      rows = rows.slice(offset, offset + limit);
    }

    return [rows];
  }

  // 22. Fee Structures
  if (/FROM fee_structures fs/i.test(cleanSql)) {
    const list = mockDb.feeStructures.map(fs => ({
      ...fs,
      session_name: '2026-27',
      course_name: 'Bachelor of Technology',
      branch_name: 'Computer Science & Engineering',
      semester_label: '1st Semester',
      created_by_email: 'accounts.head@genz.edu.in'
    }));
    return [list];
  }

  if (/FROM fee_structure_items fsi/i.test(cleanSql)) {
    const structId = parseInt(params[0], 10);
    const items = mockDb.feeStructureItems.filter(it => it.fee_structure_id === structId).map(it => {
      const cat = mockDb.feeCategories.find(c => c.id === it.fee_category_id);
      return {
        ...it,
        category_name: cat ? cat.name : 'Component',
        category_code: cat ? cat.code : 'FEE'
      };
    });
    return [items];
  }

  if (/FROM fee_categories/i.test(cleanSql)) {
    return [mockDb.feeCategories];
  }

  if (/FROM fine_rules/i.test(cleanSql)) {
    const rules = mockDb.fineRules.map(fr => {
      const cat = mockDb.feeCategories.find(c => c.id === fr.fee_category_id);
      return { ...fr, category_name: cat ? cat.name : 'Tuition Fee', category_code: cat ? cat.code : 'TUI' };
    });
    return [rules];
  }

  // 23. Invoices Global List
  if (/SELECT COUNT\(\*\) AS total FROM invoices i/i.test(cleanSql)) {
    return [[{ total: mockDb.invoices.length }]];
  }

  if (/SELECT i\.id, i\.invoice_no .* FROM invoices i/i.test(cleanSql)) {
    const rows = mockDb.invoices.map(i => {
      const s = mockDb.students.find(st => st.id === i.student_id);
      const b = s ? mockDb.branches.find(br => br.id === s.branch_id) : null;
      return {
        ...i,
        student_id: s ? s.id : 1,
        reg_no: s ? s.reg_no : '',
        full_name: s ? s.full_name : '',
        branch_name: b ? b.name : 'CSE',
        branch_code: b ? b.code : 'CSE',
        semester_label: '1st Semester',
        session_name: '2026-27'
      };
    });
    return [rows];
  }

  // 23b. Defaulters Report Query
  if (/FROM invoices i\b.*JOIN students s\b/i.test(cleanSql) && (cleanSql.includes('days_overdue') || cleanSql.includes('DATEDIFF'))) {
    const today = new Date();
    const rows = [];
    mockDb.invoices.forEach(i => {
      if (i.status !== 'CANCELLED' && parseFloat(i.outstanding_amount || 0) > 0) {
        const s = mockDb.students.find(st => st.id === i.student_id);
        if (!s) return;
        const b = mockDb.branches.find(br => br.id === s.branch_id);
        const sem = mockDb.semesters.find(sm => sm.id === s.current_semester_id);

        // Due date calculation
        const dueStr = i.due_date || '2026-08-31';
        const dueDate = new Date(dueStr);
        const diffMs = today - dueDate;
        const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        rows.push({
          id: s.id,
          student_id: s.id,
          reg_no: s.reg_no,
          full_name: s.full_name,
          phone: s.phone || '',
          parent_name: s.parent_name || s.father_name || '',
          parent_phone: s.parent_phone || s.guardian_phone || '',
          branch_id: s.branch_id,
          branch_name: b ? b.name : 'Engineering',
          branch_code: b ? b.code : 'ENG',
          course_name: s.course_name || 'B.Tech',
          academic_year: s.academic_year || (s.current_semester_id && s.current_semester_id > 2 ? '2nd Year' : '1st Year'),
          session: s.session || '2026-27',
          current_semester_id: s.current_semester_id || 1,
          semester_label: sem ? sem.label : (s.current_semester_id ? `${s.current_semester_id === 1 ? '1st' : `${s.current_semester_id}th`} Semester` : '1st Semester'),
          invoice_no: i.invoice_no,
          total_payable: parseFloat(i.total_payable || 0),
          paid_amount: parseFloat(i.paid_amount || 0),
          outstanding_amount: parseFloat(i.outstanding_amount || 0),
          due_date: dueStr,
          days_overdue: daysOverdue
        });
      }
    });

    rows.sort((a, b) => b.outstanding_amount - a.outstanding_amount || b.days_overdue - a.days_overdue);
    return [rows];
  }

  // 24. Refunds & Adjustments
  if (/FROM refunds r/i.test(cleanSql)) {
    return [mockDb.refunds];
  }

  if (/FROM adjustments a/i.test(cleanSql)) {
    return [mockDb.adjustments];
  }

  // 25. Reconciliation
  if (/FROM reconciliation_records rr/i.test(cleanSql)) {
    return [mockDb.reconciliations];
  }

  if (/SELECT \(SELECT COALESCE\(SUM\(amount\), 0\) FROM payments WHERE status = 'SUCCESS'\) AS system_total/i.test(cleanSql)) {
    return [[{
      system_total: 20000.00,
      gateway_total: 20000.00,
      matched_count: 1,
      unmatched_count: 0,
      investigation_count: 0,
      resolved_count: 0
    }]];
  }

  // 26. Reports & Collections Register
  if (/FROM payments p\b.*JOIN students s\b/i.test(cleanSql) && !cleanSql.includes('LIMIT 10')) {
    const list = [];
    const seenPaymentIds = new Set();

    mockDb.payments.forEach(p => {
      if (p.status === 'SUCCESS') {
        seenPaymentIds.add(p.id);
        const s = mockDb.students.find(st => st.id === p.student_id);
        const b = s ? mockDb.branches.find(br => br.id === s.branch_id) : null;
        const inv = mockDb.invoices.find(i => i.id === p.invoice_id);
        const rec = mockDb.receipts.find(r => r.payment_id === p.id || r.id === p.id);
        const sem = s ? mockDb.semesters.find(sm => sm.id === s.current_semester_id) : null;
        const sess = s ? mockDb.academicSessions.find(as => as.id === s.academic_session_id) : null;
        list.push({
          ...p,
          reg_no: s ? s.reg_no : '',
          full_name: s ? s.full_name : '',
          branch_name: b ? b.name : 'Engineering',
          branch_code: b ? b.code : 'ENG',
          course_name: s ? s.course_name : 'B.Tech',
          academic_year: s ? (s.academic_year || (s.current_semester_id && s.current_semester_id > 2 ? '2nd Year' : '1st Year')) : '1st Year',
          current_semester_id: s ? (s.current_semester_id || 1) : 1,
          semester_label: sem ? sem.label : (s && s.current_semester_id ? `${s.current_semester_id === 1 ? '1st' : `${s.current_semester_id}th`} Semester` : '1st Semester'),
          session_name: sess ? sess.name : '2026-27',
          session: sess ? sess.name : '2026-27',
          invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
          receipt_no: rec ? rec.receipt_no : (p.receipt_no || `REC-${p.id}`)
        });
      }
    });

    mockDb.receipts.forEach(r => {
      if (r.payment_id && seenPaymentIds.has(r.payment_id)) return;
      const s = mockDb.students.find(st => st.id === r.student_id);
      const b = s ? mockDb.branches.find(br => br.id === s.branch_id) : null;
      const inv = mockDb.invoices.find(i => i.id === r.invoice_id);
      const sem = s ? mockDb.semesters.find(sm => sm.id === s.current_semester_id) : null;
      const sess = s ? mockDb.academicSessions.find(as => as.id === s.academic_session_id) : null;
      const amt = parseFloat(r.amount_paid !== undefined ? r.amount_paid : (r.receipt_amount !== undefined ? r.receipt_amount : (r.amount || 0)));
      list.push({
        id: r.id,
        payment_no: r.payment_no || `PAY-${r.receipt_no || r.id}`,
        invoice_id: r.invoice_id || 1,
        student_id: r.student_id,
        amount: amt,
        payment_method: r.payment_method || r.payment_mode || 'CASH',
        transaction_id: r.transaction_id || `REC-${r.receipt_no}`,
        status: r.status || 'SUCCESS',
        created_at: r.created_at || r.issued_date || r.receipt_date || new Date().toISOString(),
        reg_no: s ? s.reg_no : '',
        full_name: s ? s.full_name : '',
        branch_name: b ? b.name : 'Engineering',
        branch_code: b ? b.code : 'ENG',
        course_name: s ? s.course_name : 'B.Tech',
        academic_year: s ? (s.academic_year || (s.current_semester_id && s.current_semester_id > 2 ? '2nd Year' : '1st Year')) : '1st Year',
        current_semester_id: s ? (s.current_semester_id || 1) : 1,
        semester_label: sem ? sem.label : (s && s.current_semester_id ? `${s.current_semester_id === 1 ? '1st' : `${s.current_semester_id}th`} Semester` : '1st Semester'),
        session_name: sess ? sess.name : '2026-27',
        session: sess ? sess.name : '2026-27',
        invoice_no: inv ? inv.invoice_no : 'INV-2026-0001',
        receipt_no: r.receipt_no || `REC-${r.id}`
      });
    });

    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return [list];
  }

  // 27. Settings & Taxonomy
  if (/FROM academic_sessions/i.test(cleanSql)) {
    return [mockDb.academicSessions];
  }

  if (/FROM courses/i.test(cleanSql)) {
    return [mockDb.courses];
  }

  if (/FROM branches/i.test(cleanSql)) {
    return [mockDb.branches.map(b => ({ ...b, course_name: 'Bachelor of Technology' }))];
  }

  if (/FROM semesters/i.test(cleanSql)) {
    return [mockDb.semesters];
  }

  if (/FROM system_settings/i.test(cleanSql)) {
    const rows = Object.entries(mockDb.systemSettings).map(([k, v]) => ({ setting_key: k, setting_value: v }));
    return [rows];
  }

  // 28. Audit Logs
  if (/FROM audit_logs/i.test(cleanSql)) {
    return [mockDb.auditLogs];
  }

  // 29. Users Management
  if (/SELECT u\.id, u\.email, u\.role_id, u\.is_active/i.test(cleanSql)) {
    const rows = mockDb.users.map(u => {
      const r = mockDb.roles.find(ro => ro.id === u.role_id);
      const s = mockDb.students.find(st => st.user_id === u.id);
      const stf = mockDb.staff.find(sf => sf.user_id === u.id);
      return {
        ...u,
        role_name: r ? r.name : 'STUDENT',
        full_name: s ? s.full_name : (stf ? stf.full_name : 'System')
      };
    });
    return [rows];
  }

  // 29b. Cash Closings
  if (/FROM cash_closings/i.test(cleanSql)) {
    return [mockDb.cashClosings || []];
  }

  // 29c. Bank Accounts
  if (/FROM bank_accounts/i.test(cleanSql)) {
    return [mockDb.bankAccounts || []];
  }

  // 29d. Exam Registrations
  if (/FROM exam_registrations/i.test(cleanSql)) {
    let list = mockDb.examRegistrations || [];
    if (/WHERE\s+student_id\s*=/i.test(cleanSql)) {
      const sid = parseInt(params[0], 10);
      list = list.filter(e => e.student_id === sid);
    }
    return [list];
  }

  // 30. INSERT Queries
  if (/INSERT INTO payments/i.test(cleanSql)) {
    const id = mockDb.payments.length + 1;
    let paymentMethod = 'ONLINE_GATEWAY';
    let gatewayOrderId = null;
    let txnId = null;

    if (cleanSql.includes("'ONLINE_GATEWAY'")) {
      paymentMethod = 'ONLINE_GATEWAY';
      gatewayOrderId = params[4];
    } else {
      paymentMethod = params[4];
      txnId = params[5];
    }

    const payObj = {
      id,
      payment_no: params[0],
      invoice_id: params[1],
      student_id: params[2],
      amount: params[3],
      payment_method: paymentMethod,
      gateway_order_id: gatewayOrderId,
      transaction_id: txnId,
      status: cleanSql.includes("'SUCCESS'") ? 'SUCCESS' : 'PENDING',
      idempotency_key: params[5] || null,
      ip_address: params[params.length - 1],
      created_at: new Date().toISOString()
    };
    mockDb.payments.push(payObj);
    return [{ insertId: id, affectedRows: 1 }];
  }

  if (/INSERT INTO receipts/i.test(cleanSql)) {
    const id = mockDb.receipts.length + 1;
    const nowIso = new Date().toISOString();
    const amt = parseFloat(params[4]) || 0;
    mockDb.receipts.push({
      id,
      receipt_no: params[0],
      payment_id: params[1],
      student_id: params[2],
      invoice_id: params[3],
      amount_paid: amt,
      receipt_amount: amt,
      amount: amt,
      payment_method: params[5],
      transaction_id: params[6],
      issued_date: nowIso,
      receipt_date: nowIso,
      created_at: nowIso,
      receipt_data_json: params[7],
      created_by: params[8]
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  if (/INSERT INTO payment_events/i.test(cleanSql)) {
    return [{ insertId: 1, affectedRows: 1 }];
  }

  if (/INSERT INTO audit_logs/i.test(cleanSql)) {
    mockDb.auditLogs.unshift({
      id: mockDb.auditLogs.length + 1,
      user_id: params[0],
      role: params[1],
      action: params[2],
      module: params[3],
      record_id: params[4],
      old_value: params[5],
      new_value: params[6],
      reason: params[7],
      ip_address: params[8],
      created_at: new Date().toISOString()
    });
    return [{ insertId: mockDb.auditLogs.length, affectedRows: 1 }];
  }

  if (/INSERT INTO notifications/i.test(cleanSql)) {
    const id = mockDb.notifications.length + 1;
    mockDb.notifications.unshift({
      id,
      user_id: params[0],
      title: params[1],
      message: params[2],
      category: params[3],
      is_read: 0,
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  if (/INSERT INTO refunds/i.test(cleanSql)) {
    const id = mockDb.refunds.length + 1;
    mockDb.refunds.push({
      id,
      refund_no: params[0],
      payment_id: params[1],
      student_id: params[2],
      invoice_id: params[3],
      amount: params[4],
      reason: params[5],
      status: params[6] || 'REQUESTED',
      requested_by: params[7],
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  if (/INSERT INTO adjustments/i.test(cleanSql)) {
    const id = mockDb.adjustments.length + 1;
    mockDb.adjustments.push({
      id,
      student_id: params[0],
      invoice_id: params[1],
      fee_category_id: params[2],
      adjustment_type: params[3],
      amount: params[4],
      reason: params[5],
      status: params[6] || 'PENDING',
      requested_by: params[7],
      approved_by: params[8] || null,
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  if (/INSERT INTO cash_closings/i.test(cleanSql)) {
    const id = (mockDb.cashClosings ? mockDb.cashClosings.length : 0) + 1;
    if (!mockDb.cashClosings) mockDb.cashClosings = [];
    mockDb.cashClosings.unshift({
      id,
      closing_date: params[0] || new Date().toISOString().split('T')[0],
      opening_cash: parseFloat(params[1]) || 0,
      cash_collected: parseFloat(params[2]) || 0,
      cash_paid: parseFloat(params[3]) || 0,
      bank_deposited: parseFloat(params[4]) || 0,
      expected_closing: parseFloat(params[5]) || 0,
      actual_closing: parseFloat(params[6]) || 0,
      difference: parseFloat(params[7]) || 0,
      explanation: params[8] || '',
      closed_by: params[9] || 1,
      closed_by_name: 'Accounts Staff',
      status: Math.abs(parseFloat(params[7]) || 0) < 0.01 ? 'MATCHED' : 'DISCREPANCY',
      created_at: new Date().toISOString()
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  // 31. UPDATE Queries
  if (/UPDATE users SET last_login_at = NOW\(\) WHERE id = \?/i.test(cleanSql)) {
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE receipts SET status\s*=/i.test(cleanSql)) {
    const recId = parseInt(params[params.length - 1], 10);
    const r = mockDb.receipts.find(rc => rc.id === recId || rc.receipt_no === String(recId));
    if (r) {
      r.status = params[0];
      r.cancellation_reason = params[1] || '';
      r.cancelled_by = params[2] || 1;
      r.cancelled_at = new Date().toISOString();
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE exam_registrations SET/i.test(cleanSql)) {
    const regId = parseInt(params[params.length - 1], 10);
    const e = mockDb.examRegistrations.find(ex => ex.id === regId || ex.student_id === regId);
    if (e) {
      e.registration_status = params[0] || 'REGISTERED';
      e.payment_status = params[1] || 'PAID';
      e.admit_card_eligible = 1;
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE users SET password_hash = \?/i.test(cleanSql)) {
    const userId = parseInt(params[params.length - 1], 10);
    const u = mockDb.users.find(usr => usr.id === userId);
    if (u) {
      u.password_hash = params[0];
      u.must_change_password = 0;
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE invoices SET paid_amount = \?/i.test(cleanSql)) {
    const invId = parseInt(params[3], 10);
    const inv = mockDb.invoices.find(i => i.id === invId);
    if (inv) {
      inv.paid_amount = parseFloat(params[0]);
      inv.outstanding_amount = parseFloat(params[1]);
      inv.status = params[2];

      const st = mockDb.students.find(s => s.id === inv.student_id);
      if (st) {
        const studentInvoices = mockDb.invoices.filter(i => i.student_id === st.id);
        st.total_paid = studentInvoices.reduce((sum, i) => sum + parseFloat(i.paid_amount || 0), 0);
        st.total_outstanding = studentInvoices.reduce((sum, i) => sum + parseFloat(i.outstanding_amount || 0), 0);
      }
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE payments SET status = 'SUCCESS'/i.test(cleanSql)) {
    const pId = parseInt(params[2], 10);
    const p = mockDb.payments.find(pay => pay.id === pId);
    if (p) {
      p.status = 'SUCCESS';
      p.transaction_id = params[0];
      p.gateway_signature = params[1];
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE notifications SET is_read = 1/i.test(cleanSql)) {
    mockDb.notifications.forEach(n => n.is_read = 1);
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE student_fee_ledgers/i.test(cleanSql)) {
    const lId = parseInt(params[params.length - 1], 10);
    const led = mockDb.ledgers.find(l => l.id === lId);
    if (led) {
      led.amount_paid = parseFloat(params[0]);
      led.outstanding_amount = parseFloat(params[1]);
      led.status = params[2];
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE invoice_items/i.test(cleanSql)) {
    const itId = parseInt(params[params.length - 1], 10);
    const it = mockDb.invoiceItems.find(item => item.id === itId);
    if (it) {
      it.paid_amount = parseFloat(params[0]);
    }
    return [{ affectedRows: 1 }];
  }

  if (/UPDATE students/i.test(cleanSql)) {
    if (/WHERE id = \?/i.test(cleanSql)) {
      const stId = parseInt(params[params.length - 1], 10);
      const st = mockDb.students.find(s => s.id === stId);
      if (st) {
        if (cleanSql.includes('current_semester_id = ?')) {
          st.current_semester_id = parseInt(params[0], 10);
          const sem = mockDb.semesters.find(sm => sm.id === st.current_semester_id);
          if (sem) st.semester_label = sem.label;
        }
      }
    }
    return [{ affectedRows: 1 }];
  }

  // ── Subject Registration Module Mock Handlers ─────────────────────────────

  // SELECT programs
  if (/FROM programs/i.test(cleanSql)) {
    return [[...mockDb.programs]];
  }

  // SELECT departments
  if (/FROM departments/i.test(cleanSql)) {
    let depts = (mockDb.departments || []).map(d => {
      const prog = (mockDb.programs || []).find(p => p.id === d.program_id) || {};
      return { ...d, program_name: prog.name || '' };
    });
    if (/code\s*=\s*\?|short_name\s*=\s*\?/i.test(cleanSql)) {
      const codeParam = String(params[0] || '').toUpperCase();
      depts = depts.filter(d => d.code === codeParam || d.short_name === codeParam);
    }
    if (/program_id\s*=\s*\?/i.test(cleanSql)) {
      const pid = parseInt(params.find(p => Number.isInteger(p) && p > 0));
      if (pid) depts = depts.filter(d => d.program_id === pid);
    }
    if (/WHERE\s+id\s*=\s*\?|WHERE\s+\w+\.id\s*=\s*\?/i.test(cleanSql)) {
      const did = parseInt(params[0]);
      depts = depts.filter(d => d.id === did);
    }
    return [depts];
  }

  // SELECT department_hods
  if (/FROM department_hods/i.test(cleanSql)) {
    let dhs = (mockDb.departmentHods || []).map(dh => {
      const dept = (mockDb.departments || []).find(d => d.id === dh.department_id) || {};
      const hodUser = (mockDb.users || []).find(u => u.id === dh.hod_user_id) || {};
      const hodStaff = (mockDb.staff || []).find(st => st.user_id === dh.hod_user_id) || {};
      return {
        ...dh,
        department_name: dept.name || '',
        department_code: dept.code || '',
        program_id: dept.program_id || 1,
        hod_email: hodUser.email || '',
        hod_name: hodStaff.full_name || ''
      };
    });
    if (/department_id=\?|department_id = \?/i.test(cleanSql)) {
      const did = parseInt(params[0]);
      dhs = dhs.filter(dh => dh.department_id === did);
    }
    if (/hod_user_id=\?|hod_user_id = \?/i.test(cleanSql)) {
      const uid = parseInt(params[0]);
      dhs = dhs.filter(dh => dh.hod_user_id === uid);
    }
    return [dhs];
  }

  // SELECT subjects
  if (/FROM subjects/i.test(cleanSql)) {
    let results = (mockDb.subjects || []).map(s => {
      const dept = (mockDb.departments || []).find(d => d.id === s.department_id) || {};
      const prog = (mockDb.programs || []).find(p => p.id === s.program_id) || {};
      return {
        ...s,
        department_name: dept.name || '',
        department_code: dept.code || '',
        program_name: prog.name || ''
      };
    });

    if (cleanSql.includes('is_active=1') || cleanSql.includes("is_active = 1")) {
      results = results.filter(s => s.is_active === 1);
    }
    const whereMatches = [...cleanSql.matchAll(/(\w+)\s*=\s*\?/g)];
    const paramMap = {};
    whereMatches.forEach((m, idx) => {
      paramMap[m[1].toLowerCase()] = params[idx];
    });

    if (paramMap.department_id !== undefined) {
      const did = parseInt(paramMap.department_id);
      if (did) results = results.filter(s => s.department_id === did);
    }
    if (paramMap.program_id !== undefined) {
      const pid = parseInt(paramMap.program_id);
      if (pid) results = results.filter(s => s.program_id === pid);
    }
    if (paramMap.semester !== undefined) {
      const sem = parseInt(paramMap.semester);
      if (sem) results = results.filter(s => s.semester === sem);
    }
    if (paramMap.type !== undefined) {
      const type = String(paramMap.type);
      if (type) results = results.filter(s => s.type === type);
    }
    if (paramMap.branch !== undefined || paramMap.department_code !== undefined) {
      const branch = String(paramMap.branch || paramMap.department_code);
      if (branch && branch !== 'ALL') results = results.filter(s => s.department_code === branch || s.branch === branch || s.branch === 'ALL');
    }
    if (cleanSql.includes('ORDER BY semester,type,name') || cleanSql.includes('ORDER BY type,name') || cleanSql.includes('ORDER BY sequence')) {
      results.sort((a,b) => (a.sequence || 0) - (b.sequence || 0) || a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    }
    if (/WHERE id IN/i.test(cleanSql)) {
      const ids = params.map(p => parseInt(p));
      results = results.filter(s => ids.includes(s.id));
    }
    if (/WHERE id = \?/i.test(cleanSql) && params.length === 1) {
      results = results.filter(s => s.id === parseInt(params[0]));
    }
    return [results];
  }

  // INSERT INTO subjects
  if (/INSERT INTO subjects/i.test(cleanSql)) {
    const newId = mockDb.subjects.length ? Math.max(...mockDb.subjects.map(s=>s.id)) + 1 : 1;
    // Check if department-structured insert
    if (params.length >= 8) {
      const [code, name, program_id, department_id, semester, year, credits, type, sequence] = params;
      if (mockDb.subjects.find(s => s.code === code)) throw Object.assign(new Error('Duplicate code'), { code: 'ER_DUP_ENTRY' });
      mockDb.subjects.push({
        id: newId,
        code,
        name,
        program_id: parseInt(program_id) || 1,
        department_id: parseInt(department_id) || 1,
        semester: parseInt(semester),
        year: parseInt(year) || Math.ceil(parseInt(semester) / 2),
        credits: parseInt(credits),
        type: type || 'CORE',
        sequence: parseInt(sequence) || 0,
        is_active: 1,
        created_at: new Date().toISOString()
      });
    } else {
      const [code, name, branch, semester, year, credits, type] = params;
      if (mockDb.subjects.find(s => s.code === code)) throw Object.assign(new Error('Duplicate'), { code: 'ER_DUP_ENTRY' });
      mockDb.subjects.push({ id: newId, code, name, branch: branch||'ALL', semester: parseInt(semester), year: parseInt(year)||1, credits: parseInt(credits), type: type||'CORE', program_id: 1, department_id: 1, is_active: 1, created_at: new Date().toISOString() });
    }
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // UPDATE subjects
  if (/UPDATE subjects/i.test(cleanSql)) {
    const id = parseInt(params[params.length-1]);
    const sub = mockDb.subjects.find(s => s.id === id);
    if (sub) {
      if (params[0]) sub.code = params[0];
      if (params[1]) sub.name = params[1];
      if (params[2]) sub.branch = params[2];
      if (params[3]) sub.semester = parseInt(params[3]);
      if (params[4]) sub.year = parseInt(params[4]);
      if (params[5]) sub.credits = parseInt(params[5]);
      if (params[6]) sub.type = params[6];
      if (params[7] !== undefined) sub.is_active = params[7] ? 1 : 0;
    }
    return [{ affectedRows: 1 }];
  }

  // SELECT student_fees
  if (/FROM student_fees/i.test(cleanSql)) {
    let feeRows = [...mockDb.studentFees];
    if (/WHERE.*student_id=\?|WHERE.*student_id = \?/i.test(cleanSql)) {
      const sid = parseInt(params[0]);
      feeRows = feeRows.filter(f => f.student_id === sid);
    }
    if (cleanSql.includes("academic_year='2026-27'") || cleanSql.includes("academic_year = '2026-27'")) {
      feeRows = feeRows.filter(f => f.academic_year === '2026-27');
    }
    // If no fee record found, build from student data
    if (feeRows.length === 0 && params[0]) {
      const sid = parseInt(params[0]);
      const stu = mockDb.students.find(s => s.id === sid);
      if (stu) {
        const stuReceipts = (mockDb.receipts || []).filter(r => r.student_id === sid);
        const rcPaid = stuReceipts.reduce((s, r) => s + parseFloat(r.amount || r.receipt_amount || 0), 0);
        const stuPayments = (mockDb.payments || []).filter(p => p.student_id === sid && (p.status === 'SUCCESS' || !p.status));
        const pPaid = stuPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        const stuInvoices = (mockDb.invoices || []).filter(i => i.student_id === sid);
        const invPaid = stuInvoices.reduce((s, i) => s + parseFloat(i.paid_amount || 0), 0);
        const stuPaid = parseFloat(stu.total_paid || stu.tuition_fee_paid || 0);

        const totalPaid = Math.max(rcPaid, pPaid, invPaid, stuPaid);
        const hostelPaid = parseFloat(stu.hostel_fee_paid || 0);
        feeRows = [{ id: sid, student_id: sid, roll_number: stu.reg_no||'', category: (stu.category||'General').toUpperCase(), is_hosteller: stu.hostel_opted||0, total_fee: 115000, total_paid: totalPaid, hostel_paid: hostelPaid, tuition_paid: totalPaid, exam_fees_paid: 0, backlog_fees_paid: 0, scholarship_amount: 0, academic_year: '2026-27' }];
      }
    }
    return [feeRows];
  }

  // INSERT INTO student_fees
  if (/INSERT INTO student_fees/i.test(cleanSql)) {
    const newId = mockDb.studentFees.length ? Math.max(...mockDb.studentFees.map(f=>f.id)) + 1 : 1;
    const record = { id: newId, student_id: params[0], roll_number: params[1], category: params[2], is_hosteller: params[3], total_fee: params[4], total_paid: params[5], tuition_paid: params[6], hostel_paid: params[7], exam_fees_paid: params[8], backlog_fees_paid: params[9], scholarship_amount: params[10], academic_year: params[11] };
    const existing = mockDb.studentFees.findIndex(f => f.student_id === record.student_id && f.academic_year === record.academic_year);
    if (existing >= 0) {
      mockDb.studentFees[existing] = { ...mockDb.studentFees[existing], ...record, id: mockDb.studentFees[existing].id };
    } else {
      mockDb.studentFees.push(record);
    }
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // SELECT subject_registrations
  if (!cleanSql.toUpperCase().startsWith('DELETE') && /FROM subject_registrations/i.test(cleanSql)) {
    let regs = mockDb.subjectRegistrations.map(r => {
      const stu = mockDb.students.find(s => s.id === r.student_id) || {};
      const dept = mockDb.departments.find(d => d.id === r.department_id) || mockDb.departments.find(d => d.code === stu.branch_code) || mockDb.departments[0];
      const prog = mockDb.programs.find(p => p.id === r.program_id) || mockDb.programs.find(p => p.id === dept.program_id) || mockDb.programs[0];
      const br = mockDb.branches.find(b => b.id === stu.branch_id) || {};
      const sem = mockDb.semesters.find(sm => sm.semester_number === r.semester) || {};
      const hodStaff = mockDb.staff.find(st => st.user_id === r.hod_id);
      const dirStaff = mockDb.staff.find(st => st.user_id === r.director_id);
      const accStaff = mockDb.staff.find(st => st.user_id === r.accounts_id);
      const examStaff = mockDb.staff.find(st => st.user_id === r.exam_section_id) || accStaff || mockDb.staff.find(st => st.user_id === 15);

      // Fee metrics calculation
      const stuPaid = parseFloat(stu.total_paid || 0);
      const feeRequired = prog.id === 1 ? 115000 : (prog.id === 2 ? 60000 : 150000);
      const feePaidPercent = Math.min(100, Math.round((stuPaid / feeRequired) * 100));

      return {
        ...r,
        full_name: stu.full_name || '',
        reg_no: stu.reg_no || '',
        program_id: prog.id,
        program_name: prog.name,
        program_code: prog.code,
        department_id: dept.id,
        department_name: dept.name,
        department_code: dept.code,
        branch_name: br.name || dept.name,
        branch_code: dept.code,
        semester_label: sem.label || `Semester ${r.semester}`,
        student_category: stu.category || 'General',
        hostel_opted: stu.hostel_opted || 0,
        fee_paid_percent: feePaidPercent,
        total_paid: stuPaid,
        total_required: feeRequired,
        hod_name: hodStaff?.full_name || null,
        director_name: dirStaff?.full_name || null,
        accounts_name: accStaff?.full_name || null,
        exam_section_name: examStaff?.full_name || 'Dr. Ramesh Chandra Sahoo',
        exam_fee_amount: r.exam_fee_amount || 1550.00,
        exam_fee_status: r.exam_fee_status || (r.status === 'CONFIRMED' || r.status === 'EXAM_FEE_PAID' ? 'PAID' : 'PENDING'),
        exam_receipt_no: r.exam_receipt_no || (r.status === 'CONFIRMED' ? `EXAM-REC-${r.id}` : null)
      };
    });

    // Filter by student_id and/or id with proper parameter index detection
    const idPos = cleanSql.search(/\b(?:sr\.)?id\s*=\s*\?/i);
    const sidPos = cleanSql.search(/\b(?:sr\.)?student_id\s*=\s*\?/i);

    if (idPos !== -1 && sidPos !== -1) {
      if (idPos < sidPos) {
        const regId = parseInt(params[0]);
        const sid = parseInt(params[1]);
        if (regId) regs = regs.filter(r => r.id === regId);
        if (sid) regs = regs.filter(r => r.student_id === sid);
      } else {
        const sid = parseInt(params[0]);
        const regId = parseInt(params[1]);
        if (sid) regs = regs.filter(r => r.student_id === sid);
        if (regId) regs = regs.filter(r => r.id === regId);
      }
    } else {
      if (sidPos !== -1) {
        const sid = parseInt(params[0]);
        if (sid) regs = regs.filter(r => r.student_id === sid);
      }
      if (idPos !== -1) {
        const regId = parseInt(params[0]);
        if (regId) regs = regs.filter(r => r.id === regId);
      }
    }

    if (/(?:sr\.)?department_id\s*=\s*\?/i.test(cleanSql)) {
      const did = parseInt(params.find(p => Number.isInteger(p) && p > 0));
      if (did) regs = regs.filter(r => r.department_id === did);
    }
    if (/(?:sr\.)?program_id\s*=\s*\?/i.test(cleanSql)) {
      const pid = parseInt(params.find(p => Number.isInteger(p) && p > 0));
      if (pid) regs = regs.filter(r => r.program_id === pid);
    }
    if (/(?:sr\.)?status\s*=\s*\?/i.test(cleanSql)) {
      const stParam = params.find(p => typeof p === 'string' && ['SUBMITTED','HOD_FORWARDED','DIRECTOR_APPROVED','EXAM_FEE_PAID','CONFIRMED','REJECTED','HOD_REVERTED','DIRECTOR_REJECTED'].includes(p));
      if (stParam) regs = regs.filter(r => r.status === stParam);
    } else if (/(?:sr\.)?status\s+IN\s*\(([^)]+)\)/i.test(cleanSql)) {
      const inClause = cleanSql.match(/(?:sr\.)?status\s+IN\s*\(([^)]+)\)/i)[1];
      const allowed = inClause.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      regs = regs.filter(r => allowed.includes(r.status));
    } else {
      if (/status\s*=\s*'SUBMITTED'/i.test(cleanSql)) regs = regs.filter(r => r.status === 'SUBMITTED');
      if (/status\s*=\s*'HOD_FORWARDED'/i.test(cleanSql)) regs = regs.filter(r => r.status === 'HOD_FORWARDED');
      if (/status\s*=\s*'DIRECTOR_APPROVED'/i.test(cleanSql)) regs = regs.filter(r => r.status === 'DIRECTOR_APPROVED');
      if (/status\s*=\s*'EXAM_FEE_PAID'/i.test(cleanSql)) regs = regs.filter(r => r.status === 'EXAM_FEE_PAID');
      if (/status\s*=\s*'CONFIRMED'/i.test(cleanSql)) regs = regs.filter(r => r.status === 'CONFIRMED');
    }

    // Handle NOT IN clause
    if (/status NOT IN/i.test(cleanSql)) {
      const excludes = ['REJECTED','HOD_REVERTED','DIRECTOR_REJECTED'];
      regs = regs.filter(r => !excludes.includes(r.status));
    }
    // Filter by sem, type, academic_year from params
    if (/academic_year\s*=\s*['"]?([^'"\s]+)['"]?/i.test(cleanSql)) {
      const yrMatch = cleanSql.match(/academic_year\s*=\s*['"]([^'"]+)['"]/i);
      const yr = yrMatch ? yrMatch[1] : params.find(p => typeof p === 'string' && p.includes('-'));
      if (yr) regs = regs.filter(r => r.academic_year === yr);
    }
    if (/registration_type\s*=\s*['"]?(\w+)['"]?/i.test(cleanSql) || /registration_type\s*=\s*\?/i.test(cleanSql)) {
      const rtMatch = cleanSql.match(/registration_type\s*=\s*['"](\w+)['"]/i);
      const rt = rtMatch ? rtMatch[1] : params.find(p => p === 'REGULAR' || p === 'BACKLOG');
      if (rt) regs = regs.filter(r => r.registration_type === rt);
    }
    if (/(?:sr\.)?semester\s*=\s*\?/i.test(cleanSql) && !/semester_label/i.test(cleanSql)) {
      let sem = null;
      if (/(?:sr\.)?student_id\s*=\s*\?/i.test(cleanSql) && params.length >= 2) {
        sem = parseInt(params[1]);
      } else {
        sem = params.find(p => Number.isInteger(p) || (!isNaN(parseInt(p)) && p < 10));
      }
      if (sem) regs = regs.filter(r => r.semester === parseInt(sem));
    } else if (/(?:sr\.)?semester\s+IN\s*\(\s*\?\s*,\s*\?\s*\)/i.test(cleanSql)) {
      const semParams = params.filter(p => Number.isInteger(p) && p >= 1 && p <= 8);
      if (semParams.length >= 2) {
        regs = regs.filter(r => semParams.includes(r.semester));
      }
    }

    if (/LIKE \?/i.test(cleanSql)) {
      const terms = params.filter(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
      if (terms.length) {
        const raw = terms[0].replace(/^%|%$/g, '').toLowerCase();
        if (raw) {
          regs = regs.filter(r =>
            (r.full_name && r.full_name.toLowerCase().includes(raw)) ||
            (r.roll_number && r.roll_number.toLowerCase().includes(raw)) ||
            (r.reg_no && r.reg_no.toLowerCase().includes(raw)) ||
            (r.reference_number && r.reference_number.toLowerCase().includes(raw))
          );
        }
      }
    }
    regs.sort((a,b) => b.id - a.id);
    return [regs];
  }

  // INSERT INTO subject_registrations
  if (/INSERT INTO subject_registrations/i.test(cleanSql)) {
    const newId = mockDb.subjectRegistrations.length ? Math.max(...mockDb.subjectRegistrations.map(r=>r.id)) + 1 : 1;
    
    // Parse column names and value tokens from INSERT statement
    const colMatch = cleanSql.match(/INSERT\s+INTO\s+subject_registrations\s*\(([^)]+)\)/i);
    const colNames = colMatch ? colMatch[1].split(',').map(c => c.trim().toLowerCase()) : [];
    const valMatch = cleanSql.match(/VALUES\s*\(([^)]+)\)/i);
    const valTokens = valMatch ? valMatch[1].split(',').map(v => v.trim()) : [];

    const row = { academic_year: '2026-27', registration_type: 'REGULAR', status: 'SUBMITTED' };
    let pIdx = 0;
    colNames.forEach((col, idx) => {
      const token = valTokens[idx];
      if (token === '?') {
        if (params[pIdx] !== undefined) row[col] = params[pIdx++];
      } else if (token) {
        row[col] = token.replace(/^['"]|['"]$/g, '');
      }
    });

    const student_id = parseInt(row.student_id);
    const stu = mockDb.students.find(s => s.id === student_id) || {};
    const resolvedDeptId = parseInt(row.department_id) || (stu.branch_id === 5 ? 3 : (stu.branch_id === 7 ? 5 : 1));
    const dept = mockDb.departments.find(d => d.id === resolvedDeptId) || mockDb.departments[0];
    const resolvedProgId = parseInt(row.program_id) || dept.program_id;
    const refNum = row.reference_number || `REG-2026-${dept.code}-${String(newId).padStart(5, '0')}`;

    const reg = {
      id: newId,
      reference_number: refNum,
      student_id: student_id,
      roll_number: row.roll_number || stu.reg_no || '',
      program_id: resolvedProgId,
      department_id: resolvedDeptId,
      semester: parseInt(row.semester) || 1,
      academic_year: row.academic_year || '2026-27',
      registration_type: row.registration_type || 'REGULAR',
      total_credits: parseInt(row.total_credits) || 0,
      status: row.status || 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      hod_id: null,
      hod_action_at: null,
      hod_remarks: null,
      director_id: null,
      director_action_at: null,
      director_remarks: null,
      accounts_id: null,
      accounts_action_at: null,
      accounts_remarks: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.subjectRegistrations.push(reg);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // UPDATE subject_registrations
  if (/UPDATE subject_registrations/i.test(cleanSql)) {
    const regId = parseInt(params[params.length-1]);
    const reg = mockDb.subjectRegistrations.find(r => r.id === regId);
    if (reg) {
      if (/status\s*=\s*'HOD_FORWARDED'/i.test(cleanSql)) { reg.status = 'HOD_FORWARDED'; reg.hod_id = parseInt(params[0]); reg.hod_remarks = params[1] || null; reg.hod_action_at = new Date().toISOString(); }
      else if (/status\s*=\s*'HOD_REVERTED'/i.test(cleanSql)) { reg.status = 'HOD_REVERTED'; reg.hod_id = parseInt(params[0]); reg.hod_remarks = params[1]; reg.hod_action_at = new Date().toISOString(); }
      else if (/status\s*=\s*'DIRECTOR_APPROVED'/i.test(cleanSql)) { reg.status = 'DIRECTOR_APPROVED'; reg.director_id = parseInt(params[0]); reg.director_remarks = params[1] || null; reg.director_action_at = new Date().toISOString(); }
      else if (/status\s*=\s*'DIRECTOR_REJECTED'/i.test(cleanSql)) { reg.status = 'DIRECTOR_REJECTED'; reg.director_id = parseInt(params[0]); reg.director_remarks = params[1]; reg.director_action_at = new Date().toISOString(); }
      else if (/status\s*=\s*'EXAM_FEE_PAID'/i.test(cleanSql)) {
        reg.status = 'EXAM_FEE_PAID';
        reg.exam_fee_amount = parseFloat(params[0]) || 1550;
        reg.exam_fee_status = 'PAID';
        reg.exam_receipt_no = params[1] || `EXAM-REC-${reg.id}`;
        reg.exam_fee_paid_at = new Date().toISOString();
      }
      else if (/status\s*=\s*'CONFIRMED'/i.test(cleanSql)) {
        reg.status = 'CONFIRMED';
        const offId = parseInt(params[0]) || 15;
        reg.exam_section_id = offId;
        reg.exam_section_remarks = params[1] || 'Verified and marked Received by College Examination Section';
        reg.exam_section_action_at = new Date().toISOString();
        reg.accounts_id = offId;
        reg.accounts_remarks = reg.exam_section_remarks;
        reg.accounts_action_at = reg.exam_section_action_at;
      }
      reg.updated_at = new Date().toISOString();
    }
    return [{ affectedRows: 1 }];
  }

  // SELECT registration_subjects
  if (!cleanSql.toUpperCase().startsWith('DELETE') && /FROM registration_subjects/i.test(cleanSql)) {
    let rSubs = mockDb.registrationSubjects;
    if (/WHERE rs\.registration_id=\?|WHERE registration_id=\?/i.test(cleanSql) || params[0]) {
      const rid = parseInt(params[0]);
      rSubs = rSubs.filter(rs => rs.registration_id === rid);
    }
    // JOIN subjects
    const enriched = rSubs.map(rs => {
      const sub = mockDb.subjects.find(s => s.id === rs.subject_id) || {};
      return { ...sub, ...rs };
    });
    if (/COUNT\(\*\)/i.test(cleanSql)) {
      const tc = enriched.reduce((s, rs) => s + (rs.credits || 0), 0);
      return [[{ cnt: enriched.length, tc, total_credits: tc }]];
    }
    return [enriched];
  }

  // INSERT INTO registration_subjects
  if (/INSERT INTO registration_subjects/i.test(cleanSql)) {
    const newId = mockDb.registrationSubjects.length ? Math.max(...mockDb.registrationSubjects.map(rs=>rs.id)) + 1 : 1;
    const [registration_id, subject_id, is_backlog] = params;
    mockDb.registrationSubjects.push({ id: newId, registration_id: parseInt(registration_id), subject_id: parseInt(subject_id), is_backlog: parseInt(is_backlog), created_at: new Date().toISOString() });
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // INSERT INTO notifications (registration module)
  if (/INSERT INTO notifications/i.test(cleanSql) && /REGISTRATION/i.test(cleanSql)) {
    const newId = mockDb.notifications.length ? Math.max(...mockDb.notifications.map(n=>n.id||0)) + 1 : 1;
    mockDb.notifications.push({ id: newId, user_id: params[0]||null, title: params[1]||'', message: params[2]||'', category: 'REGISTRATION', is_read: 0, created_at: new Date().toISOString() });
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // SELECT scholarships for registration eligibility
  if (/FROM scholarships.*WHERE student_id=\?/i.test(cleanSql) || /FROM scholarships.*WHERE.*student_id = \?/i.test(cleanSql)) {
    const sid = parseInt(params[0]);
    // No scholarship records in mock — return 0
    return [[{ sch: 0, total_scholarship: 0 }]];
  }

  // DELETE registration tables
  if (/DELETE FROM subject_registrations/i.test(cleanSql)) {
    mockDb.subjectRegistrations = [];
    return [{ affectedRows: 1 }];
  }
  if (/DELETE FROM registration_subjects/i.test(cleanSql)) {
    mockDb.registrationSubjects = [];
    return [{ affectedRows: 1 }];
  }

  // SELECT registration_windows
  if (/FROM registration_windows/i.test(cleanSql)) {
    let windows = [...(mockDb.registrationWindows || [])];
    if (/WHERE.*semester\s*=\s*\?/i.test(cleanSql)) {
      const sem = parseInt(params[0]);
      windows = windows.filter(w => w.semester === sem);
    }
    return [windows];
  }

  // UPDATE registration_windows
  if (/UPDATE registration_windows/i.test(cleanSql)) {
    const semMatch = cleanSql.match(/WHERE.*semester\s*=\s*(\d+|\?)/i);
    let targetSem = null;
    if (semMatch) {
      targetSem = semMatch[1] === '?' ? parseInt(params[params.length - 1]) : parseInt(semMatch[1]);
    }
    const win = (mockDb.registrationWindows || []).find(w => w.semester === targetSem);
    if (win) {
      if (/is_open\s*=\s*\?/i.test(cleanSql) || /is_open\s*=\s*(\d+)/i.test(cleanSql)) {
        const isOpenVal = params[0] !== undefined ? (parseInt(params[0]) ? 1 : 0) : (cleanSql.includes('is_open = 1') ? 1 : 0);
        win.is_open = isOpenVal;
        win.status = isOpenVal ? 'OPEN' : 'LOCKED';
      }
    }
    return [{ affectedRows: 1 }];
  }

  // INSERT INTO receipts
  if (/INSERT INTO receipts/i.test(cleanSql)) {
    const newId = mockDb.receipts.length ? Math.max(...mockDb.receipts.map(r => r.id || 0)) + 1 : 1;
    const [receipt_no, student_id, amount, payment_mode, semester, remarks, created_by] = params;
    const rObj = {
      id: newId,
      receipt_no: receipt_no || `REC-${newId}`,
      student_id: parseInt(student_id),
      amount: parseFloat(amount) || 1550,
      receipt_amount: parseFloat(amount) || 1550,
      payment_mode: payment_mode || 'ONLINE',
      payment_method: payment_mode || 'Online Gateway',
      semester: semester || 'Semester 2',
      remarks: remarks || 'Gen-Z Semester Examination & Board Fee',
      created_by: created_by || 1,
      created_at: new Date().toISOString()
    };
    mockDb.receipts.push(rObj);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // INSERT INTO payments
  if (/INSERT INTO payments/i.test(cleanSql)) {
    const newId = mockDb.payments.length ? Math.max(...mockDb.payments.map(p => p.id || 0)) + 1 : 1;
    const [payment_no, student_id, amount, payment_method, transaction_id, status, idempotency_key] = params;
    const pObj = {
      id: newId,
      payment_no: payment_no || `PAY-${newId}`,
      student_id: parseInt(student_id),
      amount: parseFloat(amount) || 1550,
      payment_method: payment_method || 'ONLINE_PORTAL',
      transaction_id: transaction_id || `TXN-${Date.now()}`,
      status: status || 'SUCCESS',
      idempotency_key: idempotency_key || `key_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockDb.payments.push(pObj);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  // Generic fallback for any other unhandled queries
  return [[], {}];
}


module.exports = {
  getPool,
  query,
  getConnection,
  withTransaction,
  testConnection,
  dbConfig
};
