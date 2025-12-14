const User = require('../models/User')
const Admin = require('../models/Admin')
const Officer = require('../models/Officer')
const ServiceMan = require('../models/ServiceMan')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors/')
const { sendOTP } = require('../utils/sendEmail')
const crypto = require('crypto');

// Fonction utilitaire pour générer OTP (6 chiffres)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Initialiser la connexion (Vérif MDP + Envoi OTP)
const universalLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            throw new BadRequestError('Veuillez fournir email et mot de passe')
        }

        let user = null;
        let role = '';
        let Model = null;

        // Stratégie de recherche en cascade
        // 1. Admin
        user = await Admin.findOne({ email });
        if (user) { role = 'admin'; Model = Admin; }

        // 2. Officer
        if (!user) {
            user = await Officer.findOne({ email });
            if (user) { role = 'officer'; Model = Officer; }
        }

        // 3. ServiceMan
        if (!user) {
            user = await ServiceMan.findOne({ email });
            if (user) { role = 'serviceman'; Model = ServiceMan; }
        }

        // 4. User (Citoyen)
        if (!user) {
            user = await User.findOne({ email });
            if (user) { role = 'citizen'; Model = User; }
        }

        // Si aucun utilisateur
        if (!user) {
            throw new UnauthenticatedError('Identifiants invalides');
        }

        // Vérification MDP
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new UnauthenticatedError('Identifiants invalides');
        }

        // --- DÉBUT 2FA ---
        const otp = generateOTP();

        // Sauvegarder hash de code + expiration (10 min)
        user.otpCode = otp; // Idéalement on le hacherait, mais pour l'instant stocké clair pour debug facile si besoin, ou crypter. Ici stocké tel quel.
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Envoyer Email
        try {
            await sendOTP(user.email, otp);
        } catch (emailError) {
            console.error('Erreur envoi email OTP:', emailError);
            user.otpCode = undefined;
            user.otpExpires = undefined;
            await user.save();
            throw new Error('Impossible d\'envoyer le code de vérification');
        }

        console.log(`🔑 OTP généré pour ${user.email} (Role: ${role})`);

        // Réponse spéciale : OTP requis
        return res.status(StatusCodes.OK).json({
            requireOtp: true,
            email: user.email,
            role: role, // Informatif pour le frontend
            message: `Un code de vérification a été envoyé à ${user.email}`
        });

    } catch (error) {
        console.error('Login Error:', error);
        if (error instanceof UnauthenticatedError || error instanceof BadRequestError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

// 2. Vérifier l'OTP et délivrer le Token
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw new BadRequestError('Email et Code OTP requis');
        }

        let user = null;
        let role = '';
        let redirectTo = '/';

        // Recherche (on doit retrouver le user sans savoir son rôle a priori, 
        // ou le frontend peut renvoyer le rôle, mais cherchons par sécurité).

        // Admin
        user = await Admin.findOne({ email }).select('+otpCode');
        if (user) { role = 'admin'; redirectTo = '/admin'; }

        if (!user) {
            user = await Officer.findOne({ email }).select('+otpCode');
            if (user) { role = 'officer'; redirectTo = '/department'; }
        }
        if (!user) {
            user = await ServiceMan.findOne({ email }).select('+otpCode');
            if (user) { role = 'serviceman'; redirectTo = '/serviceman'; }
        }
        if (!user) {
            user = await User.findOne({ email }).select('+otpCode');
            if (user) { role = 'citizen'; redirectTo = '/user'; } // '/userpage' dans l'ancien code
        }

        if (!user) {
            throw new UnauthenticatedError('Utilisateur introuvable');
        }

        // Vérif validité OTP
        if (user.otpCode !== otp) {
            throw new UnauthenticatedError('Code invalide');
        }
        if (user.otpExpires < Date.now()) {
            throw new UnauthenticatedError('Code expiré');
        }

        // Nettoyer OTP
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Générer Token
        const token = user.createJWT();

        // Ajuster redirection legacy si besoin
        if (role === 'citizen') redirectTo = '/userpage';
        if (role === 'officer') redirectTo = '/adminpage'; // Legacy officer route
        if (role === 'admin') redirectTo = '/admin/dashboard';

        return res.status(StatusCodes.OK).json({
            user: { name: user.name, email: user.email },
            token,
            role,
            redirectTo
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        if (error instanceof UnauthenticatedError || error instanceof BadRequestError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports = { universalLogin, verifyOTP }
