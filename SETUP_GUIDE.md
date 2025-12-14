# Configuration de l'Application Municipale - Burkina Faso

## Variables d'Environnement

Créez un fichier `.env` dans le dossier `server` avec les configurations suivantes :

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/municipal-complain-bf

# JWT Secret (Changez cette valeur pour la production)
JWT_SECRET=votre_secret_jwt_tres_securise_ici_2024

# JWT Lifetime
JWT_LIFETIME=30d

# Server Port
PORT=3000

# Email Configuration (Optionnel - pour les notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application

# Twilio Configuration (Optionnel - pour SMS)
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+226xxxxxxxx

# Application URL
APP_URL=http://localhost:5173
```

## Installation de MongoDB

### Windows

1. Téléchargez MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Installez MongoDB avec les options par défaut
3. MongoDB démarrera automatiquement comme service Windows

### Vérifier que MongoDB fonctionne

```powershell
mongosh
```

Si la connexion réussit, MongoDB est prêt !

## Démarrage de l'Application

### 1. Démarrer le Backend

```powershell
cd server
npm start
```

Le serveur démarrera sur `http://localhost:3000`

### 2. Démarrer le Frontend

Dans un nouveau terminal :

```powershell
cd client
npm run dev
```

Le frontend démarrera sur `http://localhost:5173`

## Comptes de Test

### Utilisateur Citoyen
- Email: `citoyen@test.bf`
- Mot de passe: `password123`

### Agent Municipal
- Format: `[commune][departement][niveau]@municipal.bf`
- Exemple: `ouagadougouvoirie1@municipal.bf`
- Mot de passe: `password`

### Administrateur
- Format: `[commune]admin@municipal.bf`
- Exemple: `ouagadougouadmin@municipal.bf`
- Mot de passe: `password`

## Prochaines Étapes

1. ✅ Dépendances installées
2. ✅ Configuration des communes burkinabè créée
3. ⏳ Créer le fichier `.env`
4. ⏳ Installer et démarrer MongoDB
5. ⏳ Adapter les modèles de données
6. ⏳ Traduire l'interface en français
7. ⏳ Tester l'application
