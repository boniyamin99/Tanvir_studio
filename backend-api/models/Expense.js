const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('studio_rent', 'equipment', 'marketing', 'utilities', 'salaries', 'travel', 'miscellaneous'),
        allowNull: false
    },
    expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    receiptUrl: { // To store the URL of the uploaded receipt image/pdf
        type: DataTypes.STRING,
        allowNull: true
    },
    recordedBy: { // Optional: User who recorded the expense (admin/accountant)
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users', // Reference users table
            key: 'id'
        }
    }
}, {
    tableName: 'expenses',
    timestamps: true
});

module.exports = Expense;
