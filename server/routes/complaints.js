const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { getAllComplaints, getComplaint, createComplaint, deleteComplaint, sendReminder, rateOfficer, reopenTask } = require('../controllers/complaints')

// const { roleAuthenticationMiddleware } = require('../middleware/roleAuthentication')

router.route('/').get(getAllComplaints).post(
    upload.fields([
        { name: 'photos', maxCount: 10 },
        { name: 'videos', maxCount: 5 },
        { name: 'audio', maxCount: 5 }
    ]),
    createComplaint
)
router.route('/:id').get(getComplaint).delete(deleteComplaint).patch(reopenTask)
router.route('/reminder/:id').patch(sendReminder);
router.route('/rateOfficer/:id').patch(rateOfficer);


module.exports = router