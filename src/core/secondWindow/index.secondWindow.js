import "./timer.js";
import "./messages.js";
import "./themeHandler.js";

// Fix resource paths for production
import "../resourcePathFixer.js";

// R\u00e9cup\u00e9rer i18n depuis window (charg\u00e9 via script dans secondWindow.html)
const i18n = window.i18n;

// Traduction initiale de la page
document.addEventListener("DOMContentLoaded", () => {
    i18n.translatePage();
});

// Exposer i18n globalement
window.i18n = i18n;
