// models/ActivityLog.js


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: { // The user who performed the action
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    actionType: { // What kind of action was performed
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., USER_LOGIN, BOOKING_CREATED, EMPLOYEE_DELETED'
    },
    details: { // A human-readable description of the action
        type: DataTypes.TEXT,
        allowNull: false,
        comment: `e.g., User 'admin' deleted employee 'John Doe'`
    },
    targetId: { // The ID of the entity that was affected (optional)
        type: DataTypes.INTEGER,
        allowNull: true
    },
    targetType: { // The type of entity affected (e.g., 'booking', 'employee')
        type: DataTypes.STRING,
        allowNull: true
    },
    ipAddress: { // IP address of the user
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true, // This will add createdAt and updatedAt
    updatedAt: false // We only care about when it was created
});

// Associations are defined centrally in models/index.js
// So, remove any association definitions from here if they exist.
// ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = ActivityLog;
