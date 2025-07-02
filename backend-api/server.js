// backend-api/server.js

const express = require('express');
const http = require('http'); // Still needed for creating HTTP server, even without Socket.IO specific setup
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan'); // Assuming you want morgan for logging
const helmet = require('helmet'); // Assuming you want helmet for security
const hpp = require('hpp'); // Assuming you want hpp for security

// --- Main Application Components ---
const { connectDB } = require('./config/db');
const { syncModels } = require('./models'); // syncModels from models/index.js
const initializeJobs = require('./jobs/scheduler'); // Scheduler for cron jobs
const { logActivity } = require('./utils/activityLogger'); // For logging server start/stop


// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Connect to DB, Sync Models, and Start Jobs
const initializeApp = async () => {
    try {
        await connectDB(); // Connect to database
        await syncModels(); // Sync database models
        initializeJobs(); // Start scheduled cron jobs
    } catch (error) {
        console.error('Failed to initialize application:', error);
        logActivity(null, 'SERVER_ERROR', `Failed to initialize application: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
initializeApp();

// --- Core Middleware ---
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from your frontend URL
    credentials: true // Allow cookies to be sent
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded

// Security middleware
app.use(helmet());
app.use(hpp());

// Logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files from the 'uploads' directory
// This path is relative to the server.js file's location (public_html/backend-api/)
// Files are expected to be saved in public_html/backend-api/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Import All Application Routes ---
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const logRoutes = require('./routes/logRoutes'); // Assuming you have an activity log route
const formRoutes = require('./routes/formRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const projectRoutes = require('./routes/projectRoutes'); // Main project related routes

// Additional API routes (for index.html functionality)
const availabilityRoutes = require('./routes/availability'); // Used by frontend calendar
const lyricsRoutes = require('./routes/lyrics'); // Used by frontend AI lyrics generator


// --- API Route Definitions ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api/availability', availabilityRoutes);
app.use('/api/generate-lyrics', lyricsRoutes);


// --- Serve Frontend Static Files ---
// This is crucial for cPanel where Node.js app runs in a subdirectory (backend-api)
// but serves the main domain (public_html).
// This serves files from public_html (one level up from backend-api)
app.use(express.static(path.join(__dirname, '../'))); 

// --- SPA (Single Page Application) Fallback / Catch-all route ---
// This serves index.html for any unmatched route, allowing client-side routing.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'index.html'));
});


// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    logActivity(null, 'APPLICATION_ERROR', `Unhandled application error: ${err.message}`, { errorStack: err.stack });
    res.status(500).send('Something broke on the server!');
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Frontend should access API at ${process.env.CLIENT_URL}/api`);
    logActivity(null, 'SERVER_START', `Node.js server started successfully on port ${PORT}.`);
});

// Handle graceful shutdown signals (for PM2 management)
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await logActivity(null, 'SERVER_SHUTDOWN', 'Node.js server shutting down due to SIGTERM.');
    server.close(() => {
        console.log('HTTP server closed');
        // Close database connection if you have a separate method for it
        // sequelize.close(); 
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await logActivity(null, 'SERVER_SHUTDOWN', 'Node.js server shutting down due to SIGINT.');
    server.close(() => {
        console.log('HTTP server closed');
        // Close database connection
        // sequelize.close();
        process.exit(0);
    });
});
