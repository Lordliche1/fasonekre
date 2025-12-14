#!/bin/bash

# Configuration
PROJECT_DIR="/var/www/fasonekre"

echo "🚀 Début du déploiement (APACHE)..."

# 1. Mise à jour du code
# cd $PROJECT_DIR
# git pull origin main

# 2. Installation Backend
echo "📦 Installation Backend..."
cd $PROJECT_DIR/server
npm install --production

# 3. Build Frontend
echo "🏗️ Build Frontend..."
cd $PROJECT_DIR/client
npm install
npm run build

# 4. Redémarrage PM2
echo "🔄 Redémarrage Backend..."
cd $PROJECT_DIR/server
pm2 reload ecosystem.config.js --env production

# 5. Redémarrage Apache
echo "🔄 Redémarrage Apache..."
sudo systemctl reload httpd

echo "✅ Déploiement terminé !"
