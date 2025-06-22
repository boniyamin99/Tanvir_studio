const { ActivityLog, User } = require('../models');
const { Op } = require('sequelize'); // Operator for advanced queries

// @desc    Get all activity logs with filtering and pagination
// @route   GET /api/logs
// @access  Private (admin)
const getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 15, userId, actionType, startDate, endDate } = req.query;

        // Pagination setup
        const offset = (page - 1) * limit;

        // Filtering setup
        const whereClause = {};
        if (userId) {
            whereClause.userId = userId;
        }
        if (actionType) {
            whereClause.actionType = actionType;
        }
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        // Fetch logs from the database
        const { count, rows } = await ActivityLog.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['id', 'username', 'fullName'] // Include user info with the log
            }],
            order: [['createdAt', 'DESC']], // Show most recent logs first
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            logs: rows,
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Server error while fetching logs.' });
    }
};

module.exports = {
    getAllLogs
};
