const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    applicantNumber: {
        type: String,
        required: true,
        ref: 'Admission'
    },
    studentName: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    feeCategory: {
        type: String,
        required: true,
        enum: ['Admission Fee', 'Tuition Fee', 'Development Fee', 'Library Fee', 'Transport Fee']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking']
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    academicYear: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate receipt number before validation
feePaymentSchema.pre('validate', async function(next) {
    try {
        if (!this.receiptNumber) {
            const counter = await mongoose.model('Counter').findByIdAndUpdate(
                { _id: 'receiptNumber' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            const year = new Date().getFullYear().toString().slice(-2);
            const sequence = String(counter.seq).padStart(4, '0');
            this.receiptNumber = `KPS/FEE/${year}/${sequence}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to find by receipt number
feePaymentSchema.statics.findByReceiptNumber = function(receiptNumber) {
    return this.findOne({ receiptNumber });
};

module.exports = mongoose.model('FeePayment', feePaymentSchema); 