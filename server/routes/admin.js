const express = require('express')
const router = express.Router()
const {
    registerOfficer,
    getAdminDetails,
    getOfficerData,
    deleteOfficer,
    updateOfficer,
    toggleOfficerStatus,
    getServices,
    createService,
    updateService,
    deleteService
} = require('../controllers/admin')
const {
    getDashboardStats,
    getCitizens,
    createCitizen,
    getCitizenById,
    updateCitizenStatus
} = require('../controllers/adminController');

const {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignInCharge
} = require('../controllers/departmentController');

// Routes admin existantes
router.route('/registerOfficer').post(registerOfficer)
router.route('/').get(getAdminDetails)
router.route('/getOfficerData').get(getOfficerData)
router.route('/deleteOfficer/:id').delete(deleteOfficer)

// Nouvelles routes Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Nouvelles routes Citizens
router.get('/citizens', getCitizens);
router.post('/citizens', createCitizen);
router.get('/citizens/:id', getCitizenById);
router.put('/citizens/:id/status', updateCitizenStatus);

// Nouvelles routes Departments
router.get('/departments', getAllDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.put('/departments/:id/assign-incharge', assignInCharge);

// Routes Officers (In-Charge)
router.get('/officers', getOfficerData);
router.post('/officers', registerOfficer);
router.patch('/officers/:id', updateOfficer);
router.delete('/officers/:id', deleteOfficer);
router.patch('/officers/:id/toggle-status', toggleOfficerStatus);

// Routes Services
router.get('/services', getServices);
router.post('/services', createService);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router


