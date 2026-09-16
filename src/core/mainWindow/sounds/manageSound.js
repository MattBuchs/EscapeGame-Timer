const path = require("path");
import { notification } from "../UI/notification.js";
import { sounds } from "./loadInput.js";

const manageSoundObj = {
	endTimer: null,
	btnNotificationSound: null,
	btnAmbientSound: null,
	btnStopAmbientSound: null,
	notificationSound: null,
	ambientSound: null,

	init() {
		console.log("manageSound.init() called");
		// Sélectionner les éléments DOM
		this.btnNotificationSound = document.querySelector(
			"#btn-notification_sound",
		);
		this.btnAmbientSound = document.querySelector("#btn-ambient_sound");
		this.btnStopAmbientSound = document.querySelector(
			"#btn-stop--ambient_sound",
		);
		this.notificationSound = document.querySelector("#notification_sound");
		this.ambientSound = document.querySelector("#ambient_sound");

		console.log("manageSound elements:", {
			btnNotificationSound: this.btnNotificationSound,
			btnAmbientSound: this.btnAmbientSound,
			notificationSound: this.notificationSound,
		});

		if (!this.btnNotificationSound || !this.btnAmbientSound) {
			console.error("Elements for manageSound not found");
			return;
		}

		const licenseManager = window.licenseManager;
		const canUseAmbient =
			licenseManager && licenseManager.canUseFeature
				? licenseManager.canUseFeature("ambientSounds")
				: true;

		if (!canUseAmbient) {
			this.btnAmbientSound.disabled = true;
			this.btnAmbientSound.title =
				"🔒 Son ambiant disponible en version PRO/BUSINESS";
			this.btnStopAmbientSound.classList.add("hidden");
		}

		this.btnNotificationSound.addEventListener(
			"click",
			this.startNotificationSound.bind(this),
		);
		this.btnAmbientSound.addEventListener(
			"click",
			this.startAmbientSound.bind(this),
		);
		this.btnStopAmbientSound.addEventListener(
			"click",
			this.stopAmbientSoundInRoom.bind(this),
		);
		sounds.forEach((obj) => {
			obj.btnListenMusic.addEventListener("click", () => {
				this.startSound(
					obj.audioFolderName,
					obj.soundList,
					obj.btnStopMusic,
					obj.btnListenMusic,
				);
			});
		});
	},

	startNotificationSound() {
		this.notificationSound.play();

		if (this.notificationSound.duration > 6) {
			setTimeout(() => {
				this.notificationSound.pause();
				this.notificationSound.currentTime = 0;
			}, 6000);
		}
	},

	startAmbientSound() {
		const licenseManager = window.licenseManager;
		if (
			licenseManager &&
			licenseManager.canUseFeature &&
			!licenseManager.canUseFeature("ambientSounds")
		) {
			notification(
				"🔒 Le son ambiant est disponible uniquement en version PRO/BUSINESS.",
				"error",
			);
			return;
		}

		this.ambientSound.play();

		// Loop the sound
		this.ambientSound.addEventListener(
			"ended",
			function () {
				this.currentTime = 0;
				this.play();
			},
			false,
		);

		this.btnStopAmbientSound.classList.remove("hidden");
		this.btnAmbientSound.classList.add("hidden");
	},

	stopAmbientSoundInRoom() {
		this.ambientSound.pause();
		this.ambientSound.currentTime = 0;

		this.btnStopAmbientSound.classList.add("hidden");
		this.btnAmbientSound.classList.remove("hidden");
	},

	startSound(audioName, soundList, btnStopMusic, btnListenMusic) {
		const audio = this[audioName];

		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}

		const soundValue = soundList.value;

		if (!soundValue) {
			return notification("Veuillez sélectionner un son.", "error");
		}

		const soundPath = path.join(
			__dirname,
			`../../../public/sounds/${audioName}/${soundValue}`,
		);

		this[audioName] = new Audio(soundPath);
		const newAudio = this[audioName];
		newAudio.play();

		btnStopMusic.classList.remove("hidden");
		btnListenMusic.classList.add("hidden");

		this.managesSoundButtonEvents(
			btnStopMusic,
			newAudio,
			soundList,
			btnListenMusic,
		);
	},

	resetBtn(stopMusic, btnListenMusic, audio) {
		stopMusic.classList.add("hidden");
		btnListenMusic.classList.remove("hidden");

		audio.pause();
		audio.currentTime = 0;
	},

	managesSoundButtonEvents(
		btnStopMusic,
		newAudio,
		soundList,
		btnListenMusic,
	) {
		// Retirer les gestionnaires d'événements existants
		btnStopMusic.removeEventListener("click", this.resetBtn);
		newAudio.removeEventListener("ended", this.resetBtn);
		soundList.removeEventListener("change", this.resetBtn);
		// closeAddRoom.removeEventListener("click", this.closeModal);

		btnStopMusic.addEventListener("click", () => {
			this.resetBtn(btnStopMusic, btnListenMusic, newAudio);
		});

		newAudio.addEventListener("ended", () => {
			this.resetBtn(btnStopMusic, btnListenMusic, newAudio);
		});

		soundList.addEventListener("change", () => {
			this.resetBtn(btnStopMusic, btnListenMusic, newAudio);
		});
	},
};

export default manageSoundObj;
