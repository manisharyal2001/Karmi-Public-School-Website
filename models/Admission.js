const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    applicantNumber: {
        type: String,
        required: true,
        unique: true
    },
    studentName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    appliedClass: {
        type: String,
        required: true
    },
    parentName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    alternativeNumber: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    previousSchool: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate applicant number before saving
admissionSchema.pre('save', async function(next) {
    if (!this.applicantNumber) {
        try {
            const Counter = require('./Counter');
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'applicantNumber' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            // Get last two digits of the year
            const year = new Date().getFullYear().toString().slice(-2);
            // School code
            const schoolCode = 'KPS';
            // Pad sequence number to 4 digits
            const sequence = String(counter.seq).padStart(4, '0');
            
            // Format: YYKPSXXXX (e.g., 25KPS0001)
            this.applicantNumber = `${year}${schoolCode}${sequence}`;
        } catch (error) {
            console.error('Error generating applicant number:', error);
            throw error;
        }
    }
    next();
});

// Update timestamps
admissionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add method to find by applicant number
admissionSchema.statics.findByApplicantNumber = function(applicantNumber) {
    return this.findOne({ applicantNumber });
};

module.exports = mongoose.model('Admission', admissionSchema); 