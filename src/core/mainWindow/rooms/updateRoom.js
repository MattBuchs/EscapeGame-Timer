import { listSounds, dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import roomsObj from "./rooms.js";
import { loadPhrases } from "../phrases/deletePhrases.js";
import editPhrasesObj from "../phrases/editPhrases.js";
const { ipcRenderer } = require("electron");

const btnUpdateRoom = document.querySelector("#update-timer");
const formUpdateTimer = document.querySelector("#update-timer_value");
const nameInput = document.querySelector("#update-title");
const timerInput = document.querySelector("#update-timer_input");
const updateAlarmSoundList = document.querySelector("#update-alarm_sound-list");
const updateAmbientSoundList = document.querySelector(
    "#update-ambient_sound-list"
);
const updateNotificationSoundList = document.querySelector(
    "#update-notification_sound-list"
);

const updateRoomObj = {
    isOptionCreatedInUpdateRoom: false,
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
                listId: "#update-alarm_sound-list",
            },
            {
                path: await ipcRenderer.invoke(
                    "get-public-path",
                    "sounds",
                    "ambient"
                ),
                listId: "#update-ambient_sound-list",
            },
            {
                path: await ipcRenderer.invoke(
                    "get-public-path",
                    "sounds",
                    "notification"
                ),
                listId: "#update-notification_sound-list",
            },
        ];

        formUpdateTimer.addEventListener("submit", (e) => this.setupForm(e));
        btnUpdateRoom.addEventListener("click", () => {
            if (!this.isOptionCreatedInUpdateRoom) {
                listSounds(this.soundDirectories);
                this.isOptionCreatedInUpdateRoom = true;
            }
            this.addValuesInInputs();
            loadPhrases();
            editPhrasesObj.loadPhrases();
        });
    },

    addValuesInInputs() {
        const indexRoom = dataloaded.findIndex(
            (el) => el.id === roomsObj.roomId
        );

        const roomValue = dataloaded[indexRoom];

        nameInput.value = roomValue.name;
        timerInput.value = `${
            roomValue.hours > 10 ? roomValue.hours : "0" + roomValue.hours
        }:${
            roomValue.minutes > 10 ? roomValue.minutes : "0" + roomValue.minutes
        }`;

        updateAlarmSoundList.value = roomValue.end_timer_sound;
        updateAmbientSoundList.value = roomValue.ambient_sound;
        updateNotificationSoundList.value = roomValue.notification_sound;
    },

    setupForm(e) {
        e.preventDefault();

        const name = nameInput.value || null;
        const time = timerInput.value || null;
        const endTimerSound = updateAlarmSoundList.value || null;
        const notificationSound = updateNotificationSoundList.value || null;
        const ambientSound = updateAmbientSoundList.value || null;

        let hours = null;
        let minutes = null;
        if (time !== null) {
            hours = time.split(":")[0];
            minutes = time.split(":")[1];
        }

        if (hours === "00" && minutes === "00") {
            notification("Le timer ne peut pas avoir une durée de 0.", "error");
            return;
        }

        this.updateRoomToData({
            name,
            hours,
            minutes,
            endTimerSound,
            notificationSound,
            ambientSound,
        });
    },

    updateRoomToData(obj) {
        let name;

        dataloaded.map((el) => {
            if (el.id === roomsObj.roomId) {
                if (obj.name !== null) el.name = obj.name;
                if (obj.hours !== null) el.hours = Number(obj.hours);
                if (obj.minutes !== null) el.minutes = Number(obj.minutes);
                if (obj.endTimerSound !== null)
                    el.end_timer_sound = obj.endTimerSound;
                if (obj.ambientSound !== null)
                    el.ambient_sound = obj.ambientSound;
                if (obj.notificationSound !== null)
                    el.notification_sound = obj.notificationSound;

                name = el.name;
            }
        });

        // Écrire dans le fichier JSON
        writeFile(dataloaded);

        notification(`Le timer "${name}" à été modifié.`, "success");
        this.reloadTimer();
    },

    reloadTimer() {
        const roomId = roomsObj.roomId;

        let room;
        dataloaded.forEach((data) => {
            if (data.id === roomId) return (room = data);
        });

        roomsObj.startRoom(room, roomId);
    },
};

export default updateRoomObj;
