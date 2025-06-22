// backend-api/routes/lyrics.js

const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');

// Route to generate lyrics using AI
router.post('/', lyricsController.generateLyrics);

module.exports = router;
