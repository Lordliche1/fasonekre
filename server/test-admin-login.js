require('dotenv').config();
const connectDB = require('./db/connect');
const Admin = require('./models/Admin');

const testAdminLogin = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('✅ Connexion MongoDB réussie\n');

        const email = 'admin@admin.com';
        const password = 'password123';

        console.log('🔍 Recherche admin avec email:', email);
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log('❌ Admin non trouvé!');
            process.exit(1);
        }

        console.log('✅ Admin trouvé:');
        console.log('   - Nom:', admin.name);
        console.log('   - Email:', admin.email);
        console.log('   - District:', admin.district);
        console.log('   - Password hash:', admin.password.substring(0, 20) + '...');

        console.log('\n🔑 Test du mot de passe:', password);
        const isMatch = await admin.comparePassword(password);
        console.log('   - Résultat:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');

        if (isMatch) {
            console.log('\n🎟️ Génération token...');
            const token = admin.createJWT();
            console.log('   - Token:', token.substring(0, 30) + '...');
            console.log('\n✅ LOGIN FONCTIONNEL!');
        } else {
            console.log('\n❌ MOT DE PASSE INCORRECT!');
            console.log('💡 Essayez de recréer l\'admin avec: node create-super-admin.js');
        }

        process.exit(0);
    } catch (error) {
        console.error('💥 Erreur:', error.message);
        process.exit(1);
    }
};

testAdminLogin();
