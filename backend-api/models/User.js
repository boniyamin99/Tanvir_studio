// File: models/User.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'accountant', 'employee', 'editor', 'customer'),
        allowNull: false,
        defaultValue: 'customer' // 'editor' role added for CMS
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    status: { // For live chat presence
        type: DataTypes.ENUM('online', 'offline'),
        defaultValue: 'offline'
    },
    lastSeen: { // To show last online time
        type: DataTypes.DATE,
        allowNull: true
    },
    pushSubscriptionToken: { // To store PWA push notification subscription object
        type: DataTypes.JSON,
        allowNull: true
    },
    cloudStorageFolderId: { // To store personal folder ID for cloud services like Google Drive/Dropbox
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true
});

// Hash password before saving the user
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Compare password method
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;