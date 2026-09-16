/**
 * 🛡️ Data Validator - Validation et nettoyage des données selon la licence
 *
 * Ce service empêche la manipulation des fichiers JSON pour contourner
 * les limites de la version FREE.
 */

const fs = require("fs");
const path = require("path");

// Limites de la version FREE
const FREE_LIMITS = {
    maxRooms: 1,
    maxPhrases: 5,
    allowedThemes: ["modern"],
    allowAmbientSounds: false,
    allowTimerPreference: false,
    allowCustomTheme: false,
    allowSoundUpload: false,
};

class DataValidator {
    constructor() {
        this.licenseManager = null;
        this.roomsPath = path.join(__dirname, "../data/rooms.json");
        this.settingsPath = path.join(__dirname, "../data/settings.json");
    }

    /**
     * Initialize with license manager instance
     * @param {object} licenseManager
     */
    init(licenseManager) {
        this.licenseManager = licenseManager;
    }

    /**
     * Validate and clean rooms.json according to license limits
     * @returns {Array} Validated rooms array
     */
    validateRooms() {
        if (!fs.existsSync(this.roomsPath)) {
            return [];
        }

        try {
            const fileContent = fs.readFileSync(this.roomsPath, "utf8");
            let rooms = JSON.parse(fileContent);

            // Si version FREE, appliquer les restrictions
            if (this.licenseManager && this.licenseManager.isFree()) {
                const limits = FREE_LIMITS;

                // Limite de salles (filtrage en mémoire uniquement, pas de modification du fichier)
                if (rooms.length > limits.maxRooms) {
                    rooms = rooms.slice(0, limits.maxRooms);
                }

                // Limiter les phrases par salle
                rooms = rooms.map((room) => {
                    if (
                        room.phrases &&
                        Array.isArray(room.phrases) &&
                        room.phrases.length > limits.maxPhrases
                    ) {
                        room.phrases = room.phrases.slice(0, limits.maxPhrases);
                    }
                    return room;
                });
            }

            return rooms;
        } catch (error) {
            console.error("Error validating rooms:", error);
            return [];
        }
    }

    /**
     * Validate and clean settings.json according to license limits
     * @returns {object} Validated settings object
     */
    validateSettings() {
        if (!fs.existsSync(this.settingsPath)) {
            return this.getDefaultSettings();
        }

        try {
            const fileContent = fs.readFileSync(this.settingsPath, "utf8");
            let settings = JSON.parse(fileContent);

            // Si version FREE, appliquer les restrictions (en mémoire uniquement)
            if (this.licenseManager && this.licenseManager.isFree()) {
                const limits = FREE_LIMITS;

                // Forcer le thème "modern" si autre thème non autorisé
                if (
                    settings.theme &&
                    !limits.allowedThemes.includes(settings.theme) &&
                    settings.theme !== "custom"
                ) {
                    settings.theme = "modern";
                }

                // Désactiver customTheme si non autorisé
                if (settings.customTheme && !limits.allowCustomTheme) {
                    delete settings.customTheme;
                    settings.theme = "modern";
                }

                // Désactiver preferenceTimer si non autorisé
                if (settings.preferenceTimer && !limits.allowTimerPreference) {
                    settings.preferenceTimer = false;
                }
            }

            return settings;
        } catch (error) {
            console.error("Error validating settings:", error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Get default settings
     * @returns {object}
     */
    getDefaultSettings() {
        return {
            language: "fr",
            theme: "modern",
            preferenceTimer: false,
        };
    }

    /**
     * Validate before adding a new room
     * @returns {boolean} true if allowed, false otherwise
     */
    canAddRoom() {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            const rooms = this.validateRooms();
            return rooms.length < FREE_LIMITS.maxRooms;
        }

        return true;
    }

    /**
     * Validate before adding a new phrase
     * @param {string} roomId
     * @returns {boolean} true if allowed, false otherwise
     */
    canAddPhrase(roomId) {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            const rooms = this.validateRooms();
            const room = rooms.find((r) => r.id === roomId);

            if (room && room.phrases) {
                return room.phrases.length < FREE_LIMITS.maxPhrases;
            }
        }

        return true;
    }

    /**
     * Validate if a theme is allowed
     * @param {string} themeName
     * @returns {boolean}
     */
    canUseTheme(themeName) {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            return (
                FREE_LIMITS.allowedThemes.includes(themeName) ||
                themeName === "custom"
            );
        }

        return true;
    }

    /**
     * Validate if custom theme is allowed
     * @returns {boolean}
     */
    canUseCustomTheme() {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            return FREE_LIMITS.allowCustomTheme;
        }

        return true;
    }

    /**
     * Validate if ambient sounds are allowed
     * @returns {boolean}
     */
    canUseAmbientSounds() {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            return FREE_LIMITS.allowAmbientSounds;
        }

        return true;
    }

    /**
     * Validate if sound upload is allowed
     * @returns {boolean}
     */
    canUploadSounds() {
        if (!this.licenseManager) return true;

        if (this.licenseManager.isFree()) {
            return FREE_LIMITS.allowSoundUpload;
        }

        return true;
    }
}

// Export singleton instance
const dataValidator = new DataValidator();

// Expose globally for use in renderer process
if (typeof window !== "undefined") {
    window.dataValidator = dataValidator;
}

module.exports = dataValidator;
