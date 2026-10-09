/**
 * Student Portal Routes (Protected & Isolated)
 * Gen-Z University Accounts System
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { ensureStudentIsolation } = require('../middleware/isolation');

// Enforce authentication, student role, and data isolation across all routes
router.use(authenticateToken, requireRole('STUDENT'), ensureStudentIsolation);

router.get('/profile', studentController.getProfile);
router.get('/dashboard', studentController.getDashboard);
router.get('/ledger', studentController.getLedger);
router.get('/invoices', studentController.getInvoices);
router.get('/invoices/:id', studentController.getInvoiceById);
router.get('/payments', studentController.getPayments);
router.get('/receipts', studentController.getReceipts);
router.get('/receipts/:id', studentController.getReceiptById);
router.post('/requests', studentController.submitRequest);
router.get('/notifications', studentController.getNotifications);
router.get('/health', studentController.getHealth);
router.post('/health', studentController.updateHealth);
router.post('/loan-request', studentController.submitLoanRequest);
router.get('/loan-requests', studentController.getLoanRequests);
router.get('/loan-letters/:id', studentController.getLoanLetters);

module.exports = router;
