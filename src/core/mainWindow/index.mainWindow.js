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
import manageTabsObj from "./UI/manageTabs.js";
import updateRoomObj from "./rooms/updateRoom.js";
import deletePhrasesObj from "./phrases/deletePhrases.js";
import editPhrasesObj from "./phrases/editPhrases.js";
import dragAndDropObj from "./settings/DragAndDrop.js";
import deleteSongFileObj from "./settings/deleteSongFile.js";
import manageNavbarObj from "./UI/manageNavbar.js";
import checkFoldersExist from "./sounds/checkFoldersExist.js";
import { initThemeSelector } from "./settings/themeSelector.js";
import { initSecondWindowInfo } from "./UI/secondWindowInfo.js";
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

// Initialisation du système i18n et traduction de la page
document.addEventListener("DOMContentLoaded", () => {
    if (i18n) {
        i18n.translatePage();

        // Ajouter un observateur pour retraduire la page lors du changement de langue
        i18n.addObserver(() => {
            i18n.translatePage();
        });
    } else {
        console.error("i18n n'est pas chargé");
    }
});

// Initialisation du Timer
timerObj.init();
messagesObj.init();

// Initialisation des fonctionnalités liées aux Timers
roomsObj.init();
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
utilsSettingsObj.init();
uploadFilesObj.init();
dragAndDropObj.init();
deleteSongFileObj.init();
checkFoldersExist();

// Initialisation du sélecteur de thème
initThemeSelector();

// Initialisation du sélecteur de langue
if (initLanguageSelector) {
    initLanguageSelector();
} else {
    console.error("initLanguageSelector n'est pas chargé");
}

// Appliquer le thème personnalisé si existant
applyCustomTheme();

// Exposer les fonctions de l'éditeur de thème globalement
window.openCustomThemeEditor = openCustomThemeEditor;
window.closeCustomThemeEditor = closeCustomThemeEditor;
window.saveCustomThemeFromEditor = saveCustomThemeFromEditor;
window.resetCustomTheme = resetCustomTheme;

// Initialisation des fonctionnalités liées à la navbar
manageNavbarObj.init();
manageTabsObj.init();

// Initialisation de l'info pour la fenêtre secondaire
initSecondWindowInfo();
