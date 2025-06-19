const FeePayment = require('../models/FeePayment');
const Admission = require('../models/Admission');

// Create new fee payment
exports.createFeePayment = async (req, res) => {
    try {
        console.log('Received fee payment data:', req.body);

        // Verify applicant exists
        const admission = await Admission.findOne({ applicantNumber: req.body.applicantNumber });
        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }

        // Generate receipt number
        const receiptNumber = 'RCP' + Date.now();

        // Create new fee payment
        const feePayment = new FeePayment({
            ...req.body,
            receiptNumber,
            paymentStatus: 'Completed'
        });
        
        const savedPayment = await feePayment.save();

        res.status(201).json({
            success: true,
            message: 'Fee payment processed successfully',
            data: {
                receiptNumber: savedPayment.receiptNumber,
                studentName: savedPayment.studentName,
                amount: savedPayment.amount,
                feeCategory: savedPayment.feeCategory,
                paymentDate: savedPayment.paymentDate,
                transactionId: savedPayment.transactionId,
                paymentStatus: savedPayment.paymentStatus
            }
        });
    } catch (error) {
        console.error('Error in createFeePayment:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error processing fee payment'
        });
    }
};

// Get all fee payments
exports.getAllFeePayments = async (req, res) => {
    try {
        const payments = await FeePayment.find()
            .sort({ paymentDate: -1 })
            .select('-__v');
        
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get fee payment by receipt number
exports.getFeePaymentByReceipt = async (req, res) => {
    try {
        const payment = await FeePayment.findByReceiptNumber(req.params.receiptNumber);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get fee payments by applicant number
exports.getFeePaymentsByApplicant = async (req, res) => {
    try {
        const payments = await FeePayment.find({ applicantNumber: req.params.applicantNumber })
            .sort({ paymentDate: -1 })
            .select('-__v');
        
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await FeePayment.findByReceiptNumber(req.params.receiptNumber);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment not found'
            });
        }

        payment.paymentStatus = req.body.paymentStatus;
        payment.remarks = req.body.remarks;
        
        const updatedPayment = await payment.save();

        res.status(200).json({
            success: true,
            data: updatedPayment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 