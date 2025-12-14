const Department = require('../models/Department');

// Script pour initialiser les 13 départements municipaux du Burkina Faso
const initializeDepartments = async () => {
    const departments = [
        {
            name: 'Voirie et Infrastructures',
            description: 'Gestion des routes, ponts, et infrastructures municipales',
            icon: 'road',
            color: '#FF5722'
        },
        {
            name: 'Assainissement et Déchets',
            description: 'Collecte des déchets, nettoyage et assainissement',
            icon: 'trash',
            color: '#4CAF50'
        },
        {
            name: 'Eau et Hydraulique',
            description: 'Distribution d\'eau potable et gestion hydraulique',
            icon: 'water',
            color: '#2196F3'
        },
        {
            name: 'Éclairage Public',
            description: 'Gestion et maintenance de l\'éclairage public',
            icon: 'lightbulb',
            color: '#FFC107'
        },
        {
            name: 'Espaces Verts',
            description: 'Entretien des parcs, jardins et espaces verts',
            icon: 'tree',
            color: '#8BC34A'
        },
        {
            name: 'Urbanisme et Habitat',
            description: 'Planification urbaine et gestion de l\'habitat',
            icon: 'building',
            color: '#9C27B0'
        },
        {
            name: 'État Civil',
            description: 'Enregistrement des naissances, mariages et décès',
            icon: 'document',
            color: '#3F51B5'
        },
        {
            name: 'Sécurité et Police Municipale',
            description: 'Sécurité publique et police municipale',
            icon: 'shield',
            color: '#F44336'
        },
        {
            name: 'Marchés et Commerce',
            description: 'Gestion des marchés et activités commerciales',
            icon: 'shopping',
            color: '#FF9800'
        },
        {
            name: 'Services Sociaux',
            description: 'Aide sociale et services à la population',
            icon: 'heart',
            color: '#E91E63'
        },
        {
            name: 'Jeunesse et Sports',
            description: 'Activités sportives et programmes jeunesse',
            icon: 'sports',
            color: '#00BCD4'
        },
        {
            name: 'Culture',
            description: 'Promotion culturelle et événements',
            icon: 'palette',
            color: '#673AB7'
        },
        {
            name: 'Autres Services',
            description: 'Services municipaux divers',
            icon: 'more',
            color: '#607D8B'
        }
    ];

    try {
        // Vérifier si des départements existent déjà
        const existingCount = await Department.countDocuments();

        if (existingCount > 0) {
            console.log(`${existingCount} département(s) existe(nt) déjà. Aucune initialisation nécessaire.`);
            return;
        }

        // Créer tous les départements
        const created = await Department.insertMany(departments);
        console.log(`✅ ${created.length} départements créés avec succès !`);

        created.forEach(dept => {
            console.log(`   - ${dept.name}`);
        });

        return created;
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des départements:', error);
        throw error;
    }
};

module.exports = { initializeDepartments };
