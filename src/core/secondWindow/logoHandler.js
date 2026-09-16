/**
 * Logo Handler pour la Second Window
 * Gère l'affichage/masquage et le remplacement du logo
 */

const { ipcRenderer } = require("electron");

// Récupérer l'élément logo
const logoSection = document.querySelector(".timer2__logo");
const logoWhite = document.querySelector(".timer2__logo .logo-white");
const logoBlack = document.querySelector(".timer2__logo .logo-black");

/**
 * Initialisation du gestionnaire de logo
 */
async function initLogoHandler() {
    // Charger les paramètres depuis le main process
    const settings = await ipcRenderer.invoke("get-logo-settings");

    if (settings) {
        applyLogoSettings(settings);
    }

    // Écouter les mises à jour de visibilité
    ipcRenderer.on("logo-visibility-updated", (event, isHidden) => {
        if (logoSection) {
            logoSection.style.display = isHidden ? "none" : "";
        }
    });

    // Écouter les mises à jour de logo personnalisé
    ipcRenderer.on("custom-logo-updated", (event, logoPath) => {
        updateCustomLogo(logoPath);
    });
}

/**
 * Applique les paramètres de logo
 */
function applyLogoSettings(settings) {
    const { hideSecondWindowLogo, customLogoPath } = settings;

    // Masquer/Afficher le logo
    if (logoSection) {
        logoSection.style.display = hideSecondWindowLogo ? "none" : "";
    }

    // Appliquer le logo personnalisé
    if (customLogoPath) {
        updateCustomLogo(customLogoPath);
    }
}

/**
 * Met à jour avec un logo personnalisé
 */
function updateCustomLogo(logoPath) {
    if (!logoSection) return;

    if (logoPath) {
        // Ajouter classe pour masquer les logos par défaut
        logoSection.classList.add("logo-custom-active");

        // Masquer les logos par défaut (redondance pour sécurité)
        if (logoWhite) logoWhite.style.display = "none";
        if (logoBlack) logoBlack.style.display = "none";

        // Vérifier si un logo personnalisé existe déjà
        let customLogoImg = logoSection.querySelector(".logo-custom");

        if (!customLogoImg) {
            // Créer un nouvel élément img pour le logo personnalisé
            customLogoImg = document.createElement("img");
            customLogoImg.className = "logo-custom";
            customLogoImg.alt = "Custom Logo";
            logoSection.appendChild(customLogoImg);
        }

        // Mettre à jour le chemin du logo avec timestamp pour éviter le cache
        const timestamp = new Date().getTime();
        customLogoImg.src = `file://${logoPath}?t=${timestamp}`;
        customLogoImg.style.display = "block";
    } else {
        // Retirer la classe
        logoSection.classList.remove("logo-custom-active");

        // Supprimer le logo personnalisé s'il existe
        const customLogoImg = logoSection.querySelector(".logo-custom");
        if (customLogoImg) {
            customLogoImg.remove();
        }

        // Réafficher les logos par défaut
        if (logoWhite) logoWhite.style.display = "";
        if (logoBlack) logoBlack.style.display = "";
    }
}

// Initialiser dès que le DOM est prêt
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogoHandler);
} else {
    initLogoHandler();
}
