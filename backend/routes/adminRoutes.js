/**
 * Administrative & Accounts Executive Operations Routes
 * Gen-Z University Accounts System
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const refundController = require('../controllers/refundController');
const adjustmentController = require('../controllers/adjustmentController');
const reconciliationController = require('../controllers/reconciliationController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

// Executive Dashboard & Intelligence
router.get(
  '/dashboard',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY', 'DIRECTOR'),
  adminController.getDashboard
);
router.get(
  '/intelligence',
  requireRole('ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getIntelligence
);

// Students Directory
router.get(
  '/students',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getStudents
);
router.get(
  '/students/:id/ledger',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getStudentLedger
);

// Student Academic Progression & Promotion Endpoints
router.get(
  '/promotion/stats',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getPromotionOverview
);
router.post(
  '/promotion/promote-semester',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.promoteSemester
);
router.post(
  '/promotion/promote-year',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.promoteAcademicYear
);
router.post(
  '/promotion/passout-alumni',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.passOutStudentToAlumni
);
router.post(
  '/promotion/batch-passout-alumni',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.batchPassOutToAlumni
);

// Alumni Directory & Management Endpoints
router.get(
  '/alumni',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getAlumni
);
router.put(
  '/alumni/:id',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.updateAlumniProfile
);

// Refunds Workflow
router.get(
  '/refunds',
  requireRole('ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  refundController.getRefunds
);
router.post(
  '/refunds',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  refundController.createRefundRequest
);
router.post(
  '/refunds/:id/approve',
  requireRole('ACCOUNTS_HEAD', 'ADMIN'),
  refundController.approveRefund
);
router.post(
  '/refunds/:id/reject',
  requireRole('ACCOUNTS_HEAD', 'ADMIN'),
  refundController.rejectRefund
);

// Fee Adjustments & Waivers
router.get(
  '/adjustments',
  requireRole('ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adjustmentController.getAdjustments
);
router.post(
  '/adjustments',
  requireRole('ACCOUNTS_HEAD', 'ADMIN'),
  adjustmentController.applyAdjustment
);

// Payment Reconciliation
router.get(
  '/reconciliation',
  requireRole('ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  reconciliationController.getReconciliation
);
router.post(
  '/reconciliation/:id/resolve',
  requireRole('ACCOUNTS_HEAD', 'ADMIN'),
  reconciliationController.resolveReconciliation
);

// Audit Logs
router.get(
  '/audit-logs',
  requireRole('ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getAuditLogs
);

// Master Control & User Accounts Management
router.get('/roles', requireRole('ADMIN', 'ACCOUNTS_HEAD'), adminController.getRoles);
router.get('/users', requireRole('ADMIN', 'ACCOUNTS_HEAD'), adminController.getUsers);
router.post('/users', requireRole('ADMIN'), adminController.createUser);
router.put('/users/:id', requireRole('ADMIN'), adminController.updateUser);
router.post('/users/:id/password', requireRole('ADMIN'), adminController.changeUserPassword);
router.post('/users/:id/status', requireRole('ADMIN'), adminController.updateUserStatus);
router.patch('/users/:id/status', requireRole('ADMIN'), adminController.updateUserStatus);
router.put('/students/:id/profile', requireRole('ADMIN'), adminController.updateStudentProfile);
router.post('/students/:id/password', requireRole('ADMIN'), adminController.changeStudentPassword);

// Universal Transaction Search
router.get(
  '/transactions/search',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getUniversalTransactions
);

// Cash Management & Daily Closing
router.get(
  '/cash-closing',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getCashClosing
);
router.post(
  '/cash-closing',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.recordCashClosing
);

// Bank Accounts
router.get(
  '/bank-accounts',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getBankAccounts
);

// Exam Registrations
router.get(
  '/exam-registrations',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY'),
  adminController.getExamRegistrations
);
router.post(
  '/exam-registrations/:id',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.updateExamRegistration
);
router.post(
  '/exam-registrations/:id/status',
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN'),
  adminController.updateExamRegistration
);

// Education Loan Applications (Director & Admin Approval)
router.get(
  '/loan-requests',
  requireRole('DIRECTOR', 'ADMIN', 'ACCOUNTS_HEAD', 'ACCOUNTS_STAFF'),
  adminController.getLoanRequests
);
router.patch(
  '/loan-requests/:id/status',
  requireRole('DIRECTOR', 'ADMIN'),
  adminController.updateLoanRequestStatus
);
router.post(
  '/loan-requests/:id/status',
  requireRole('DIRECTOR', 'ADMIN'),
  adminController.updateLoanRequestStatus
);

module.exports = router;

