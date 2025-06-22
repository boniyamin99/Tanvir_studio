// File: models/Booking.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // Import User model

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: { // Link to the User who made the booking (if registered)
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: true // Can be null if booking is made by a guest
    },
    clientName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    clientEmail: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    clientPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    // --- Applied Update 10: Clarify serviceType vs. packageName ---
    // Renamed serviceType to serviceCategory to represent the broad type of service.
    // Added a new field 'packageName' to hold the specific package chosen (Basic, Standard, Premium).
    serviceCategory: { 
        type: DataTypes.ENUM('composition', 'mixing', 'mastering', 'production', 'vocal_training', 'other'), // General service categories
        allowNull: true, // Can be null if packageName covers it entirely
        comment: 'Broad category of service (e.g., composition, mixing)'
    },
    packageName: {
        type: DataTypes.ENUM('Basic', 'Standard', 'Premium'), // Matches your frontend package names
        allowNull: false,
        comment: 'Specific package chosen (Basic, Standard, Premium)'
    },
    bookingDate: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: false
    },
    bookingTime: {
        type: DataTypes.TIME, // HH:MM:SS
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            'pending',          // Initial status, awaiting admin approval
            'confirmed',        // Confirmed after payment/review
            'in_progress',      // Work is ongoing
            'ready_for_review', // Ready for client review
            'completed',        // Work completed
            'cancelled'         // Booking cancelled
        ),
        allowNull: false,
        defaultValue: 'pending'
    },
    assignedEmployeeId: { // Employee assigned to this booking
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User, // Employees are also users
            key: 'id'
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    dueAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    invoiceId: { // To store a unique identifier for the generated PDF invoice
        type: DataTypes.STRING,
        allowNull: true
    },
    isFeedbackSurveySent: { // To track if the automated feedback survey has been sent
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    hooks: {
        beforeSave: (booking) => {
            // Automatically calculate dueAmount whenever totalAmount or paidAmount changes
            if (booking.changed('totalAmount') || booking.changed('paidAmount')) {
                booking.dueAmount = booking.totalAmount - booking.paidAmount;
            }
        }
    }
});

// Define associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
Booking.belongsTo(User, { foreignKey: 'assignedEmployeeId', as: 'assignedEmployee' });

module.exports = Booking;
