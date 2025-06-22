// File: models/Payment.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking'); // Import Booking model
const User = require('./User'); // Import User model (for payer info if needed)

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    bookingId: {
        type: DataTypes.INTEGER,
        references: {
            model: Booking,
            key: 'id'
        },
        allowNull: false
    },
    payerId: { // Optional: Link to User who made the payment if different from booking user
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    paymentMethod: {
        type: DataTypes.ENUM('bKash', 'Rocket', 'Nagad', 'bank_transfer', 'cash', 'other'),
        allowNull: false
    },
    transactionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true // Assuming transaction IDs are unique per payment. Note: NULL values are typically not constrained by UNIQUE in MySQL.
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    tableName: 'payments',
    timestamps: true,
    comment: 'Records individual payment transactions. A booking might have multiple payment entries (e.g., advance, final payment). This model is ideal for detailed financial tracking, separate from Booking.paidAmount which might represent the sum.'
});

// Define associations
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });
Payment.belongsTo(User, { foreignKey: 'payerId', as: 'payer' });

module.exports = Payment;
