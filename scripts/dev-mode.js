const fs = require("fs");
const path = require("path");

console.log(
    "🔄 Restauration des fichiers originaux pour le développement...\n"
);

const files = [
    {
        original: "src/services/licenseManager.js",
        backup: "src/services/licenseManager.dev.js",
    },
    {
        original: "src/config.js",
        backup: "src/config.dev.js",
    },
];

let restoredCount = 0;

files.forEach(({ original, backup }) => {
    try {
        if (!fs.existsSync(backup)) {
            console.log(
                `⚠️  ${backup} n'existe pas, fichier déjà en mode dev ou jamais basculé`
            );
            return;
        }

        // Restaurer le fichier original
        fs.copyFileSync(backup, original);
        console.log(`✅ ${original} → version développement restaurée`);
        restoredCount++;
    } catch (error) {
        console.error(`❌ Erreur pour ${original}:`, error.message);
    }
});

console.log(
    `\n✨ ${restoredCount}/${files.length} fichiers restaurés en mode développement`
);
console.log(
    "\n📝 Pour revenir en mode production, exécutez: npm run prod-mode\n"
);
