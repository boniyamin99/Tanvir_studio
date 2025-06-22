// backend-api/server.js

const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');

// --- Main Application Components ---
const { connectDB } = require('./config/db');
const { syncModels } = require('./models');
const { initializeSocket } = require('./socket');
const initializeJobs = require('./jobs/scheduler');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO (ensure this is correctly set up in socket.js to use 'server' object)
initializeSocket(server);

// Connect to DB, Sync Models, and Start Jobs
const initializeApp = async () => {
    try {
        await connectDB();
        await syncModels();
        initializeJobs();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};
initializeApp();

// --- Core Middleware ---
// Ensure CORS origin is correctly configured for your frontend domain
app.use(cors({
    // Replace 'http://localhost:5500' with your actual frontend domain when deploying
    origin: process.env.FRONTEND_URL || 'http://localhost:5500', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(helmet());
app.use(hpp());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Import All Application Routes ---
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const logRoutes = require('./routes/logRoutes');
const formRoutes = require('./routes/formRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const projectRoutes = require('./routes/projectRoutes');

// New imports for index.html functionality
const availabilityRoutes = require('./routes/availabilityRoutes'); // Import the new availability route
const lyricsRoutes = require('./routes/lyricsRoutes'); // Import the new lyrics route


// --- API Route Definitions ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes); // Existing booking route
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/projects', projectRoutes);

// New API routes for frontend index.html
app.use('/api/availability', availabilityRoutes); // Use the new availability route
app.use('/api/generate-lyrics', lyricsRoutes); // Use the new lyrics route (for AI Lyrics Generator)


// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Frontend should access API at http://localhost:${PORT}/api`);
});
