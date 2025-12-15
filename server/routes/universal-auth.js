const express = require('express')
const router = express.Router()
const { universalLogin, verifyOTP } = require('../controllers/universal-auth')

// Route de connexion universelle
router.post('/universal-login', universalLogin)
router.post('/verify-otp', verifyOTP)

module.exports = router
