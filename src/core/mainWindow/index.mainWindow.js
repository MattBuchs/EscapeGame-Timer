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

// Initialisation des fonctionnalités liées à la navbar
manageNavbarObj.init();
manageTabsObj.init();
