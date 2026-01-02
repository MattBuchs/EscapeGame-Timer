const fs = require("fs");
const { ipcRenderer } = require("electron");
import { dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";

const selectDeleteSong = document.querySelector("#delete-song");
const btnDeleteSong = document.querySelector("#validate-delete_song");

const deleteSongFileObj = {
    alarmSoundsFolder: null,
    ambientSoundsFolder: null,
    notificationSoundsFolder: null,

    async init() {
        // Get proper paths from main process
        this.alarmSoundsFolder = await ipcRenderer.invoke(
            "get-public-path",
            "sounds",
            "end_timer"
        );
        this.ambientSoundsFolder = await ipcRenderer.invoke(
            "get-public-path",
            "sounds",
            "ambient"
        );
        this.notificationSoundsFolder = await ipcRenderer.invoke(
            "get-public-path",
            "sounds",
            "notification"
        );

        await this.loadSong();
        btnDeleteSong.addEventListener("click", this.getSoundName.bind(this));
    },

    async loadSong() {
        const alarmSounds = await this.getFilesInFolder(this.alarmSoundsFolder);
        const notificationSounds = await this.getFilesInFolder(
            this.notificationSoundsFolder
        );
        const ambientSounds = await this.getFilesInFolder(
            this.ambientSoundsFolder
        );

        const arr = [
            {
                sounds: alarmSounds,
                label: "Son pour l'alarme",
            },
            {
                sounds: notificationSounds,
                label: "Son pour la notification",
            },
            {
                sounds: ambientSounds,
                label: "Son ambiant",
            },
        ];

        if (selectDeleteSong.options.length > 1) {
            const optgroups = selectDeleteSong.querySelectorAll("optgroup");

            optgroups.forEach((el) => selectDeleteSong.removeChild(el));
        }

        arr.forEach((obj, index) => {
            this.createOptions(obj.sounds, obj.label, index);
        });
    },

    // Fonction pour récupérer les noms de fichiers dans un dossier
    getFilesInFolder(folderPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    },

    createOptions(sounds, label, indexArr) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = label;

        sounds.forEach((sound, index) => {
            const option = document.createElement("option");
            option.value = indexArr + "-" + index;
            option.textContent = sound;

            optgroup.appendChild(option);
        });

        selectDeleteSong.appendChild(optgroup);
    },

    async getSoundName() {
        const selectedValue = selectDeleteSong.value;

        if (selectedValue === "") return;

        const indexGroup = selectedValue.split("-")[0];
        const indexValue = selectedValue.split("-")[1];

        let filePathSound;
        let nameSounds;
        if (Number(indexGroup) === 0) {
            filePathSound = this.alarmSoundsFolder;
            nameSounds = await this.getFilesInFolder(this.alarmSoundsFolder);
        } else if (Number(indexGroup) === 1) {
            filePathSound = this.notificationSoundsFolder;
            nameSounds = await this.getFilesInFolder(
                this.notificationSoundsFolder
            );
        } else if (Number(indexGroup) === 2) {
            filePathSound = this.ambientSoundsFolder;
            nameSounds = await this.getFilesInFolder(this.ambientSoundsFolder);
        }

        const soundName = nameSounds[indexValue];

        this.checkSoundIsNotInATimer(soundName, Number(indexGroup));
        this.deleteSong(filePathSound, soundName);
    },

    deleteSong(filePathSound, soundName) {
        const newfilePath = `${filePathSound}/${soundName}`;

        fs.unlink(newfilePath, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression du fichier:", err);
                return;
            }
            this.loadSong();
            notification(`Le son "${soundName}" à été supprimé.`, "success");
        });
    },

    checkSoundIsNotInATimer(soundName, index) {
        dataloaded.forEach((obj) => {
            if (obj.end_timer_sound === soundName) {
                obj.end_timer_sound = null;
            }

            if (obj.notification_sound === soundName) {
                obj.notification_sound = null;
            }

            if (obj.ambient_sound === soundName) {
                obj.ambient_sound = null;
            }
        });

        // Écrire dans le fichier JSON
        writeFile(dataloaded);
    },
};

export default deleteSongFileObj;
