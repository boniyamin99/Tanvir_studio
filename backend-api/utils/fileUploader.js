// File: backend-api/utils/fileUploader.js

const multer = require('multer');
const path = require('path');
// No need for aws-sdk or multerS3 for local storage

// Configure disk storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this directory exists on your VPS!
        // You'll need to create it manually if it doesn't exist.
        // For example: sudo mkdir -p /var/www/tanvir_studio_app/uploads
        // sudo chown -R root:root /var/www/tanvir_studio_app/uploads
        cb(null, '/var/www/tanvir_studio_app/uploads'); // Path to store uploaded files
    },
    filename: function (req, file, cb) {
        // Create a unique filename for the uploaded file
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File type filter to allow only specific file formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp3|wav|mp4|mov|avi/; // Added video types for general use
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: File type not allowed! Only images, PDFs, and audio/video files are permitted.'));
};

const upload = multer({
    storage: storage, // Using disk storage now
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
    fileFilter: fileFilter
});

// No need for a deleteFile function here, as local file deletion needs more careful handling
// and is typically done using Node.js's 'fs' module in a controller if needed.

module.exports = upload;
