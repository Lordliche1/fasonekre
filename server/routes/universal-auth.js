const express = require('express')
const router = express.Router()
const { universalLogin } = require('../controllers/universal-auth')

// Route de connexion universelle
router.post('/universal-login', universalLogin)

module.exports = router
