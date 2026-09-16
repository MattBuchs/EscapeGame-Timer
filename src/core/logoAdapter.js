/**
 * Logo Theme Adapter
 * Détecte automatiquement si le fond est clair ou foncé pour adapter le logo
 */

/**
 * Détermine si une couleur est claire ou foncée
 * @param {string} color - Couleur au format hex, rgb, rgba, ou CSS variable
 * @returns {boolean} - true si la couleur est claire
 */
function isLightColor(color) {
    // Si c'est une variable CSS, récupérer sa valeur
    if (color.startsWith("var(")) {
        const varName = color.match(/var\((--[^,)]+)/)?.[1];
        if (varName) {
            color = getComputedStyle(document.body)
                .getPropertyValue(varName)
                .trim();
        }
    }

    let r, g, b;

    // Convertir hex en rgb
    if (color.startsWith("#")) {
        const hex = color.replace("#", "");
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
    }
    // Parser rgb ou rgba
    else if (color.startsWith("rgb")) {
        const matches = color.match(/\d+/g);
        if (matches) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        }
    }

    // Si on n'a pas pu extraire les valeurs, supposer foncé par défaut
    if (r === undefined || g === undefined || b === undefined) {
        return false;
    }

    // Calculer la luminosité relative (formule W3C)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si luminosité > 0.5, c'est une couleur claire
    return luminance > 0.5;
}

/**
 * Vérifie le fond et ajuste la classe du body
 */
function updateLogoBasedOnBackground() {
    const bodyStyle = getComputedStyle(document.body);

    // Récupérer les deux couleurs principales
    let bgDark = bodyStyle.getPropertyValue("--color-bg-dark").trim();
    let bgCard = bodyStyle.getPropertyValue("--color-bg-card").trim();

    // Si pas de variable CSS (thème non-custom), utiliser backgroundColor
    if (!bgDark) {
        bgDark = bodyStyle.backgroundColor;
    }

    // Détecter la luminosité pour chaque type de fond
    const isDarkBgLight = isLightColor(bgDark || bodyStyle.backgroundColor);
    const isCardBgLight = isLightColor(
        bgCard || bgDark || bodyStyle.backgroundColor
    );

    // Appliquer les classes appropriées
    if (isDarkBgLight) {
        document.body.classList.add("light-background");
    } else {
        document.body.classList.remove("light-background");
    }

    // Classe spécifique pour la navbar qui utilise bgCard
    if (isCardBgLight) {
        document.body.classList.add("light-navbar");
    } else {
        document.body.classList.remove("light-navbar");
    }
}

/**
 * Initialise l'adaptateur de logo
 */
function initLogoAdapter() {
    // Vérifier immédiatement
    updateLogoBasedOnBackground();

    // Observer les changements de thème
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "data-theme"
            ) {
                // Attendre que les styles CSS soient appliqués
                setTimeout(updateLogoBasedOnBackground, 100);
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });

    // Écouter également les changements de style inline (pour thème custom)
    const styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "style"
            ) {
                // Petit délai pour laisser tous les styles s'appliquer
                setTimeout(updateLogoBasedOnBackground, 100);
            }
        });
    });

    styleObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["style"],
    });
}

// Exporter pour utilisation
if (typeof module !== "undefined" && module.exports) {
    module.exports = { initLogoAdapter, updateLogoBasedOnBackground };
}

// Exposer globalement pour utilisation dans les scripts
if (typeof window !== "undefined") {
    window.initLogoAdapter = initLogoAdapter;
    window.updateLogoBasedOnBackground = updateLogoBasedOnBackground;
}
