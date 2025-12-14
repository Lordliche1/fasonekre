require('dotenv').config()
const connectDB = require('./db/connect')
const Admin = require('./models/Admin')

const cleanupAdmins = async () => {
    try {
        await connectDB(process.env.MONGO_URI)

        console.log('🔍 Recherche des comptes admin...')

        // Supprimer l'ancien compte par défaut
        const deletedOld = await Admin.deleteOne({ email: 'adminlogin@iiita.ac.in' })
        if (deletedOld.deletedCount > 0) {
            console.log('✅ Ancien compte adminlogin@iiita.ac.in supprimé')
        } else {
            console.log('ℹ️  Ancien compte adminlogin@iiita.ac.in non trouvé')
        }

        // Vérifier si le nouveau compte existe
        const existingAdmin = await Admin.findOne({ email: 'admin@admin.com' })

        if (existingAdmin) {
            console.log('✅ Le compte admin@admin.com existe déjà')
            console.log('📧 Email:', existingAdmin.email)
            console.log('👤 Nom:', existingAdmin.name)
            console.log('📍 District:', existingAdmin.district)
        } else {
            // Créer le nouveau compte s'il n'existe pas
            const newAdmin = await Admin.create({
                name: "Super Admin",
                email: "admin@admin.com",
                password: "password123",
                district: "Ouagadougou"
            })

            console.log('✅ Nouveau compte admin créé!')
            console.log('📧 Email:', newAdmin.email)
            console.log('🔑 Mot de passe: password123')
            console.log('👤 Nom:', newAdmin.name)
            console.log('📍 District:', newAdmin.district)
        }

        // Afficher tous les comptes admin
        const allAdmins = await Admin.find({})
        console.log(`\n📊 Total comptes admin: ${allAdmins.length}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Erreur:', error.message)
        process.exit(1)
    }
}

cleanupAdmins()
