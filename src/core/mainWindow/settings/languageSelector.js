/**
 * Gestion du changement de langue dans les paramètres
 */

(function () {
    // Charger ipcRenderer localement
    const electron = window.require
        ? window.require("electron")
        : require("electron");
    const ipcRenderer = electron.ipcRenderer;

    /**
     * Initialise le sélecteur de langue
     */
    function initLanguageSelector() {
        const i18n = window.i18n;
        const langFr = document.getElementById("lang-fr");
        const langEn = document.getElementById("lang-en");

        if (!langFr || !langEn) {
            console.error(
                "Les éléments de sélection de langue n'ont pas été trouvés"
            );
            return;
        }

        // Définir la langue actuelle
        const currentLocale = i18n.getLocale();
        if (currentLocale === "fr") {
            langFr.checked = true;
        } else {
            langEn.checked = true;
        }

        // Gérer le changement de langue
        langFr.addEventListener("change", () => {
            if (langFr.checked) {
                changeLanguage("fr");
            }
        });

        langEn.addEventListener("change", () => {
            if (langEn.checked) {
                changeLanguage("en");
            }
        });
    }

    /**
     * Change la langue de l'application
     * @param {string} locale - Code de la locale ('fr' ou 'en')
     */
    function changeLanguage(locale) {
        const i18n = window.i18n;
        i18n.setLocale(locale);

        // Recharger toutes les traductions sur la page
        i18n.translatePage();

        // Notifier les autres fenêtres du changement de langue
        ipcRenderer.send("language-changed", locale);
    }

    // Exposer globalement pour utilisation dans les modules
    if (typeof window !== "undefined") {
        window.initLanguageSelector = initLanguageSelector;
        window.changeLanguage = changeLanguage;
    }
})(); // Fin de l'IIFE
