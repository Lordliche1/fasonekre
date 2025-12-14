const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Officer = require('../models/Officer');
const ServiceMan = require('../models/ServiceMan');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

const createTestData = async () => {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté\n');

        // Récupérer départements
        const departments = await Department.find().limit(3);
        if (departments.length === 0) {
            console.log('❌ Aucun département. Exécutez d\'abord: node scripts/initDepartments.js');
            process.exit(1);
        }

        console.log(`📁 ${departments.length} départements trouvés\n`);

        // Créer 1 Officer
        console.log('👮 Création Officer...');
        const officer = new Officer({
            name: 'Marie Chef Voirie',
            email: 'chef@test.com',
            password: 'password123',
            department: departments[0]._id,
            district: 'Baskuy',
            level: 2
        });
        await officer.save();
        console.log(`✅ ${officer.name} - ${officer.email}\n`);

        // Créer 2 ServiceMen
        console.log('🔧 Création ServiceMen...');
        const sm1 = new ServiceMan({
            name: 'Jean Technicien',
            email: 'serviceman1@test.com',
            password: 'password123',
            phone: '+22670123456',
            department: departments[0]._id,
            district: 'Baskuy',
            specialization: 'Voirie',
            status: 'available'
        });
        await sm1.save();
        console.log(`✅ ${sm1.name} - ${sm1.email}`);

        const sm2 = new ServiceMan({
            name: 'Paul Électricien',
            email: 'serviceman2@test.com',
            password: 'password123',
            phone: '+22670234567',
            department: departments[0]._id,
            district: 'Baskuy',
            specialization: 'Électricité',
            status: 'busy'
        });
        await sm2.save();
        console.log(`✅ ${sm2.name} - ${sm2.email}\n`);

        // Créer 2 Citoyens
        console.log('👤 Création Citoyens...');
        const citizen1 = new User({
            name: 'Alice Citoyen',
            email: 'citoyen1@test.com',
            password: 'password123',
            phone: '+22660123456',
            district: 'Baskuy',
            age: 30,
            role: 'user'
        });
        await citizen1.save();
        console.log(`✅ ${citizen1.name} - ${citizen1.email}`);

        const citizen2 = new User({
            name: 'Bob Résident',
            email: 'citoyen2@test.com',
            password: 'password123',
            phone: '+22660234567',
            district: 'Baskuy',
            age: 35,
            role: 'user'
        });
        await citizen2.save();
        console.log(`✅ ${citizen2.name} - ${citizen2.email}\n`);

        // Créer 3 Plaintes
        console.log('📋 Création Plaintes...');

        const complaint1 = new Complaint({
            subject: 'Nid de poule dangereux',
            description: 'Gros nid de poule sur Avenue Kwame Nkrumah',
            department: departments[0]._id,
            createdBy: citizen1._id,
            status: 'pending',
            location: {
                type: 'Point',
                coordinates: [-1.5, 12.3],
                address: 'Avenue Kwame Nkrumah, Baskuy'
            }
        });
        await complaint1.save();
        console.log(`✅ ${complaint1.subject}`);

        const complaint2 = new Complaint({
            subject: 'Lampadaire défectueux',
            description: 'Le lampadaire ne fonctionne plus',
            department: departments[0]._id,
            createdBy: citizen2._id,
            status: 'pending',
            location: {
                type: 'Point',
                coordinates: [-1.51, 12.31],
                address: 'Rue de la Paix, Baskuy'
            }
        });
        await complaint2.save();
        console.log(`✅ ${complaint2.subject}`);

        const complaint3 = new Complaint({
            subject: 'Caniveau bouché',
            description: 'Le caniveau provoque des inondations',
            department: departments[0]._id,
            createdBy: citizen1._id,
            status: 'in process',
            location: {
                type: 'Point',
                coordinates: [-1.52, 12.32],
                address: 'Boulevard Charles de Gaulle, Baskuy'
            }
        });
        await complaint3.save();

        // Assigner la 3ème plainte
        await complaint3.assignServiceMan(sm1._id, officer._id, 'Officer');
        console.log(`✅ ${complaint3.subject} (assignée)\n`);

        // Résumé
        console.log('\n═══════════════════════════════════════');
        console.log('✅ DONNÉES DE TEST CRÉÉES !');
        console.log('═══════════════════════════════════════\n');

        console.log('👮 OFFICER:');
        console.log(`   Email: chef@test.com`);
        console.log(`   Password: password123\n`);

        console.log('🔧 SERVICEMEN:');
        console.log(`   1. serviceman1@test.com (Disponible)`);
        console.log(`   2. serviceman2@test.com (Occupé)`);
        console.log(`   Password: password123\n`);

        console.log('👤 CITOYENS:');
        console.log(`   1. citoyen1@test.com`);
        console.log(`   2. citoyen2@test.com`);
        console.log(`   Password: password123\n`);

        console.log('📋 PLAINTES: 3 créées');
        console.log(`   - 2 en attente`);
        console.log(`   - 1 en cours (assignée)\n`);

        console.log('🚀 Testez sur: http://localhost:5175/\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

createTestData();
