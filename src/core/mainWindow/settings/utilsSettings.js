const { ipcRenderer } = require("electron");
import { dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";

// const inputColor = document.querySelector("#update-color");
// const buttons = document.querySelectorAll("button");
// const containerTimer = document.querySelector("#container-room_timer");
const inputsRadio = document.getElementsByName("preference-timer");
const imgs = document.querySelectorAll("img");

const utilsSettingsObj = {
    isPreferenceTimer: null,

    init() {
        this.isPreferenceTimer = dataloaded[0]?.isPreferenceTimer;
        ipcRenderer.send("update-preference", this.isPreferenceTimer);
        ipcRenderer.send("load-timer", this.isPreferenceTimer);

        if (this.isPreferenceTimer) inputsRadio[0].checked = true;
        else inputsRadio[1].checked = true;

        // inputColor.value = "#e4c600";
        // inputColor.addEventListener("input", this.updateColor.bind(this));

        inputsRadio.forEach((input) => {
            input.addEventListener("click", async () => {
                await this.updatePreferenceTimer(input);
                notification(
                    "La préférence du timer à été pris en compte.",
                    "success"
                );
            });
        });

        imgs.forEach((img) => {
            img.addEventListener("dragstart", (e) => e.preventDefault());
        });
    },

    // updateColor() {
    //     buttons.forEach((btn) => {
    //         btn.style.background = inputColor.value;
    //     });

    //     containerTimer.style.borderColor = inputColor.value;
    //     containerTimer.style.color = inputColor.value;
    // },

    async updatePreferenceTimer(input) {
        let value;
        if (input.value === "true") value = true;
        if (input.value === "false") value = false;

        if (dataloaded[0].isPreferenceTimer === value) return;

        this.isPreferenceTimer = value;
        dataloaded.forEach((obj) => {
            obj.isPreferenceTimer = value;
        });

        // Sauvegarder dans settingsManager
        const settingsManager = window.settingsManager;
        if (settingsManager) {
            await settingsManager.set("preferenceTimer", value);
        }

        ipcRenderer.send("update-preference", this.isPreferenceTimer);

        writeFile(dataloaded);
    },
};

export default utilsSettingsObj;
