#!/bin/bash

# Configuration CPanel / Apache
APP_DIR="/home/dreamdev/fasonekre.waapii.com"
GIT_URL="https://github.com/Lordliche1/fasonekre.git"

echo "🚀 Début du déploiement FASONEKRE (Mode Apache/CPanel)..."

# 1. Mise à jour du code
if [ -d "$APP_DIR" ]; then
    echo "📂 Mise à jour du dossier existant..."
    cd $APP_DIR
    git pull
else
    echo "📂 Le dossier n'existe pas. Assurez vous de l'avoir créé ou cloné."
    # On tente le clone si le dossier est vide ou n'existe pas, mais attention aux permissions
    git clone $GIT_URL $APP_DIR
    cd $APP_DIR
fi

# 2. Backend
echo "📦 Installation Backend..."
cd $APP_DIR/server
npm install
# Pour CPanel, souvent on n'utilise pas PM2 global mais on démarre l'app Node via l'interface CPanel
# Si vous avez accès SSH complet, on tente PM2 :
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js --env production
    pm2 save
else
    echo "⚠️ PM2 non trouvé. Assurez-vous de démarrer l'app Node.js via le CPanel 'Setup Node.js App'."
fi

# 3. Frontend
echo "🎨 Installation et Build Frontend..."
cd $APP_DIR/client
npm install
npm run build

# 4. Configuration Apache (.htaccess)
echo "📄 Copie du .htaccess..."
# Le fichier .htaccess est dans public/ donc Vite le copie déjà dans dist/
# On s'assure juste que les perms sont bonnes
chmod 644 $APP_DIR/client/dist/.htaccess

echo "✅ Déploiement terminé ! Pointez votre DocumentRoot Apache vers $APP_DIR/client/dist"
