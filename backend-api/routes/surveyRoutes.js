const express = require('express');
const { 
    createSurveyResponse, 
    getSurveyResponses 
} = require('../controllers/surveyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for clients to submit a new survey response (publicly accessible via a unique link)
router.route('/')
    .post(createSurveyResponse);

// Route for admins to get all survey responses
router.route('/')
    .get(protect, authorizeRoles('admin', 'manager'), getSurveyResponses);


module.exports = router;
