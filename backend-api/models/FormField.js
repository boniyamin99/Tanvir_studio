const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FormField = sequelize.define('FormField', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The text displayed to the user (e.g., "Your Full Name")'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'The machine-readable name for the input (e.g., "your_full_name")'
    },
    fieldType: {
        type: DataTypes.ENUM('text', 'email', 'tel', 'textarea', 'select', 'date'),
        allowNull: false,
        defaultValue: 'text'
    },
    options: {
        type: DataTypes.JSON, // For 'select' type, stores an array of options
        allowNull: true
    },
    isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    placeholder: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'The display order of the field in the form'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'form_fields',
    timestamps: true,
    hooks: {
        // Automatically generate the 'name' attribute from the 'label' before validation
        beforeValidate: (formField) => {
            if (formField.label && !formField.name) {
                formField.name = formField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            }
        }
    }
});

module.exports = FormField;
