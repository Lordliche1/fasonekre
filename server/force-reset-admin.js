require('dotenv').config();
const connectDB = require('./db/connect');
const Admin = require('./models/Admin');

const resetAdmin = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // Supprimer l'ancien
        await Admin.deleteMany({ email: 'admin@admin.com' });
        console.log('🗑️ Ancien admin supprimé');

        // Créer le nouveau
        // Note: Le hook pre-save dans models/Admin.js va hasher le mot de passe
        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@admin.com',
            password: 'password123',
            district: 'Ouagadougou',
            role: 'admin'
        });

        console.log('✅ NOUVEL ADMIN CRÉÉ AVEC SUCCÈS !');
        console.log('-----------------------------------');
        console.log('📧 Email:    admin@admin.com');
        console.log('🔑 Password: password123');
        console.log('-----------------------------------');
        console.log('💡 Vous pouvez maintenant essayer de vous connecter.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

resetAdmin();
