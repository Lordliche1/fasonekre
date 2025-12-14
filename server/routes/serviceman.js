const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    register,
    login,
    getProfile,
    updateProfile,
    updateLocation,
    updateStatus,
    getMyComplaints,
    getComplaint,
    updateComplaintStatus,
    createReport,
    getMyReports,
    getReport,
    updateReport,
    uploadReportMedia,
    completeReport
} = require('../controllers/serviceman');

// Auth
router.post('/register', register);
router.post('/login', login);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/location', updateLocation);
router.patch('/status', updateStatus);

// Complaints
router.get('/complaints', getMyComplaints);
router.get('/complaints/:id', getComplaint);
router.patch('/complaints/:id/status', updateComplaintStatus);

// Reports
router.post('/reports', createReport);
router.get('/reports', getMyReports);
router.get('/reports/:id', getReport);
router.patch('/reports/:id', updateReport);
router.post('/reports/:id/media', upload.fields([
    { name: 'photosBefore', maxCount: 10 },
    { name: 'photosAfter', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'audioNotes', maxCount: 5 }
]), uploadReportMedia);
router.post('/reports/:id/complete', completeReport);

module.exports = router;
