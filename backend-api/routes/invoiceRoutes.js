// backend-api/routes/invoiceRoutes.js

const express = require('express');
const { downloadInvoice } = require('../controllers/invoiceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// This route will handle the download of an invoice for a specific booking
// The bookingId will be passed as a URL parameter
router.route('/:bookingId')
    .get(
        protect,
        authorizeRoles('admin', 'manager', 'accountant', 'customer'), // Allows relevant roles
        downloadInvoice
    );

module.exports = router;
