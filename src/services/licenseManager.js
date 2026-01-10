(function () {
    const fs = window.require ? window.require("fs") : require("fs");
    const path = window.require ? window.require("path") : require("path");
    const electron = window.require
        ? window.require("electron")
        : require("electron");
    const { ipcRenderer } = electron;
    const os = window.require ? window.require("os") : require("os");
    const crypto = window.require
        ? window.require("crypto")
        : require("crypto");

    let API_URL;

    try {
        // Construire le chemin absolu vers config.js
        const configPath = path.join(__dirname, "../../config.js");

        const config = window.require
            ? window.require(configPath)
            : require(configPath);

        API_URL = config.API_URL;
    } catch (error) {
        console.error("Config file error:", error);
        console.warn("Config file not found, using default values");
    }

    const LICENSE_TYPES = {
        FREE: "free",
        PRO: "pro",
        BUSINESS: "business",
    };

    const FREE_LIMITS = {
        maxRooms: 1,
        allowedThemes: ["modern"],
        maxPhrases: 5,
        allowAmbientSounds: false,
        allowTimerPreference: false,
        allowCustomTheme: false,
        allowSoundUpload: false,
    };

    class LicenseManager {
        constructor() {
            this.license = null;
            this.licensePath = null;
            this.machineId = null;
            this.lastVerificationTime = null;
            this.encryptionKey = null;
        }

        /**
         * Get encryption key based on machine ID and licenseSecret unique
         * @returns {Buffer}
         */
        getEncryptionKey() {
            const machineId = this.getMachineId();

            // Utiliser la licenseSecret unique de la licence
            const licenseSecret =
                this.license?.licenseSecret || "default-fallback";
            const combined = `${licenseSecret}:${machineId}`;

            // Ne pas mettre en cache car licenseSecret peut changer
            return crypto
                .createHash("sha256")
                .update(combined)
                .digest();
        }

        /**
         * Encrypt license key
         * @param {string} licenseKey - Plain license key
         * @returns {string} - Encrypted license key (hex)
         */
        encryptLicenseKey(licenseKey) {
            if (!licenseKey) return null;

            try {
                const key = this.getEncryptionKey();
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

                let encrypted = cipher.update(licenseKey, "utf8", "hex");
                encrypted += cipher.final("hex");

                // Retourner IV + données chiffrées
                return iv.toString("hex") + ":" + encrypted;
            } catch (error) {
                console.error("Error encrypting license key:", error);
                return licenseKey; // Fallback
            }
        }

        /**
         * Decrypt license key
         * @param {string} encryptedKey - Encrypted license key (hex)
         * @returns {string} - Plain license key
         */
        decryptLicenseKey(encryptedKey) {
            if (!encryptedKey) return null;

            try {
                // Si la clé ne contient pas ":", c'est une ancienne version non chiffrée
                if (!encryptedKey.includes(":")) {
                    return encryptedKey;
                }

                const key = this.getEncryptionKey();
                const parts = encryptedKey.split(":");
                const iv = Buffer.from(parts[0], "hex");
                const encrypted = parts[1];

                const decipher = crypto.createDecipheriv(
                    "aes-256-cbc",
                    key,
                    iv
                );

                let decrypted = decipher.update(encrypted, "hex", "utf8");
                decrypted += decipher.final("utf8");

                return decrypted;
            } catch (error) {
                console.error("Error decrypting license key:", error);
                return null;
            }
        }

        /**
         * Generate a signature for license data to prevent tampering
         * @param {object} data - License data to sign
         * @returns {string}
         */
        generateSignature(data) {
            // Utiliser la licenseSecret unique de la licence
            const licenseSecret =
                data.licenseSecret ||
                this.license?.licenseSecret ||
                "default-fallback";

            // Déchiffrer la clé pour la signature
            const plainKey = this.decryptLicenseKey(data.key);
            const payload = JSON.stringify({
                key: plainKey,
                email: data.email,
                plan: data.plan,
                activatedAt: data.activatedAt,
            });
            return crypto
                .createHmac("sha256", licenseSecret)
                .update(payload)
                .digest("hex");
        }

        /**
         * Verify license signature to detect tampering
         * @param {object} license - License object with signature
         * @returns {boolean}
         */
        verifySignature(license) {
            if (!license || !license.signature) return false;
            try {
                const expectedSignature = this.generateSignature(license);
                return crypto.timingSafeEqual(
                    Buffer.from(expectedSignature),
                    Buffer.from(license.signature)
                );
            } catch (error) {
                return false;
            }
        }

        /**
         * Get unique machine ID
         * @returns {string}
         */
        getMachineId() {
            if (this.machineId) return this.machineId;

            // Créer un ID unique basé sur les informations de la machine
            const machineInfo = {
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus()[0]?.model || "unknown",
            };

            // Générer un hash unique
            this.machineId = crypto
                .createHash("sha256")
                .update(JSON.stringify(machineInfo))
                .digest("hex")
                .substring(0, 32);

            return this.machineId;
        }

        /**
         * Initialize license manager
         */
        async init() {
            try {
                // Get license file path from main process
                this.licensePath = await ipcRenderer.invoke(
                    "get-data-path",
                    "license.json"
                );

                // Load or create license file
                if (!fs.existsSync(this.licensePath)) {
                    this.createFreeLicense();
                } else {
                    this.loadLicense();

                    // Vérifier l'intégrité de la licence (anti-piratage)
                    if (this.isPro() && !this.verifySignature(this.license)) {
                        console.warn(
                            "License signature invalid - license may be tampered"
                        );
                        this.createFreeLicense();
                        return;
                    }
                }
            } catch (error) {
                console.error("Error initializing license manager:", error);
                this.createFreeLicense();
            }
        }

        /**
         * Create a free trial license
         */
        createFreeLicense() {
            this.license = {
                type: LICENSE_TYPES.FREE,
                activatedAt: new Date().toISOString(),
                key: null,
                plan: null,
                email: null,
                signature: null,
            };
            this.saveLicense();
        }

        /**
         * Load license from file
         */
        loadLicense() {
            try {
                const data = fs.readFileSync(this.licensePath, "utf8");
                this.license = JSON.parse(data);
            } catch (error) {
                console.error("Error loading license:", error);
                this.createFreeLicense();
            }
        }

        /**
         * Save license to file
         */
        saveLicense() {
            try {
                fs.writeFileSync(
                    this.licensePath,
                    JSON.stringify(this.license, null, 4),
                    "utf8"
                );
            } catch (error) {
                console.error("Error saving license:", error);
            }
        }

        /**
         * Verify license online using GET endpoint (doesn't consume usage)
         * Only used occasionally to check if license is still active
         */
        async checkLicenseStatus() {
            if (!this.license?.key || !this.license?.email)
                return { valid: true };

            try {
                const url = new URL(API_URL + "/validate-license");
                url.searchParams.append("key", this.license.key);
                url.searchParams.append("email", this.license.email);

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.warn("License check failed:", response.status);
                    return { valid: true }; // Don't deactivate on network error
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.warn("Could not check license online:", error);
                return { valid: true }; // Don't deactivate on network error
            }
        }

        /**
         * Activate a PRO license with a key and email
         * @param {string} licenseKey - The license key to activate
         * @param {string} email - The email associated with the license
         * @returns {Promise<{success: boolean, error?: string, data?: object}>}
         */
        async activatePro(licenseKey, email) {
            // Validation de l'email
            if (!email || !this.validateEmail(email)) {
                return {
                    success: false,
                    error: "Adresse email invalide",
                };
            }

            // Validation simple du format de la clé
            if (!this.validateLicenseKey(licenseKey)) {
                return {
                    success: false,
                    error: "Format de clé invalide. Format attendu : XXXX-XXXX-XXXX-XXXX",
                };
            }

            try {
                // Valider la clé via l'API (POST consomme une utilisation)
                const response = await fetch(API_URL + "/validate-license", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        licenseKey: licenseKey,
                        email: email,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    return {
                        success: false,
                        error:
                            data.error ||
                            "Erreur lors de la validation de la licence",
                    };
                }

                if (!data.valid && !data.success) {
                    return {
                        success: false,
                        error: data.error || "Clé de licence invalide",
                    };
                }

                // Déterminer le type de licence selon le plan
                const plan = data.plan || "PRO";
                const licenseType =
                    plan.toUpperCase() === "BUSINESS"
                        ? LICENSE_TYPES.BUSINESS
                        : LICENSE_TYPES.PRO;

                // ⚠️ IMPORTANT : Récupérer la licenseSecret unique envoyée par le serveur
                const licenseSecret = data.licenseSecret;
                if (!licenseSecret) {
                    return {
                        success: false,
                        error: "Le serveur n'a pas renvoyé de secret de licence. Contactez le support.",
                    };
                }

                // Créer l'objet licence avec la secret unique
                const licenseData = {
                    type: licenseType,
                    activatedAt: new Date().toISOString(),
                    key: licenseKey, // En clair pour la signature
                    plan: plan,
                    email: email,
                    licenseSecret: licenseSecret,
                };

                // ⚠️ IMPORTANT : Mettre à jour this.license AVANT de chiffrer
                // pour que getEncryptionKey() utilise la bonne licenseSecret
                this.license = licenseData;

                // Générer une signature avec la clé en clair
                this.license.signature = this.generateSignature(this.license);

                // Maintenant chiffrer la clé
                this.license.key = this.encryptLicenseKey(licenseKey);

                // Sauvegarder la licence
                this.saveLicense();

                return {
                    success: true,
                    data: {
                        plan: plan,
                        email: email,
                    },
                };
            } catch (error) {
                console.error("Error activating license:", error);
                return {
                    success: false,
                    error: "Impossible de vérifier la licence. Vérifiez votre connexion internet.",
                };
            }
        }

        /**
         * Validate a license key format
         * @param {string} key - License key to validate
         * @returns {boolean}
         */
        validateLicenseKey(key) {
            // Format: XXXX-XXXX-XXXX-XXXX (16 caractères + 3 tirets)
            const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            return pattern.test(key);
        }

        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean}
         */
        validateEmail(email) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(email);
        }

        /**
         * Check if current license is PRO
         * @returns {boolean}
         */
        isPro() {
            return (
                this.license &&
                (this.license.type === LICENSE_TYPES.PRO ||
                    this.license.type === LICENSE_TYPES.BUSINESS)
            );
        }

        /**
         * Check if current license is BUSINESS
         * @returns {boolean}
         */
        isBusiness() {
            return this.license && this.license.type === LICENSE_TYPES.BUSINESS;
        }

        /**
         * Check if current license is FREE
         * @returns {boolean}
         */
        isFree() {
            return !this.isPro();
        }

        /**
         * Get license type
         * @returns {string}
         */
        getLicenseType() {
            return this.license ? this.license.type : LICENSE_TYPES.FREE;
        }

        /**
         * Get license information
         * @returns {object}
         */
        getLicenseInfo() {
            return {
                type: this.getLicenseType(),
                isPro: this.isPro(),
                isBusiness: this.isBusiness(),
                activatedAt: this.license?.activatedAt,
                limits: this.isFree() ? FREE_LIMITS : null,
                plan: this.license?.plan,
                email: this.license?.email,
                remainingUsages: this.license?.remainingUsages,
                maxUsages: this.license?.maxUsages,
                // Ne PAS exposer la clé déchiffrée
            };
        }

        /**
         * Get decrypted license key (internal use only)
         * @returns {string|null}
         */
        getDecryptedLicenseKey() {
            if (!this.license?.key) return null;
            return this.decryptLicenseKey(this.license.key);
        }

        /**
         * Check if a feature is available
         * @param {string} feature - Feature name to check
         * @returns {boolean}
         */
        canUseFeature(feature) {
            if (this.isPro()) return true;

            const limits = FREE_LIMITS;
            switch (feature) {
                case "customTheme":
                    return limits.allowCustomTheme;
                case "ambientSounds":
                    return limits.allowAmbientSounds;
                case "timerPreference":
                    return limits.allowTimerPreference;
                case "soundUpload":
                    return limits.allowSoundUpload;
                default:
                    return true;
            }
        }

        /**
         * Check if a theme is allowed
         * @param {string} themeName - Theme name
         * @returns {boolean}
         */
        canUseTheme(themeName) {
            if (this.isPro()) return true;
            return FREE_LIMITS.allowedThemes.includes(themeName);
        }

        /**
         * Get maximum number of rooms allowed
         * @returns {number}
         */
        getMaxRooms() {
            return this.isPro() ? Infinity : FREE_LIMITS.maxRooms;
        }

        /**
         * Get maximum number of phrases allowed
         * @returns {number}
         */
        getMaxPhrases() {
            return this.isPro() ? Infinity : FREE_LIMITS.maxPhrases;
        }

        /**
         * Check if can create more rooms
         * @param {number} currentCount - Current number of rooms
         * @returns {boolean}
         */
        canCreateRoom(currentCount) {
            return currentCount < this.getMaxRooms();
        }

        /**
         * Check if can add more phrases
         * @param {number} currentCount - Current number of phrases
         * @returns {boolean}
         */
        canAddPhrase(currentCount) {
            return currentCount < this.getMaxPhrases();
        }
    }

    // Create singleton instance
    const licenseManager = new LicenseManager();

    // Export global pour utilisation dans le navigateur
    if (typeof window !== "undefined") {
        window.licenseManager = licenseManager;
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = licenseManager;
    }
})();
