const User = require('../models/User')
const Admin = require('../models/Admin')
const Officer = require('../models/Officer')
const ServiceMan = require('../models/ServiceMan')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../errors/')

const otplessLogin = async (req, res) => {
    try {
        // OTPLess envoie le token, mais idéalement on extrait le téléphone vérifié
        // Pour simplifier l'intégration rapide sans backend SDK complexe :
        // On suppose que le frontend nous envoie { phone: "226XXXX...", email: "...", name: "..." } après validation OTPLess
        // Note: En PROD, il faut valider le token coté serveur avec le Client Secret pour être sûr.

        const { phone, email, name, token } = req.body;

        if (!phone) {
            throw new BadRequestError('Numéro de téléphone requis');
        }

        // Nettoyer le numéro (enlever +, espaces) si besoin
        // Le format OTPLess est généralement clean (ex: 22670000000)

        console.log('📱 [OTPLess] Tentative connexion pour :', phone);

        let user = null;
        let role = '';
        let redirectTo = '';

        // 1. Chercher par téléphone dans User (Citoyen) - Le plus probable
        user = await User.findOne({ phone: { $regex: phone.slice(-8) } }); // Match flexible sur les 8 derniers chiffres
        if (user) { role = 'citizen'; redirectTo = '/user'; }

        // 2. Chercher ServiceMan
        if (!user) {
            // ServiceMan a un champ phone
            user = await ServiceMan.findOne({ phone: { $regex: phone.slice(-8) } });
            if (user) { role = 'serviceman'; redirectTo = '/serviceman'; }
        }

        // 3. Admin et Officer n'ont pas forcément de champ phone 'officiel' unique dans ce projet
        // Mais s'ils en ont un, on pourrait ajouter la logique ici.
        // Pour l'instant on se concentre sur Citoyen/Employé qui utilisent le mobile.

        if (user) {
            // Utilisateur trouvé -> Connexion
            const authToken = user.createJWT();
            console.log('✅ [OTPLess] Utilisateur trouvé:', user.name);

            return res.status(StatusCodes.OK).json({
                user: { name: user.name, email: user.email },
                token: authToken,
                role,
                redirectTo,
                isNewUser: false
            });
        } else {
            // Nouvel utilisateur -> On renvoie les infos pour pré-remplir l'inscription
            console.log('🆕 [OTPLess] Nouvel utilisateur');
            return res.status(StatusCodes.OK).json({
                isNewUser: true,
                prefill: {
                    phone,
                    email, // Peut être vide si OTPLess n'a que le phone
                    name
                },
                message: "Utilisateur inconnu, veuillez compléter l'inscription."
            });
        }

    } catch (error) {
        console.error('OTPLess Auth Error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}


const verifyOtpless2FA = async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            throw new BadRequestError('Email et Token Otpless requis');
        }

        console.log(`🔐 [2FA Otpless] Vérification pour ${email}`);

        // 1. Vérifier le token avec l'API Otpless (Server-to-Server) pour la sécurité
        // Ou utiliser les données décodées si on fait confiance au client (moins sûr).
        // Ici on va simuler une extraction/vérification basique ou appeler l'API si dispo.
        // Pour l'instant, on suppose que le token contient le numéro ou qu'on l'a reçu validé.

        // TODO: En PROD, faire un appel à https://auth.otpless.app/auth/userInfo 
        // avec le token en header pour récupérer le numéro vérifié.

        // Simulation pour le prototype: On suppose que le frontend a fait le job et nous envoie le bon token.
        // On va juste loguer pour l'instant. Dans une vraie implémentation, on décode le JWT Otpless.

        // Pour cet exemple, on va faire confiance au "token" comme étant un conteneur d'info 
        // ou on l'accepte si le user existe. 
        // MAIS pour la sécurité, on doit vérifier que le numéro du token correspond au user.

        // --- VRAIE LOGIQUE (Commentée si pas de Client ID/Secret configuré) ---
        /*
        const response = await fetch("https://auth.otpless.app/auth/userInfo", {
            method: 'POST',
            headers: { 
                'clientId': process.env.OTPLESS_CLIENT_ID,
                'clientSecret': process.env.OTPLESS_CLIENT_SECRET, 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: `token=${token}`
        });
        const data = await response.json();
        const verifiedPhone = data.phoneNumber; // ex: 22670000000
        */

        // --- LOGIQUE SIMPLIFIÉE (A adapter selon le retour du SDK frontend) ---
        // Le SDK frontend retourne souvent un objet user complet. Supposons qu'on envoie le phone.
        const { phone } = req.body; // On demande au front d'envoyer le phone extrait aussi

        if (!phone) {
            throw new BadRequestError('Numéro de téléphone manquant pour la vérification');
        }

        // 2. Trouver l'utilisateur
        let user = null;
        let role = '';
        let redirectTo = '/';

        user = await Admin.findOne({ email });
        if (user) { role = 'admin'; redirectTo = '/admin/dashboard'; }

        if (!user) {
            user = await Officer.findOne({ email });
            if (user) { role = 'officer'; redirectTo = '/department'; }
        }
        if (!user) {
            user = await ServiceMan.findOne({ email });
            if (user) { role = 'serviceman'; redirectTo = '/serviceman'; }
        }
        if (!user) {
            user = await User.findOne({ email });
            if (user) { role = 'citizen'; redirectTo = '/userpage'; }
        }

        if (!user) {
            throw new UnauthenticatedError('Utilisateur introuvable');
        }

        // 3. Vérifier correspondance téléphone
        // On nettoie les numéros (garder les 8 derniers chiffres pour matcher)
        const userPhoneLast8 = user.phone ? user.phone.replace(/\D/g, '').slice(-8) : '';
        const otplessPhoneLast8 = phone.replace(/\D/g, '').slice(-8);

        if (!userPhoneLast8 || userPhoneLast8 !== otplessPhoneLast8) {
            console.log(`❌ [2FA] Mismatch: User(${userPhoneLast8}) vs Otpless(${otplessPhoneLast8})`);
            throw new UnauthenticatedError('Le numéro WhatsApp ne correspond pas au compte');
        }

        console.log(`✅ [2FA] Succès pour ${user.name}`);

        // 4. Générer Token
        const authToken = user.createJWT();

        // Nettoyer les codes OTP email s'il y en avait
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(StatusCodes.OK).json({
            user: { name: user.name, email: user.email },
            token: authToken,
            role,
            redirectTo
        });

    } catch (error) {
        console.error('Otpless 2FA Error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports = { otplessLogin, verifyOtpless2FA }
