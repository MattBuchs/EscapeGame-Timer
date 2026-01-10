const fs = require("fs");
const path = require("path");

console.log("🔄 Bascule vers les fichiers obfusqués pour la production...\n");

const files = [
    {
        original: "src/services/licenseManager.js",
        obfuscated: "src/services/licenseManager.obfuscated.js",
        backup: "src/services/licenseManager.dev.js",
    },
    {
        original: "src/config.js",
        obfuscated: "src/config.obfuscated.js",
        backup: "src/config.dev.js",
    },
];

let switchedCount = 0;

files.forEach(({ original, obfuscated, backup }) => {
    try {
        if (!fs.existsSync(obfuscated)) {
            console.log(
                `⚠️  ${obfuscated} n'existe pas, exécutez d'abord 'npm run obfuscate'`
            );
            return;
        }

        // Sauvegarder le fichier original si pas déjà fait
        if (!fs.existsSync(backup)) {
            fs.copyFileSync(original, backup);
            console.log(`✅ Sauvegarde: ${backup}`);
        }

        // Remplacer par la version obfusquée
        fs.copyFileSync(obfuscated, original);
        console.log(`✅ ${original} → version obfusquée`);
        switchedCount++;
    } catch (error) {
        console.error(`❌ Erreur pour ${original}:`, error.message);
    }
});

console.log(
    `\n✨ ${switchedCount}/${files.length} fichiers basculés en mode production`
);
console.log(
    "\n⚠️  Pour revenir en mode développement, exécutez: npm run dev-mode\n"
);
