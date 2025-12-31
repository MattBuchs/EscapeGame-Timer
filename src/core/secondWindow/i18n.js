/**
 * Système de traduction i18n pour la fenêtre secondaire
 */

const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

class I18nSecondWindow {
    constructor() {
        this.currentLocale = "fr";
        this.translations = {};
        this.loadLocale();
        
        // Écouter les changements de langue depuis la fenêtre principale
        ipcRenderer.on("language-changed", (event, locale) => {
            this.setLocale(locale);
        });
    }

    /**
     * Charge la locale depuis le localStorage ou utilise la locale par défaut
     */
    loadLocale() {
        const savedLocale = localStorage.getItem("app-locale");
        if (savedLocale) {
            this.currentLocale = savedLocale;
        }
        this.loadTranslations();
    }

    /**
     * Charge les traductions pour la locale actuelle
     */
    loadTranslations() {
        try {
            const translationsPath = path.join(
                __dirname,
                "../locales",
                `${this.currentLocale}.json`
            );
            const data = fs.readFileSync(translationsPath, "utf8");
            this.translations = JSON.parse(data);
        } catch (error) {
            console.error(
                `Erreur lors du chargement des traductions pour ${this.currentLocale}:`,
                error
            );
            if (this.currentLocale !== "fr") {
                this.currentLocale = "fr";
                this.loadTranslations();
            }
        }
    }

    /**
     * Change la langue de l'application
     * @param {string} locale - Code de la locale (ex: 'fr', 'en')
     */
    setLocale(locale) {
        if (this.currentLocale !== locale) {
            this.currentLocale = locale;
            localStorage.setItem("app-locale", locale);
            this.loadTranslations();
            this.translatePage();
        }
    }

    /**
     * Obtient la locale actuelle
     * @returns {string} Code de la locale actuelle
     */
    getLocale() {
        return this.currentLocale;
    }

    /**
     * Traduit une clé
     * @param {string} key - Clé de traduction (ex: 'header.home')
     * @param {object} params - Paramètres pour remplacer dans la traduction
     * @returns {string} Texte traduit
     */
    t(key, params = {}) {
        const keys = key.split(".");
        let translation = this.translations;

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                console.warn(`Traduction manquante pour la clé: ${key}`);
                return key;
            }
        }

        if (typeof translation === "string") {
            return this.interpolate(translation, params);
        }

        return translation;
    }

    /**
     * Remplace les variables dans une chaîne de traduction
     * @param {string} str - Chaîne avec des variables (ex: "Bonjour {name}")
     * @param {object} params - Objet avec les valeurs à remplacer
     * @returns {string} Chaîne avec les variables remplacées
     */
    interpolate(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Traduit tous les éléments avec l'attribut data-i18n dans le DOM
     */
    translatePage() {
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            element.textContent = this.t(key);
        });

        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach((element) => {
                const key = element.getAttribute("data-i18n-placeholder");
                element.placeholder = this.t(key);
            });

        document.querySelectorAll("[data-i18n-title]").forEach((element) => {
            const key = element.getAttribute("data-i18n-title");
            element.title = this.t(key);
        });

        document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
            const key = element.getAttribute("data-i18n-alt");
            element.alt = this.t(key);
        });
    }
}

// Instance globale
const i18n = new I18nSecondWindow();

// Export pour utilisation dans les autres modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = i18n;
}

// Export global pour utilisation dans le navigateur
if (typeof window !== "undefined") {
    window.i18n = i18n;
}
