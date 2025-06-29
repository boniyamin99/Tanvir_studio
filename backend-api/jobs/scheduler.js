// File: backend-api/jobs/scheduler.js

const cron = require('node-cron');
const { Booking } = require('../models');
const { Op } = require('sequelize');
// const emailSender = require('../utils/emailSender'); // Old import, removed
const { sendEmail } = require('../utils/mailSender'); // New import for sendEmail utility

const sendSurveyEmails = async () => {
    console.log('Running scheduled job: Checking for completed bookings to send surveys...');

    try {
        // Find bookings that were completed 2 days ago and haven't had a survey sent yet.
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // Set to 2 days in the past

        // To ensure comparison is at the start of the day for `updatedAt`
        twoDaysAgo.setHours(0, 0, 0, 0); 
        
        // Find bookings where status is completed, survey not sent, and updated at least 2 days ago
        const eligibleBookings = await Booking.findAll({
            where: {
                status: 'completed',
                isFeedbackSurveySent: false,
                updatedAt: { // Assuming 'updatedAt' is set when status becomes 'completed'
                    [Op.lte]: twoDaysAgo
                }
            }
        });

        if (eligibleBookings.length === 0) {
            console.log('No eligible bookings found for survey emails.');
            return;
        }

        console.log(`Found ${eligibleBookings.length} bookings to send survey emails.`);

        for (const booking of eligibleBookings) {
            // 1. Send the email
            const surveyLink = `${process.env.CLIENT_URL}/survey.html?bookingId=${booking.id}`; // Ensure survey.html exists in frontend
            const mailOptions = {
                to: booking.clientEmail,
                subject: `We'd love your feedback on your project with Tanvir Studio!`,
                html: `<p>Hello ${booking.clientName},</p>
                       <p>Thank you for working with us on your recent project. We would love to hear your feedback to improve our services.</p>
                       <p>Please take a moment to fill out our short survey by clicking the link below:</p>
                       <a href="${surveyLink}">Click here to give feedback</a>
                       <p>Thank you,<br>Tanvir Studio Team</p>`
            };
            
            await sendEmail(mailOptions); // Activate sending email
            console.log(`Successfully sent survey email to ${booking.clientEmail} for booking #${booking.id}`);


            // 2. Update the booking to mark that the survey has been sent
            await booking.update({ isFeedbackSurveySent: true });
        }

    } catch (error) {
        console.error('Error in scheduled job sendSurveyEmails:', error);
    }
};


// Main function to initialize all scheduled jobs
const initializeJobs = () => {
    // Schedule the task to run once every day at 10 AM (UTC).
    // Cron format: (minute hour day-of-month month day-of-week)
    cron.schedule('0 10 * * *', sendSurveyEmails); // Adjust time zone as needed

    console.log('Scheduled jobs initialized.');
};

module.exports = initializeJobs;
