const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
import utils from "../utils.js";
import deleteRoomsObj from "./deleteRooms.js";
import addPhrasesObj from "./addPhrasesObj.js";

const containerRoom = document.querySelector("#container-room");
const containerBtnRooms = document.querySelector("#container-btn_rooms");
const timer = document.querySelector("#timer-room");
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

const dataFolderPath = path.join(__dirname, "../../data");
const filePath = path.join(dataFolderPath, "rooms.json");

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
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            if (data.length > 2) {
                const rooms = JSON.parse(data);
                this.rangeValue = rooms;

                rooms.forEach((el) => {
                    const div = document.createElement("div");
                    const btn = document.createElement("button");
                    const btnDelete = document.createElement("button");

                    btn.classList.add("room-btn");
                    div.classList.add("container-one_btn");
                    btnDelete.classList.add("btn-delete_room");
                    btnDelete.classList.add("hidden");

                    div.id = el.id;
                    btn.textContent = el.name;
                    btnDelete.textContent = "X";

                    const idOfRoom = el.id;

                    btn.addEventListener("click", () => {
                        this.startRoom(el, idOfRoom);
                    });

                    containerBtnRooms.appendChild(div);
                    div.appendChild(btn);
                    div.appendChild(btnDelete);
                });
            } else {
                const text = document.createElement("p");
                text.textContent = "Pas de timer...";
                text.classList.add("txt-no_toom");

                containerBtnRooms.appendChild(text);
            }
        });
    },

    startRoom(room, idOfRoom) {
        const btnDeleteRoom = document.querySelector(".btn-delete_room");

        if (btnDeleteRoom.className === "btn-delete_room") {
            deleteRoomsObj.removeDeleteRoom();
        }

        this.roomId = idOfRoom;
        this.hours = room.hours;
        this.minutes = room.minutes;
        this.resetHours = room.hours;
        this.resetMinutes = room.minutes;

        endTimerSound.src = `../sounds/end_timer/${room.end_timer_sound}`;
        notificationSound.src = `../sounds/notification/${room.notification_sound}`;
        ambientSound.src = `../sounds/ambient/${room.ambient_sound}`;

        utils.displayTimer(timer, this.hours, this.minutes);
        this.updateRangeAndSound(idOfRoom);

        navbarTimer.classList.remove("hidden");
        btnHome.classList.remove("active");
        btnTimerSelected.classList.add("active");

        for (let i = 0; i < content.length; i++) {
            content[i].classList.remove("activeContent");
        }

        containerRoom.classList.add("activeContent");

        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            const dataObj = JSON.parse(data);
            const index = dataObj.findIndex((obj) => obj.id === this.roomId);

            addPhrasesObj.loadOption(dataObj[index]);
        });

        ipcRenderer.send("times", this.resetHours, this.resetMinutes);
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
};

export default roomsObj;
