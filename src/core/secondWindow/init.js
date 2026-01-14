/**
 * Initialisation de la Second Window
 */

// Initialiser l'adaptateur de logo quand le DOM est chargé
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof initLogoAdapter === "function") {
            initLogoAdapter();
        }
    });
} else {
    if (typeof initLogoAdapter === "function") {
        initLogoAdapter();
    }
}
