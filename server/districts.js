// Communes du Burkina Faso organisées par région
// Configuration adaptée pour la plateforme municipale burkinabè

const communesArray = [
    // Région du Centre (Ouagadougou)
    "Ouagadougou",
    "Komki-Ipala",
    "Komsilga",
    "Koubri",
    "Loumbila",
    "Pabré",
    "Saaba",
    "Tanghin-Dassouri",
    "Ziniaré",

    // Région des Hauts-Bassins (Bobo-Dioulasso)
    "Bobo-Dioulasso",
    "Banfora",
    "Dédougou",
    "Houndé",
    "Orodara",
    "Dano",
    "Diébougou",
    "Gaoua",
    "Batié",
    "Boromo",
    "Nouna",
    "Solenzo",
    "Tougan",

    // Région des Cascades
    "Sindou",
    "Mangodara",
    "Niangoloko",
    "Tiéfora",

    // Région du Nord
    "Ouahigouya",
    "Yako",
    "Gourcy",
    "Thiou",
    "Titao",
    "Koumbri",

    // Région du Centre-Nord
    "Kaya",
    "Barsalogho",
    "Boulsa",
    "Kongoussi",
    "Tougouri",

    // Région du Centre-Ouest
    "Koudougou",
    "Réo",
    "Léo",
    "Sapouy",
    "Tenado",

    // Région du Centre-Sud
    "Manga",
    "Kombissiri",
    "Pô",

    // Région du Centre-Est
    "Tenkodogo",
    "Garango",
    "Koupéla",
    "Pouytenga",

    // Région de l'Est
    "Fada N'Gourma",
    "Diapaga",
    "Gayéri",
    "Pama",

    // Région du Plateau-Central
    "Zorgho",
    "Zitenga",

    // Région du Sahel
    "Dori",
    "Djibo",
    "Gorom-Gorom",
    "Sebba",

    // Région de la Boucle du Mouhoun
    "Toma",
    "Bondokuy",
    "Safané",

    // Région du Sud-Ouest
    "Kampti",
    "Dissin",
    "Midebdo"
];

// Départements/Services municipaux du Burkina Faso
const departmentsArray = [
    "Voirie et Infrastructures",
    "Assainissement et Déchets",
    "Eau et Hydraulique",
    "Éclairage Public",
    "Espaces Verts",
    "Urbanisme et Habitat",
    "État Civil",
    "Sécurité et Police Municipale",
    "Marchés et Commerce",
    "Services Sociaux",
    "Jeunesse et Sports",
    "Culture",
    "Autres Services"
];

// Catégories de plaintes adaptées au contexte burkinabè
const categoriesArray = [
    "Voirie et Routes",
    "Éclairage Public",
    "Gestion des Déchets",
    "Assainissement",
    "Eau Potable",
    "Espaces Verts",
    "Marchés",
    "État Civil",
    "Sécurité",
    "Urbanisme",
    "Autres"
];

// Export pour compatibilité avec le code existant
const districtArray = communesArray;

module.exports = {
    districtArray,
    communesArray,
    departmentsArray,
    categoriesArray
};