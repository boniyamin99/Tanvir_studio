const express = require('express');
const {
    createExpense,
    getAllExpenses,
    deleteExpense
} = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader'); // <-- Importing our uploader

const router = express.Router();

// All routes in this file are protected and role-based

router.route('/')
    .get(
        protect,
        authorizeRoles('admin', 'accountant'),
        getAllExpenses
    )
    .post(
        protect,
        authorizeRoles('admin', 'accountant'),
        upload.single('receipt'), // <-- Using the upload middleware
        createExpense
    );

router.route('/:id')
    .delete(
        protect,
        authorizeRoles('admin'), // Only admin can delete expenses
        deleteExpense
    );

module.exports = router;
