/**
 * Theme Handler for Second Window
 * Gère la réception et l'application du thème dans la fenêtre secondaire
 */

const { ipcRenderer } = require("electron");

const STORAGE_KEY = "escape-game-theme";
const CUSTOM_THEME_KEY = "escape-game-custom-theme";

/**
 * Charge le thème personnalisé depuis le localStorage
 */
function loadCustomTheme() {
    const savedTheme = localStorage.getItem(CUSTOM_THEME_KEY);
    if (savedTheme) {
        try {
            return JSON.parse(savedTheme);
        } catch (e) {
            console.error(
                "Erreur lors du chargement du thème personnalisé:",
                e
            );
        }
    }
    return null;
}

/**
 * Applique le thème personnalisé en modifiant les variables CSS
 */
function applyCustomTheme(theme) {
    if (!theme || !theme.colors) {
        return;
    }

    const root = document.body;

    // Helper functions
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const adjustColor = (hex, percent) => {
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B)
            .toString(16)
            .slice(1)}`;
    };

    // Couleurs principales
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty(
        "--color-primary-dark",
        adjustColor(theme.colors.primary, -20)
    );
    root.style.setProperty(
        "--color-primary-light",
        adjustColor(theme.colors.primary, 20)
    );
    root.style.setProperty(
        "--color-primary-glow",
        hexToRgba(theme.colors.primary, 0.4)
    );

    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty(
        "--color-secondary-dark",
        adjustColor(theme.colors.secondary, -20)
    );
    root.style.setProperty(
        "--color-secondary-light",
        adjustColor(theme.colors.secondary, 20)
    );
    root.style.setProperty(
        "--color-secondary-glow",
        hexToRgba(theme.colors.secondary, 0.3)
    );

    // Backgrounds
    root.style.setProperty("--color-bg-dark", theme.colors.bgDark);
    root.style.setProperty(
        "--color-bg-darker",
        adjustColor(theme.colors.bgDark, -10)
    );
    root.style.setProperty("--color-bg-card", theme.colors.bgCard);
    root.style.setProperty(
        "--color-bg-card-hover",
        adjustColor(theme.colors.bgCard, 10)
    );
    root.style.setProperty("--color-bg-input", theme.colors.bgInput);
    root.style.setProperty(
        "--color-bg-section",
        hexToRgba(theme.colors.bgCard, 0.3)
    );
    root.style.setProperty(
        "--color-bg-section-hover",
        hexToRgba(theme.colors.bgCard, 0.5)
    );
    root.style.setProperty(
        "--color-bg-glass",
        hexToRgba(theme.colors.bgCard, 0.7)
    );
    root.style.setProperty(
        "--color-bg-accent",
        hexToRgba(theme.colors.primary, 0.05)
    );
    root.style.setProperty(
        "--color-bg-accent-hover",
        hexToRgba(theme.colors.primary, 0.1)
    );

    // Textes
    root.style.setProperty("--color-text-primary", theme.colors.textPrimary);
    root.style.setProperty(
        "--color-text-secondary",
        theme.colors.textSecondary
    );
    root.style.setProperty(
        "--color-text-muted",
        adjustColor(theme.colors.textSecondary, -20)
    );

    // Bordures
    root.style.setProperty("--color-border", theme.colors.border);
    root.style.setProperty(
        "--color-border-light",
        adjustColor(theme.colors.border, 20)
    );

    // Status
    root.style.setProperty("--color-success", theme.colors.success);
    root.style.setProperty("--color-error", theme.colors.error);
    root.style.setProperty("--color-warning", theme.colors.warning);

    // Gradient
    const gradient = `linear-gradient(145deg, ${
        theme.colors.bgCard
    } 0%, ${adjustColor(theme.colors.bgCard, 10)} 100%)`;
    root.style.setProperty("--gradient-card", gradient);
}

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
 * Supprime les styles CSS inline du thème personnalisé
 */
function clearCustomThemeStyles() {
    const root = document.body;
    const customProperties = [
        "--color-primary",
        "--color-primary-dark",
        "--color-primary-light",
        "--color-primary-glow",
        "--color-secondary",
        "--color-secondary-dark",
        "--color-secondary-light",
        "--color-secondary-glow",
        "--color-bg-dark",
        "--color-bg-darker",
        "--color-bg-card",
        "--color-bg-card-hover",
        "--color-bg-input",
        "--color-bg-section",
        "--color-bg-section-hover",
        "--color-bg-glass",
        "--color-bg-accent",
        "--color-bg-accent-hover",
        "--color-bg-overlay",
        "--color-text-primary",
        "--color-text-secondary",
        "--color-text-muted",
        "--color-border",
        "--color-border-light",
        "--color-success",
        "--color-error",
        "--color-warning",
        "--gradient-card",
    ];

    customProperties.forEach((prop) => root.style.removeProperty(prop));
}

/**
 * Applique un thème à la seconde fenêtre
 * @param {string} themeName - Nom du thème à appliquer
 */
function applyTheme(themeName) {
    // Si on change pour un thème non-custom, supprimer les styles inline
    if (themeName !== "custom") {
        clearCustomThemeStyles();
    }

    // Appliquer l'attribut data-theme sur le body
    document.body.setAttribute("data-theme", themeName);

    // Sauvegarder le choix
    localStorage.setItem(STORAGE_KEY, themeName);

    // Si c'est le thème personnalisé, appliquer les variables CSS
    if (themeName === "custom") {
        const customTheme = loadCustomTheme();
        if (customTheme) {
            applyCustomTheme(customTheme);
        }
    }
}

// Initialiser au chargement
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeHandler);
} else {
    initThemeHandler();
}

export { initThemeHandler, applyTheme };
