const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Créer le transporteur
    const transporter = nodemailer.createTransport({
        host: "smtp.waapii.com",
        port: 465,
        secure: true, // true pour le port 465
        auth: {
            user: "fasonekre@waapii.com",
            pass: "@BouB@car28"
        },
        tls: {
            // Ne pas échouer sur les certificats invalides (utile en dev/self-signed)
            rejectUnauthorized: false
        }
    });

    // 2. Définir les options de l'email
    const mailOptions = {
        from: '"FASONEKRE Sécurité" <fasonekre@waapii.com>',
        to: options.email,
        subject: options.subject,
        html: options.html // Utilisation de HTML pour un meilleur rendu
    };

    // 3. Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email envoyé à ${options.email} : ${info.messageId}`);
};

const sendOTP = async (email, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">Code de Connexion FASONEKRE</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de vérification à usage unique pour vous connecter :</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #e67e22; border-radius: 5px;">
            ${otp}
        </div>
        <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
    </div>
    `;

    await sendEmail({
        email,
        subject: 'Votre code de connexion FASONEKRE',
        html
    });
};

module.exports = { sendEmail, sendOTP };
