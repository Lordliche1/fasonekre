const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors/')
// const blacklist = import('../models/Blacklist')

const auth = async (req, res, next) => {
    //check header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid')
    }

    const token = authHeader.split(' ')[1]

    // const checkIfBlacklisted = await Blacklist.findOne({ token: token });
    // if (checkIfBlacklisted) return res.sendStatus(204)

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //attach the user to the routes
        // console.log("hello");
        req.user = { userId: payload.userId, name: payload.name, role: payload.role }
        // Compatibility for old admin controllers that might expect req.admin
        if (payload.role === 'admin' || !payload.role) { // fallback if role is missing in legacy tokens
            req.admin = { adminId: payload.userId, name: payload.name }
        }

        console.log("AUTH MIDDLEWARE:", { user: req.user, admin: req.admin });
        next()

    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }

}

module.exports = auth