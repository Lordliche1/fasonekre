const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔍 Test de connexion universelle...\n');

        const response = await axios.post('http://localhost:3000/api/v1/auth/universal-login', {
            email: 'admin@admin.com',
            password: 'password123'
        });

        console.log('✅ Connexion réussie!');
        console.log('📧 Email:', response.data.user.email);
        console.log('👤 Nom:', response.data.user.name);
        console.log('🎭 Rôle:', response.data.role);
        console.log('🔑 Token:', response.data.token.substring(0, 20) + '...');
        console.log('🔗 Redirection:', response.data.redirectTo);

    } catch (error) {
        console.error('❌ Erreur de connexion:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.data);
        } else if (error.request) {
            console.error('Pas de réponse du serveur');
            console.error('Le serveur est-il démarré sur le port 3000?');
        } else {
            console.error('Erreur:', error.message);
        }
    }
}

testLogin();
