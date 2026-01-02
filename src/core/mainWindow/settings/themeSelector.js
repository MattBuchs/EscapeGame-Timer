/**
 * Theme Selector
 * Gère le changement de thème de l'application
 */

const { ipcRenderer } = require("electron");

const THEMES = {
    modern: { name: "Moderne", icon: "🚀" },
    light: { name: "Light", icon: "☀️" },
    neutral: { name: "Neutre", icon: "🌑" },
    neon: { name: "Néon", icon: "✨" },
    custom: { name: "Personnalisé", icon: "🎨", customizable: true },
};

const STORAGE_KEY = "escape-game-theme";

/**
 * Initialise le sélecteur de thème
 */
function initThemeSelector() {
    // Récupérer le thème sauvegardé ou utiliser le thème par défaut
    const settingsManager = window.settingsManager;
    const savedTheme = settingsManager
        ? settingsManager.get("theme")
        : localStorage.getItem(STORAGE_KEY) || "neon";

    // Appliquer le thème immédiatement au body
    document.body.setAttribute("data-theme", savedTheme);

    // Créer l'interface du sélecteur après le chargement du DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createThemeSelectorUI);
    } else {
        createThemeSelectorUI();
    }
}

/**
 * Applique un thème à la page
 * @param {string} themeName - Nom du thème à appliquer
 */
function applyTheme(themeName) {
    if (!THEMES[themeName]) {
        console.error(`Thème inconnu: ${themeName}`);
        return;
    }

    // Si on change pour un thème non-custom, supprimer les styles inline du thème personnalisé
    if (themeName !== "custom") {
        clearCustomThemeStyles();
    }

    // Appliquer l'attribut data-theme sur le body
    document.body.setAttribute("data-theme", themeName);

    // Sauvegarder le choix
    const settingsManager = window.settingsManager;
    if (settingsManager) {
        settingsManager.set("theme", themeName);
    } else {
        localStorage.setItem(STORAGE_KEY, themeName);
    }

    // Envoyer le changement de thème à la seconde fenêtre via IPC
    ipcRenderer.send("change-theme", themeName);

    // Mettre à jour l'UI si elle existe
    updateThemeSelectorUI(themeName);
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
 * Crée l'interface utilisateur du sélecteur de thème
 */
function createThemeSelectorUI() {
    const themeGrid = document.querySelector("#themeGrid");
    if (!themeGrid) {
        console.warn("Theme grid non trouvée");
        return;
    }

    // Vérifier si les boutons existent déjà
    if (themeGrid.querySelector(".theme-option")) {
        return;
    }

    // Créer les boutons de thème
    const themeButtonsHTML = Object.keys(THEMES)
        .map(
            (themeKey) => `
            <button 
                class="theme-option ${
                    localStorage.getItem(STORAGE_KEY) === themeKey
                        ? "active"
                        : ""
                }" 
                data-theme="${themeKey}"
                title="Appliquer le thème ${THEMES[themeKey].name}"
            >
                <span class="theme-icon">${THEMES[themeKey].icon}</span>
                <span class="theme-name">${THEMES[themeKey].name}</span>
            </button>
        `
        )
        .join("");

    // Insérer les boutons dans la grille
    themeGrid.innerHTML = themeButtonsHTML;

    // Ajouter les event listeners
    const themeButtons = document.querySelectorAll(".theme-option");
    themeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const themeName = button.getAttribute("data-theme");

            // Si c'est le thème personnalisé, ouvrir l'éditeur
            if (THEMES[themeName]?.customizable) {
                if (typeof window.openCustomThemeEditor === "function") {
                    window.openCustomThemeEditor();
                } else {
                    console.error("openCustomThemeEditor n'est pas disponible");
                }
            } else {
                applyTheme(themeName);
            }
        });
    });
}

/**
 * Met à jour l'interface du sélecteur pour refléter le thème actif
 * @param {string} activeTheme - Nom du thème actif
 */
function updateThemeSelectorUI(activeTheme) {
    const buttons = document.querySelectorAll(".theme-option");
    buttons.forEach((button) => {
        const themeName = button.getAttribute("data-theme");
        if (themeName === activeTheme) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

// Exporter les fonctions en ES6
export { initThemeSelector, applyTheme, THEMES };
