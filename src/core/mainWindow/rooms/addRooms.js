const { ipcRenderer } = require("electron");
import { listSounds, dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import { loadRoomsInSettings } from "./deleteRooms.js";
const dataValidator = require("../../services/dataValidator");

const btnAddRoom = document.querySelector("#btn-add_room");
const formAddRoom = document.querySelector("#form-add_room");
const containerBtnRooms = document.querySelector("#container-btn_rooms");
const endTimerSoundList = document.querySelector("#end-timer_sound-list");
const ambientSoundList = document.querySelector("#ambient_sound-list");
const notificationSoundList = document.querySelector(
    "#notification_sound-list"
);

const addRoomObj = {
    isOptionCreatedInAddRoom: false,
    soundDirectories: null,

    async init() {
        // Initialize sound directories with proper paths
        this.soundDirectories = [
            {
                path: await ipcRenderer.invoke(
                    "get-public-path",
                    "sounds",
                    "end_timer"
                ),
                listId: "#end-timer_sound-list",
            },
            {
                path: await ipcRenderer.invoke(
                    "get-public-path",
                    "sounds",
                    "ambient"
                ),
                listId: "#ambient_sound-list",
            },
            {
                path: await ipcRenderer.invoke(
                    "get-public-path",
                    "sounds",
                    "notification"
                ),
                listId: "#notification_sound-list",
            },
        ];

        formAddRoom.addEventListener("submit", (e) => this.setupForm(e));
        btnAddRoom.addEventListener("click", () => {
            if (!this.isOptionCreatedInAddRoom) {
                listSounds(this.soundDirectories);
                this.isOptionCreatedInAddRoom = true;

                // Désactiver les sons d'ambiance en version gratuite
                const licenseManager = window.licenseManager;
                if (!licenseManager.canUseFeature("ambientSounds")) {
                    ambientSoundList.disabled = true;
                    ambientSoundList.parentElement.style.opacity = "0.5";
                    ambientSoundList.parentElement.title =
                        "🔒 Version PRO/BUISNESS requise";
                }
            }
        });
    },

    setupForm(e) {
        e.preventDefault();

        // ✅ Vérifier si on peut ajouter une salle
        if (!dataValidator.canAddRoom()) {
            notification(
                "🔒 Version FREE : Vous ne pouvez créer qu'une seule salle. Passez en version PRO pour créer des salles illimitées.",
                "error"
            );
            return;
        }

        // Vérifier la licence
        const licenseManager = window.licenseManager;
        if (!licenseManager.canCreateRoom(dataloaded.length)) {
            return notification(
                licenseManager.isPro()
                    ? "Limite de rooms atteinte."
                    : `Version gratuite : vous ne pouvez créer qu'une seule room. Passez à la version PRO pour débloquer toutes les fonctionnalités !`,
                "error"
            );
        }

        let name = document.querySelector("#room_name");
        let time = document.querySelector("#room_times");
        const endTimerSound = endTimerSoundList.value || null;
        const notificationSound = notificationSoundList.value || null;
        const ambientSound = ambientSoundList.value || null;

        const hours = time.value.split(":")[0];
        const minutes = time.value.split(":")[1];

        if (name.value === "")
            return notification(
                "Le timer doit obligatoirement avoir un titre.",
                "error"
            );
        if (hours === "00" && minutes === "00") {
            return notification(
                "Le timer ne peut pas avoir une durée de 0.",
                "error"
            );
        }

        if (
            containerBtnRooms.children[0].classList.contains(
                "home__container--noRoom"
            )
        ) {
            containerBtnRooms.children[0].remove();
        }

        this.addRoomToData({
            name: name.value,
            hours,
            minutes,
            endTimerSound,
            notificationSound,
            ambientSound,
        });

        loadRoomsInSettings();
        name.value = "";
        time.value = "";
    },

    addRoomToData(newRoom) {
        const newData = {
            id: `btn-room_${dataloaded.length + 1}`,
            name: newRoom.name,
            end_timer_sound: newRoom.endTimerSound,
            notification_sound: newRoom.notificationSound,
            ambient_sound: newRoom.ambientSound,
            hours: Number(newRoom.hours),
            minutes: Number(newRoom.minutes),
            end_timer_volume: 0.5,
            notification_volume: 0.5,
            ambient_volume: 0.2,
            isPreferenceTimer: true,
            phrases: [],
        };

        const updatedData = [...dataloaded, newData];

        // Écrire dans le fichier JSON
        writeFile(updatedData);

        dataloaded.push(newData);
        notification(`Le timer "${newRoom.name}" a été ajouté.`, "success");
    },
};

export default addRoomObj;
