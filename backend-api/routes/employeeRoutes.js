// backend-api/routes/employeeRoutes.js

const express = require('express');
const {
    addEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getEmployeeBookings // Exported from controller
} = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Main routes for adding and getting all employees
router.route('/')
    .post(protect, authorizeRoles('admin', 'manager'), addEmployee)
    .get(protect, authorizeRoles('admin', 'manager', 'accountant'), getAllEmployees);

// --- Applied Update 5: Enable the route for getting bookings assigned to a specific employee ---
// This route was commented out in your original routes file. It's now enabled here.
// @route   GET /api/employees/:id/bookings
// @access  Private (admin, manager, employee)
router.route('/:id/bookings')
    .get(protect, authorizeRoles('admin', 'manager', 'employee'), getEmployeeBookings); // Enabled for use

// Routes for a specific employee
router.route('/:id')
    .get(protect, authorizeRoles('admin', 'manager', 'accountant', 'employee'), getEmployeeById)
    .put(protect, authorizeRoles('admin', 'manager'), updateEmployee)
    .delete(protect, authorizeRoles('admin'), deleteEmployee);

module.exports = router;
