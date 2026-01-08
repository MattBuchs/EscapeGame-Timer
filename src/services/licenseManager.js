(function () {
    const fs = window.require ? window.require("fs") : require("fs");
    const path = window.require ? window.require("path") : require("path");
    const electron = window.require
        ? window.require("electron")
        : require("electron");
    const { ipcRenderer } = electron;

    const LICENSE_TYPES = {
        FREE: "free",
        PRO: "pro",
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
         * Activate a PRO license with a key
         * @param {string} licenseKey - The license key to activate
         * @returns {boolean} - True if activation successful
         */
        activatePro(licenseKey) {
            // Validation simple du format de la clé
            if (!this.validateLicenseKey(licenseKey)) {
                return false;
            }

            this.license = {
                type: LICENSE_TYPES.PRO,
                activatedAt: new Date().toISOString(),
                key: licenseKey,
            };
            this.saveLicense();
            return true;
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
         * Check if current license is PRO
         * @returns {boolean}
         */
        isPro() {
            return this.license && this.license.type === LICENSE_TYPES.PRO;
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
                activatedAt: this.license?.activatedAt,
                limits: this.isFree() ? FREE_LIMITS : null,
            };
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
