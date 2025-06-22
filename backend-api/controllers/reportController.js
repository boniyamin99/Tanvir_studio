const { Booking, Expense } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get summary stats for the main dashboard cards
// @route   GET /api/reports/summary
// @access  Private (admin, manager, accountant)
const getDashboardSummary = async (req, res) => {
    try {
        const totalRevenue = await Booking.sum('paidAmount', { where: { paymentStatus: 'paid' } });
        const totalExpenses = await Expense.sum('amount');
        const totalBookings = await Booking.count();
        const netProfit = (totalRevenue || 0) - (totalExpenses || 0);

        res.status(200).json({
            totalBookings,
            totalRevenue: totalRevenue || 0,
            totalExpenses: totalExpenses || 0,
            netProfit
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Server error while fetching summary.' });
    }
};


// @desc    Generate a Profit & Loss statement for a given date range
// @route   GET /api/reports/profit-loss
// @access  Private (admin, accountant)
const getProfitAndLossStatement = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide both a start date and an end date.' });
    }

    try {
        // 1. Calculate Total Revenue in the date range
        const totalRevenue = await Booking.sum('paidAmount', {
            where: {
                paymentStatus: 'paid',
                updatedAt: { // Assuming payment confirmation updates this timestamp
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });

        // 2. Calculate Total Expenses in the date range
        const totalExpenses = await Expense.sum('amount', {
            where: {
                expenseDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });

        // 3. Get a breakdown of expenses by category
        const expenseBreakdown = await Expense.findAll({
            attributes: [
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
            ],
            where: {
                expenseDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            group: ['category']
        });
        
        // 4. Calculate Net Profit
        const netProfit = (totalRevenue || 0) - (totalExpenses || 0);

        res.status(200).json({
            startDate,
            endDate,
            totalRevenue: totalRevenue || 0,
            totalExpenses: totalExpenses || 0,
            netProfit,
            expenseBreakdown
        });

    } catch (error) {
        console.error('Error generating P&L statement:', error);
        res.status(500).json({ message: 'Server error while generating report.' });
    }
};

module.exports = {
    getDashboardSummary,
    getProfitAndLossStatement
};
