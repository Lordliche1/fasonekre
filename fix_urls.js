const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client/src');
const searchString = 'http://127.0.0.1:3000';
const replaceString = ''; // On remplace par rien pour rendre le chemin relatif (ex: /api/v1/...)

function replaceInFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }

        // Remplacement simple
        // Attention aux cas `http://127.0.0.1:3000${photo.url}` -> `${photo.url}` (si photo.url commence par /)
        // Ou 'http://127.0.0.1:3000/api...' -> '/api...'

        let result = data.split(searchString).join(replaceString);

        // Correction potentielle si le remplacement laisse un vide bizarre dans les template literals
        // ex: `http://127...${url}` devient `${url}` -> OK.

        if (result !== data) {
            fs.writeFile(filePath, result, 'utf8', (err) => {
                if (err) return console.log(err);
                console.log(`Modified: ${filePath}`);
            });
        }
    });
}

function traverseDir(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            return console.log(err);
        }
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    return console.log(err);
                }
                if (stats.isDirectory()) {
                    traverseDir(filePath);
                } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                    replaceInFile(filePath);
                }
            });
        });
    });
}

traverseDir(directoryPath);
