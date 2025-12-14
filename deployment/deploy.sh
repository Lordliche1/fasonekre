#!/bin/bash

# Configuration
APP_DIR="/var/www/fasonekre"
GIT_URL="<VOTRE_GIT_URL>" # À remplacer par l'URL de votre dépôt
USER="root"

echo "🚀 Début du déploiement de FASONEKRE..."

# 1. Mise à jour du code
if [ -d "$APP_DIR" ]; then
    echo "📂 Mise à jour du dépôt existant..."
    cd $APP_DIR
    git pull
else
    echo "📂 Clonage du dépôt..."
    git clone $GIT_URL $APP_DIR
    cd $APP_DIR
fi

# 2. Installation Backend
echo "📦 Installation dépendances Backend..."
cd $APP_DIR/server
npm install

# 3. Installation et Build Frontend
echo "🎨 Installation et Build Frontend..."
cd $APP_DIR/client
npm install
npm run build

# 4. Copie des fichiers de config
echo "⚙️ Configuration..."
cp $APP_DIR/client/.env.production $APP_DIR/client/.env

# 5. Redémarrage PM2
echo "🔄 Redémarrage Backend..."
cd $APP_DIR/server
pm2 start ecosystem.config.js --env production
pm2 save

echo "✅ Déploiement terminé avec succès !"
