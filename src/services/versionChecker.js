/**
 * Version Checker
 * Vérifie si une nouvelle version de l'application est disponible
 */

const { ipcRenderer } = require("electron");
const config = require("../../config.js");

class VersionChecker {
	constructor() {
		this.currentVersion = config.APP_VERSION;
		this.versionElement = null;
	}

	/**
	 * Initialise l'affichage de la version et vérifie les mises à jour
	 */
	async init() {
		this.displayVersion();
		await this.checkForUpdates();
	}

	/**
	 * Affiche la version actuelle dans le header
	 */
	displayVersion() {
		this.versionElement = document.getElementById("app-version");
		if (this.versionElement) {
			this.versionElement.textContent = `v${this.currentVersion}`;
			this.versionElement.title = `Version ${this.currentVersion}`;
		}
	}

	/**
	 * Vérifie si une nouvelle version est disponible via l'API
	 */
	async checkForUpdates() {
		try {
			if (!config.API_URL || !/^https?:\/\//i.test(config.API_URL)) {
				console.warn(
					"API_URL invalide, vérification des mises à jour ignorée",
				);
				return;
			}

			// Vérifier la connexion internet d'abord
			const isOnline = await this.checkInternetConnection();
			if (!isOnline) {
				console.warn(
					"Pas de connexion internet, vérification des mises à jour ignorée",
				);
				return;
			}

			// Faire une requête vers l'API pour obtenir la dernière version
			const response = await fetch(`${config.API_URL}/versions/latest`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				signal: AbortSignal.timeout(5000), // Timeout de 5 secondes
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const latestVersion = data.version;

			// Comparer les versions
			if (this.isNewerVersion(latestVersion, this.currentVersion)) {
				this.showUpdateNotification(latestVersion, data.downloadUrl);
			}
		} catch (error) {
			// Ne pas afficher d'erreur à l'utilisateur, juste logger
			console.error(
				"Impossible de vérifier les mises à jour:",
				error.message,
			);
		}
	}

	/**
	 * Vérifie si la connexion internet est disponible
	 */
	async checkInternetConnection() {
		try {
			const response = await fetch("https://www.google.com/favicon.ico", {
				method: "HEAD",
				signal: AbortSignal.timeout(3000),
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	/**
	 * Compare deux versions (format: X.Y.Z)
	 * @returns {boolean} true si newVersion > currentVersion
	 */
	isNewerVersion(newVersion, currentVersion) {
		const newParts = newVersion.split(".").map(Number);
		const currentParts = currentVersion.split(".").map(Number);

		for (let i = 0; i < 3; i++) {
			if (newParts[i] > currentParts[i]) return true;
			if (newParts[i] < currentParts[i]) return false;
		}
		return false;
	}

	/**
	 * Affiche une notification de mise à jour disponible
	 */
	showUpdateNotification(newVersion, downloadUrl) {
		if (!this.versionElement) return;

		// Ajouter une classe pour indiquer qu'une mise à jour est disponible
		this.versionElement.classList.add("update-available");
		this.versionElement.title =
			window.i18n?.t("header.updateAvailable", { version: newVersion }) ||
			`Nouvelle version ${newVersion} disponible ! Cliquez pour télécharger.`;

		// Ajouter un événement de clic pour ouvrir l'URL de téléchargement
		this.versionElement.style.cursor = "pointer";
		this.versionElement.addEventListener("click", () => {
			ipcRenderer.send("open-external-url", downloadUrl);
		});

		// Afficher une notification visuelle
		const notification = document.createElement("div");
		notification.className = "update-notification";

		// Créer le contenu de manière sécurisée
		const content = document.createElement("div");
		content.className = "update-notification__content";

		const icon = document.createElement("span");
		icon.className = "update-notification__icon";
		icon.textContent = "🚀";

		const textDiv = document.createElement("div");
		textDiv.className = "update-notification__text";

		const strong = document.createElement("strong");
		strong.textContent =
			window.i18n?.t("update.newVersionAvailable") ||
			"Nouvelle version disponible !";

		const p1 = document.createElement("p");
		p1.textContent =
			window.i18n?.t("update.versionAvailableText", {
				version: newVersion,
			}) || `Version ${newVersion} est maintenant disponible.`;

		const p2 = document.createElement("p");
		p2.textContent =
			window.i18n?.t("update.clickToDownload") ||
			"Clique ici pour télécharger";

		textDiv.appendChild(strong);
		textDiv.appendChild(p1);
		textDiv.appendChild(p2);

		const closeBtn = document.createElement("button");
		closeBtn.className = "update-notification__close";
		closeBtn.textContent = "×";

		content.appendChild(icon);
		content.appendChild(textDiv);
		content.appendChild(closeBtn);
		notification.appendChild(content);

		document.body.appendChild(notification);

		// Animation d'apparition
		setTimeout(() => notification.classList.add("show"), 100);

		// Fermer la notification
		closeBtn.addEventListener("click", () => {
			notification.classList.remove("show");
			setTimeout(() => notification.remove(), 300);
		});

		// Cliquer sur la notification ouvre l'URL
		notification.addEventListener("click", (e) => {
			if (e.target !== closeBtn) {
				ipcRenderer.send("open-external-url", downloadUrl);
			}
		});

		// Auto-fermer après 10 secondes
		setTimeout(() => {
			if (notification.classList.contains("show")) {
				notification.classList.remove("show");
				setTimeout(() => notification.remove(), 300);
			}
		}, 10000);
	}
}

// Initialiser au chargement
const versionChecker = new VersionChecker();
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => versionChecker.init());
} else {
	versionChecker.init();
}

module.exports = versionChecker;
