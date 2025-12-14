const User = require('../models/User')
const Admin = require('../models/Admin')
const Officer = require('../models/Officer')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors/')

// Connexion universelle - détecte automatiquement le rôle
const universalLogin = async (req, res) => {
    try {
        console.log('📥 [UNIVERSAL-LOGIN] Requête reçue');
        const { email, password } = req.body
        console.log('📧 [UNIVERSAL-LOGIN] Email:', email);

        if (!email || !password) {
            console.log('❌ [UNIVERSAL-LOGIN] Email ou password manquant');
            throw new BadRequestError('Veuillez fournir email et mot de passe')
        }

        // Chercher dans les 3 collections
        let user = null

        // 1. Vérifier Admin
        console.log('🔍 [UNIVERSAL-LOGIN] Recherche dans Admin...');
        user = await Admin.findOne({ email })
        console.log('👤 [UNIVERSAL-LOGIN] Admin trouvé:', user ? 'Oui (' + user.name + ')' : 'Non');

        if (user) {
            console.log('🔑 [UNIVERSAL-LOGIN] Vérification mot de passe admin...');
            const isPasswordCorrect = await user.comparePassword(password)
            console.log('✓ [UNIVERSAL-LOGIN] Mot de passe correct:', isPasswordCorrect);

            if (isPasswordCorrect) {
                console.log('🎟️ [UNIVERSAL-LOGIN] Génération token admin...');
                const token = user.createJWT()
                console.log('✅ [UNIVERSAL-LOGIN] Connexion admin réussie!');
                return res.status(StatusCodes.OK).json({
                    user: { name: user.name, email: user.email },
                    token,
                    role: 'admin',
                    redirectTo: '/admin/dashboard'
                })
            }
        }

        // 2. Vérifier Officer
        console.log('🔍 [UNIVERSAL-LOGIN] Recherche dans Officer...');
        user = await Officer.findOne({ email })
        console.log('👤 [UNIVERSAL-LOGIN] Officer trouvé:', user ? 'Oui' : 'Non');

        if (user) {
            const isPasswordCorrect = await user.comparePassword(password)
            if (isPasswordCorrect) {
                const token = user.createJWT()
                console.log('✅ [UNIVERSAL-LOGIN] Connexion officer réussie!');
                return res.status(StatusCodes.OK).json({
                    user: { name: user.name, email: user.email },
                    token,
                    role: 'officer',
                    redirectTo: '/adminpage'
                })
            }
        }

        // 3. Vérifier ServiceMan
        console.log('🔍 [UNIVERSAL-LOGIN] Recherche dans ServiceMan...');
        const ServiceMan = require('../models/ServiceMan');
        user = await ServiceMan.findOne({ email });
        console.log('👤 [UNIVERSAL-LOGIN] ServiceMan trouvé:', user ? 'Oui' : 'Non');

        if (user) {
            const isPasswordCorrect = await user.comparePassword(password);
            if (isPasswordCorrect) {
                const token = user.createJWT();
                console.log('✅ [UNIVERSAL-LOGIN] Connexion serviceman réussie!');
                return res.status(StatusCodes.OK).json({
                    user: { name: user.name, email: user.email },
                    token,
                    role: 'serviceman',
                    redirectTo: '/serviceman'
                });
            }
        }

        // 4. Vérifier User (Citoyen)
        console.log('🔍 [UNIVERSAL-LOGIN] Recherche dans User...');
        user = await User.findOne({ email })
        console.log('👤 [UNIVERSAL-LOGIN] User trouvé:', user ? 'Oui' : 'Non');

        if (user) {
            const isPasswordCorrect = await user.comparePassword(password)
            if (isPasswordCorrect) {
                const token = user.createJWT()
                console.log('✅ [UNIVERSAL-LOGIN] Connexion user réussie!');
                return res.status(StatusCodes.OK).json({
                    user: { name: user.name, email: user.email },
                    token,
                    role: 'citizen',
                    redirectTo: '/userpage'
                })
            }
        }

        // Si aucun utilisateur trouvé ou mot de passe incorrect
        console.log('❌ [UNIVERSAL-LOGIN] Identifiants invalides');
        throw new UnauthenticatedError('Identifiants invalides')

    } catch (error) {
        console.error('💥 [UNIVERSAL-LOGIN] Erreur:', error.message);
        console.error('💥 [UNIVERSAL-LOGIN] Stack:', error.stack);

        if (error instanceof UnauthenticatedError || error instanceof BadRequestError) {
            return res.status(error.statusCode).json({ error: error.message })
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: 'Erreur serveur',
                details: error.message
            })
        }
    }
}

module.exports = { universalLogin }
