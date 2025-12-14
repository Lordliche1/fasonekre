const express = require('express');
const router = express.Router();
const {
    getDepartmentComplaints,
    getComplaint,
    assignServiceMan,
    getServiceMen,
    addServiceMan,
    updateServiceMan,
    deleteServiceMan,
    getDepartmentStats
} = require('../controllers/department');

// Plaintes
router.get('/complaints', getDepartmentComplaints);
router.get('/complaints/:id', getComplaint);
router.post('/complaints/:id/assign', assignServiceMan);

// ServiceMen
router.get('/servicemen', getServiceMen);
router.post('/servicemen', addServiceMan);
router.patch('/servicemen/:id', updateServiceMan);
router.delete('/servicemen/:id', deleteServiceMan);

// Stats
router.get('/stats', getDepartmentStats);

module.exports = router;
