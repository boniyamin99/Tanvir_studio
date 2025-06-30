// File: models/index.js

const { sequelize } = require('../config/db');

// Import all your models
const User = require('./User');
const Booking = require('./Booking');
const Employee = require('./Employee');
const Payment = require('./Payment');
const Expense = require('./Expense');
const Delivery = require('./Delivery');
const ActivityLog = require('./ActivityLog');       
const FormField = require('./FormField');           
const ProjectMessage = require('./ProjectMessage'); 
const ProjectFile = require('./ProjectFile');       
const SurveyResponse = require('./SurveyResponse'); 


// Define Associations
// =========================================================================

// User - Booking Associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'customerMadeBookings' }); // Changed alias
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// User - Employee Associations
User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeInfo' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'userInfo' });

// Booking - Employee (assigned) Associations
User.hasMany(Booking, { foreignKey: 'assignedEmployeeId', as: 'employeeAssignedBookings' }); // Changed alias
Booking.belongsTo(User, { foreignKey: 'assignedEmployeeId', as: 'assignedEmployee' });

// Booking - Payment Associations
Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Booking - Delivery Associations
Booking.hasOne(Delivery, { foreignKey: 'bookingId', as: 'delivery' });
Delivery.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Expense - User (recordedBy) Association
User.hasMany(Expense, { foreignKey: 'recordedBy', as: 'recordedExpenses' });
Expense.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

// ActivityLog - User Association
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Booking - ProjectMessage Association (for project-specific chat/communication)
Booking.hasMany(ProjectMessage, { foreignKey: 'bookingId', as: 'projectMessages' });
ProjectMessage.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
User.hasMany(ProjectMessage, { foreignKey: 'senderId', as: 'sentMessages' });
ProjectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });


// Booking - ProjectFile Association (for project-specific file sharing)
Booking.hasMany(ProjectFile, { foreignKey: 'bookingId', as: 'projectFiles' });
ProjectFile.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
User.hasMany(ProjectFile, { foreignKey: 'uploaderId', as: 'uploadedFiles' });
ProjectFile.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });


// Booking - SurveyResponse Association
Booking.hasOne(SurveyResponse, { foreignKey: 'bookingId', as: 'surveyResponse' });
SurveyResponse.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });


// Note: FormField has no direct associations with other models based on its current structure,
// as it defines the form structure itself, not data linked to other entities.


// =========================================================================

// Sync all models with the database
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true }); 
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error syncing models:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Booking,
    Employee,
    Payment,
    Expense,
    Delivery,
    ActivityLog,    
    FormField,      
    ProjectMessage, 
    ProjectFile,    
    SurveyResponse, 
    syncModels
};
