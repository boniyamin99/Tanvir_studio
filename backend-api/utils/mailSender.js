// File: backend-api/utils/mailSender.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

/**
 * Configuration for the email transporter using Brevo (Sendinblue).
 * Ensure SENDER_EMAIL_ADDRESS, BREVO_SMTP_USER, BREVO_SMTP_PASSWORD are set in your .env file.
 */
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo's SMTP host
    port: 587, // Standard port for TLS
    secure: false, // Use TLS (true for 465, false for 587)
    auth: {
        user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP Login (usually your account email or generated)
        pass: process.env.BREVO_SMTP_PASSWORD, // Your Brevo SMTP Password
    },
});

/**
 * Sends an email using the configured transporter.
 * @param {object} mailOptions - Object containing email details.
 * @param {string} mailOptions.to - Recipient's email address.
 * @param {string} mailOptions.subject - Subject of the email.
 * @param {string} mailOptions.html - HTML content of the email.
 * @param {string} [mailOptions.text] - Plain text content (optional, good fallback).
 */
const sendEmail = async (mailOptions) => {
    try {
        const defaultSender = process.env.SENDER_EMAIL_ADDRESS;

        if (!defaultSender) {
            console.error('Error: SENDER_EMAIL_ADDRESS is not defined in .env file.');
            throw new Error('Email sender address not configured.');
        }

        const info = await transporter.sendMail({
            from: `Tanvir Studio <${defaultSender}>`, // Sender address (must be a verified sender in Brevo)
            to: mailOptions.to, // List of receivers
            subject: mailOptions.subject, // Subject line
            html: mailOptions.html, // HTML body
            text: mailOptions.text || mailOptions.html, // Plain text body, fallback to HTML
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = {
    sendEmail,
};
