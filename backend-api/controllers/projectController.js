// backend-api/controllers/ProjectController.js

const { Booking, User, ProjectMessage, ProjectFile } = require('../models');
// const { getIo } = require('../socket'); // For Socket.IO real-time communication
const { logActivity } = require('../utils/activityLogger'); // For logging activities

// @desc    Get all details for a specific project (booking)
// @route   GET /api/projects/:id
// @access  Private (client who owns it, or admin/employee)
const getProjectDetails = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const project = await Booking.findByPk(bookingId, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'fullName', 'username', 'email', 'phoneNumber'] },
                { model: User, as: 'assignedEmployee', attributes: ['id', 'fullName'] },
                { model: ProjectMessage, as: 'projectMessages', include: [{ model: User, as: 'sender', attributes: ['id', 'fullName', 'role'] }], order: [['createdAt', 'ASC']] },
                { model: ProjectFile, as: 'projectFiles', include: [{ model: User, as: 'uploader', attributes: ['id', 'fullName', 'role'] }], order: [['createdAt', 'DESC']] },
                // Add other relevant project details if they are linked to the Booking model
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // --- Applied Update 1: Authorize customer to only view their own projects ---
        // This is crucial for security. If a customer tries to view another customer's project,
        // this check will prevent it. Admins/managers/employees bypass this check.
        if (req.user && req.user.role === 'customer' && project.userId !== req.user.id) {
            await logActivity(req.user.id, 'UNAUTHORIZED_ACCESS_ATTEMPT', `Customer tried to access project ID ${bookingId} (not owned).`, {
                targetId: bookingId,
                targetType: 'project',
                ipAddress: req.ip
            });
            return res.status(403).json({ message: 'Not authorized to access this project.' });
        }
        
        // Optionally, log successful access for admin/manager/employee
        // await logActivity(req.user.id, 'PROJECT_VIEWED', `Viewed project ID ${bookingId}.`, {
        //     targetId: bookingId,
        //     targetType: 'project',
        //     ipAddress: req.ip
        // });

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ message: 'Server error while fetching project details.' });
    }
};

// @desc    Add a new message to a specific project's chat
// @route   POST /api/projects/:id/messages
// @access  Private (client who owns it, or admin/employee)
const addProjectMessage = async (req, res) => {
    const bookingId = req.params.id;
    const { message } = req.body;
    const senderId = req.user.id; // Sender is the authenticated user

    if (!message) {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    try {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // --- Applied Update 1: Authorize customer to only message in their own projects ---
        // Prevents a customer from sending messages to another customer's project.
        if (req.user && req.user.role === 'customer' && booking.userId !== req.user.id) {
            await logActivity(req.user.id, 'UNAUTHORIZED_MESSAGE_ATTEMPT', `Customer tried to message in project ID ${bookingId} (not owned).`, {
                targetId: bookingId,
                targetType: 'project',
                ipAddress: req.ip
            });
            return res.status(403).json({ message: 'Not authorized to message in this project.' });
        }
        // You might add a similar check for assigned employees if needed:
        // For employees, they should only be able to message if assigned or if they are admin/manager.
        // if (req.user && req.user.role === 'employee' && booking.assignedEmployeeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
        //     return res.status(403).json({ message: 'Not authorized to message in this project.' });
        // }


        const projectMessage = await ProjectMessage.create({
            bookingId,
            senderId,
            message
        });

        // --- Applied Update: Log activity for message added ---
        await logActivity(req.user.id, 'PROJECT_MESSAGE_SENT', `User ${req.user.username} sent message in project ID ${bookingId}.`, {
            targetId: bookingId,
            targetType: 'project_message',
            ipAddress: req.ip
        });

        // --- Real-time event emission using Socket.IO ---
        // Uncomment this section to enable real-time messaging updates via Socket.IO.
        // const io = getIo();
        // io.to(`project_${bookingId}`).emit('new_message', projectMessage);
        console.log(`Simulating emitting new message to room: project_${bookingId}`);


        res.status(201).json({ message: 'Message sent successfully!', message: projectMessage });

    } catch (error) {
        console.error('Error adding project message:', error);
        res.status(500).json({ message: 'Server error while adding message.' });
    }
};


// @desc    Upload a file for a specific project
// @route   POST /api/projects/:id/files
// @access  Private (client who owns it, or admin/employee)
const uploadProjectFile = async (req, res) => {
    const bookingId = req.params.id;
    const uploaderId = req.user.id;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }

    try {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // --- Applied Update 1: Authorize customer to only upload files to their own projects ---
        // Prevents a customer from uploading files to another customer's project.
        if (req.user && req.user.role === 'customer' && booking.userId !== req.user.id) {
            await logActivity(req.user.id, 'UNAUTHORIZED_FILE_UPLOAD_ATTEMPT', `Customer tried to upload file to project ID ${bookingId} (not owned).`, {
                targetId: bookingId,
                targetType: 'project',
                ipAddress: req.ip
            });
            return res.status(403).json({ message: 'Not authorized to upload files to this project.' });
        }
        // You might add a similar check for assigned employees if needed:
        // For employees, they should only be able to upload if assigned or if they are admin/manager.
        // if (req.user && req.user.role === 'employee' && booking.assignedEmployeeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
        //     return res.status(403).json({ message: 'Not authorized to upload files to this project.' });
        // }

        // Determine if the uploader is from the studio or is the client
        const uploadedBy = (req.user.role === 'admin' || req.user.role === 'employee' || req.user.role === 'manager') 
            ? 'studio' 
            : 'client';

        const projectFile = await ProjectFile.create({
            bookingId,
            uploaderId,
            uploadedBy,
            fileName: req.file.originalname,
            filePath: req.file.location, // URL from multer-s3
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        // --- Applied Update: Log activity for file upload ---
        await logActivity(req.user.id, 'PROJECT_FILE_UPLOADED', `User ${req.user.username} uploaded file '${req.file.originalname}' to project ID ${bookingId}.`, {
            targetId: bookingId,
            targetType: 'project_file',
            ipAddress: req.ip
        });

        // --- Real-time event emission using Socket.IO ---
        // Uncomment this section to enable real-time file upload notifications via Socket.IO.
        // const io = getIo();
        // io.to(`project_${bookingId}`).emit('file_uploaded', projectFile);
        console.log(`Simulating emitting file upload notification to room: project_${bookingId}`);

        res.status(201).json({ message: 'File uploaded successfully!', file: projectFile });

    } catch (error) {
        console.error('Error uploading project file:', error);
        res.status(500).json({ message: 'Server error while uploading file.' });
    }
};


module.exports = {
    getProjectDetails,
    addProjectMessage,
    uploadProjectFile // <-- Export the new function
};
