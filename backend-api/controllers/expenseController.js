const { Expense } = require('../models');
// const { logActivity } = require('../utils/activityLogger');
// const fileUploader = require('../utils/fileUploader'); // A helper for deleting files from cloud

// @desc    Create a new expense with receipt
// @route   POST /api/expenses
// @access  Private (admin, accountant)
const createExpense = async (req, res) => {
    const { description, amount, category, expenseDate } = req.body;

    if (!description || !amount || !category) {
        return res.status(400).json({ message: 'Description, amount, and category are required.' });
    }

    try {
        let receiptUrl = null;
        // req.file will be available if you use multer middleware for file upload
        if (req.file) {
            // For AWS S3, the location of the uploaded file is in req.file.location
            // For local storage, it might be in req.file.path
            receiptUrl = req.file.location || req.file.path;
        }

        const expense = await Expense.create({
            description,
            amount,
            category,
            expenseDate: expenseDate || new Date(),
            receiptUrl,
            recordedBy: req.user.id
        });

        // --- Log Activity (Feature #9) ---
        // await logActivity(req.user.id, 'EXPENSE_CREATED', `Created new expense '${description}' for amount ${amount}`);

        res.status(201).json({ message: 'Expense created successfully', expense });

    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Server error while creating expense.' });
    }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (admin, accountant)
const getAllExpenses = async (req, res) => {
    try {
        // In a real app, you might add pagination here
        const expenses = await Expense.findAll({
            order: [['expenseDate', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error while fetching expenses.' });
    }
};


// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (admin)
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }

        // If there's a receipt URL, delete the file from cloud storage
        if (expense.receiptUrl) {
            // await fileUploader.deleteFile(expense.receiptUrl);
            console.log(`Deleting file: ${expense.receiptUrl}`);
        }

        await expense.destroy();

        // --- Log Activity (Feature #9) ---
        // await logActivity(req.user.id, 'EXPENSE_DELETED', `Deleted expense '${expense.description}' (ID: ${req.params.id})`);

        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error while deleting expense.' });
    }
};

// updateExpense and getExpenseById can be added here if needed, following a similar structure.

module.exports = {
    createExpense,
    getAllExpenses,
    deleteExpense
};
