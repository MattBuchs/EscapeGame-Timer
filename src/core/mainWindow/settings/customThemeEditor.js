/**
 * Custom Theme Editor
 * Permet de créer et personnaliser un thème
 */

const { ipcRenderer } = require("electron");

const CUSTOM_THEME_KEY = "escape-game-custom-theme";

const DEFAULT_CUSTOM_THEME = {
    name: "Mon Thème",
    colors: {
        primary: "#6366f1",
        secondary: "#06b6d4",
        bgDark: "#0f0f1e",
        bgCard: "#1a1a2e",
        bgInput: "#252538",
        textPrimary: "#f8fafc",
        textSecondary: "#cbd5e1",
        border: "#2d2d44",
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
    },
};

/**
 * Charge le thème personnalisé depuis le localStorage
 */
function loadCustomTheme() {
    const savedTheme = localStorage.getItem(CUSTOM_THEME_KEY);
    if (savedTheme) {
        try {
            return JSON.parse(savedTheme);
        } catch (error) {
            console.error(
                "Erreur lors du chargement du thème personnalisé:",
                error
            );
        }
    }
    return DEFAULT_CUSTOM_THEME;
}

/**
 * Sauvegarde le thème personnalisé
 */
function saveCustomTheme(theme) {
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(theme));
    applyCustomTheme(theme);
}

/**
 * Applique le thème personnalisé en modifiant les variables CSS
 */
function applyCustomTheme(theme) {
    // Si aucun thème n'est fourni, charger depuis localStorage
    if (!theme) {
        theme = loadCustomTheme();
    }

    // Si toujours pas de thème, ne rien faire
    if (!theme || !theme.colors) {
        return;
    }

    // Appliquer sur le body pour que les variables soient accessibles
    const root = document.body;

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

    // Couleurs secondaires
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
 * Convertit une couleur hex en rgba
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Ajuste la luminosité d'une couleur
 */
function adjustColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B)
        .toString(16)
        .slice(1)}`;
}

/**
 * Ouvre le modal d'édition de thème personnalisé
 */
function openCustomThemeEditor() {
    const modal = document.getElementById("modal-custom-theme");
    if (!modal) {
        createCustomThemeModal();
    }

    const currentTheme = loadCustomTheme();
    populateThemeEditor(currentTheme);

    document.getElementById("modal-custom-theme").classList.remove("hidden");
}

/**
 * Crée le modal d'édition de thème
 */
function createCustomThemeModal() {
    const modalHTML = `
        <div id="modal-custom-theme" class="modal hidden">
            <div class="modal__content modal__content--theme-editor">
                <button class="modal__content--close" id="btn-close-theme-editor">
                    <img src="../../../public/img/cross.png" alt="close" />
                </button>
                
                <h2>🎨 Éditeur de Thème Personnalisé</h2>
                
                <div class="theme-editor">
                    <div class="theme-editor__preview">
                        <h3>Prévisualisation</h3>
                        <div class="preview-container" id="theme-preview">
                            <div class="preview-bg-info">
                                <small>Fond principal (bgDark)</small>
                            </div>
                            <div class="preview-card">
                                <small class="preview-card-label">Fond des cartes (bgCard)</small>
                                <h4>Titre de carte</h4>
                                <p>Texte principal</p>
                                <p class="secondary-text">Texte secondaire</p>
                                <button class="preview-button">Bouton</button>
                                <input type="text" placeholder="Input (bgInput)" class="preview-input" />
                                <div class="preview-borders">Bordures</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="theme-editor__colors">
                        <h3>Couleurs</h3>
                        
                        <div class="color-group">
                            <h4>🎯 Couleurs Principales</h4>
                            <div class="color-input-group">
                                <label>
                                    <span class="color-label">Couleur Primaire</span>
                                    <span class="color-description">Boutons, liens, accents</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-primary" data-color="primary" />
                                        <input type="text" id="color-primary-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Couleur Secondaire</span>
                                    <span class="color-description">Éléments secondaires</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-secondary" data-color="secondary" />
                                        <input type="text" id="color-secondary-text" class="color-text" />
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="color-group">
                            <h4>🖼️ Arrière-plans</h4>
                            <div class="color-input-group">
                                <label>
                                    <span class="color-label">Fond Principal</span>
                                    <span class="color-description">Arrière-plan de la page</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-bgDark" data-color="bgDark" />
                                        <input type="text" id="color-bgDark-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Fond des Cartes</span>
                                    <span class="color-description">Sections, cartes, containers</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-bgCard" data-color="bgCard" />
                                        <input type="text" id="color-bgCard-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Fond des Inputs</span>
                                    <span class="color-description">Champs de texte, selects</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-bgInput" data-color="bgInput" />
                                        <input type="text" id="color-bgInput-text" class="color-text" />
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="color-group">
                            <h4>✍️ Textes</h4>
                            <div class="color-input-group">
                                <label>
                                    <span class="color-label">Texte Principal</span>
                                    <span class="color-description">Titres, texte important</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-textPrimary" data-color="textPrimary" />
                                        <input type="text" id="color-textPrimary-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Texte Secondaire</span>
                                    <span class="color-description">Descriptions, labels</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-textSecondary" data-color="textSecondary" />
                                        <input type="text" id="color-textSecondary-text" class="color-text" />
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="color-group">
                            <h4>🎨 Autres</h4>
                            <div class="color-input-group">
                                <label>
                                    <span class="color-label">Bordures</span>
                                    <span class="color-description">Contours des éléments</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-border" data-color="border" />
                                        <input type="text" id="color-border-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Succès</span>
                                    <span class="color-description">Messages de validation</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-success" data-color="success" />
                                        <input type="text" id="color-success-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Erreur</span>
                                    <span class="color-description">Messages d'erreur</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-error" data-color="error" />
                                        <input type="text" id="color-error-text" class="color-text" />
                                    </div>
                                </label>
                                
                                <label>
                                    <span class="color-label">Avertissement</span>
                                    <span class="color-description">Messages d'alerte</span>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="color-warning" data-color="warning" />
                                        <input type="text" id="color-warning-text" class="color-text" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="theme-editor__actions">
                    <button class="btn-reset" id="btn-reset-theme">Réinitialiser</button>
                    <button class="btn-cancel" id="btn-cancel-theme">Annuler</button>
                    <button class="btn-save" id="btn-save-theme">Enregistrer et Appliquer</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Ajouter les event listeners pour les boutons
    document
        .getElementById("btn-close-theme-editor")
        .addEventListener("click", closeCustomThemeEditor);
    document
        .getElementById("btn-reset-theme")
        .addEventListener("click", resetCustomTheme);
    document
        .getElementById("btn-cancel-theme")
        .addEventListener("click", closeCustomThemeEditor);
    document
        .getElementById("btn-save-theme")
        .addEventListener("click", saveCustomThemeFromEditor);

    // Ajouter les event listeners pour les couleurs
    setupColorInputListeners();
}

/**
 * Configure les event listeners pour les inputs de couleur
 */
function setupColorInputListeners() {
    const colorInputs = document.querySelectorAll(
        'input[type="color"][data-color]'
    );

    colorInputs.forEach((input) => {
        const colorKey = input.dataset.color;
        const textInput = document.getElementById(`color-${colorKey}-text`);

        // Synchroniser color picker avec text input
        input.addEventListener("input", (e) => {
            textInput.value = e.target.value;
            updatePreview();
        });

        // Synchroniser text input avec color picker
        textInput.addEventListener("input", (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                input.value = e.target.value;
                updatePreview();
            }
        });
    });
}

/**
 * Remplit l'éditeur avec les valeurs du thème
 */
function populateThemeEditor(theme) {
    Object.keys(theme.colors).forEach((key) => {
        const colorInput = document.getElementById(`color-${key}`);
        const textInput = document.getElementById(`color-${key}-text`);

        if (colorInput && textInput) {
            colorInput.value = theme.colors[key];
            textInput.value = theme.colors[key];
        }
    });

    updatePreview();
}

/**
 * Met à jour la prévisualisation
 */
function updatePreview() {
    const preview = document.getElementById("theme-preview");
    const theme = getThemeFromEditor();

    // Fond principal
    preview.style.backgroundColor = theme.colors.bgDark;

    // Info du fond principal
    const bgInfo = preview.querySelector(".preview-bg-info");
    if (bgInfo) {
        bgInfo.style.backgroundColor = theme.colors.bgCard;
        bgInfo.style.borderColor = theme.colors.border;
        bgInfo.querySelector("small").style.color = theme.colors.textSecondary;
    }

    // Carte
    const card = preview.querySelector(".preview-card");
    card.style.backgroundColor = theme.colors.bgCard;
    card.style.borderColor = theme.colors.border;
    card.style.color = theme.colors.textPrimary;

    // Label de la carte
    const cardLabel = card.querySelector(".preview-card-label");
    if (cardLabel) {
        cardLabel.style.color = theme.colors.textSecondary;
    }

    // Titre
    const title = card.querySelector("h4");
    title.style.color = theme.colors.textPrimary;

    // Texte secondaire
    const secondaryText = card.querySelector(".secondary-text");
    secondaryText.style.color = theme.colors.textSecondary;

    // Bouton
    const button = card.querySelector(".preview-button");
    button.style.background = `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
    button.style.color = "#ffffff";

    // Input
    const input = card.querySelector(".preview-input");
    input.style.backgroundColor = theme.colors.bgInput;
    input.style.borderColor = theme.colors.border;
    input.style.color = theme.colors.textPrimary;

    // Bordures
    const borders = card.querySelector(".preview-borders");
    if (borders) {
        borders.style.borderColor = theme.colors.border;
        borders.style.color = theme.colors.textSecondary;
    }
}

/**
 * Récupère le thème depuis l'éditeur
 */
function getThemeFromEditor() {
    const theme = {
        name: "Mon Thème",
        colors: {},
    };

    const colorInputs = document.querySelectorAll(
        'input[type="color"][data-color]'
    );
    colorInputs.forEach((input) => {
        theme.colors[input.dataset.color] = input.value;
    });

    return theme;
}

/**
 * Sauvegarde le thème depuis l'éditeur
 */
function saveCustomThemeFromEditor() {
    const theme = getThemeFromEditor();
    saveCustomTheme(theme);

    // Appliquer le thème custom
    document.body.setAttribute("data-theme", "custom");
    localStorage.setItem("escape-game-theme", "custom");

    // Envoyer le changement de thème à la seconde fenêtre
    ipcRenderer.send("change-theme", "custom");

    // Mettre à jour l'UI du sélecteur de thème
    const themeButtons = document.querySelectorAll(".theme-option");
    themeButtons.forEach((button) => {
        if (button.getAttribute("data-theme") === "custom") {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });

    closeCustomThemeEditor();
}

/**
 * Réinitialise le thème personnalisé
 */
function resetCustomTheme() {
    if (
        confirm(
            "Voulez-vous vraiment réinitialiser le thème aux valeurs par défaut ?"
        )
    ) {
        populateThemeEditor(DEFAULT_CUSTOM_THEME);
    }
}

/**
 * Ferme l'éditeur de thème
 */
function closeCustomThemeEditor() {
    const modal = document.getElementById("modal-custom-theme");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    // Si le thème custom est sélectionné, l'appliquer
    const currentTheme = localStorage.getItem("escape-game-theme");
    if (currentTheme === "custom") {
        const customTheme = loadCustomTheme();
        applyCustomTheme(customTheme);
    }
});

export {
    openCustomThemeEditor,
    closeCustomThemeEditor,
    saveCustomThemeFromEditor,
    resetCustomTheme,
    loadCustomTheme,
    saveCustomTheme,
    applyCustomTheme,
};
