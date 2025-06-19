const Admission = require('../models/Admission');

// Create new admission
exports.createAdmission = async (req, res) => {
    try {
        console.log('Creating new admission with data:', req.body);

        // Validate required fields
        const requiredFields = ['studentName', 'dateOfBirth', 'gender', 'appliedClass', 'parentName', 'email', 'contactNumber', 'address'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: missingFields.reduce((acc, field) => {
                    acc[field] = `${field} is required`;
                    return acc;
                }, {})
            });
        }

        // Generate applicant number
        const year = new Date().getFullYear().toString().slice(-2);
        const count = await Admission.countDocuments() + 1;
        const applicantNumber = `${year}KPS${count.toString().padStart(4, '0')}`;

        // Create new admission with applicant number
        const admissionData = {
            ...req.body,
            applicantNumber,
            status: 'Pending'
        };

        console.log('Final admission data:', admissionData);

        const admission = new Admission(admissionData);
        await admission.save();

        res.status(201).json({
            success: true,
            message: 'Admission application submitted successfully',
            data: {
                applicantNumber: admission.applicantNumber,
                studentName: admission.studentName
            }
        });
    } catch (error) {
        console.error('Error in createAdmission:', error);
        
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate application',
                error: 'An application with this information already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get all admissions
exports.getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find()
            .sort({ applicationDate: -1 })
            .select('-__v')
            .lean();

        // Format the data to match frontend expectations
        const formattedAdmissions = admissions.map(admission => ({
            _id: admission._id,
            studentName: admission.studentName,
            dateOfBirth: admission.dateOfBirth,
            gender: admission.gender,
            appliedClass: admission.appliedClass,
            previousSchool: admission.previousSchool,
            applicantNumber: admission.applicantNumber,
            parentName: admission.parentName,
            contactNumber: admission.contactNumber,
            alternativeNumber: admission.alternativeNumber,
            email: admission.email,
            address: admission.address,
            status: admission.status,
            appliedDate: admission.applicationDate
        }));

        res.status(200).json({
            success: true,
            data: formattedAdmissions
        });
    } catch (error) {
        console.error('Error in getAllAdmissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admissions',
            error: error.message
        });
    }
};

// Get single admission by applicant number
exports.getAdmissionByNumber = async (req, res) => {
    try {
        const admission = await Admission.findOne({ 
            applicantNumber: req.params.applicantNumber 
        });

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'No admission found with this applicant number'
            });
        }

        res.status(200).json({
            success: true,
            data: admission
        });
    } catch (error) {
        console.error('Error in getAdmissionByNumber:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update admission status
exports.updateAdmissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Convert status to proper case for storage
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        if (!['Pending', 'Approved', 'Rejected'].includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const admission = await Admission.findByIdAndUpdate(
            id,
            { 
                status: normalizedStatus,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-__v').lean();

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission application not found'
            });
        }

        // Format the response to match frontend expectations
        const formattedAdmission = {
            ...admission,
            status: admission.status,
            appliedDate: admission.applicationDate
        };

        res.status(200).json({
            success: true,
            message: 'Admission status updated successfully',
            data: formattedAdmission
        });
    } catch (error) {
        console.error('Error in updateAdmissionStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admission status',
            error: error.message
        });
    }
};

// Delete admission
exports.deleteAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const admission = await Admission.findByIdAndDelete(id);

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admission application deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteAdmission:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting admission',
            error: error.message
        });
    }
}; 