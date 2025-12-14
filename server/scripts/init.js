require('dotenv').config();
const mongoose = require('mongoose');
const { initializeDepartments } = require('./initDepartments');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/municipal-complain-bf';

const runInitialization = async () => {
    try {
        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connecté à MongoDB\n');

        console.log('📦 Initialisation des départements municipaux...');
        await initializeDepartments();

        console.log('\n✅ Initialisation terminée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur lors de l\'initialisation:', error);
        process.exit(1);
    }
};

runInitialization();
