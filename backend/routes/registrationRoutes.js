/**
 * Department-Wise Subject Registration Routes
 * GENZ — Workflow: Student → HOD (Department) → Director (All) → Accounts (Finalize) → CONFIRMED
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ctrl = require('../controllers/registrationController');

// ── Metadata Routes ───────────────────────────────────────────────────────────
router.get('/metadata', ctrl.getProgramsAndDepartments);

// ── Student Routes ────────────────────────────────────────────────────────────
router.get('/eligibility', authenticateToken, requireRole('STUDENT', 'ACCOUNTS_HEAD', 'ACCOUNTS_STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'EXAM_CELL'), ctrl.getEligibility);
router.get('/subjects', authenticateToken, ctrl.getSubjects);
router.post('/submit', authenticateToken, requireRole('STUDENT'), ctrl.submitRegistration);
router.post('/:id/create-exam-order', authenticateToken, requireRole('STUDENT'), ctrl.createExamFeeOrder);
router.post('/:id/pay-exam-fee', authenticateToken, requireRole('STUDENT'), ctrl.payExamFee);
router.get('/my', authenticateToken, requireRole('STUDENT', 'ACCOUNTS_HEAD', 'ACCOUNTS_STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'EXAM_CELL'), ctrl.getMyRegistrations);

// ── HOD & Review Detail Routes (All Review Authorities) ───────────────────────
router.get('/hod/registrations', authenticateToken, requireRole('HOD', 'ADMIN', 'SUPER_ADMIN'), ctrl.hodGetRegistrations);
router.get('/hod/pending', authenticateToken, requireRole('HOD', 'ADMIN', 'SUPER_ADMIN'), ctrl.hodGetRegistrations); // alias
router.get('/hod/:id', authenticateToken, requireRole('HOD', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'EXAM_CELL'), ctrl.hodGetDetail);
router.get('/detail/:id', authenticateToken, ctrl.hodGetDetail); // universal detail endpoint
router.put('/hod/:id/forward', authenticateToken, requireRole('HOD', 'ADMIN', 'SUPER_ADMIN'), ctrl.hodForward);
router.put('/hod/:id/revert', authenticateToken, requireRole('HOD', 'ADMIN', 'SUPER_ADMIN'), ctrl.hodRevert);

// ── Director Routes (All Departments) ─────────────────────────────────────────
router.get('/director/registrations', authenticateToken, requireRole('DIRECTOR', 'ADMIN'), ctrl.directorGetRegistrations);
router.get('/director/pending', authenticateToken, requireRole('DIRECTOR', 'ADMIN'), ctrl.directorGetRegistrations); // alias
router.put('/director/:id/approve', authenticateToken, requireRole('DIRECTOR', 'ADMIN'), ctrl.directorApprove);
router.put('/director/:id/reject', authenticateToken, requireRole('DIRECTOR', 'ADMIN'), ctrl.directorReject);

// ── Examination Section Routes (College Exam Cell Confirmation) ───────────────
router.get('/exam-section/registrations', authenticateToken, requireRole('EXAM_CELL', 'EXAM_SECTION', 'ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'SUPER_ADMIN'), ctrl.examSectionGetRegistrations);
router.get('/exam-section/pending', authenticateToken, requireRole('EXAM_CELL', 'EXAM_SECTION', 'ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'SUPER_ADMIN'), ctrl.examSectionGetRegistrations);
router.get('/exam-section/windows', authenticateToken, ctrl.examSectionGetWindows);
router.put('/exam-section/windows/:semester/toggle', authenticateToken, requireRole('EXAM_CELL', 'EXAM_SECTION', 'ADMIN', 'DIRECTOR', 'SUPER_ADMIN'), ctrl.examSectionToggleWindow);
router.put('/exam-section/:id/mark-received', authenticateToken, requireRole('EXAM_CELL', 'EXAM_SECTION', 'ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'SUPER_ADMIN'), ctrl.examSectionMarkReceived);
router.put('/exam-section/:id/confirm', authenticateToken, requireRole('EXAM_CELL', 'EXAM_SECTION', 'ADMIN', 'DIRECTOR', 'ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'SUPER_ADMIN'), ctrl.examSectionMarkReceived);

// ── Accounts Routes (Backward-Compatibility & Counter Registration) ───────────
const ACCOUNTS_REVIEW_ROLES = ['ACCOUNTS_HEAD', 'ACCOUNTS_STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'EXAM_CELL', 'EXAM_SECTION', 'CASHIER', 'ACCOUNTS_MANAGER', 'AUDITOR_READ_ONLY'];
router.get('/accounts/registrations', authenticateToken, requireRole(...ACCOUNTS_REVIEW_ROLES), ctrl.accountsGetRegistrations);
router.get('/accounts/pending', authenticateToken, requireRole(...ACCOUNTS_REVIEW_ROLES), ctrl.accountsGetRegistrations); // alias
router.put('/accounts/:id/finalize', authenticateToken, requireRole(...ACCOUNTS_REVIEW_ROLES), ctrl.accountsFinalize);
router.post('/counter-register', authenticateToken, requireRole(...ACCOUNTS_REVIEW_ROLES), ctrl.counterRegisterStudent);

// ── Admin Subject Catalog & Bulk Import ────────────────────────────────────────
router.get('/admin/subjects', authenticateToken, requireRole('ADMIN', 'HOD', 'DIRECTOR'), ctrl.adminGetSubjects);
router.post('/admin/subjects', authenticateToken, requireRole('ADMIN'), ctrl.adminCreateSubject);
router.post('/admin/subjects/bulk', authenticateToken, requireRole('ADMIN'), ctrl.adminBulkImportSubjects);
router.post('/admin/registrations/reset', authenticateToken, requireRole('ADMIN'), ctrl.adminResetRegistrations);
router.put('/admin/subjects/:id', authenticateToken, requireRole('ADMIN'), ctrl.adminUpdateSubject);
router.delete('/admin/subjects/:id', authenticateToken, requireRole('ADMIN'), ctrl.adminDeleteSubject);

module.exports = router;
