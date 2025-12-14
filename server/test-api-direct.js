const fetch = require('node-fetch');

async function testLogin() {
    console.log('🚀 Test Connexion API Direct (http://127.0.0.1:3000)...');
    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/auth/universal-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Réponse:', JSON.stringify(data, null, 2));

        if (response.status === 200 && data.token) {
            console.log('✅ LOGIN SUCCÈS ! Backend OK.');
        } else {
            console.log('❌ LOGIN ÉCHEC ! Backend rejette.');
        }
    } catch (error) {
        console.error('💥 Erreur réseau:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🛑 Le serveur semble ÉTEINT ou inaccessible sur le port 3000.');
        }
    }
}

testLogin();
