# 🌍 GUIDE DE DÉPLOIEMENT : FASONEKRE

Ce guide explique comment déployer la plateforme sur votre VPS AlmaLinux (`fasonekre.waapii.com`).

## 📋 Prérequis sur le VPS
Assurez-vous que les outils suivants sont installés :
- **Node.js** (v18+) : `curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -` puis `sudo yum install -y nodejs`
- **Nginx** : `sudo yum install -y nginx`
- **Git** : `sudo yum install -y git`
- **PM2** : `sudo npm install -g pm2`
- **MongoDB** : [Guide installation MongoDB sur AlmaLinux](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-red-hat/)

## 📂 Structure des Fichiers
Votre projet contient maintenant un dossier `deployment` avec les configurations :
- `deployment/fasonekre.conf` : Config Nginx.
- `deployment/deploy.sh` : Script d'automatisation.
- `server/ecosystem.config.js` : Config PM2.
- `client/.env.production` : Variables d'environnement Frontend.

## 🚀 Étapes de Déploiement

### 1. Préparation du Code
Poussez votre code local vers votre dépôt Git (GitHub/GitLab) :
```bash
git add .
git commit -m "Préparation déploiement"
git push origin main
```

### 2. Configuration sur le VPS
Connectez-vous via SSH et assurez-vous que le dossier existe :
```bash
# Le dossier indiqué est : /home/dreamdev/fasonekre.waapii.com
cd /home/dreamdev/fasonekre.waapii.com
```

### 3. Installation Automatique (Via Script)
Rendez le script exécutable et lancez-le :
```bash
chmod +x ./deployment/deploy.sh
./deployment/deploy.sh
```
*Le script installera les dépendances, buildera le frontend et lancera le backend avec PM2.*

### 4. Configuration Nginx
Si ce n'est pas encore fait, configurez Nginx pour pointer vers le build :
```bash
sudo cp ./deployment/fasonekre.conf /etc/nginx/conf.d/
sudo systemctl restart nginx
```

### 5. Finalisation (SSL - HTTPS)
Pour sécuriser le site avec HTTPS (recommandé), utilisez Certbot :
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fasonekre.waapii.com
```

## ✅ Vérification
- Accédez à : `https://fasonekre.waapii.com`
- Testez le login admin.
- Vérifiez les logs backend si besoin : `pm2 logs fasonekre-api`

---

## 🔧 Dépannage
- **Erreur 502 Bad Gateway** : Le backend ne tourne pas. Vérifiez `pm2 list` et `pm2 logs`.
- **Modifications Backend** : Si vous changez le code backend, faites `pm2 reload fasonekre-api`.
- **Modifications Frontend** : Si vous changez le frontend, refaites `npm run build` dans le dossier client.
