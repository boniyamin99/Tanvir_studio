// backend-api/controllers/lyricsController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure you have a .env file with GEMINI_API_KEY=YOUR_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in .env file. AI Lyrics generation will not work.");
    // Exit or throw an error if API key is critical for server start
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.generateLyrics = async (req, res) => {
    const { topic, language, lines } = req.body;

    if (!topic || !language || !lines) {
        return res.status(400).json({ message: 'Missing topic, language, or lines for lyrics generation.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or "gemini-1.5-flash" / "gemini-1.5-pro" if you have access

        const prompt = `You are a poetic lyricist specializing in Islamic spiritual songs (Nasheeds). A Nasheed is a vocal-only piece of music with lyrics that praise Allah, describe the Prophet Muhammad (PBUH), or convey Islamic values.
        
        Please generate a Nasheed with approximately ${lines} lines in the ${language} language.
        
        The topic for the Nasheed is: "${topic}".
        
        The lyrics should be soulful, inspiring, deeply spiritual, and reflect Islamic values. Do not include musical cues, titles like "Verse" or "Chorus", or any other text—just provide the raw lyrics.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ lyrics: text });
    } catch (error) {
        console.error('Error generating lyrics with Gemini API:', error);
        res.status(500).json({ message: 'Failed to generate lyrics. Please try again later.', error: error.message });
    }
};