const { ipcRenderer } = require("electron");
import { dataloaded, listSounds, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import { loadRoomsInSettings } from "./deleteRooms.js";
import roomsObj from "./rooms.js";
const dataValidator = require("../../services/dataValidator");

const addRoomObj = {
	isOptionCreatedInAddRoom: false,
	soundDirectories: null,
	btnAddRoom: null,
	formAddRoom: null,
	containerBtnRooms: null,
	endTimerSoundList: null,
	ambientSoundList: null,
	notificationSoundList: null,

	async init() {
		console.log("addRooms.init() called");
		// Sélectionner les éléments DOM
		this.btnAddRoom = document.querySelector("#btn-add_room");
		this.formAddRoom = document.querySelector("#form-add_room");
		this.containerBtnRooms = document.querySelector("#container-btn_rooms");
		this.endTimerSoundList = document.querySelector(
			"#end-timer_sound-list",
		);
		this.ambientSoundList = document.querySelector("#ambient_sound-list");
		this.notificationSoundList = document.querySelector(
			"#notification_sound-list",
		);

		console.log("addRooms elements:", {
			btnAddRoom: this.btnAddRoom,
			formAddRoom: this.formAddRoom,
			endTimerSoundList: this.endTimerSoundList,
		});

		if (!this.btnAddRoom || !this.formAddRoom) {
			console.error("Elements for addRooms not found");
			return;
		}
		// Initialize sound directories with proper paths
		this.soundDirectories = [
			{
				path: await ipcRenderer.invoke(
					"get-public-path",
					"sounds",
					"end_timer",
				),
				listId: "#end-timer_sound-list",
			},
			{
				path: await ipcRenderer.invoke(
					"get-public-path",
					"sounds",
					"ambient",
				),
				listId: "#ambient_sound-list",
			},
			{
				path: await ipcRenderer.invoke(
					"get-public-path",
					"sounds",
					"notification",
				),
				listId: "#notification_sound-list",
			},
		];

		this.formAddRoom.addEventListener("submit", (e) => this.setupForm(e));
		this.btnAddRoom.addEventListener("click", () => {
			if (!this.isOptionCreatedInAddRoom) {
				listSounds(this.soundDirectories);
				this.isOptionCreatedInAddRoom = true;

				// Désactiver les sons d'ambiance en version gratuite
				const licenseManager = window.licenseManager;
				if (!licenseManager.canUseFeature("ambientSounds")) {
					this.ambientSoundList.disabled = true;
					this.ambientSoundList.parentElement.style.opacity = "0.5";
					this.ambientSoundList.parentElement.title =
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
				"error",
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
				"error",
			);
		}

		let name = document.querySelector("#room_name");
		let time = document.querySelector("#room_times");
		const endTimerSound = this.endTimerSoundList.value || null;
		const notificationSound = this.notificationSoundList.value || null;
		const ambientSound = this.ambientSoundList.value || null;

		const hours = time.value.split(":")[0];
		const minutes = time.value.split(":")[1];

		if (name.value === "")
			return notification(
				"Le timer doit obligatoirement avoir un titre.",
				"error",
			);
		if (hours === "00" && minutes === "00") {
			return notification(
				"Le timer ne peut pas avoir une durée de 0.",
				"error",
			);
		}

		if (
			this.containerBtnRooms.children[0].classList.contains(
				"home__container--noRoom",
			)
		) {
			this.containerBtnRooms.children[0].remove();
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
		roomsObj.loadRooms();
		notification(`Le timer "${newRoom.name}" a été ajouté.`, "success");
	},
};

export default addRoomObj;
