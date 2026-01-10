const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

console.log("🔐 Démarrage de l'obfuscation...\n");

// Fichiers à obfusquer
const filesToObfuscate = [
    {
        input: "src/services/licenseManager.js",
        output: "src/services/licenseManager.obfuscated.js",
        backup: "src/services/licenseManager.original.js",
    },
    {
        input: "src/config.js",
        output: "src/config.obfuscated.js",
        backup: "src/config.original.js",
    },
];

// Options d'obfuscation
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ["base64"],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: "variable",
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
};

// Fonction d'obfuscation
function obfuscateFile(fileConfig) {
    const { input, output, backup } = fileConfig;

    console.log(`📄 Traitement de ${input}...`);

    try {
        // Vérifier si le fichier existe
        if (!fs.existsSync(input)) {
            console.log(`   ⚠️  Fichier non trouvé, passage au suivant\n`);
            return false;
        }

        // Lire le code source
        const sourceCode = fs.readFileSync(input, "utf8");

        // Créer une sauvegarde
        if (backup && !fs.existsSync(backup)) {
            fs.writeFileSync(backup, sourceCode);
            console.log(`   ✅ Sauvegarde créée: ${backup}`);
        }

        // Obfusquer le code
        const obfuscated = JavaScriptObfuscator.obfuscate(
            sourceCode,
            obfuscationOptions
        );

        // Écrire le fichier obfusqué
        fs.writeFileSync(output, obfuscated.getObfuscatedCode());
        console.log(`   ✅ Obfuscation terminée: ${output}`);

        // Statistiques
        const originalSize = Buffer.byteLength(sourceCode, "utf8");
        const obfuscatedSize = Buffer.byteLength(
            obfuscated.getObfuscatedCode(),
            "utf8"
        );
        const ratio = ((obfuscatedSize / originalSize) * 100).toFixed(1);

        console.log(
            `   📊 Taille: ${(originalSize / 1024).toFixed(1)}KB → ${(
                obfuscatedSize / 1024
            ).toFixed(1)}KB (${ratio}%)\n`
        );

        return true;
    } catch (error) {
        console.error(`   ❌ Erreur lors de l'obfuscation:`, error.message);
        console.log("");
        return false;
    }
}

// Obfusquer tous les fichiers
let successCount = 0;
let totalCount = filesToObfuscate.length;

filesToObfuscate.forEach((fileConfig) => {
    if (obfuscateFile(fileConfig)) {
        successCount++;
    }
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(
    `✨ Obfuscation terminée: ${successCount}/${totalCount} fichiers traités\n`
);

if (successCount > 0) {
    console.log("📝 Prochaines étapes:");
    console.log(
        "   1. Vérifiez que les fichiers obfusqués fonctionnent correctement"
    );
    console.log(
        "   2. Pour utiliser les versions obfusquées en production, modifiez les imports"
    );
    console.log(
        "   3. Les fichiers originaux sont sauvegardés avec l'extension .original.js"
    );
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log(
        "   - Les fichiers .original.js contiennent votre code non obfusqué"
    );
    console.log("   - Ne distribuez PAS ces fichiers dans votre application");
    console.log(
        "   - Ajoutez *.original.js à votre .gitignore si nécessaire\n"
    );
}
