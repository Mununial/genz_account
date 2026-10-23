/**
 * Financial Reports & Analytics Routes
 * Gen-Z University Accounts System
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const registrationController = require('../controllers/registrationController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(
  authenticateToken,
  requireRole('ACCOUNTS_STAFF', 'ACCOUNTS_HEAD', 'ADMIN', 'AUDITOR_READ_ONLY', 'SUPER_ADMIN', 'CASHIER', 'ACCOUNTS_MANAGER')
);

router.get('/collections', reportController.getCollectionsReport);
router.get('/defaulters', reportController.getDefaultersReport);
router.get('/registrations', reportController.getRegistrationsReport);
router.post('/counter-register', registrationController.counterRegisterStudent);
router.get('/export-csv', reportController.exportCsv);

module.exports = router;
