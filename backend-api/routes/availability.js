// backend-api/routes/availability.js

const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// Route to get booking availability (unavailable days, dates, booked slots)
router.get('/', availabilityController.getAvailability);

module.exports = router;