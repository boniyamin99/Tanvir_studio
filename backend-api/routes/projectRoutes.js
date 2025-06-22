// backend-api/routes/projectRoutes.js

const express = require('express');
const { 
    getProjectDetails, 
    addProjectMessage,
    uploadProjectFile
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');

const router = express.Router();

// All routes here are protected and related to a specific project
const allowedRoles = ['admin', 'manager', 'employee', 'customer'];

// Route to get all data for the project details page
router.route('/:id')
    .get(protect, authorizeRoles(...allowedRoles), getProjectDetails);

// Route to post a new message in the project's chat
router.route('/:id/messages')
    .post(protect, authorizeRoles(...allowedRoles), addProjectMessage);
    
// Route to upload a file to the project
router.route('/:id/files')
    .post(
        protect, 
        authorizeRoles(...allowedRoles), 
        upload.single('projectFile'), // 'projectFile' is the name of the form field for the file
        uploadProjectFile
    );

module.exports = router;
