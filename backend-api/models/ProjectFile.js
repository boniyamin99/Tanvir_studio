// models/ProjectFile.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');
const User = require('./User');

const ProjectFile = sequelize.define('ProjectFile', {
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
    uploaderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        comment: 'ID of the user who uploaded the file'
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The original name of the file'
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The URL of the file in cloud storage (e.g., S3 link)'
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'The MIME type of the file (e.g., audio/wav)'
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'File size in bytes'
    },
    uploadedBy: {
        type: DataTypes.ENUM('client', 'studio'),
        allowNull: false,
        comment: 'To easily distinguish who uploaded the file'
    }
}, {
    tableName: 'project_files',
    timestamps: true // This will add createdAt and updatedAt
});

// Associations are defined centrally in models/index.js
// So, remove any association definitions from here if they exist.
// ProjectFile.belongsTo(Booking, { foreignKey: 'bookingId' });
// Booking.hasMany(ProjectFile, { foreignKey: 'bookingId' });
// ProjectFile.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });
// User.hasMany(ProjectFile, { foreignKey: 'uploaderId' });

module.exports = ProjectFile;
