const express = require('express');
const {
    getFormFields,
    createFormField,
    updateFormField,
    deleteFormField,
    updateFieldsOrder
} = require('../controllers/formController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();


// Route to get the structure of the public booking form
router.route('/booking-form').get(getFormFields);

// Route to update the order of the fields
router.route('/booking-form/order')
    .put(protect, authorizeRoles('admin'), updateFieldsOrder);


// Routes for Creating, Updating, and Deleting individual fields
router.route('/form-fields')
    .post(protect, authorizeRoles('admin'), createFormField);

router.route('/form-fields/:id')
    .put(protect, authorizeRoles('admin'), updateFormField)
    .delete(protect, authorizeRoles('admin'), deleteFormField);


module.exports = router;
