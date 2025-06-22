// backend-api/controllers/bookingController.js

const { Booking, User } = require('../models'); // Assuming your Booking model is defined here
// const invoiceService = require('../services/invoiceService'); // Future service for PDF generation
// const jobScheduler = require('../services/jobScheduler'); // Future service for scheduling tasks like surveys

// A dummy price map for calculating total amount. In a real app, this might come from a database table.
// Ensure these match your frontend package prices
const servicePriceMap = {
    'Basic': 3000,
    'Standard': 6000,
    'Premium': 10000,
};

// @desc    Create a new booking with advance payment from the public frontend
// @route   POST /api/bookings
// @access  Public (for website users)
const createBooking = async (req, res) => {
    // These are the fields coming from the new index.html booking form
    const {
        clientName,
        clientPhone,
        clientEmail,
        selectedPackage, // Renamed from serviceType
        bookingDate,     // ISO string date from frontend
        timeSlot,        // e.g., "10:00 - 12:00"
        paymentAmount,   // The actual amount paid by the user
        transactionIdLast4, // Last 4 digits of bKash/Nagad number
        termsAgreed      // Boolean if terms are agreed
    } = req.body;

    // Basic validation
    if (!clientName || !clientPhone || !selectedPackage || !bookingDate || !timeSlot || !paymentAmount || !transactionIdLast4 || !termsAgreed) {
        return res.status(400).json({ message: 'Please fill all required booking details and confirm terms.' });
    }
    if (!termsAgreed) {
        return res.status(400).json({ message: 'You must agree to the terms and conditions.' });
    }
    if (transactionIdLast4.length !== 4 || !/^\d+$/.test(transactionIdLast4)) {
        return res.status(400).json({ message: 'Transaction ID should be exactly 4 digits.' });
    }

    try {
        const totalAmount = servicePriceMap[selectedPackage];
        if (totalAmount === undefined) {
            return res.status(400).json({ message: 'Invalid package selected.' });
        }

        // Validate paymentAmount against minimum and total price
        if (paymentAmount < 1000 || paymentAmount > totalAmount) {
            return res.status(400).json({ message: `Payment amount must be between ৳1,000 and ৳${totalAmount}.` });
        }
        
        const dueAmount = totalAmount - paymentAmount;
        // Determine payment status based on amount paid
        const paymentStatus = paymentAmount >= totalAmount ? 'paid' : 'partially_paid';
        const bookingStatus = 'pending'; // Initial status for new bookings awaiting admin approval

        // Create the booking in the database
        const booking = await Booking.create({
            clientName,
            clientEmail,    // This might be optional, depending on your frontend form setup
            clientPhone,
            serviceType: selectedPackage, // Map to existing serviceType field
            bookingDate: new Date(bookingDate), // Convert ISO string to Date object
            bookingTime: timeSlot,
            message: `Package: ${selectedPackage}, Time: ${timeSlot}, Transaction Last 4: ${transactionIdLast4}`, // Combine message/details
            totalAmount,
            paidAmount: paymentAmount,
            dueAmount,
            paymentStatus,
            status: bookingStatus, // All new bookings are 'pending' admin approval initially
            // userId: req.user ? req.user.id : null, // If you implement user login for clients, you'd use this
            transactionId: transactionIdLast4 // Storing the last 4 digits
        });

        // --- PDF Invoice Generation (Placeholder - keep if you plan to implement this later) ---
        // In a real implementation, you would call a service to generate and save the invoice
        // const invoiceId = await invoiceService.generate(booking);
        // await booking.update({ invoiceId: invoiceId });
        // For now, we'll just simulate it or remove if not needed
        // await booking.update({ invoiceId: `INV-${booking.id}-${Date.now()}` }); // Removed for now, as it needs an actual invoice ID logic

        res.status(201).json({
            message: 'Booking request submitted! We will confirm after payment verification.',
            bookingId: booking.id, // Return the ID for frontend confirmation
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error while processing booking. Please try again.' });
    }
};

// @desc    Get all bookings (Admin/Manager)
// @route   GET /api/bookings
// @access  Private (admin, manager, accountant)
const getAllBookings = async (req, res) => {
  // This function remains the same, but will now return the new fields from the model
  try {
    const bookings = await Booking.findAll({
      // Ensure 'User' model is included if you link bookings to users
      // include: [{ model: User, as: 'customer', attributes: ['username', 'email'] }], 
      order: [['bookingDate', 'DESC']],
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};


// @desc    Update booking status (Admin/Manager)
// @route   PUT /api/bookings/:id/status
// @access  Private (admin, manager)
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'ready_for_review', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        booking.status = status;
        await booking.save();

        // --- Automated Feedback Survey Trigger (Placeholder) ---
        if (status === 'completed' && !booking.isFeedbackSurveySent) {
            // Schedule a job to send a feedback email after 2 days
            // jobScheduler.schedule('send-feedback-email', 'in 2 days', { bookingId: booking.id });
            console.log(`Scheduling feedback survey for booking ID: ${booking.id}`);
        }

        res.status(200).json({
            message: 'Booking status updated successfully!',
            booking,
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error while updating booking status.' });
    }
};

// Other functions like getBookingById, assignEmployeeToBooking, deleteBooking
// should remain here if they are part of your existing bookingController.js
// and are used by your admin panel.

module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  // ... other exported functions (getBookingById, assignEmployeeToBooking, deleteBooking)
};