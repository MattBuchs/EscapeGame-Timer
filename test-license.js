/**
 * Script de test pour le système de licence
 *
 * Utilisez ce script dans la console DevTools de l'application Electron
 * pour tester le système de licence.
 */

// ==========================================
// Tests du système de licence
// ==========================================

const licenseTests = {
    /**
     * Test 1: Vérifier que le licenseManager est chargé
     */
    async testManagerLoaded() {
        console.log(
            "\n🧪 Test 1: Vérification du chargement du licenseManager..."
        );

        if (typeof window.licenseManager !== "undefined") {
            console.log("✅ licenseManager est chargé");
            return true;
        } else {
            console.error("❌ licenseManager n'est pas chargé");
            return false;
        }
    },

    /**
     * Test 2: Obtenir les informations de licence
     */
    async testGetLicenseInfo() {
        console.log("\n🧪 Test 2: Récupération des informations de licence...");

        try {
            const info = window.licenseManager.getLicenseInfo();
            console.log("✅ Informations de licence:", info);
            return true;
        } catch (error) {
            console.error("❌ Erreur:", error);
            return false;
        }
    },

    /**
     * Test 3: Valider le format d'une clé de licence
     */
    testKeyFormat() {
        console.log("\n🧪 Test 3: Validation du format de clé...");

        const validKeys = [
            "AAAA-BBBB-CCCC-DDDD",
            "A1B2-C3D4-E5F6-G7H8",
            "1234-5678-90AB-CDEF",
        ];

        const invalidKeys = [
            "AAAA-BBBB-CCCC",
            "AAAA-BBBB-CCCC-DDDD-EEEE",
            "aaaa-bbbb-cccc-dddd",
            "AAAA BBBB CCCC DDDD",
        ];

        console.log("Clés valides:");
        validKeys.forEach((key) => {
            const isValid = window.licenseManager.validateLicenseKey(key);
            console.log(`  ${key}: ${isValid ? "✅" : "❌"}`);
        });

        console.log("Clés invalides:");
        invalidKeys.forEach((key) => {
            const isValid = window.licenseManager.validateLicenseKey(key);
            console.log(`  ${key}: ${isValid ? "❌" : "✅"}`);
        });
    },

    /**
     * Test 4: Valider le format d'email
     */
    testEmailFormat() {
        console.log("\n🧪 Test 4: Validation du format d'email...");

        const validEmails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.com",
        ];

        const invalidEmails = ["invalid", "@example.com", "user@", "user@.com"];

        console.log("Emails valides:");
        validEmails.forEach((email) => {
            const isValid = window.licenseManager.validateEmail(email);
            console.log(`  ${email}: ${isValid ? "✅" : "❌"}`);
        });

        console.log("Emails invalides:");
        invalidEmails.forEach((email) => {
            const isValid = window.licenseManager.validateEmail(email);
            console.log(`  ${email}: ${isValid ? "❌" : "✅"}`);
        });
    },

    /**
     * Test 5: Tester l'activation (nécessite une connexion internet et une vraie clé)
     */
    async testActivation(key, email) {
        console.log("\n🧪 Test 5: Test d'activation...");
        console.log(`Clé: ${key}`);
        console.log(`Email: ${email}`);

        try {
            const result = await window.licenseManager.activatePro(key, email);

            if (result.success) {
                console.log("✅ Activation réussie!");
                console.log("Données:", result.data);
            } else {
                console.log("❌ Activation échouée");
                console.log("Erreur:", result.error);
            }

            return result;
        } catch (error) {
            console.error("❌ Erreur lors de l'activation:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Test 6: Vérifier la signature de la licence actuelle
     */
    testSignature() {
        console.log("\n🧪 Test 6: Vérification de la signature...");

        const license = window.licenseManager.license;

        if (!license) {
            console.log("ℹ️ Aucune licence chargée");
            return;
        }

        if (license.type === "free") {
            console.log("ℹ️ Version gratuite, pas de signature à vérifier");
            return;
        }

        const isValid = window.licenseManager.verifySignature(license);

        if (isValid) {
            console.log(
                "✅ Signature valide - La licence n'a pas été modifiée"
            );
        } else {
            console.log(
                "❌ Signature invalide - La licence a été modifiée ou corrompue"
            );
        }
    },

    /**
     * Test 7: Vérifier les limitations de la version gratuite
     */
    testFreeLimits() {
        console.log("\n🧪 Test 7: Vérification des limitations...");

        console.log("Max rooms:", window.licenseManager.getMaxRooms());
        console.log("Max phrases:", window.licenseManager.getMaxPhrases());
        console.log(
            "Can use custom theme:",
            window.licenseManager.canUseFeature("customTheme")
        );
        console.log(
            "Can use ambient sounds:",
            window.licenseManager.canUseFeature("ambientSounds")
        );
        console.log(
            "Can use timer preference:",
            window.licenseManager.canUseFeature("timerPreference")
        );
    },

    /**
     * Exécuter tous les tests
     */
    async runAll() {
        console.log("🚀 Démarrage de tous les tests...\n");

        await this.testManagerLoaded();
        await this.testGetLicenseInfo();
        this.testKeyFormat();
        this.testEmailFormat();
        this.testSignature();
        this.testFreeLimits();

        console.log("\n✅ Tous les tests terminés!\n");
    },
};

// ==========================================
// Utilitaires
// ==========================================

const licenseUtils = {
    /**
     * Afficher les informations de la licence actuelle
     */
    showCurrentLicense() {
        const info = window.licenseManager.getLicenseInfo();
        console.log("\n📄 Licence actuelle:");
        console.log("━".repeat(50));
        console.log(`Type: ${info.type}`);
        console.log(`Plan: ${info.plan || "N/A"}`);
        console.log(`Email: ${info.email || "N/A"}`);
        console.log(`Activée le: ${info.activatedAt || "N/A"}`);
        console.log(`PRO: ${info.isPro ? "✅" : "❌"}`);
        console.log(`Business: ${info.isBusiness ? "✅" : "❌"}`);

        if (info.maxUsages) {
            console.log(
                `Utilisations restantes: ${info.remainingUsages}/${info.maxUsages}`
            );
        }

        console.log("━".repeat(50) + "\n");
    },

    /**
     * Simuler l'activation avec une clé de test
     */
    async activateTest(key, email) {
        console.log("\n🔑 Tentative d'activation...\n");
        const result = await licenseTests.testActivation(key, email);

        if (result.success) {
            this.showCurrentLicense();
        }

        return result;
    },

    /**
     * Réinitialiser en version gratuite (pour les tests)
     */
    resetToFree() {
        console.log("\n🔄 Réinitialisation en version gratuite...");
        window.licenseManager.createFreeLicense();
        console.log("✅ Réinitialisation effectuée\n");
        this.showCurrentLicense();
    },
};

// ==========================================
// Exposer globalement pour utilisation dans la console
// ==========================================

if (typeof window !== "undefined") {
    window.licenseTests = licenseTests;
    window.licenseUtils = licenseUtils;
}

console.log("🧪 Tests de licence chargés!");
console.log("\nCommandes disponibles:");
console.log(
    "  licenseTests.runAll()                    - Exécuter tous les tests"
);
console.log(
    "  licenseTests.testActivation(key, email)  - Tester une activation"
);
console.log(
    "  licenseUtils.showCurrentLicense()        - Afficher la licence actuelle"
);
console.log(
    "  licenseUtils.activateTest(key, email)    - Activer avec une clé de test"
);
console.log(
    "  licenseUtils.resetToFree()               - Réinitialiser en version gratuite"
);
console.log("\nExemple:");
console.log(
    '  licenseUtils.activateTest("AAAA-BBBB-CCCC-DDDD", "test@example.com")\n'
);
