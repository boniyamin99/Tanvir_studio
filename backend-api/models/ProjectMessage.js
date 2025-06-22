const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');
const User = require('./User');

const ProjectMessage = sequelize.define('ProjectMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Booking,
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'project_messages',
    timestamps: true // This will add createdAt and updatedAt
});

// Define associations
ProjectMessage.belongsTo(Booking, { foreignKey: 'bookingId' });
Booking.hasMany(ProjectMessage, { foreignKey: 'bookingId' });

ProjectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(ProjectMessage, { foreignKey: 'senderId' });


module.exports = ProjectMessage;
