const { SurveyResponse, Booking } = require('../models');

// @desc    Create a new survey response
// @route   POST /api/surveys
// @access  Public (accessible via a unique link sent to client's email)
const createSurveyResponse = async (req, res) => {
    const { bookingId, rating, comments, wouldRecommend } = req.body;

    if (!bookingId || !rating) {
        return res.status(400).json({ message: 'Booking ID and a rating are required.' });
    }

    try {
        // 1. Check if a survey for this booking has already been submitted
        const existingResponse = await SurveyResponse.findOne({ where: { bookingId } });
        if (existingResponse) {
            return res.status(400).json({ message: 'A survey for this booking has already been submitted. Thank you!' });
        }
        
        // 2. Check if the booking exists and is completed
        const booking = await Booking.findByPk(bookingId);
        if (!booking || booking.status !== 'completed') {
             return res.status(400).json({ message: 'This booking is not eligible for a survey at this time.' });
        }

        // 3. Create the new survey response
        const surveyResponse = await SurveyResponse.create({
            bookingId,
            rating,
            comments,
            wouldRecommend
        });

        res.status(201).json({ message: 'Thank you for your valuable feedback!', surveyResponse });

    } catch (error) {
        console.error('Error submitting survey response:', error);
        res.status(500).json({ message: 'Server error while submitting your feedback.' });
    }
};


// @desc    Get all survey responses (for admin panel)
// @route   GET /api/surveys
// @access  Private (admin)
const getSurveyResponses = async (req, res) => {
    try {
        const responses = await SurveyResponse.findAll({
            include: [{
                model: Booking,
                attributes: ['id', 'clientName', 'serviceType']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(responses);
    } catch (error) {
        console.error('Error fetching survey responses:', error);
        res.status(500).json({ message: 'Server error while fetching responses.' });
    }
};

module.exports = {
    createSurveyResponse,
    getSurveyResponses
};
