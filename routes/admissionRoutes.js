const express = require('express');
const router = express.Router();
const {
    createAdmission,
    getAllAdmissions,
    updateAdmissionStatus,
    deleteAdmission
} = require('../controllers/admissionController');

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const adminToken = req.headers.authorization?.split(' ')[1];
    
    if (!adminToken || adminToken !== 'admin-token-123') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
    next();
};

// Public routes
router.post('/admission', createAdmission);

// Admin protected routes
router.get('/admission/applications', adminAuth, getAllAdmissions);
router.put('/admission/:id/status', adminAuth, updateAdmissionStatus);
router.delete('/admission/:id', adminAuth, deleteAdmission);

module.exports = router; 