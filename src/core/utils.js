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
				`${directory.listId} .recover-sound`,
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
			// Charger les données brutes sans validation au démarrage
			// La validation se fera après l'initialisation du licenseManager
			const fileContent = fs.readFileSync(this.filePath, "utf8");
			if (fileContent.length > 1) {
				this._dataloaded = JSON.parse(fileContent);
			}
			return this._dataloaded;
		}

		return null;
	},

	/**
	 * Recharger et valider les données avec le validator
	 * À appeler après l'initialisation du licenseManager
	 * @param {object} dataValidator - Instance initialisée du dataValidator
	 */
	reloadAndValidate(dataValidator) {
		if (!dataValidator) {
			return this.loadData();
		}

		try {
			this._dataloaded = dataValidator.validateRooms();
			return this._dataloaded;
		} catch (error) {
			console.error("Erreur lors de la validation:", error);
			return this.loadData();
		}
	},

	get dataloaded() {
		return this._dataloaded || this.loadData();
	},

	writeFile(data) {
		// Garder la source en mémoire synchronisée pour éviter d'attendre un rechargement manuel
		utils._dataloaded = data;

		fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
			if (err) {
				console.error(
					"Erreur lors de l'écriture des données dans le fichier :",
					err,
				);
				return;
			}

			// Notifier tous les modules UI qu'une donnée room a changé
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event("rooms-data-updated"));
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
	reloadAndValidate,
} = utils;
export default utils;
