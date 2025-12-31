const { ipcRenderer } = require("electron");
import { displayTimer, dataloaded } from "../../utils.js";
import addPhrasesObj from "../phrases/addPhrases.js";
import utilsSettingsObj from "../settings/utilsSettings.js";

const containerRoom = document.querySelector("#container-room");
const containerBtnRooms = document.querySelector("#container-btn_rooms");
const timer = document.querySelector("#timer-room");
const timer2 = document.querySelector("#timer-roomNegative");
const endTimerSound = document.querySelector("#end-timer_sound");
const notificationSound = document.querySelector("#notification_sound");
const ambientSound = document.querySelector("#ambient_sound");
const endTimerRange = document.querySelector("#volume-end_timer");
const notificationRange = document.querySelector("#volume-notification");
const amibentRange = document.querySelector("#volume-amibent");
const pourcentageVolume = document.querySelectorAll(".volume p");
const btnHome = document.querySelector("#btn-home");
const btnTimerSelected = document.querySelector("#btn-timer_selected");
const content = document.querySelectorAll(".content");
const navbarTimer = document.querySelector("#navbar-timer");
const btnNotification = document.querySelector("#btn-notification_sound");
const btnAmbient = document.querySelector("#btn-ambient_sound");
const sectionHome = document.querySelector("#container-home");

const roomsObj = {
    hours: null,
    minutes: null,
    resetHours: null,
    resetMinutes: null,
    roomId: null,
    rangeValue: [],

    init() {
        this.loadRooms();
    },

    loadRooms() {
        if (containerBtnRooms.children.length > 0) {
            const buttons = containerBtnRooms.querySelectorAll(
                ".home__container--btn"
            );
            buttons.forEach((room) => {
                containerBtnRooms.removeChild(room);
            });
        }

        if (dataloaded.length > 0) {
            this.rangeValue = dataloaded;

            dataloaded.forEach((el) => {
                const btn = document.createElement("button");
                btn.classList.add("home__container--btn");

                const h3 = document.createElement("h3");
                h3.textContent = el.name;
                btn.appendChild(h3);

                const pTimer = this.createParagraphWithSpan(
                    `${el.hours > 0 ? el.hours + "h : " : ""}${
                        el.minutes
                    }mn : 0s`,
                    window.i18n ? window.i18n.t("home.timerLabel") : "Timer : "
                );
                const pNotification = this.createParagraphWithSpan(
                    el.notification_sound,
                    window.i18n
                        ? window.i18n.t("home.notificationSoundLabel")
                        : "Son notification : "
                );
                const pAmbient = this.createParagraphWithSpan(
                    el.ambient_sound,
                    window.i18n
                        ? window.i18n.t("home.ambientSoundLabel")
                        : "Son ambiant : "
                );
                const pAlarm = this.createParagraphWithSpan(
                    el.end_timer_sound,
                    window.i18n
                        ? window.i18n.t("home.endTimerSoundLabel")
                        : "Son timer : "
                );

                btn.appendChild(pTimer);
                btn.appendChild(pNotification);
                btn.appendChild(pAmbient);
                btn.appendChild(pAlarm);

                containerBtnRooms.appendChild(btn);

                const idOfRoom = el.id;

                btn.addEventListener("click", () => {
                    this.startRoom(el, idOfRoom);
                });
            });
        } else {
            if (containerBtnRooms.children.length > 0) return;

            const div = document.createElement("div");
            const h3 = document.createElement("h3");
            const p = document.createElement("p");
            const btn = document.createElement("button");

            div.classList.add("home__container--noRoom");
            h3.textContent = window.i18n
                ? window.i18n.t("home.noTimer")
                : "Il n'y a pas de timer pour le moment...";
            p.textContent = window.i18n
                ? window.i18n.t("home.createTimerPrompt")
                : "Si vous voulez en créer un, cliquer dans la barre de navigation ou sur ce bouton : ";
            btn.textContent = "+";

            btn.addEventListener("click", () => {
                const sectionAddRoom = document.querySelector(
                    "#container-add_room"
                );
                const btnAddRoom = document.querySelector("#btn-add_room");

                sectionAddRoom.classList.add("activeContent");
                sectionHome.classList.remove("activeContent");
                btnAddRoom.classList.add("active");
                btnHome.classList.remove("active");
            });

            div.appendChild(h3);
            div.appendChild(p);
            div.appendChild(btn);
            containerBtnRooms.appendChild(div);
        }
    },

    startRoom(room, idOfRoom) {
        this.roomId = idOfRoom;
        this.hours = room.hours;
        this.minutes = room.minutes;
        this.resetHours = room.hours;
        this.resetMinutes = room.minutes;

        if (room.end_timer_sound)
            endTimerSound.src = `../../../public/sounds/end_timer/${room.end_timer_sound}`;

        if (room.notification_sound) {
            notificationSound.src = `../../../public/sounds/notification/${room.notification_sound}`;

            if (btnNotification.disabled === true)
                btnNotification.disabled = false;
        } else btnNotification.disabled = true;

        if (room.ambient_sound) {
            ambientSound.src = `../../../public/sounds/ambient/${room.ambient_sound}`;

            if (btnAmbient.disabled === true) btnAmbient.disabled = false;
        } else btnAmbient.disabled = true;

        displayTimer(
            timer,
            this.hours,
            this.minutes,
            utilsSettingsObj.isPreferenceTimer,
            timer2
        );
        this.updateRangeAndSound(idOfRoom);

        if (sectionHome.classList.contains("activeContent")) {
            navbarTimer.classList.remove("hidden");
            btnHome.classList.remove("active");
            btnTimerSelected.classList.add("active");

            for (let i = 0; i < content.length; i++) {
                content[i].classList.remove("activeContent");
            }

            containerRoom.classList.add("activeContent");
        }

        this.loadOption();

        ipcRenderer.send(
            "reset-timer",
            this.resetHours,
            this.resetMinutes,
            utilsSettingsObj.isPreferenceTimer
        );
    },

    loadOption() {
        const index = dataloaded.findIndex((obj) => obj.id === this.roomId);
        addPhrasesObj.loadOption(dataloaded[index]);
    },

    updateRangeAndSound(idOfRoom) {
        const findRoom = this.rangeValue.find((el) => el.id === idOfRoom);

        endTimerRange.value = findRoom.end_timer_volume * 100;
        notificationRange.value = findRoom.notification_volume * 100;
        amibentRange.value = findRoom.ambient_volume * 100;

        pourcentageVolume[0].textContent = endTimerRange.value + "%";
        pourcentageVolume[1].textContent = notificationRange.value + "%";
        pourcentageVolume[2].textContent = amibentRange.value + "%";

        endTimerSound.volume = Number(endTimerRange.value) / 100;
        notificationSound.volume = Number(notificationRange.value) / 100;
        ambientSound.volume = Number(amibentRange.value) / 100;
    },

    createParagraphWithSpan(text, spanText) {
        const p = document.createElement("p");
        const span = document.createElement("span");
        span.classList.add("strong");
        span.textContent = spanText + " ";
        p.appendChild(span);
        p.appendChild(document.createTextNode(text ? text : " - "));
        return p;
    },
};

export const { startRoom, updateRangeAndSound, loadRooms } = roomsObj;
export default roomsObj;
