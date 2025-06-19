const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { createFeePayment } = require('../controllers/feeController');

// Create new fee payment
router.post('/payments', feeController.createFeePayment);

// Get all fee payments
router.get('/payments', feeController.getAllFeePayments);

// Get fee payment by receipt number
router.get('/payments/receipt/:receiptNumber', feeController.getFeePaymentByReceipt);

// Get fee payments by applicant number
router.get('/payments/applicant/:applicantNumber', feeController.getFeePaymentsByApplicant);

// Update payment status
router.patch('/payments/:receiptNumber', feeController.updatePaymentStatus);

// Fee payment routes
router.post('/fee/payment', createFeePayment);

module.exports = router; 