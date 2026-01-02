const fs = window.require ? window.require("fs") : require("fs");
const path = window.require ? window.require("path") : require("path");
const electron = window.require
    ? window.require("electron")
    : require("electron");
const { ipcRenderer } = electron;

class SettingsManager {
    constructor() {
        this.settings = null;
        this.settingsPath = null;
        this.defaultSettings = {
            language: "en",
            theme: "modern",
            preferenceTimer: false,
        };
    }

    /**
     * Initialize settings from file
     */
    async init() {
        try {
            // Get settings file path from main process
            this.settingsPath = await ipcRenderer.invoke(
                "get-data-path",
                "settings.json"
            );

            // Create file if it doesn't exist
            if (!fs.existsSync(this.settingsPath)) {
                // Check for installer language
                const installerLang = await this.getInstallerLanguage();
                if (installerLang) {
                    this.defaultSettings.language = installerLang;
                }

                fs.writeFileSync(
                    this.settingsPath,
                    JSON.stringify(this.defaultSettings, null, 4),
                    "utf8"
                );
            }

            // Load settings
            this.loadSettings();

            // Migrate from localStorage if needed
            await this.migrateFromLocalStorage();
        } catch (error) {
            console.error("Error initializing settings:", error);
            this.settings = { ...this.defaultSettings };
        }
    }

    /**
     * Load settings from file
     */
    loadSettings() {
        try {
            const data = fs.readFileSync(this.settingsPath, "utf8");
            this.settings = JSON.parse(data);

            // Ensure all default keys exist
            this.settings = { ...this.defaultSettings, ...this.settings };
        } catch (error) {
            console.error("Error loading settings:", error);
            this.settings = { ...this.defaultSettings };
        }
    }

    /**
     * Save settings to file
     */
    saveSettings() {
        try {
            fs.writeFileSync(
                this.settingsPath,
                JSON.stringify(this.settings, null, 4),
                "utf8"
            );
            return true;
        } catch (error) {
            console.error("Error saving settings:", error);
            return false;
        }
    }

    /**
     * Get a setting value
     */
    get(key) {
        return this.settings ? this.settings[key] : this.defaultSettings[key];
    }

    /**
     * Set a setting value and save
     */
    set(key, value) {
        if (this.settings) {
            this.settings[key] = value;
            this.saveSettings();
        }
    }

    /**
     * Get all settings
     */
    getAll() {
        return this.settings || this.defaultSettings;
    }

    /**
     * Get installer language
     */
    async getInstallerLanguage() {
        try {
            const langFilePath = await ipcRenderer.invoke(
                "get-installer-language"
            );
            if (langFilePath && fs.existsSync(langFilePath)) {
                const lang = fs.readFileSync(langFilePath, "utf8").trim();
                return lang || null;
            }
        } catch (e) {
            // Ignore errors
        }
        return null;
    }

    /**
     * Migrate settings from localStorage to JSON file
     */
    async migrateFromLocalStorage() {
        let migrated = false;

        // Migrate language
        const savedLocale = localStorage.getItem("app-locale");
        if (savedLocale && savedLocale !== this.settings.language) {
            this.settings.language = savedLocale;
            migrated = true;
        }

        // Migrate theme
        const savedTheme = localStorage.getItem("selected-theme");
        if (savedTheme && savedTheme !== this.settings.theme) {
            this.settings.theme = savedTheme;
            migrated = true;
        }

        // Migrate preference timer
        const savedPreference = localStorage.getItem("is-preference-timer");
        if (savedPreference !== null) {
            const preferenceValue = savedPreference === "true";
            if (preferenceValue !== this.settings.preferenceTimer) {
                this.settings.preferenceTimer = preferenceValue;
                migrated = true;
            }
        }

        if (migrated) {
            this.saveSettings();
            console.log("Settings migrated from localStorage to settings.json");
        }
    }
}

// Create singleton instance
const settingsManager = new SettingsManager();

// Export global pour utilisation dans le navigateur
if (typeof window !== "undefined") {
    window.settingsManager = settingsManager;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = settingsManager;
}
