/**
 * Theme Handler for Second Window
 * Gère la réception et l'application du thème dans la fenêtre secondaire
 */

const { ipcRenderer } = require("electron");

const STORAGE_KEY = "escape-game-theme";

/**
 * Initialise la gestion du thème dans la seconde fenêtre
 */
function initThemeHandler() {
    // Récupérer et appliquer le thème sauvegardé
    const savedTheme = localStorage.getItem(STORAGE_KEY) || "neon";
    applyTheme(savedTheme);

    // Écouter les changements de thème via IPC
    ipcRenderer.on("change-theme", (_, themeName) => {
        applyTheme(themeName);
    });
}

/**
 * Applique un thème à la seconde fenêtre
 * @param {string} themeName - Nom du thème à appliquer
 */
function applyTheme(themeName) {
    // Appliquer l'attribut data-theme sur le body
    document.body.setAttribute("data-theme", themeName);

    // Sauvegarder le choix
    localStorage.setItem(STORAGE_KEY, themeName);
}

// Initialiser au chargement
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeHandler);
} else {
    initThemeHandler();
}

export { initThemeHandler, applyTheme };
