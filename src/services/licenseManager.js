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
            this.initialized = false; // Flag pour éviter l'init multiple
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
            return crypto.createHash("sha256").update(combined).digest();
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
         * @param {string} plainKey - Optional plain key (if already decrypted)
         * @returns {string}
         */
        generateSignature(data, plainKey = null) {
            // Utiliser la licenseSecret unique de la licence
            const licenseSecret =
                data.licenseSecret ||
                this.license?.licenseSecret ||
                "default-fallback";

            // Si plainKey fourni, l'utiliser directement
            // Sinon détecter si la clé est chiffrée (contient ':') ou en clair
            let keyToUse = plainKey;
            if (!keyToUse && data.key) {
                if (data.key.includes(":")) {
                    // Clé chiffrée, la déchiffrer
                    keyToUse = this.decryptLicenseKey(data.key);
                } else {
                    // Clé en clair
                    keyToUse = data.key;
                }
            }

            const payload = JSON.stringify({
                key: keyToUse,
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

            try {
                const { execSync } = require("child_process");

                // Créer un ID unique basé sur les informations de la machine
                const machineInfo = {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    arch: os.arch(),
                    cpus: os.cpus()[0]?.model || "unknown",
                    totalMemory: os.totalmem(), // RAM totale (plus unique)
                };

                // Ajouter des identifiants système selon la plateforme
                if (os.platform() === "win32") {
                    // Windows: Essayer plusieurs méthodes
                    try {
                        const uuid = execSync("wmic csproduct get UUID", {
                            encoding: "utf-8",
                            stdio: ["ignore", "pipe", "ignore"],
                        })
                            .split("\n")[1]
                            ?.trim();
                        if (uuid && uuid !== "UUID") {
                            machineInfo.systemUUID = uuid;
                        }
                    } catch (e) {
                        // wmic non disponible, ignorer
                    }

                    try {
                        const diskSerial = execSync(
                            "wmic diskdrive get SerialNumber",
                            {
                                encoding: "utf-8",
                                stdio: ["ignore", "pipe", "ignore"],
                            }
                        )
                            .split("\n")[1]
                            ?.trim();
                        if (diskSerial && diskSerial !== "SerialNumber") {
                            machineInfo.diskSerial = diskSerial;
                        }
                    } catch (e) {
                        // wmic non disponible, ignorer
                    }

                    // Fallback Windows : utiliser le nom d'utilisateur
                    try {
                        machineInfo.username = os.userInfo().username;
                    } catch (e) {
                        // Ignorer
                    }
                } else if (os.platform() === "darwin") {
                    // macOS: Hardware UUID
                    try {
                        const uuid = execSync(
                            "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID",
                            { encoding: "utf-8" }
                        )
                            .split("=")[1]
                            ?.trim()
                            .replace(/"/g, "");
                        if (uuid) {
                            machineInfo.systemUUID = uuid;
                        }
                    } catch (e) {
                        // Ignorer
                    }
                } else if (os.platform() === "linux") {
                    // Linux: Machine ID
                    try {
                        const machineId = execSync(
                            "cat /etc/machine-id || cat /var/lib/dbus/machine-id",
                            { encoding: "utf-8" }
                        ).trim();
                        if (machineId) {
                            machineInfo.systemUUID = machineId;
                        }
                    } catch (e) {
                        // Ignorer
                    }
                }

                // Générer un hash SHA-256 unique
                this.machineId = crypto
                    .createHash("sha256")
                    .update(JSON.stringify(machineInfo))
                    .digest("hex");

                return this.machineId;
            } catch (error) {
                console.error("Error generating machineId:", error);

                // Fallback : au moins hostname + timestamp + random
                const fallbackInfo = {
                    hostname: os.hostname(),
                    platform: os.platform(),
                    random: crypto.randomBytes(16).toString("hex"),
                    timestamp: Date.now(),
                };

                this.machineId = crypto
                    .createHash("sha256")
                    .update(JSON.stringify(fallbackInfo))
                    .digest("hex");

                return this.machineId;
            }
        }

        /**
         * Initialize license manager
         */
        async init() {
            // Éviter l'initialisation multiple
            if (this.initialized) {
                return;
            }

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

                    // Vérifier le machineId en ligne (si connexion disponible)
                    if (this.isPro()) {
                        const verification = await this.verifyMachineIdOnline();

                        if (verification.shouldDeactivate) {
                            console.error(
                                "License deactivated: machineId mismatch"
                            );
                            this.createFreeLicense();

                            // Afficher un message et recharger l'app
                            if (typeof window !== "undefined") {
                                setTimeout(() => {
                                    alert(
                                        "Votre licence a été désactivée car elle est utilisée sur une autre machine.\n\n" +
                                            "Si vous souhaitez l'utiliser sur cette machine, veuillez d'abord la transférer depuis l'ancienne machine " +
                                            "via la section Contact > Gestion de licence."
                                    );

                                    // Recharger l'application pour appliquer les changements
                                    window.location.reload();
                                }, 1000);
                            }
                            return;
                        }
                    }
                }

                // Marquer comme initialisé
                this.initialized = true;
            } catch (error) {
                console.error("Error initializing license manager:", error);
                this.createFreeLicense();
                this.initialized = true;
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
         * Verify machineId with server at startup
         * Only runs if internet is available, doesn't block if offline
         * @returns {Promise<{valid: boolean, shouldDeactivate: boolean}>}
         */
        async verifyMachineIdOnline() {
            // Ne vérifier que pour les licences PRO
            if (!this.isPro() || !this.license?.email) {
                return { valid: true, shouldDeactivate: false };
            }

            try {
                const machineId = this.getMachineId();
                const licenseKey = this.getDecryptedLicenseKey();

                if (!licenseKey) {
                    console.warn("No license key to verify");
                    return { valid: true, shouldDeactivate: false };
                }

                // Appel à l'API pour vérifier le machineId
                const response = await fetch(API_URL + "/verify-machine", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        licenseKey: licenseKey,
                        email: this.license.email,
                        machineId: machineId,
                        timestamp: Date.now(),
                    }),
                    // Timeout de 5 secondes pour ne pas bloquer
                    signal: AbortSignal.timeout(5000),
                });

                if (!response.ok) {
                    // Si erreur serveur (500, etc.), ne pas désactiver
                    if (response.status >= 500) {
                        console.warn(
                            "Server error during machineId verification, skipping"
                        );
                        return { valid: true, shouldDeactivate: false };
                    }

                    // Si 403/401, la machine n'est pas autorisée
                    if (response.status === 403 || response.status === 401) {
                        console.error(
                            "MachineId not authorized for this license"
                        );
                        return { valid: false, shouldDeactivate: true };
                    }

                    // Autres erreurs, laisser passer
                    return { valid: true, shouldDeactivate: false };
                }

                const data = await response.json();

                if (data.valid === false) {
                    console.error("MachineId verification failed:", data.error);
                    return { valid: false, shouldDeactivate: true };
                }

                return { valid: true, shouldDeactivate: false };
            } catch (error) {
                // Erreur réseau (pas de connexion, timeout, etc.)
                // Ne pas bloquer l'utilisateur
                console.warn(
                    "Could not verify machineId (offline or timeout):",
                    error.message
                );
                return { valid: true, shouldDeactivate: false };
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
                // Récupérer le machineId pour l'envoyer au serveur
                const machineId = this.getMachineId();

                // Valider la clé via l'API (POST consomme une utilisation)
                const response = await fetch(API_URL + "/validate-license", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        licenseKey: licenseKey,
                        email: email,
                        machineId, // 🔒 Envoyer le machineId pour stockage
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

                // Générer une signature avec la clé en clair (passer en paramètre)
                this.license.signature = this.generateSignature(
                    this.license,
                    licenseKey
                );

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
         * Deactivate current license and reset to FREE
         * @returns {Promise<boolean>}
         */
        async deactivateLicense() {
            try {
                // Réinitialiser à FREE
                this.license = {
                    type: LICENSE_TYPES.FREE,
                };

                // Sauvegarder
                this.saveLicense();

                return true;
            } catch (error) {
                console.error("Error deactivating license:", error);
                return false;
            }
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
