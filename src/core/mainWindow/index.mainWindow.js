import timerObj from "./timer/timer.js";
import messagesObj from "./UI/messages.js";
import roomsObj from "./rooms/rooms.js";
import addRoomObj from "./rooms/addRooms.js";
import uploadFilesObj from "./settings/uploadFiles.js";
import manageSoundObj from "./sounds/manageSound.js";
import deleteRoomsObj from "./rooms/deleteRooms.js";
import updateSoundObj from "./sounds/updateSound.js";
import addPhrasesObj from "./phrases/addPhrases.js";
import utilsSettingsObj from "./settings/utilsSettings.js";
import logoSettingsObj from "./settings/logoSettings.js";
import manageTabsObj from "./UI/manageTabs.js";
import updateRoomObj from "./rooms/updateRoom.js";
import deletePhrasesObj from "./phrases/deletePhrases.js";
import editPhrasesObj from "./phrases/editPhrases.js";
import dragAndDropObj from "./settings/DragAndDrop.js";
import deleteSongFileObj from "./settings/deleteSongFile.js";
import manageNavbarObj from "./UI/manageNavbar.js";
import checkFoldersExist from "./sounds/checkFoldersExist.js";
import {
    initThemeSelector,
    applyInitialTheme,
} from "./settings/themeSelector.js";
import { initSecondWindowInfo } from "./UI/secondWindowInfo.js";
import licenseModalObj from "./settings/licenseModal.js";
import contactObj from "./contact/contact.js";
import utils from "../utils.js";

// Fix resource paths for production
import "../resourcePathFixer.js";
import {
    openCustomThemeEditor,
    closeCustomThemeEditor,
    saveCustomThemeFromEditor,
    resetCustomTheme,
    applyCustomTheme,
} from "./settings/customThemeEditor.js";

// Récupérer i18n et initLanguageSelector depuis window (chargés via scripts dans index.html)
const i18n = window.i18n;
const initLanguageSelector = window.initLanguageSelector;

// Fonction pour initialiser l'application une fois i18n prêt
async function initApp() {
    // Attendre que i18n soit prêt
    if (!i18n.isReady) {
        await new Promise((resolve) => {
            window.addEventListener("i18n-ready", resolve, { once: true });
        });
    }

    // Traduire la page initiale
    i18n.translatePage();

    // Ajouter un observateur pour retraduire la page lors du changement de langue
    i18n.addObserver(() => {
        i18n.translatePage();
    });

    // Initialisation du sélecteur de langue
    if (initLanguageSelector) {
        initLanguageSelector();
    } else {
        console.error("initLanguageSelector n'est pas chargé");
    }
}

// Initialisation du système i18n et traduction de la page
document.addEventListener("DOMContentLoaded", () => {
    // Appliquer le thème sauvegardé immédiatement
    applyInitialTheme();

    if (i18n) {
        initApp().catch((err) => {
            console.error("Erreur lors de l'initialisation de l'app:", err);
        });
    } else {
        console.error("i18n n'est pas chargé");
    }

    // Initialiser le licenseManager
    const licenseManager = window.licenseManager;
    const dataValidator = require("../../services/dataValidator");

    if (licenseManager) {
        licenseManager.init().then(() => {
            // Initialiser le validator avec le licenseManager
            dataValidator.init(licenseManager);

            // Valider et nettoyer les settings
            dataValidator.validateSettings();

            // Recharger et valider les rooms selon la licence
            utils.reloadAndValidate(dataValidator);

            // Recharger l'affichage des rooms
            roomsObj.loadRooms();

            // Initialiser les fonctionnalités dépendantes de la licence
            utilsSettingsObj.init();
            logoSettingsObj.init();
        });
    }

    // Initialisation de la modal de licence
    setTimeout(() => {
        licenseModalObj.init();
        contactObj.init();
    }, 500);
});

// Fonction pour initialiser les modules dépendants du DOM
function initDOMDependentModules() {
    console.log("Initializing DOM-dependent modules...");

    // Initialiser le thème selector
    initThemeSelector();

    // Initialisation du Timer
    timerObj.init();
    messagesObj.init();

    // Exposer messagesObj globalement
    window.messagesObj = messagesObj;

    // Initialisation des fonctionnalités liées aux Timers
    // ⚠️ roomsObj.init() est appelé APRÈS la validation de la licence (voir licenseManager.init().then())
    addRoomObj.init();
    deleteRoomsObj.init();
    updateRoomObj.init();

    // Initialisation des fonctionnalités liées aux paramètres de la room
    addPhrasesObj.init();
    deletePhrasesObj.init();
    editPhrasesObj.init();
    updateSoundObj.init();
    manageSoundObj.init();

    // Initialisation des fonctionnalités liées aux paramètres globaux
    uploadFilesObj.init();
    dragAndDropObj.init();
    deleteSongFileObj.init();
    checkFoldersExist();
}

// Attendre que les sections HTML soient chargées avant d'initialiser les modules qui dépendent du DOM
if (window.htmlSectionsReady) {
    console.log("HTML sections already loaded, initializing immediately...");
    initDOMDependentModules();
} else {
    console.log("Waiting for html-sections-loaded event...");
    window.addEventListener("html-sections-loaded", initDOMDependentModules);
}

// Appliquer le thème personnalisé uniquement si le thème "custom" est actif
const settingsManager = window.settingsManager;
const currentTheme = settingsManager
    ? settingsManager.get("theme")
    : localStorage.getItem("escape-game-theme") || "neon";

if (currentTheme === "custom") {
    applyCustomTheme();
}

// Exposer les fonctions de l'éditeur de thème globalement
window.openCustomThemeEditor = openCustomThemeEditor;
window.closeCustomThemeEditor = closeCustomThemeEditor;
window.saveCustomThemeFromEditor = saveCustomThemeFromEditor;
window.resetCustomTheme = resetCustomTheme;

// Initialisation des fonctionnalités liées à la navbar
manageNavbarObj.init();
manageTabsObj.init();

// Initialiser l'adaptateur de logo
if (typeof window.initLogoAdapter === "function") {
    window.initLogoAdapter();
}

// Initialisation de l'info pour la fenêtre secondaire
initSecondWindowInfo();
