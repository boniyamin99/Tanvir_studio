const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');

const SurveyResponse = sequelize.define('SurveyResponse', {
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
        },
        unique: true, // Ensures one survey response per booking
        comment: 'Links the survey response to a specific booking'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1, // Rating should be between 1 and 5
            max: 5
        },
        comment: 'Overall rating from 1 to 5'
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed feedback or comments from the client'
    },
    wouldRecommend: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'A simple yes/no for "Would you recommend us?"'
    }
}, {
    tableName: 'survey_responses',
    timestamps: true, // `createdAt` will act as the submission date
    updatedAt: false
});

// Define associations
SurveyResponse.belongsTo(Booking, { foreignKey: 'bookingId' });
Booking.hasOne(SurveyResponse, { foreignKey: 'bookingId' });


module.exports = SurveyResponse;
