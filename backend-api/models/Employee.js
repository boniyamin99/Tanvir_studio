Const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // Link to the base User model

const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: { // Link to the User table for login credentials
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        unique: true // Each user can only be one employee
    },
    position: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    hireDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    shiftType: { // For employee shift management
        type: DataTypes.ENUM('morning', 'evening', 'night', 'flexible', 'off'),
        defaultValue: 'flexible'
    },
    hoursPerWeek: { // To define standard weekly work hours
        type: DataTypes.INTEGER,
        allowNull: true
    },
    availableLeaveDays: { // To track remaining leave days
        type: DataTypes.INTEGER,
        defaultValue: 10 // Example: 10 days default annual leave
    }
}, {
    tableName: 'employees',
    timestamps: true
});

// Associations are defined centrally in models/index.js
// So, remove any association definitions from here if they exist.
// Employee.belongsTo(User, { foreignKey: 'userId', as: 'userInfo' });
// User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeInfo' });

module.exports = Employee;
