const express = require('express');
const { getDashboardSummary, getProfitAndLossStatement } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get dashboard summary data
router.get('/summary', protect, authorizeRoles('admin', 'manager', 'accountant'), getDashboardSummary);

// Route to get a Profit & Loss statement
router.get('/profit-loss', protect, authorizeRoles('admin', 'accountant'), getProfitAndLossStatement);

module.exports = router;
