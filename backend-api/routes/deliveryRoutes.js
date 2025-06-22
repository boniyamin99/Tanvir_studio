const express = require('express');
const { createDelivery, getDeliveries } = require('../controllers/deliveryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader'); // Our cloud uploader utility

const router = express.Router();

// Route to get all delivery records
router.route('/')
    .get(protect, authorizeRoles('admin', 'manager'), getDeliveries);

// Route to create a new delivery (upload a file)
router.route('/')
    .post(
        protect,
        authorizeRoles('admin', 'manager', 'employee'),
        upload.single('finalFile'), // Middleware to upload a single file from a form field named 'finalFile'
        createDelivery
    );

module.exports = router;
