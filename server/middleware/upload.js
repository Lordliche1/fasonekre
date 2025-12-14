const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const createUploadDirs = () => {
    const dirs = ['uploads/images', 'uploads/videos', 'uploads/audio'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (file.mimetype.startsWith('image')) {
            folder += 'images/';
        } else if (file.mimetype.startsWith('video')) {
            folder += 'videos/';
        } else if (file.mimetype.startsWith('audio')) {
            folder += 'audio/';
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filtres de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov|avi|mp3|wav|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error(`Type de fichier non supporté: ${file.mimetype}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    }
});

module.exports = upload;
