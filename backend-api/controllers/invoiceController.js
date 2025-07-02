// backend-api/controllers/invoiceController.js

const PDFDocument = require('pdfkit');
const { Booking, User } = require('../models');
const { logActivity } = require('../utils/activityLogger'); // Added for logging unauthorized access

// @desc Generate and download a PDF invoice for a booking
// @route GET /api/invoices/:bookingId or /api/bookings/:id/invoice
// @access Private (admin, customer who owns the booking)
const downloadInvoice = async (req, res) => {
    try {
        const bookingId = req.params.bookingId || req.params.id;
        const booking = await Booking.findByPk(bookingId, {
            include: [{ model: User, as: 'customer', attributes: ['fullName', 'email'] }]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Authorize customer to only download their own invoice
        if (req.user && req.user.role === 'customer' && booking.userId !== req.user.id) {
            await logActivity(req.user.id, 'UNAUTHORIZED_INVOICE_ACCESS_ATTEMPT', `Customer tried to download invoice for booking ID ${bookingId} (not owned).`, {
                targetId: bookingId,
                targetType: 'invoice',
                ipAddress: req.ip
            });
            return res.status(403).json({ message: 'Not authorized to download this invoice.' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set response headers to trigger download
        const filename = `invoice-${booking.id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe the PDF document directly to the response
        doc.pipe(res);

        // --- Start Generating PDF Content ---

        // Header
        doc.fontSize(20).text('Tanvir Studio - INVOICE', { align: 'center' });
        doc.moveDown(2);

        // Invoice Details
        doc.fontSize(12).text(`Invoice #: ${booking.invoiceId || booking.id}`);
        doc.text(`Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Client Information
        doc.text('Bill To:');
        doc.text(booking.clientName);
        doc.text(booking.clientEmail);
        doc.moveDown(2);

        // Invoice Table Header
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, 300);
        doc.text('Amount', 450, 300, { width: 100, align: 'right' });
        doc.font('Helvetica');
        doc.lineCap('butt').moveTo(50, 320).lineTo(550, 320).stroke();
        doc.moveDown();

        // Invoice Table Row
        const description = `Studio Service: ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)}`;
        doc.text(description, 50, 330);
        doc.text(`৳${booking.totalAmount.toLocaleString()}`, 450, 330, { width: 100, align: 'right' });
        doc.moveDown(2);
        doc.lineCap('butt').moveTo(50, 350).lineTo(550, 350).stroke();

        // Summary
        const summaryY = 370;
        doc.font('Helvetica-Bold');
        doc.text('Total Amount:', 350, summaryY);
        doc.text(`৳${booking.totalAmount.toLocaleString()}`, 450, summaryY, { width: 100, align: 'right' });

        doc.font('Helvetica');
        doc.text('Amount Paid:', 350, summaryY + 20);
        doc.text(`৳${booking.paidAmount.toLocaleString()}`, 450, summaryY + 20, { width: 100, align: 'right' });

        doc.font('Helvetica-Bold');
        doc.text('Amount Due:', 350, summaryY + 40);
        doc.text(`৳${booking.dueAmount.toLocaleString()}`, 450, summaryY + 40, { width: 100, align: 'right' });
        doc.moveDown(4);


        // Footer
        doc.fontSize(10).text('Thank you for your business!', { align: 'center' });


        // --- End Generating PDF Content ---
        doc.end();

    } catch (error) {
        console.error('Error generating PDF invoice:', error);
        res.status(500).json({ message: 'Server error while generating invoice.' });
    }
};

module.exports = {
    downloadInvoice
};
