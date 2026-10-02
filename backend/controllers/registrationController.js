/**
 * Department-Wise Subject Registration Controller
 * BPUT College Structure: Program + Department + Semester
 * Multi-Level Workflow: Student → HOD (Department) → Director (All) → Accounts (Finalize) → CONFIRMED
 * Every action is timestamped, reference-numbered, and audit logged.
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../services/auditService');
const paymentService = require('../services/paymentService');

// Credit Rules
const MIN_CREDITS = 20;
const MAX_CREDITS = 28;

// BPUT Real Fee Structure Map
const BPUT_PROGRAM_FEES = {
  1: { // B.Tech (4 years, 8 semesters)
    name: 'B.Tech',
    code: 'BTECH',
    totalAnnualFee: 115000,
    tuitionMisc: 70000,
    hostelAnnual: 45000,
    examFeePerSem: 1550,
    backlogFeePerSubject: 500
  },
  2: { // Diploma (3 years, 6 semesters)
    name: 'Diploma',
    code: 'DIP',
    totalAnnualFee: 60000,
    tuitionMisc: 45000,
    hostelAnnual: 15000,
    examFeePerSem: 1000,
    backlogFeePerSubject: 500
  },
  3: { // MBA (2 years, 4 semesters)
    name: 'MBA',
    code: 'MBA',
    totalAnnualFee: 150000,
    tuitionMisc: 100000,
    hostelAnnual: 50000,
    examFeePerSem: 2000,
    backlogFeePerSubject: 500
  }
};

/**
 * Calculate BPUT Real Category and Semester Fee Eligibility
 */
function calcBputEligibility(feeData, programId, semester) {
  const pFee = BPUT_PROGRAM_FEES[programId] || BPUT_PROGRAM_FEES[1];
  const cat = String(feeData.category || feeData.student_category || 'GENERAL').toUpperCase();
  const isHosteller = Boolean(feeData.is_hosteller || feeData.hostel_opted);
  const totalPaid = parseFloat(feeData.total_paid) || 0;
  const hostelPaid = parseFloat(feeData.hostel_paid) || 0;
  const schAmt = parseFloat(feeData.scholarship_amount) || 0;
  const isScholarshipStudent = ['SC', 'ST'].includes(cat) || schAmt > 0;

  let eligible = true;
  const checks = [];

  // Determine if 1st semester (odd / initial) or 2nd semester (even / annual close)
  const isFirstTerm = (semester % 2) !== 0 || semester === 1;

  if (isScholarshipStudent) {
    // SC / ST / Scholarship: Tuition covered by Government scholarship
    checks.push({
      label: 'Tuition Fee (Govt Scholarship)',
      required: 0,
      paid: pFee.tuitionMisc,
      ok: true,
      note: '100% Tuition covered under Post-Matric / State Scholarship'
    });

    if (isHosteller) {
      const requiredHostel = isFirstTerm ? (pFee.hostelAnnual * 0.5) : pFee.hostelAnnual;
      const ok = hostelPaid >= requiredHostel;
      if (!ok) eligible = false;
      checks.push({
        label: `Hostel Fee (${isFirstTerm ? '50%' : '100%'} Required: ₹${requiredHostel.toLocaleString('en-IN')})`,
        required: requiredHostel,
        paid: hostelPaid,
        ok,
        note: ok ? 'Hostel fee threshold satisfied' : 'Outstanding hostel dues'
      });
    }
  } else {
    // General / OBC: 50% for 1st sem, 100% for 2nd sem
    const requiredTotal = isFirstTerm ? (pFee.totalAnnualFee * 0.5) : pFee.totalAnnualFee;
    const ok = totalPaid >= requiredTotal;
    if (!ok) eligible = false;
    checks.push({
      label: `Total Annual Fee (${isFirstTerm ? '50%' : '100%'} Required: ₹${requiredTotal.toLocaleString('en-IN')})`,
      required: requiredTotal,
      paid: totalPaid,
      ok,
      note: ok ? 'Fee requirement cleared' : 'Dues outstanding for semester'
    });

    if (isHosteller) {
      const requiredHostel = isFirstTerm ? (pFee.hostelAnnual * 0.5) : pFee.hostelAnnual;
      const okH = hostelPaid >= requiredHostel;
      if (!okH) eligible = false;
      checks.push({
        label: `Hostel Dues (${isFirstTerm ? '50%' : '100%'}: ₹${requiredHostel.toLocaleString('en-IN')})`,
        required: requiredHostel,
        paid: hostelPaid,
        ok: okH,
        note: okH ? 'Hostel clear' : 'Hostel dues pending'
      });
    }
  }

  const feePaidPercent = Math.min(100, Math.round((totalPaid / pFee.totalAnnualFee) * 100));

  return {
    eligible,
    checks,
    category: cat,
    isHosteller,
    isScholarshipStudent,
    totalPaid,
    hostelPaid,
    scholarshipAmount: schAmt,
    totalAnnualFee: pFee.totalAnnualFee,
    tuitionFee: pFee.tuitionMisc,
    hostelAnnual: pFee.hostelAnnual,
    examFeePerSem: pFee.examFeePerSem,
    backlogFeePerSubject: pFee.backlogFeePerSubject,
    feePaidPercent
  };
}

/**
 * Fetch Aggregated Fee Data for Student
 */
async function getStudentFeeData(studentId) {
  const [sf] = await query(
    `SELECT * FROM student_fees WHERE student_id = ? AND academic_year = '2026-27' LIMIT 1`,
    [studentId]
  );

  const [s] = await query(
    `SELECT s.*, b.code AS branch_code, b.name AS branch_name
     FROM students s
     JOIN branches b ON s.branch_id = b.id
     WHERE s.id = ? LIMIT 1`,
    [studentId]
  );
  const [sc] = await query(
    `SELECT COALESCE(SUM(value),0) AS sch FROM scholarships WHERE student_id = ? AND status = 'ACTIVE'`,
    [studentId]
  );

  const stu = s[0] || {};
  const feeRec = sf[0] || {};

  const totalPaid = Math.max(
    parseFloat(feeRec.total_paid || 0),
    parseFloat(stu.total_paid || 0),
    parseFloat(stu.tuition_fee_paid || 0)
  );

  const hostelPaid = Math.max(
    parseFloat(feeRec.hostel_paid || 0),
    parseFloat(stu.hostel_fee_paid || 0)
  );

  const progId = stu.course_id || feeRec.course_id || 1;
  const pFee = BPUT_PROGRAM_FEES[progId] || BPUT_PROGRAM_FEES[1];

  return {
    total_paid: totalPaid,
    hostel_paid: hostelPaid,
    category: stu.category || feeRec.category || 'General',
    is_hosteller: Boolean(stu.hostel_opted || feeRec.is_hosteller),
    scholarship_amount: parseFloat(sc[0]?.sch || 0),
    total_fee: pFee.totalAnnualFee,
    course_id: progId,
    branch_id: stu.branch_id || feeRec.branch_id || 1
  };
}

/**
 * Generate Reference Number: REG-YYYY-DEPT-XXXXX
 */
function generateReferenceNumber(deptCode, id) {
  const cleanDept = String(deptCode || 'GEN').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `REG-2026-${cleanDept}-${String(id).padStart(5, '0')}`;
}

// =============================================================================
// CONTROLLER HANDLERS
// =============================================================================

/**
 * 1. GET /api/registration/metadata
 * Returns Programs and Departments
 */
async function getProgramsAndDepartments(req, res) {
  try {
    const [programs] = await query(`SELECT * FROM programs ORDER BY id ASC`);
    const [departments] = await query(`SELECT * FROM departments WHERE is_active = 1 ORDER BY program_id, id ASC`);
    return success(res, { programs, departments }, 'Programs and departments loaded.');
  } catch (err) {
    return error(res, 'Failed to fetch academic metadata.', 500);
  }
}

/**
 * 2. GET /api/registration/eligibility
 * Student checks own eligibility
 */
async function getEligibility(req, res) {
  try {
    const sid = req.user.studentId;
    if (!sid) return error(res, 'Student account record not found.', 404);

    const [stuRows] = await query(
      `SELECT s.*, c.name AS course_name, c.code AS course_code,
              b.code AS branch_code, b.name AS branch_name
       FROM students s
       JOIN courses c ON s.course_id = c.id
       JOIN branches b ON s.branch_id = b.id
       WHERE s.id = ? LIMIT 1`,
      [sid]
    );

    const student = stuRows[0] || {};
    const progId = student.course_id || 1;
    const defaultSem = req.user.student?.current_semester_id || student.current_semester_id || 1;
    const sem = req.query.semester ? parseInt(req.query.semester) : defaultSem;

    // Resolve Department
    const [deptRows] = await query(
      `SELECT * FROM departments WHERE code = ? OR short_name = ? LIMIT 1`,
      [student.branch_code, student.branch_code]
    );
    const department = deptRows[0] || { id: 1, code: 'CSE', name: 'Computer Science & Engineering' };

    const fee = await getStudentFeeData(sid);
    const elig = calcBputEligibility(fee, progId, sem);

    // Check Registration Window set by Examination Section
    const [winRows] = await query(
      `SELECT * FROM registration_windows WHERE semester = ? LIMIT 1`,
      [sem]
    );
    const semWindow = (winRows && winRows[0]) ? winRows[0] : { is_open: (sem <= 2 ? 1 : 0), status: (sem <= 2 ? 'OPEN' : 'LOCKED') };
    const isWindowOpen = sem === 1 || Boolean(semWindow.is_open);

    // Prerequisite: Check if previous semester registration was completed
    let isPreviousSemCompleted = true;
    let previousSemLockReason = null;
    if (sem > 1) {
      if (sem === 2) {
        // Semester 1 registration is officially completed at admission onboarding
        isPreviousSemCompleted = true;
      } else {
        const prevSem = sem - 1;
        const [prevReg] = await query(
          `SELECT id, status, reference_number FROM subject_registrations 
           WHERE student_id = ? AND semester = ? AND registration_type = 'REGULAR' LIMIT 1`,
          [sid, prevSem]
        );
        if (!prevReg.length || prevReg[0].status !== 'CONFIRMED') {
          isPreviousSemCompleted = false;
          const prevStatus = prevReg.length ? prevReg[0].status : 'NOT_APPLIED';
          previousSemLockReason = `Previous Semester ${prevSem} registration is incomplete (${prevStatus === 'NOT_APPLIED' ? 'not registered' : prevStatus}). You must complete Semester ${prevSem} registration and Exam Section verification before registering for Semester ${sem}.`;
          elig.eligible = false;
          elig.reasons = elig.reasons || [];
          elig.reasons.push(previousSemLockReason);
        }
      }
    }

    if (!isWindowOpen && sem > 1) {
      elig.eligible = false;
      elig.reasons = elig.reasons || [];
      elig.reasons.push(`Registration Window for Semester ${sem} is currently CLOSED by Examination Section.`);
    }

    // Check existing registration for this specific student and semester
    const [reg] = await query(
      `SELECT * FROM subject_registrations
       WHERE student_id = ? AND academic_year = '2026-27' AND semester = ? AND registration_type = 'REGULAR'
       ORDER BY id DESC LIMIT 1`,
      [sid, sem]
    );

    let existingReg = reg[0] || null;

    // Semester 1 auto-enrollment at admission
    if (sem === 1 && !existingReg) {
      existingReg = {
        id: 10000 + sid,
        student_id: sid,
        roll_number: student.reg_no,
        program_id: progId,
        department_id: department.id,
        semester: 1,
        academic_year: '2026-27',
        registration_type: 'REGULAR',
        total_credits: 22,
        status: 'CONFIRMED',
        is_admission_registered: 1,
        reference_number: `ADM-2026-${department.code || 'CSE'}-${String(sid).padStart(4, '0')}`,
        exam_fee_status: 'PAID',
        exam_fee_amount: 1550,
        exam_receipt_no: `EXAM-REC-ADM-${sid}`,
        hod_name: 'Admissions & Department Head',
        director_name: 'Director of Academics',
        exam_section_name: 'Dr. Ramesh Chandra Sahoo',
        submitted_at: '2026-07-15T10:00:00.000Z',
        hod_action_at: '2026-07-16T11:00:00.000Z',
        director_action_at: '2026-07-17T12:00:00.000Z',
        exam_section_action_at: '2026-07-18T14:00:00.000Z',
        subjects: [
          { id: 101, code: 'BS101', name: 'Engineering Mathematics-I', credits: 4, type: 'CORE' },
          { id: 102, code: 'BS102', name: 'Engineering Physics', credits: 4, type: 'CORE' },
          { id: 103, code: 'ES101', name: 'Basic Electrical Engineering', credits: 4, type: 'CORE' },
          { id: 104, code: 'ES102', name: 'Engineering Graphics & Design', credits: 3, type: 'CORE' },
          { id: 105, code: 'BS103L', name: 'Physics Laboratory', credits: 1.5, type: 'LAB' },
          { id: 106, code: 'ES103L', name: 'Basic Electrical Engineering Lab', credits: 1.5, type: 'LAB' },
          { id: 107, code: 'ES104L', name: 'Workshop Practices', credits: 2, type: 'LAB' },
          { id: 108, code: 'MC101', name: 'Induction Program & Ethics', credits: 2, type: 'CORE' }
        ]
      };
    }
    if (existingReg) {
      const [subs] = await query(
        `SELECT s.*, rs.is_backlog
         FROM registration_subjects rs
         JOIN subjects s ON s.id = rs.subject_id
         WHERE rs.registration_id = ?`,
        [existingReg.id]
      );
      existingReg.subjects = subs || [];

      if (existingReg.hod_id) {
        const [h] = await query(`SELECT full_name FROM staff WHERE user_id = ? LIMIT 1`, [existingReg.hod_id]);
        if (h && h[0]) existingReg.hod_name = h[0].full_name;
      }
      if (existingReg.director_id) {
        const [d] = await query(`SELECT full_name FROM staff WHERE user_id = ? LIMIT 1`, [existingReg.director_id]);
        if (d && d[0]) existingReg.director_name = d[0].full_name;
      }
      if (existingReg.accounts_id) {
        const [a] = await query(`SELECT full_name FROM staff WHERE user_id = ? LIMIT 1`, [existingReg.accounts_id]);
        if (a && a[0]) existingReg.accounts_name = a[0].full_name;
      }
      if (existingReg.exam_section_id) {
        const [e] = await query(`SELECT full_name FROM staff WHERE user_id = ? LIMIT 1`, [existingReg.exam_section_id]);
        if (e && e[0]) existingReg.exam_section_name = e[0].full_name;
      }
      if (!existingReg.exam_section_name) {
        existingReg.exam_section_name = existingReg.accounts_name || 'Dr. Ramesh Chandra Sahoo';
      }
    }

    return success(res, {
      studentId: sid,
      rollNumber: student.reg_no,
      fullName: student.full_name,
      student: {
        id: sid,
        roll_number: student.reg_no,
        full_name: student.full_name,
        category: student.category || 'General',
        is_hosteller: Boolean(student.hostel_opted),
        program: { id: progId, name: student.course_name, code: student.course_code },
        department: { id: department.id, name: department.name, code: department.code },
        semester: sem,
      },
      program: { id: progId, name: student.course_name, code: student.course_code },
      department: { id: department.id, name: department.name, code: department.code },
      semester: sem,
      academicYear: '2026-27',
      eligibility: elig,
      existingRegistration: existingReg,
      isPreviousSemCompleted,
      previousSemLockReason,
      windowStatus: {
        isOpen: isWindowOpen,
        status: semWindow.status || (isWindowOpen ? 'OPEN' : 'LOCKED'),
        autoEnrolled: sem === 1,
        isPreviousSemCompleted,
        previousSemLockReason,
        message: sem === 1
          ? 'Semester 1 registration was officially completed during admission onboarding.'
          : (!isPreviousSemCompleted
            ? previousSemLockReason
            : (isWindowOpen
              ? `Semester ${sem} Subject Registration window is currently OPEN.`
              : `Semester ${sem} Subject Registration window is currently LOCKED by College Examination Section.`))
      }
    }, 'Eligibility verified.');
  } catch (err) {
    console.error('[getEligibility Error]', err);
    return error(res, 'Failed to check eligibility.', 500);
  }
}

/**
 * 3. GET /api/registration/subjects
 * Fetch subjects filtered by Department, Program, Semester
 */
async function getSubjects(req, res) {
  try {
    const sem = parseInt(req.query.semester) || 1;
    const deptId = req.query.department_id ? parseInt(req.query.department_id) : null;
    const progId = req.query.program_id ? parseInt(req.query.program_id) : null;
    const branch = req.query.branch || null;

    let sql = `SELECT * FROM subjects WHERE semester = ? AND is_active = 1`;
    const params = [sem];

    if (deptId) {
      sql += ` AND department_id = ?`;
      params.push(deptId);
    } else if (branch) {
      sql += ` AND (department_code = ? OR branch = ? OR branch = 'ALL')`;
      params.push(branch, branch);
    }

    if (progId) {
      sql += ` AND program_id = ?`;
      params.push(progId);
    }

    let [rows] = await query(sql, params);

    // If no subjects found specifically for this department in semester 1 or 2, fallback to standard B.Tech foundation syllabus (CSE/General)
    if ((!rows || !rows.length) && (sem === 1 || sem === 2)) {
      const [fallback] = await query(
        `SELECT * FROM subjects WHERE semester = ? AND is_active = 1 AND program_id = ? AND department_id = 1 ORDER BY sequence ASC`,
        [sem, progId || 1]
      );
      if (fallback && fallback.length) rows = fallback;
    }

    const grouped = { CORE: [], ELECTIVE: [], LAB: [] };
    for (const r of rows) {
      if (grouped[r.type]) grouped[r.type].push(r);
    }

    return success(res, { subjects: rows, grouped, total: rows.length }, 'Subjects loaded.');
  } catch (err) {
    return error(res, 'Failed to fetch subjects catalog.', 500);
  }
}

/**
 * 4. POST /api/registration/submit
 * Student registers for subjects -> auto-routed to Department HOD
 */
async function submitRegistration(req, res) {
  try {
    const sid = req.user.studentId;
    if (!sid) return error(res, 'Student account record not found.', 404);

    const { subjectIds, registrationType = 'REGULAR' } = req.body;
    if (!subjectIds || !Array.isArray(subjectIds) || !subjectIds.length) {
      return error(res, 'Select at least one subject to register.', 400);
    }

    const [stuRows] = await query(
      `SELECT s.*, b.code AS branch_code FROM students s JOIN branches b ON s.branch_id = b.id WHERE s.id = ? LIMIT 1`,
      [sid]
    );
    const student = stuRows[0] || {};
    const sem = req.body.semester ? parseInt(req.body.semester) : (student.current_semester_id || 1);
    const progId = student.course_id || 1;

    // Resolve Department
    const [deptRows] = await query(
      `SELECT * FROM departments WHERE code = ? OR short_name = ? LIMIT 1`,
      [student.branch_code, student.branch_code]
    );
    const dept = deptRows[0] || { id: 1, code: 'CSE', name: 'Computer Science & Engineering', program_id: 1 };

    // Fee eligibility check
    const fee = await getStudentFeeData(sid);
    const elig = calcBputEligibility(fee, progId, sem);
    if (!elig.eligible && registrationType === 'REGULAR') {
      return error(res, 'Fee eligibility criteria not met. Please clear required dues first.', 403);
    }

    // 1. Examination Section Window Check
    if (sem > 1 && registrationType === 'REGULAR') {
      const [winRows] = await query(`SELECT * FROM registration_windows WHERE semester = ? LIMIT 1`, [sem]);
      const semWindow = (winRows && winRows[0]) ? winRows[0] : { is_open: (sem <= 2 ? 1 : 0) };
      if (!semWindow.is_open) {
        return error(res, `Registration window for Semester ${sem} is currently CLOSED by College Examination Section.`, 403);
      }
    }

    // 2. Prerequisite Check: Previous Semester must be CONFIRMED
    if (sem > 2 && registrationType === 'REGULAR') {
      const prevSem = sem - 1;
      const [prevReg] = await query(
        `SELECT id, status FROM subject_registrations WHERE student_id = ? AND semester = ? AND registration_type = 'REGULAR' LIMIT 1`,
        [sid, prevSem]
      );
      if (!prevReg.length || prevReg[0].status !== 'CONFIRMED') {
        return error(res, `Previous Semester ${prevSem} registration must be completed and confirmed before applying for Semester ${sem}.`, 400);
      }
    }

    // Check existing registration
    const [exist] = await query(
      `SELECT id FROM subject_registrations
       WHERE student_id = ? AND academic_year = '2026-27' AND semester = ? AND registration_type = ?
         AND status NOT IN ('REJECTED', 'HOD_REVERTED', 'DIRECTOR_REJECTED')`,
      [sid, sem, registrationType]
    );
    if (exist.length) {
      return error(res, `An active ${registrationType} registration (#${exist[0].id}) already exists.`, 409);
    }

    // Validate subjects
    const ph = subjectIds.map(() => '?').join(',');
    const [subs] = await query(`SELECT * FROM subjects WHERE id IN (${ph}) AND is_active = 1`, subjectIds);
    if (subs.length !== subjectIds.length) {
      return error(res, 'One or more invalid or inactive subjects selected.', 400);
    }

    const totalCredits = subs.reduce((sum, s) => sum + (s.credits || 0), 0);
    if (registrationType === 'REGULAR' && (totalCredits < MIN_CREDITS || totalCredits > MAX_CREDITS)) {
      return error(res, `Total credits (${totalCredits}) must be within BPUT range ${MIN_CREDITS}–${MAX_CREDITS}.`, 400);
    }

    const rollNo = student.reg_no || '';

    // Auto-route lookup: Find assigned HOD for this department
    const [hodAssign] = await query(
      `SELECT hod_user_id FROM department_hods WHERE department_id = ? LIMIT 1`,
      [dept.id]
    );
    const assignedHodUserId = hodAssign[0]?.hod_user_id || null;

    // Insert Subject Registration
    const [ins] = await query(
      `INSERT INTO subject_registrations
       (student_id, roll_number, program_id, department_id, semester, academic_year, registration_type, total_credits, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, '2026-27', ?, ?, 'SUBMITTED', NOW())`,
      [sid, rollNo, progId, dept.id, sem, registrationType, totalCredits]
    );

    const regId = ins.insertId;
    const refNum = generateReferenceNumber(dept.code, regId);

    // Save Reference Number
    await query(`UPDATE subject_registrations SET reference_number = ? WHERE id = ?`, [refNum, regId]).catch(() => {});

    // Save Subjects
    for (const subId of subjectIds) {
      await query(
        `INSERT INTO registration_subjects (registration_id, subject_id, is_backlog) VALUES (?, ?, ?)`,
        [regId, subId, registrationType === 'BACKLOG' ? 1 : 0]
      );
    }

    // Notify HOD
    if (assignedHodUserId) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [assignedHodUserId, 'New Registration Pending', `Student ${rollNo} submitted registration ${refNum}.`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'REGISTRATION_SUBMITTED',
      module: 'SUBJECT_REGISTRATION',
      recordId: regId,
      newValue: {
        referenceNumber: refNum,
        programId: progId,
        departmentId: dept.id,
        departmentCode: dept.code,
        semester: sem,
        credits: totalCredits,
        subjectCount: subjectIds.length
      }
    });

    return success(res, {
      registrationId: regId,
      referenceNumber: refNum,
      status: 'SUBMITTED',
      department: dept.name,
      totalCredits,
      subjectCount: subjectIds.length
    }, `Registration ${refNum} submitted. Auto-routed to ${dept.name} HOD.`, 201);
  } catch (err) {
    console.error('[submitRegistration Error]', err);
    return error(res, 'Failed to submit subject registration.', 500);
  }
}

/**
 * 5. GET /api/registration/my
 * Student view their registrations with timeline audit
 */
async function getMyRegistrations(req, res) {
  try {
    const sid = req.user.studentId;
    if (!sid) return error(res, 'Student account record not found.', 404);

    const [rows] = await query(
      `SELECT sr.*,
              hs.full_name AS hod_name, ds.full_name AS director_name, acs.full_name AS accounts_name
       FROM subject_registrations sr
       LEFT JOIN staff hs ON hs.user_id = sr.hod_id
       LEFT JOIN staff ds ON ds.user_id = sr.director_id
       LEFT JOIN staff acs ON acs.user_id = sr.accounts_id
       WHERE sr.student_id = ?
       ORDER BY sr.id DESC`,
      [sid]
    );

    const enriched = await Promise.all(
      rows.map(async (r) => {
        const [subs] = await query(
          `SELECT s.*, rs.is_backlog
           FROM registration_subjects rs
           JOIN subjects s ON s.id = rs.subject_id
           WHERE rs.registration_id = ?`,
          [r.id]
        );
        return { ...r, subjects: subs };
      })
    );

    return success(res, { registrations: enriched, total: enriched.length }, 'Registrations loaded.');
  } catch (err) {
    return error(res, 'Failed to fetch registrations.', 500);
  }
}

/**
 * 6. GET /api/registration/hod/registrations
 * HOD Queue: Department-Scoped!
 * HOD sees ONLY students of their assigned department.
 */
async function hodGetRegistrations(req, res) {
  try {
    const hodUserId = req.user.id;
    const isSuperAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    // Resolve assigned department for this HOD
    const [assign] = await query(
      `SELECT dh.*, d.code AS dept_code, d.name AS dept_name
       FROM department_hods dh
       JOIN departments d ON d.id = dh.department_id
       WHERE dh.hod_user_id = ? LIMIT 1`,
      [hodUserId]
    );

    let assignedDeptId = assign[0]?.department_id || 1;
    let deptName = assign[0]?.dept_name || 'Computer Science & Engineering';

    // Allow Admin override if provided in query
    if (isSuperAdmin && req.query.department_id) {
      assignedDeptId = parseInt(req.query.department_id);
    }

    const { semester, year, status, search } = req.query;

    let sql = `SELECT sr.*, s.full_name, s.reg_no, s.category AS student_category,
                      s.hostel_opted, COALESCE(sf.total_paid, 0) AS student_total_paid,
                      sem.label AS semester_label
               FROM subject_registrations sr
               JOIN students s ON s.id = sr.student_id
               LEFT JOIN student_fees sf ON sf.student_id = s.id
               JOIN semesters sem ON sem.semester_number = sr.semester
               WHERE sr.department_id = ?`;
    const params = [assignedDeptId];

    if (semester) {
      sql += ` AND sr.semester = ?`;
      params.push(parseInt(semester));
    }
    if (year) {
      sql += ` AND sr.academic_year = ?`;
      params.push(year);
    }
    if (status) {
      sql += ` AND sr.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (LOWER(s.full_name) LIKE ? OR LOWER(sr.roll_number) LIKE ? OR LOWER(sr.reference_number) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY sr.submitted_at DESC`;

    const [rows] = await query(sql, params);

    // Compute stats cards
    const [allDeptRows] = await query(
      `SELECT status FROM subject_registrations WHERE department_id = ?`,
      [assignedDeptId]
    );

    const stats = {
      total: allDeptRows.length,
      pending: allDeptRows.filter(r => r.status === 'SUBMITTED').length,
      forwarded: allDeptRows.filter(r => ['HOD_FORWARDED', 'DIRECTOR_APPROVED', 'CONFIRMED'].includes(r.status)).length,
      reverted: allDeptRows.filter(r => r.status === 'HOD_REVERTED').length
    };

    return success(res, {
      department: { id: assignedDeptId, name: deptName },
      stats,
      registrations: rows,
      total: rows.length
    }, 'Department queue loaded.');
  } catch (err) {
    console.error('[hodGetRegistrations Error]', err);
    return error(res, 'Failed to fetch HOD registrations.', 500);
  }
}

/**
 * 7. GET /api/registration/hod/:id
 * HOD Registration Detail View
 */
async function hodGetDetail(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const [rows] = await query(
      `SELECT sr.*, s.full_name, s.reg_no, s.category AS student_category,
              s.hostel_opted, s.phone, s.photo_url, b.name AS branch_name, b.code AS branch_code,
              sem.label AS semester_label, c.name AS course_name,
              d.name AS department_name, d.code AS department_code,
              hs.full_name AS hod_name,
              ds.full_name AS director_name,
              acs.full_name AS accounts_name,
              exs.full_name AS exam_section_name
       FROM subject_registrations sr
       JOIN students s ON s.id = sr.student_id
       JOIN branches b ON b.id = s.branch_id
       JOIN semesters sem ON sem.semester_number = sr.semester
       JOIN courses c ON c.id = s.course_id
       JOIN departments d ON d.id = sr.department_id
       LEFT JOIN staff hs ON hs.user_id = sr.hod_id
       LEFT JOIN staff ds ON ds.user_id = sr.director_id
       LEFT JOIN staff acs ON acs.user_id = sr.accounts_id
       LEFT JOIN staff exs ON exs.user_id = sr.exam_section_id
       WHERE sr.id = ? LIMIT 1`,
      [rid]
    );

    if (!rows.length) return error(res, 'Registration application not found.', 404);

    const [subs] = await query(
      `SELECT s.*, rs.is_backlog
       FROM registration_subjects rs
       JOIN subjects s ON s.id = rs.subject_id
       WHERE rs.registration_id = ?
       ORDER BY rs.is_backlog ASC, s.code ASC`,
      [rid]
    );

    const fee = await getStudentFeeData(rows[0].student_id);
    const elig = calcBputEligibility(fee, rows[0].program_id || 1, rows[0].semester);

    // Fetch recent student payment history
    const [payments] = await query(
      `SELECT p.id, p.payment_no, p.amount, p.payment_method, p.transaction_id, p.status, p.created_at, r.receipt_no
       FROM payments p
       LEFT JOIN receipts r ON r.payment_id = p.id
       WHERE p.student_id = ? AND p.status = 'SUCCESS'
       ORDER BY p.created_at DESC LIMIT 5`,
      [rows[0].student_id]
    );

    // Compute complete financial summary
    const totalCollegeFee = parseFloat(fee.total_fee || 115000);
    const totalCollegePaid = parseFloat(fee.total_paid || 0);
    const collegeBalanceDue = Math.max(0, totalCollegeFee - totalCollegePaid);
    const clearancePercent = totalCollegeFee > 0 ? Math.min(100, Math.round((totalCollegePaid / totalCollegeFee) * 100)) : 100;
    const examFee = parseFloat(rows[0].exam_fee_amount || 1550);
    const isExamPaid = rows[0].exam_fee_status === 'PAID' || rows[0].status === 'CONFIRMED';
    const totalPaidOverall = totalCollegePaid + (isExamPaid ? examFee : 0);

    const financialSummary = {
      totalCollegeFee,
      totalCollegePaid,
      collegeBalanceDue,
      clearancePercent,
      examFeeAmount: examFee,
      examFeeStatus: isExamPaid ? 'PAID' : (rows[0].exam_fee_status || 'PENDING'),
      examReceiptNo: rows[0].exam_receipt_no || (isExamPaid ? `EXAM-REC-2026-${String(rid).padStart(4, '0')}` : null),
      examFeePaidAt: rows[0].exam_fee_paid_at || (isExamPaid ? rows[0].updated_at : null),
      examTransactionId: rows[0].exam_transaction_id || (isExamPaid ? `TXN-EXAM-${rid}` : null),
      totalPaidOverall,
      recentPayments: payments || []
    };

    // Clearance trail across all 5 tiers
    const clearanceTrail = {
      submission: {
        title: 'Student Registration Submission',
        status: 'SUBMITTED',
        referenceNumber: rows[0].reference_number,
        submittedAt: rows[0].submitted_at,
        ok: true
      },
      hod: {
        title: 'Department Academic Endorsement (HOD)',
        status: ['HOD_FORWARDED', 'DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status)
          ? 'CLEARED'
          : (rows[0].status === 'HOD_REVERTED' ? 'REVERTED' : 'PENDING'),
        officer: rows[0].hod_name || (rows[0].hod_id ? 'Head of Department' : 'Assigned Department HOD'),
        actionAt: rows[0].hod_action_at,
        remarks: rows[0].hod_remarks || (['HOD_FORWARDED', 'DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status) ? 'Academic credits & syllabus eligibility verified.' : 'Pending HOD credit verification.'),
        ok: ['HOD_FORWARDED', 'DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status)
      },
      director: {
        title: 'Directorate Institutional Approval',
        status: ['DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status)
          ? 'CLEARED'
          : (rows[0].status === 'DIRECTOR_REJECTED' ? 'REJECTED' : 'PENDING'),
        officer: rows[0].director_name || (rows[0].director_id ? 'College Directorate' : 'Director / Dean Academic'),
        actionAt: rows[0].director_action_at,
        remarks: rows[0].director_remarks || (['DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status) ? 'Institutional approval granted under BPUT academic guidelines.' : 'Pending Directorate endorsement.'),
        ok: ['DIRECTOR_APPROVED', 'CONFIRMED'].includes(rows[0].status)
      },
      accounts: {
        title: 'Accounts Desk Institutional Fee Audit',
        status: elig.eligible || totalCollegePaid > 0 ? 'CLEARED' : 'PENDING_DUES',
        officer: rows[0].accounts_name || 'Senior Accounts Officer',
        actionAt: rows[0].accounts_action_at || rows[0].submitted_at,
        remarks: rows[0].accounts_remarks || (clearancePercent >= 50 ? `Institutional Fee Clearance Verified (${clearancePercent}% of Annual Fees Cleared: ₹${totalCollegePaid.toLocaleString('en-IN')}).` : 'Minimum 50% semester tuition fee clearance required.'),
        clearancePercent,
        ok: Boolean(elig.eligible || totalCollegePaid >= (totalCollegeFee * 0.5)),
        checks: elig.checks || []
      },
      examSection: {
        title: 'University Examination Cell Confirmation',
        status: rows[0].status === 'CONFIRMED'
          ? 'CONFIRMED'
          : (isExamPaid ? 'FEE_PAID_PENDING_CONFIRMATION' : 'PENDING_EXAM_FEE'),
        officer: rows[0].exam_section_name || (rows[0].status === 'CONFIRMED' ? 'Controller of Examinations (Exam Cell)' : 'Exam Cell Officer'),
        actionAt: rows[0].exam_section_action_at,
        receiptNo: rows[0].exam_receipt_no,
        remarks: rows[0].exam_section_remarks || (rows[0].status === 'CONFIRMED' ? 'University form fillup verified. Examination Roll & Hall Ticket generation active.' : (isExamPaid ? 'BPUT Exam fee received. Ready for final Exam Section confirmation.' : 'Exam registration fee payment pending.')),
        ok: rows[0].status === 'CONFIRMED'
      }
    };

    return success(res, {
      registration: { ...rows[0], subjects: subs },
      feeEligibility: elig,
      financialSummary,
      clearanceTrail
    }, 'Details loaded.');
  } catch (err) {
    console.error('[hodGetDetail Error]', err);
    return error(res, 'Failed to fetch registration detail.', 500);
  }
}

/**
 * 8. PUT /api/registration/hod/:id/forward
 * HOD Forwards to Director
 */
async function hodForward(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (r[0].status !== 'SUBMITTED') {
      return error(res, `Cannot forward registration in status: ${r[0].status}.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'HOD_FORWARDED', hod_id = ?, hod_action_at = NOW(), hod_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks || 'Verified syllabus credits. Forwarded to Director for approval.', rid]
    );

    // Notify Director
    await query(
      `INSERT INTO notifications (user_id, title, message, category)
       SELECT u.id, 'Registration Forwarded by HOD', CONCAT('Application ', ?, ' forwarded for Director review.'), 'REGISTRATION'
       FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'DIRECTOR' AND u.is_active = 1 LIMIT 1`,
      [r[0].reference_number || rid]
    ).catch(() => {});

    await logAudit(req, {
      action: 'HOD_FORWARDED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'HOD_FORWARDED', remarks, hodId: uid }
    });

    return success(res, { message: `Registration #${rid} verified and forwarded to Director.` });
  } catch (err) {
    return error(res, 'Failed to forward registration.', 500);
  }
}

/**
 * 9. PUT /api/registration/hod/:id/revert
 * HOD Reverts with Reason
 */
async function hodRevert(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    if (!remarks || remarks.trim().length < 5) {
      return error(res, 'Mandatory reason for reverting must be provided (minimum 5 characters).', 400);
    }

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (r[0].status !== 'SUBMITTED') {
      return error(res, `Cannot revert registration in status: ${r[0].status}.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'HOD_REVERTED', hod_id = ?, hod_action_at = NOW(), hod_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks, rid]
    );

    const [su] = await query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [r[0].student_id]);
    if (su.length) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [su[0].user_id, 'Registration Reverted by HOD', `Registration ${r[0].reference_number || rid} reverted. Reason: ${remarks}`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'HOD_REVERTED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'HOD_REVERTED', remarks, hodId: uid }
    });

    return success(res, { message: 'Registration reverted back to student with remarks.' });
  } catch (err) {
    return error(res, 'Failed to revert registration.', 500);
  }
}

/**
 * 10. GET /api/registration/director/registrations
 * Director Dashboard: Shows ALL departments with Global Stats Dashboard & Multi-Filters!
 */
async function directorGetRegistrations(req, res) {
  try {
    const { program_id, department_id, semester, year, status, search } = req.query;

    let sql = `SELECT sr.*, s.full_name, s.reg_no, s.category AS student_category,
                      p.name AS program_name, p.code AS program_code,
                      d.name AS department_name, d.code AS department_code,
                      sem.label AS semester_label,
                      hs.full_name AS hod_name
               FROM subject_registrations sr
               JOIN students s ON s.id = sr.student_id
               JOIN programs p ON p.id = sr.program_id
               JOIN departments d ON d.id = sr.department_id
               JOIN semesters sem ON sem.semester_number = sr.semester
               LEFT JOIN staff hs ON hs.user_id = sr.hod_id
               WHERE 1 = 1`;
    const params = [];

    if (program_id) {
      sql += ` AND sr.program_id = ?`;
      params.push(parseInt(program_id));
    }
    if (department_id) {
      sql += ` AND sr.department_id = ?`;
      params.push(parseInt(department_id));
    }
    if (semester) {
      sql += ` AND sr.semester = ?`;
      params.push(parseInt(semester));
    }
    if (year) {
      sql += ` AND sr.academic_year = ?`;
      params.push(year);
    }
    if (status) {
      sql += ` AND sr.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (LOWER(s.full_name) LIKE ? OR LOWER(sr.roll_number) LIKE ? OR LOWER(sr.reference_number) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY sr.submitted_at DESC`;

    const [rows] = await query(sql, params);

    // Compute Comprehensive Global Stats Dashboard
    const [allRows] = await query(`SELECT sr.*, d.code AS dept_code, p.code AS prog_code FROM subject_registrations sr JOIN departments d ON d.id = sr.department_id JOIN programs p ON p.id = sr.program_id`);

    const byStatus = {
      pending: allRows.filter(r => r.status === 'SUBMITTED').length,
      hod_forwarded: allRows.filter(r => r.status === 'HOD_FORWARDED').length,
      director_approved: allRows.filter(r => r.status === 'DIRECTOR_APPROVED').length,
      confirmed: allRows.filter(r => r.status === 'CONFIRMED').length
    };

    const byDepartment = {};
    for (const r of allRows) {
      const code = r.dept_code || 'OTHER';
      byDepartment[code] = (byDepartment[code] || 0) + 1;
    }

    const byProgram = {};
    for (const r of allRows) {
      const pCode = r.prog_code || 'BTECH';
      byProgram[pCode] = (byProgram[pCode] || 0) + 1;
    }

    // Fee summary
    const totalCollected = rows.reduce((s, r) => s + parseFloat(r.total_paid || 0), 0);
    const totalRequired = rows.reduce((s, r) => s + parseFloat(r.total_required || 115000), 0);

    const statsDashboard = {
      totalRegistrations: allRows.length,
      byStatus,
      byDepartment,
      byProgram,
      feeSummary: {
        totalCollected,
        pending: Math.max(0, totalRequired - totalCollected)
      }
    };

    return success(res, {
      statsDashboard,
      registrations: rows,
      total: rows.length
    }, 'Director dashboard loaded.');
  } catch (err) {
    console.error('[directorGetRegistrations Error]', err);
    return error(res, 'Failed to fetch Director registrations.', 500);
  }
}

/**
 * 11. PUT /api/registration/director/:id/approve
 * Director Approves -> Sent to Accounts
 */
async function directorApprove(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (r[0].status !== 'HOD_FORWARDED') {
      return error(res, `Cannot approve registration with status: ${r[0].status}. Must be HOD_FORWARDED.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'DIRECTOR_APPROVED', director_id = ?, director_action_at = NOW(), director_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks || 'Approved by Director. Cleared for BPUT semester exam fee payment.', rid]
    );

    // Notify Student to pay BPUT Exam Fee
    const [su] = await query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [r[0].student_id]);
    if (su.length) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [su[0].user_id, 'Academic Clearance Approved - Pay Exam Fee', `Director approved your subjects for ${r[0].reference_number || rid}. Please pay BPUT semester exam fee ₹1,550 to proceed to Exam Section.`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'DIRECTOR_APPROVED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'DIRECTOR_APPROVED', remarks, directorId: uid }
    });

    return success(res, { message: `Registration #${rid} approved by Director. Cleared for Student Exam Fee Payment.` });
  } catch (err) {
    return error(res, 'Failed to approve registration.', 500);
  }
}

/**
 * 12. PUT /api/registration/director/:id/reject
 * Director Rejects
 */
async function directorReject(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    if (!remarks?.trim()) {
      return error(res, 'Mandatory rejection reason required.', 400);
    }

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (r[0].status !== 'HOD_FORWARDED') {
      return error(res, `Cannot reject registration with status: ${r[0].status}.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'DIRECTOR_REJECTED', director_id = ?, director_action_at = NOW(), director_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks, rid]
    );

    const [su] = await query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [r[0].student_id]);
    if (su.length) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [su[0].user_id, 'Registration Rejected by Director', `Registration ${r[0].reference_number || rid} rejected. Reason: ${remarks}`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'DIRECTOR_REJECTED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'DIRECTOR_REJECTED', remarks, directorId: uid }
    });

    return success(res, { message: 'Registration rejected by Director.' });
  } catch (err) {
    return error(res, 'Failed to reject registration.', 500);
  }
}

/**
 * 13. GET /api/registration/accounts/registrations
 * Accounts Queue: Shows Director-approved registrations awaiting finalization
 */
async function accountsGetRegistrations(req, res) {
  try {
    const { department_id, program_id, semester, status, search } = req.query;

    let sql = `SELECT sr.*, s.full_name, s.reg_no, s.category AS student_category,
                      p.name AS program_name, d.name AS department_name, d.code AS department_code,
                      sem.label AS semester_label, hs.full_name AS hod_name, ds.full_name AS director_name,
                      es.full_name AS exam_section_name
               FROM subject_registrations sr
               JOIN students s ON s.id = sr.student_id
               JOIN programs p ON p.id = sr.program_id
               JOIN departments d ON d.id = sr.department_id
               JOIN semesters sem ON sem.semester_number = sr.semester
               LEFT JOIN staff hs ON hs.user_id = sr.hod_id
               LEFT JOIN staff ds ON ds.user_id = sr.director_id
               LEFT JOIN staff es ON es.user_id = sr.exam_section_id
               WHERE 1 = 1`;
    const params = [];

    if (status && status !== 'ALL') {
      if (status === 'PAID_OR_CONFIRMED') {
        sql += ` AND sr.status IN ('EXAM_FEE_PAID', 'CONFIRMED')`;
      } else {
        sql += ` AND sr.status = ?`;
        params.push(status);
      }
    } else {
      sql += ` AND sr.status IN ('EXAM_FEE_PAID', 'CONFIRMED', 'DIRECTOR_APPROVED')`;
    }

    if (department_id) {
      sql += ` AND sr.department_id = ?`;
      params.push(parseInt(department_id));
    }
    if (program_id) {
      sql += ` AND sr.program_id = ?`;
      params.push(parseInt(program_id));
    }
    if (semester) {
      sql += ` AND sr.semester = ?`;
      params.push(parseInt(semester));
    }
    if (search) {
      sql += ` AND (LOWER(s.full_name) LIKE ? OR LOWER(sr.roll_number) LIKE ? OR LOWER(sr.reference_number) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY sr.id DESC`;

    const [rows] = await query(sql, params);

    // Enrich rows with subjects & payment classification
    for (const r of rows) {
      const [subs] = await query(
        `SELECT s.id, s.code, s.name, s.credits, s.type, rs.is_backlog
         FROM registration_subjects rs
         JOIN subjects s ON s.id = rs.subject_id
         WHERE rs.registration_id = ?`,
        [r.id]
      );
      r.subjects = subs || [];
      r.total_credits = r.total_credits || r.subjects.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);
      r.candidate_year = `${Math.ceil(r.semester / 2)}${Math.ceil(r.semester / 2) === 1 ? 'st' : Math.ceil(r.semester / 2) === 2 ? 'nd' : Math.ceil(r.semester / 2) === 3 ? 'rd' : 'th'} Year`;
      r.fee_head = `BPUT Semester ${r.semester} Registration Fee`;
      r.payment_channel = r.exam_receipt_no ? 'Online Payment Gateway (Razorpay/UPI)' : 'Pending';
    }

    const [allRows] = await query(`SELECT id, status, exam_fee_amount FROM subject_registrations`);
    const allList = allRows || rows;

    const totalCollected = allList
      .filter(r => ['EXAM_FEE_PAID', 'CONFIRMED'].includes(r.status))
      .reduce((sum, r) => sum + (parseFloat(r.exam_fee_amount) || 1550), 0);

    const stats = {
      totalCollected,
      totalPaidRegistrations: allList.filter(r => ['EXAM_FEE_PAID', 'CONFIRMED'].includes(r.status)).length,
      awaitingPayment: allList.filter(r => r.status === 'DIRECTOR_APPROVED').length,
      totalConfirmed: allList.filter(r => r.status === 'CONFIRMED').length,
      total: allList.length
    };

    return success(res, { stats, registrations: rows, total: rows.length }, 'Accounts registration payments queue loaded.');
  } catch (err) {
    return error(res, 'Failed to fetch Accounts registrations queue.', 500);
  }
}

/**
 * 14. PUT /api/registration/accounts/:id/finalize
 * Accounts Desk: Finalize & Confirm Registration
 */
async function accountsFinalize(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (!['DIRECTOR_APPROVED', 'EXAM_FEE_PAID'].includes(r[0].status)) {
      return error(res, `Cannot finalize registration in status: ${r[0].status}. Must be DIRECTOR_APPROVED or EXAM_FEE_PAID.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'CONFIRMED', accounts_id = ?, accounts_action_at = NOW(), accounts_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks || 'Fee payment audited and verified. Registration officially CONFIRMED.', rid]
    );

    const [su] = await query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [r[0].student_id]);
    if (su.length) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [su[0].user_id, '🎉 Subject Registration CONFIRMED!', `Your subject registration (${r[0].reference_number || rid}) is officially CONFIRMED!`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'ACCOUNTS_CONFIRMED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'CONFIRMED', accountsId: uid }
    });

    return success(res, { message: `Registration #${rid} officially CONFIRMED!` });
  } catch (err) {
    return error(res, 'Failed to finalize registration.', 500);
  }
}

/**
 * 14B. POST /api/registration/:id/create-exam-order
 * Initiates Razorpay Order for BPUT Exam Fee
 */
async function createExamFeeOrder(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const sid = req.user.studentId;
    if (!sid) return error(res, 'Student account record required.', 401);

    const [r] = await query(
      `SELECT sr.*, s.full_name, s.reg_no, s.course_id, u.email
       FROM subject_registrations sr
       JOIN students s ON s.id = sr.student_id
       LEFT JOIN users u ON u.id = s.user_id
       WHERE sr.id = ? AND sr.student_id = ? LIMIT 1`,
      [rid, sid]
    );
    if (!r.length) return error(res, 'Registration application not found.', 404);

    const reg = r[0];
    const progId = reg.program_id || reg.course_id || 1;
    const pFee = BPUT_PROGRAM_FEES[progId] || BPUT_PROGRAM_FEES[1];
    const examFeeAmount = parseFloat(req.body.amount) || pFee.examFeePerSem || 1550;

    const orderData = await paymentService.createOrder({
      invoiceNo: `EXAM_${reg.reference_number || rid}`,
      amount: examFeeAmount,
      studentId: sid,
      email: reg.email || '',
      notes: {
        registrationId: String(rid),
        studentRegNo: reg.reg_no,
        feeType: 'BPUT_SEMESTER_EXAM_FEE'
      }
    });

    return success(res, {
      orderId: orderData.orderId,
      amount: examFeeAmount,
      amountPaise: orderData.amount,
      currency: orderData.currency || 'INR',
      key: orderData.key,
      provider: orderData.provider,
      registrationId: rid,
      studentName: reg.full_name,
      studentRegNo: reg.reg_no,
      studentEmail: reg.email
    }, 'Razorpay Exam Fee Order initiated.');
  } catch (err) {
    console.error('createExamFeeOrder error:', err);
    return error(res, 'Failed to create Razorpay exam fee order: ' + err.message, 500);
  }
}

/**
 * 15. POST /api/registration/:id/pay-exam-fee
 * Student pays BPUT semester exam fee (₹1,550 for B.Tech, ₹1,000 for Diploma, ₹2,000 for MBA)
 * Automatically advances application to College Examination Section queue!
 */
async function payExamFee(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const sid = req.user.studentId;
    if (!sid) return error(res, 'Student account record required.', 401);

    const [r] = await query(
      `SELECT sr.*, s.full_name, s.reg_no, s.course_id
       FROM subject_registrations sr
       JOIN students s ON s.id = sr.student_id
       WHERE sr.id = ? AND sr.student_id = ? LIMIT 1`,
      [rid, sid]
    );
    if (!r.length) return error(res, 'Registration application not found.', 404);

    const reg = r[0];
    if (reg.status !== 'DIRECTOR_APPROVED' && reg.status !== 'EXAM_FEE_PAID') {
      return error(res, `Cannot pay exam fee when application is in status: ${reg.status}. Must be DIRECTOR_APPROVED.`, 400);
    }

    // Razorpay signature verification if provided
    const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;

    if (razorpaySignature && razorpayOrderId) {
      const v = await paymentService.verifySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      });
      if (!v.isValid) {
        return error(res, 'Razorpay signature verification failed. Payment not confirmed.', 400);
      }
    }

    const progId = reg.program_id || reg.course_id || 1;
    const pFee = BPUT_PROGRAM_FEES[progId] || BPUT_PROGRAM_FEES[1];
    const examFeeAmount = parseFloat(req.body.amount) || pFee.examFeePerSem || 1550;

    const receiptNo = req.body.receiptNo || `EXAM-REC-2026-${String(rid).padStart(4, '0')}-${String(sid).padStart(4, '0')}`;
    const gatewayTxnId = razorpayPaymentId || req.body.gatewayTxnId || req.body.transactionId || `TXN_PG_2026_${Date.now().toString().slice(-8)}`;
    const paymentNo = `PAY-GATEWAY-${Date.now().toString().slice(-6)}`;
    const paymentMethod = req.body.paymentMethod || (razorpayPaymentId ? 'RAZORPAY_ONLINE' : 'PAYMENT_GATEWAY (Razorpay/Online)');

    // 1. Record payment in payments register
    await query(
      `INSERT INTO payments (payment_no, student_id, amount, payment_method, transaction_id, status, idempotency_key, created_at)
       VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?, NOW())`,
      [paymentNo, sid, examFeeAmount, paymentMethod, gatewayTxnId, `exam_fee_${rid}_${Date.now()}`]
    ).catch(() => {});

    // 2. Record receipt in official receipts ledger
    await query(
      `INSERT INTO receipts (receipt_no, student_id, amount, payment_mode, semester, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [receiptNo, sid, examFeeAmount, paymentMethod, `Semester ${reg.semester}`, `BPUT Semester Registration Fee [PG: ${gatewayTxnId}]`, req.user.id]
    ).catch(() => {});

    // 3. Update subject_registrations
    await query(
      `UPDATE subject_registrations
       SET status = 'EXAM_FEE_PAID', exam_fee_amount = ?, exam_fee_status = 'PAID', exam_receipt_no = ?, exam_fee_paid_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [examFeeAmount, receiptNo, rid]
    );

    // 3B. Post into student accounts ledger for Accounts Office visibility
    await query(
      `INSERT INTO ledgers (student_id, entry_type, category, amount, description, reference_no, created_at)
       VALUES (?, 'CREDIT', 'EXAM_FEE', ?, ?, ?, NOW())`,
      [sid, examFeeAmount, `BPUT Semester ${reg.semester} Registration Fee (Paid via Gateway: ${gatewayTxnId})`, receiptNo]
    ).catch(() => {});

    // 4. Update or create in exam_registrations table for reporting
    await query(
      `INSERT INTO exam_registrations (student_id, student_name, reg_no, fee_amount, fee_paid, payment_status, registration_status, receipt_no, admit_card_eligible, created_at)
       VALUES (?, ?, ?, ?, ?, 'PAID', 'PENDING_EXAM_CELL', ?, 1, NOW())
       ON DUPLICATE KEY UPDATE fee_paid = ?, payment_status = 'PAID', receipt_no = ?`,
      [sid, reg.full_name, reg.reg_no, examFeeAmount, examFeeAmount, receiptNo, examFeeAmount, receiptNo]
    ).catch(() => {});

    // 5. Notify Exam Section officers
    await query(
      `INSERT INTO notifications (user_id, title, message, category)
       SELECT u.id, 'Exam Fee Paid - Awaiting Confirmation', CONCAT('Student ', ?, ' paid ₹', ?, ' for ', ?, '. Ready for Exam Section verification.'), 'REGISTRATION'
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.name IN ('EXAM_CELL', 'ADMIN', 'DIRECTOR') AND u.is_active = 1 LIMIT 3`,
      [reg.full_name, examFeeAmount, reg.reference_number || rid]
    ).catch(() => {});

    await logAudit(req, {
      action: 'EXAM_FEE_PAID',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { examFeeAmount, receiptNo, status: 'EXAM_FEE_PAID' }
    });

    return success(res, {
      registrationId: rid,
      receiptNumber: receiptNo,
      transactionId: gatewayTxnId,
      paymentMethod,
      paymentDate: new Date().toISOString(),
      amount: examFeeAmount,
      status: 'EXAM_FEE_PAID',
      message: `₹${examFeeAmount.toLocaleString('en-IN')} Semester Registration Fee paid successfully via ${paymentMethod}. Dispatched to College Examination Section.`
    }, 'Exam fee payment confirmed.');
  } catch (err) {
    console.error('[payExamFee Error]', err);
    return error(res, 'Failed to process exam fee payment.', 500);
  }
}

/**
 * 16. GET /api/registration/exam-section/registrations
 * College Examination Section Queue: Director-Approved & Exam-Fee Paid applications
 */
async function examSectionGetRegistrations(req, res) {
  try {
    const { department_id, program_id, semester, year, status = 'EXAM_FEE_PAID', search } = req.query;

    let sql = `SELECT sr.*, s.full_name, s.reg_no, s.category AS student_category,
                      p.name AS program_name, p.code AS program_code,
                      d.name AS department_name, d.code AS department_code,
                      sem.label AS semester_label,
                      hs.full_name AS hod_name, ds.full_name AS director_name,
                      es.full_name AS exam_section_name
               FROM subject_registrations sr
               JOIN students s ON s.id = sr.student_id
               JOIN programs p ON p.id = sr.program_id
               JOIN departments d ON d.id = sr.department_id
               JOIN semesters sem ON sem.semester_number = sr.semester
               LEFT JOIN staff hs ON hs.user_id = sr.hod_id
               LEFT JOIN staff ds ON ds.user_id = sr.director_id
               LEFT JOIN staff es ON es.user_id = sr.exam_section_id
               WHERE 1 = 1`;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` AND sr.status = ?`;
      params.push(status);
    } else {
      sql += ` AND sr.status IN ('EXAM_FEE_PAID', 'DIRECTOR_APPROVED', 'CONFIRMED')`;
    }

    if (department_id) {
      sql += ` AND sr.department_id = ?`;
      params.push(parseInt(department_id));
    }
    if (program_id) {
      sql += ` AND sr.program_id = ?`;
      params.push(parseInt(program_id));
    }
    if (year) {
      const y = parseInt(year);
      const semStart = (y - 1) * 2 + 1;
      const semEnd = y * 2;
      sql += ` AND sr.semester IN (?, ?)`;
      params.push(semStart, semEnd);
    }
    if (semester) {
      sql += ` AND sr.semester = ?`;
      params.push(parseInt(semester));
    }
    if (search) {
      sql += ` AND (LOWER(s.full_name) LIKE ? OR LOWER(sr.roll_number) LIKE ? OR LOWER(sr.reference_number) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY sr.id DESC`;

    const [rows] = await query(sql, params);

    // Enrich each row with subjects and academic year detail
    for (const r of rows) {
      const [subs] = await query(
        `SELECT s.id, s.code, s.name, s.credits, s.type, rs.is_backlog
         FROM registration_subjects rs
         JOIN subjects s ON s.id = rs.subject_id
         WHERE rs.registration_id = ?`,
        [r.id]
      );
      r.subjects = subs || [];
      r.total_credits = r.total_credits || r.subjects.reduce((sum, s) => sum + (parseInt(s.credits) || 0), 0);
      r.candidate_year = `${Math.ceil(r.semester / 2)}${Math.ceil(r.semester / 2) === 1 ? 'st' : Math.ceil(r.semester / 2) === 2 ? 'nd' : Math.ceil(r.semester / 2) === 3 ? 'rd' : 'th'} Year`;
    }

    const [allListRows] = await query(`SELECT id, status FROM subject_registrations`);
    const allRows = allListRows || rows;
    const stats = {
      pendingVerification: allRows.filter(r => r.status === 'EXAM_FEE_PAID').length,
      awaitingExamFee: allRows.filter(r => r.status === 'DIRECTOR_APPROVED').length,
      totalConfirmed: allRows.filter(r => r.status === 'CONFIRMED').length,
      total: allRows.length
    };

    return success(res, { stats, registrations: rows, total: rows.length }, 'Examination Section queue loaded.');
  } catch (err) {
    console.error('[examSectionGetRegistrations Error]', err);
    return error(res, 'Failed to fetch Examination Section queue.', 500);
  }
}

/**
 * 16B. GET /api/registration/exam-section/windows
 * Exam Section Window Master Control: Get open/locked registration status for each semester
 */
async function examSectionGetWindows(req, res) {
  try {
    const [rows] = await query(`SELECT * FROM registration_windows ORDER BY semester ASC`);
    return success(res, { windows: rows }, 'Registration windows loaded.');
  } catch (err) {
    console.error('[examSectionGetWindows Error]', err);
    return error(res, 'Failed to load registration windows.', 500);
  }
}

/**
 * 16C. PUT /api/registration/exam-section/windows/:semester/toggle
 * Exam Section Window Master Control: Turn Semester Registration OPEN / LOCKED
 */
async function examSectionToggleWindow(req, res) {
  try {
    const sem = parseInt(req.params.semester);
    const { is_open } = req.body;
    const targetOpen = is_open !== undefined ? (is_open ? 1 : 0) : 1;
    const statusLabel = targetOpen ? 'OPEN' : 'LOCKED';

    await query(
      `UPDATE registration_windows SET is_open = ?, status = ? WHERE semester = ?`,
      [targetOpen, statusLabel, sem]
    );

    await logAudit(req, {
      action: 'REGISTRATION_WINDOW_TOGGLE',
      module: 'EXAMINATION_SECTION',
      recordId: sem,
      newValue: { semester: sem, is_open: targetOpen, status: statusLabel, updatedBy: req.user?.id }
    });

    return success(res, { semester: sem, is_open: targetOpen, status: statusLabel }, `Semester ${sem} registration window is now ${statusLabel}.`);
  } catch (err) {
    console.error('[examSectionToggleWindow Error]', err);
    return error(res, 'Failed to toggle registration window.', 500);
  }
}

/**
 * 17. PUT /api/registration/exam-section/:id/mark-received
 * College Examination Section marks form Received & Completed (Official BPUT University Confirmation)
 */
async function examSectionMarkReceived(req, res) {
  try {
    const rid = parseInt(req.params.id);
    const uid = req.user.id;
    const { remarks } = req.body;

    const [r] = await query(`SELECT id, status, student_id, reference_number FROM subject_registrations WHERE id = ? LIMIT 1`, [rid]);
    if (!r.length) return error(res, 'Registration not found.', 404);
    if (!['EXAM_FEE_PAID', 'DIRECTOR_APPROVED'].includes(r[0].status)) {
      return error(res, `Cannot confirm registration in status: ${r[0].status}. Must have Director Approval & Exam Fee Paid.`, 409);
    }

    await query(
      `UPDATE subject_registrations
       SET status = 'CONFIRMED', exam_section_id = ?, exam_section_action_at = NOW(), exam_section_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [uid, remarks || 'BPUT University form fillup and exam fee verified. Marked Received & Confirmed.', rid]
    );

    const [su] = await query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [r[0].student_id]);
    if (su.length) {
      await query(
        `INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, 'REGISTRATION')`,
        [su[0].user_id, '🎉 BPUT Registration Officially CONFIRMED!', `College Examination Section has marked your subject registration (${r[0].reference_number || rid}) Received & Confirmed! Your BPUT Slip is ready.`]
      ).catch(() => {});
    }

    await logAudit(req, {
      action: 'EXAM_SECTION_CONFIRMED',
      module: 'SUBJECT_REGISTRATION',
      recordId: rid,
      newValue: { status: 'CONFIRMED', examSectionId: uid, remarks }
    });

    return success(res, { message: `Registration #${rid} officially Received & Confirmed by Examination Section!` });
  } catch (err) {
    console.error('[examSectionMarkReceived Error]', err);
    return error(res, 'Failed to confirm registration in Exam Section.', 500);
  }
}

/**
 * 15. Admin Subject CRUD
 */
async function adminGetSubjects(req, res) {
  try {
    const { program_id, department_id, semester, type } = req.query;
    let sql = `SELECT * FROM subjects WHERE 1=1`;
    const p = [];

    if (program_id) {
      sql += ` AND program_id = ?`;
      p.push(parseInt(program_id));
    }
    if (department_id) {
      sql += ` AND department_id = ?`;
      p.push(parseInt(department_id));
    }
    if (semester) {
      sql += ` AND semester = ?`;
      p.push(parseInt(semester));
    }
    if (type) {
      sql += ` AND type = ?`;
      p.push(type);
    }

    sql += ` ORDER BY sequence ASC, semester ASC, type ASC, name ASC`;
    const [rows] = await query(sql, p);
    return success(res, { subjects: rows, total: rows.length }, 'Subjects catalog loaded.');
  } catch (err) {
    return error(res, 'Failed to fetch subjects.', 500);
  }
}

async function adminCreateSubject(req, res) {
  try {
    const { code, name, program_id = 1, department_id = 1, semester, year, credits, type = 'CORE', sequence = 0 } = req.body;
    if (!code || !name || !semester || !credits) {
      return error(res, 'Code, Name, Semester, and Credits are required fields.', 400);
    }

    const calcYear = year ? parseInt(year) : Math.ceil(parseInt(semester) / 2);

    const [r] = await query(
      `INSERT INTO subjects (code, name, program_id, department_id, semester, year, credits, type, sequence, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [code, name, parseInt(program_id), parseInt(department_id), parseInt(semester), calcYear, parseInt(credits), type, parseInt(sequence)]
    );

    await logAudit(req, {
      action: 'SUBJECT_CREATED',
      module: 'SUBJECT_REGISTRATION',
      recordId: r.insertId,
      newValue: req.body
    });

    return success(res, { id: r.insertId }, 'Subject added to catalog.', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, `Subject code '${req.body.code}' already exists.`, 409);
    }
    return error(res, 'Failed to create subject.', 500);
  }
}

async function adminBulkImportSubjects(req, res) {
  try {
    let rows = req.body.rows || req.body.subjects;

    // Support raw CSV string
    if (!rows && typeof req.body.csvData === 'string') {
      const lines = req.body.csvData.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        rows = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 2) continue;
          const obj = {};
          header.forEach((h, idx) => { obj[h] = cols[idx] !== undefined ? cols[idx] : ''; });
          rows.push({
            code: obj.code || obj['subject code'],
            name: obj.name || obj['subject name'],
            program_code: obj.program_code || obj.program || 'BTECH',
            department_code: obj.department_code || obj.dept || obj.department || 'CSE',
            semester: parseInt(obj.semester || '1', 10),
            credits: parseInt(obj.credits || '3', 10),
            type: (obj.type || 'CORE').toUpperCase(),
            sequence: parseInt(obj.sequence || '1', 10)
          });
        }
      }
    }

    if (!rows || !Array.isArray(rows) || !rows.length) {
      return error(res, 'No CSV rows provided for import.', 400);
    }

    const [depts] = await query(`SELECT id, code, program_id FROM departments`);
    const deptMap = {};
    for (const d of depts) {
      deptMap[d.code.toUpperCase()] = d;
    }

    let inserted = 0;
    for (const row of rows) {
      const code = String(row.code || '').trim();
      const name = String(row.name || '').trim();
      const deptCode = String(row.department_code || row.department || row.dept || 'CSE').trim().toUpperCase();
      const sem = parseInt(row.semester) || 1;
      const credits = parseInt(row.credits) || 3;
      const type = ['CORE', 'ELECTIVE', 'LAB', 'BACKLOG'].includes(String(row.type).toUpperCase()) ? String(row.type).toUpperCase() : 'CORE';

      if (!code || !name) continue;

      const dept = deptMap[deptCode] || deptMap['CSE'] || { id: 1, program_id: 1 };
      const progId = parseInt(row.program_id) || dept.program_id || 1;
      const yr = Math.ceil(sem / 2);

      await query(
        `INSERT INTO subjects (code, name, program_id, department_id, semester, year, credits, type, sequence, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), credits = VALUES(credits), type = VALUES(type)`,
        [code, name, progId, dept.id, sem, yr, credits, type]
      ).catch(() => {});
      inserted++;
    }

    await logAudit(req, {
      action: 'SUBJECTS_BULK_IMPORTED',
      module: 'SUBJECT_REGISTRATION',
      newValue: { rowCount: inserted }
    });

    return success(res, { count: inserted, imported: inserted }, `Successfully imported ${inserted} subjects.`);
  } catch (err) {
    return error(res, 'Failed to import subjects.', 500);
  }
}

async function adminUpdateSubject(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { code, name, program_id, department_id, semester, year, credits, type, sequence, is_active } = req.body;

    await query(
      `UPDATE subjects
       SET code = ?, name = ?, program_id = ?, department_id = ?, semester = ?,
           year = ?, credits = ?, type = ?, sequence = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [code, name, parseInt(program_id) || 1, parseInt(department_id) || 1, parseInt(semester), parseInt(year), parseInt(credits), type, parseInt(sequence) || 0, is_active ? 1 : 0, id]
    );

    return success(res, { message: 'Subject updated successfully.' });
  } catch (err) {
    return error(res, 'Failed to update subject.', 500);
  }
}

async function adminDeleteSubject(req, res) {
  try {
    const id = parseInt(req.params.id);
    await query(`UPDATE subjects SET is_active = 0 WHERE id = ?`, [id]);
    return success(res, { message: 'Subject deactivated.' });
  } catch (err) {
    return error(res, 'Failed to deactivate subject.', 500);
  }
}

async function adminResetRegistrations(req, res) {
  try {
    await query(`DELETE FROM registration_subjects`);
    await query(`DELETE FROM subject_registrations`);
    return success(res, null, 'Subject registrations reset.');
  } catch (err) {
    return error(res, 'Failed to reset registrations.', 500);
  }
}

module.exports = {
  getProgramsAndDepartments,
  getEligibility,
  getSubjects,
  submitRegistration,
  getMyRegistrations,
  hodGetRegistrations,
  hodGetDetail,
  hodForward,
  hodRevert,
  directorGetRegistrations,
  directorApprove,
  directorReject,
  accountsGetRegistrations,
  accountsFinalize,
  createExamFeeOrder,
  payExamFee,
  examSectionGetRegistrations,
  examSectionMarkReceived,
  examSectionGetWindows,
  examSectionToggleWindow,
  adminGetSubjects,
  adminCreateSubject,
  adminBulkImportSubjects,
  adminUpdateSubject,
  adminDeleteSubject,
  adminResetRegistrations
};
