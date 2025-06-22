// File: models/Delivery.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking'); // Import Booking model

const Delivery = sequelize.define('Delivery', {
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
        allowNull: false,
        unique: true // One delivery per booking
    },
    finalFilePath: { // Path to the uploaded final music file
        type: DataTypes.STRING(255),
        allowNull: false
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('pending_upload', 'uploaded', 'delivered_access_granted'),
        allowNull: false,
        defaultValue: 'pending_upload'
    },
    customerAccessedAt: { // Timestamp when customer accessed/downloaded
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'deliveries',
    timestamps: true
});

Delivery.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = Delivery;
