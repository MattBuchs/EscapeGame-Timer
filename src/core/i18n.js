/**
 * Système de traduction i18n pour EscapeTime
 */

(function () {
    const electron = window.require
        ? window.require("electron")
        : require("electron");
    const fs = window.require ? window.require("fs") : require("fs");
    const path = window.require ? window.require("path") : require("path");
    const { ipcRenderer } = electron;
    // settingsManager est chargé globalement via <script> dans index.html
    const settingsManager = window.settingsManager;

    class I18n {
        constructor() {
            this.currentLocale = "fr";
            this.translations = {};
            this.observers = [];
        }

        /**
         * Initialize i18n with settings
         */
        async init() {
            await settingsManager.init();
            this.currentLocale = settingsManager.get("language");
            this.loadTranslations();
        }

        /**
         * Charge la locale depuis les paramètres
         */
        loadLocale() {
            this.currentLocale = settingsManager.get("language") || "fr";
            this.loadTranslations();
        }

        /**
         * Charge les traductions pour la locale actuelle
         */
        loadTranslations() {
            try {
                // Calculer le chemin relatif depuis le fichier HTML
                const translationsPath = path.join(
                    __dirname,
                    "../../locales",
                    `${this.currentLocale}.json`
                );
                const data = fs.readFileSync(translationsPath, "utf8");
                this.translations = JSON.parse(data);
            } catch (error) {
                console.error(
                    `Erreur lors du chargement des traductions pour ${this.currentLocale}:`,
                    error
                );
                // Fallback sur le français en cas d'erreur
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
        async setLocale(locale) {
            if (this.currentLocale !== locale) {
                this.currentLocale = locale;
                await settingsManager.set("language", locale);
                this.loadTranslations();
                this.notifyObservers();
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

            // Remplace les paramètres dans la traduction
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
         * Ajoute un observateur qui sera notifié lors du changement de langue
         * @param {Function} callback - Fonction à appeler lors du changement
         */
        addObserver(callback) {
            this.observers.push(callback);
        }

        /**
         * Notifie tous les observateurs d'un changement de langue
         */
        notifyObservers() {
            this.observers.forEach((callback) => callback(this.currentLocale));
        }

        /**
         * Traduit tous les éléments avec l'attribut data-i18n dans le DOM
         */
        translatePage() {
            // Traduit les éléments avec data-i18n (pour le contenu texte)
            document.querySelectorAll("[data-i18n]").forEach((element) => {
                const key = element.getAttribute("data-i18n");
                element.textContent = this.t(key);
            });

            // Traduit les attributs (placeholder, title, etc.)
            document
                .querySelectorAll("[data-i18n-placeholder]")
                .forEach((element) => {
                    const key = element.getAttribute("data-i18n-placeholder");
                    element.placeholder = this.t(key);
                });

            document
                .querySelectorAll("[data-i18n-title]")
                .forEach((element) => {
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
    const i18n = new I18n();
    i18n.isReady = false;

    // Export global pour utilisation dans le navigateur
    if (typeof window !== "undefined") {
        window.i18n = i18n;
    }

    // Initialiser i18n de manière asynchrone
    (async () => {
        await i18n.init();
        i18n.isReady = true;
        // Notifier que i18n est prêt
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("i18n-ready"));
        }
    })();
})(); // Fin de l'IIFE
