import "./timer.js";
import "./messages.js";
import "./themeHandler.js";

// Import et initialisation du système i18n
const i18n = require("./i18n");

// Traduction initiale de la page
document.addEventListener("DOMContentLoaded", () => {
    i18n.translatePage();
});

// Exposer i18n globalement
window.i18n = i18n;
