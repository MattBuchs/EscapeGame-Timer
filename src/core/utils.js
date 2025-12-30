const fs = require("fs");
const path = require("path");

const utils = {
    filePath: path.join(__dirname, "../../data/rooms.json"),
    _dataloaded: null,

    displayTimer(timer, hours, minutes, isPreferenceTimer, timer2) {
        timer.textContent = `${
            hours ? `${hours}${isPreferenceTimer ? "h : " : " : "}` : ""
        }${
            minutes < 10 && isPreferenceTimer === false
                ? "0" + minutes
                : minutes
        }${isPreferenceTimer ? "m" : ""} : 0${isPreferenceTimer ? "s" : "0"}`;

        if (timer2) {
            timer2.textContent = `${
                hours ? `${hours}${isPreferenceTimer ? "h : " : " : "}` : ""
            }${
                minutes < 10 && isPreferenceTimer === false
                    ? "0" + minutes
                    : minutes
            }${isPreferenceTimer ? "m" : ""} : 0${
                isPreferenceTimer ? "s" : "0"
            }`;
        }
    },

    openModal(container, modal, modalContent, otherModal, btn, otherBtn) {
        modalContent.addEventListener("click", (e) => e.stopPropagation());

        modal.classList.remove("hidden");

        if (!otherModal.classList.contains("hidden")) {
            otherModal.classList.add("hidden");
        }

        if (!btn.classList.contains("active")) btn.classList.add("active");
        if (otherBtn.classList.contains("active"))
            otherBtn.classList.remove("active");
    },

    closeModal(modal, btn) {
        modal.classList.add("hidden");

        if (btn.classList.contains("active")) btn.classList.remove("active");
    },

    listSounds(soundDirectories) {
        soundDirectories.forEach((directory) => {
            const soundOption = document.querySelectorAll(
                `${directory.listId} .recover-sound`
            );

            if (soundOption.length > 0) {
                soundOption.forEach((el) => {
                    el.remove();
                });
            }

            const listElement = document.querySelector(directory.listId);
            const soundFiles = fs.readdirSync(directory.path);

            soundFiles.forEach((fileName) => {
                const option = document.createElement("option");
                option.textContent = fileName;
                option.value = fileName;
                option.classList.add("recover-sound");
                listElement.appendChild(option);
            });
        });
    },

    loadData() {
        if (fs.existsSync(this.filePath)) {
            const fileContent = fs.readFileSync(this.filePath, "utf8");
            try {
                if (fileContent.length > 1) {
                    this._dataloaded = JSON.parse(fileContent);
                    return this._dataloaded;
                }
            } catch (err) {
                console.error(
                    "Erreur lors de la lecture des données JSON existantes :",
                    err
                );
                return null;
            }
        }

        return null;
    },

    get dataloaded() {
        return this._dataloaded || this.loadData();
    },

    writeFile(data) {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
            if (err) {
                console.error(
                    "Erreur lors de l'écriture des données dans le fichier :",
                    err
                );
            }
        });
    },

    showLoadingIndicator() {
        const app = document.querySelector("#app");

        const container = document.createElement("div");
        const loader = document.createElement("div");

        loader.className = "loader";

        // Créer 5 barres pour l'animation
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement("div");
            bar.className = "bar";
            loader.appendChild(bar);
        }

        container.classList.add("spinner");
        container.appendChild(loader);
        app.appendChild(container);
    },

    hideLoadingIndicator() {
        const spinner = document.querySelector(".spinner");

        spinner.remove();
    },
};

utils.loadData();

export const {
    displayTimer,
    openModal,
    closeModal,
    listSounds,
    writeFile,
    filePath,
    dataloaded,
    showLoadingIndicator,
    hideLoadingIndicator,
} = utils;
export default utils;
