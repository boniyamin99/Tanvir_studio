const { Delivery, Booking } = require('../models');
// const { logActivity } = require('../utils/activityLogger');

// @desc    Create a new delivery record for a booking
// @route   POST /api/deliveries
// @access  Private (admin, employee)
const createDelivery = async (req, res) => {
    const { bookingId, notes } = req.body;

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }

    try {
        // Check if a delivery for this booking already exists
        const existingDelivery = await Delivery.findOne({ where: { bookingId } });
        if (existingDelivery) {
            return res.status(400).json({ message: 'A delivery record for this booking already exists.' });
        }
        
        const finalFilePath = req.file.location; // URL from multer-s3

        const delivery = await Delivery.create({
            bookingId,
            notes,
            finalFilePath,
            status: 'delivered_access_granted' // Update status
        });

        // Optionally, update the booking status as well
        await Booking.update({ status: 'completed' }, { where: { id: bookingId } });

        // --- Log Activity ---
        // await logActivity(req.user.id, 'DELIVERY_CREATED', `File delivered for booking #${bookingId}`);

        res.status(201).json({ message: 'File delivered successfully!', delivery });

    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ message: 'Server error while creating delivery record.' });
    }
};


// @desc    Get all delivery records
// @route   GET /api/deliveries
// @access  Private (admin)
const getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll({
            include: [{
                model: Booking,
                attributes: ['id', 'clientName', 'serviceType']
            }],
            order: [['deliveryDate', 'DESC']]
        });
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ message: 'Server error while fetching delivery records.' });
    }
};


module.exports = {
    createDelivery,
    getDeliveries
};
