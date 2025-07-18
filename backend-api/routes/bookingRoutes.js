// backend-api/routes/bookingRoutes.js

const express = require('express');
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    assignEmployeeToBooking,
    deleteBooking,
} = require('../controllers/bookingController');

// Import the downloadInvoice from InvoiceController, as it's defined there
const { downloadInvoice } = require('../controllers/invoiceController'); 

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for creating initial booking from the frontend (index.html)
router.route('/')
    .post(createBooking); 

// Protected routes for admin/manager/accountant to manage bookings
router.route('/')
    .get(protect, authorizeRoles('admin', 'manager', 'accountant'), getAllBookings);

// Route for downloading an invoice for a booking
router.route('/:id/invoice')
    .get(protect, authorizeRoles('admin', 'manager', 'customer'), downloadInvoice);

// Route for making subsequent payments on a booking (Feature #1)
// This route is commented out as addPaymentToBooking function is not yet defined/exported in bookingController.js
// router.route('/:id/payment')
//     .post(protect, authorizeRoles('admin', 'customer'), addPaymentToBooking);


router.route('/:id')
    .get(protect, authorizeRoles('admin', 'manager', 'accountant', 'customer'), getBookingById)
    .delete(protect, authorizeRoles('admin'), deleteBooking); 

router.route('/:id/status')
    .put(protect, authorizeRoles('admin', 'manager'), updateBookingStatus);

router.route('/:id/assign')
    .put(protect, authorizeRoles('admin', 'manager'), assignEmployeeToBooking);


module.exports = router;
