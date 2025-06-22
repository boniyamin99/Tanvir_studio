const express = require('express');
const { getAllLogs } = require('../controllers/logController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// This route will fetch all activity logs
// Access is restricted to admins only for security reasons
router.route('/')
    .get(
        protect,
        authorizeRoles('admin'), 
        getAllLogs
    );

module.exports = router;
