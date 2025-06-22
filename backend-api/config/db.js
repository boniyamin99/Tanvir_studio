// File: config/db.js

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database Connected Successfully!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = { sequelize, connectDB };
