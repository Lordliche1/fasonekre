const express = require('express')
const router = express.Router()
const { otplessLogin, verifyOtpless2FA } = require('../controllers/otpless-auth')

router.post('/otpless', otplessLogin)
router.post('/verify-2fa', verifyOtpless2FA)

module.exports = router
