const { ActivityLog } = require('../models');

/**
 * A helper function to log user activities throughout the application.
 * @param {number} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action (e.g., 'USER_LOGIN', 'BOOKING_CREATED').
 * @param {string} details - A human-readable description of the action.
 * @param {object} options - Optional parameters.
 * @param {number} [options.targetId] - The ID of the entity affected.
 * @param {string} [options.targetType] - The type of entity affected.
 * @param {string} [options.ipAddress] - The IP address of the user.
 */
const logActivity = async (userId, actionType, details, options = {}) => {
    try {
        if (!userId || !actionType || !details) {
            throw new Error('User ID, action type, and details are required for logging.');
        }

        await ActivityLog.create({
            userId,
            actionType,
            details,
            targetId: options.targetId || null,
            targetType: options.targetType || null,
            ipAddress: options.ipAddress || null,
        });

        console.log(`Activity logged: ${details}`);

    } catch (error) {
        // We log the error to the console but don't throw it further,
        // because a failure in logging should not stop the main application flow.
        console.error('Failed to log activity:', error);
    }
};

module.exports = {
    logActivity
};
