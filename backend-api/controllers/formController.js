const { FormField } = require('../models');

// @desc    Get all active form fields for the booking form
// @route   GET /api/forms/booking-form
// @access  Public (for rendering the form) or Private (for builder)
const getFormFields = async (req, res) => {
    try {
        const fields = await FormField.findAll({
            where: { isActive: true },
            order: [['order', 'ASC']] // Important to get fields in the correct order
        });
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching form fields:', error);
        res.status(500).json({ message: 'Server error while fetching form fields.' });
    }
};

// @desc    Create a new form field
// @route   POST /api/form-fields
// @access  Private (admin)
const createFormField = async (req, res) => {
    try {
        const { label, fieldType, options, isRequired, placeholder } = req.body;
        if (!label || !fieldType) {
            return res.status(400).json({ message: 'Label and field type are required.' });
        }
        const newField = await FormField.create({
            label,
            fieldType,
            options,
            isRequired,
            placeholder
        });
        res.status(201).json(newField);
    } catch (error) {
        console.error('Error creating form field:', error);
        res.status(500).json({ message: 'Server error while creating form field.' });
    }
};

// @desc    Update an existing form field
// @route   PUT /api/form-fields/:id
// @access  Private (admin)
const updateFormField = async (req, res) => {
    try {
        const field = await FormField.findByPk(req.params.id);
        if (!field) {
            return res.status(404).json({ message: 'Form field not found.' });
        }
        const updatedField = await field.update(req.body);
        res.status(200).json(updatedField);
    } catch (error) {
        console.error('Error updating form field:', error);
        res.status(500).json({ message: 'Server error while updating form field.' });
    }
};

// @desc    Delete a form field
// @route   DELETE /api/form-fields/:id
// @access  Private (admin)
const deleteFormField = async (req, res) => {
    try {
        const field = await FormField.findByPk(req.params.id);
        if (!field) {
            return res.status(404).json({ message: 'Form field not found.' });
        }
        await field.destroy();
        res.status(200).json({ message: 'Form field deleted successfully.' });
    } catch (error) {
        console.error('Error deleting form field:', error);
        res.status(500).json({ message: 'Server error while deleting form field.' });
    }
};

// @desc    Update the order of all form fields
// @route   PUT /api/forms/booking-form/order
// @access  Private (admin)
const updateFieldsOrder = async (req, res) => {
    try {
        const { order } = req.body; // Expects an array of field IDs in the new order
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: 'Order data must be an array of IDs.' });
        }

        // Using Promise.all to update all fields concurrently
        await Promise.all(
            order.map((fieldId, index) => {
                return FormField.update({ order: index }, { where: { id: fieldId } });
            })
        );
        
        res.status(200).json({ message: 'Field order updated successfully.' });
    } catch (error) {
        console.error('Error updating field order:', error);
        res.status(500).json({ message: 'Server error while updating field order.' });
    }
};


module.exports = {
    getFormFields,
    createFormField,
    updateFormField,
    deleteFormField,
    updateFieldsOrder
};
