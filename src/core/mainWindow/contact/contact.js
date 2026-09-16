const { shell } = require("electron");

const btnOpenEmail = document.querySelector("#btn-open-email");
const btnOpenWebsite = document.querySelector("#btn-open-website");
const btnContactMe = document.querySelector("#btn-contact-me");
const btnTransferLicense = document.querySelector("#btn-transfer-license");
const btnContactLicenseHelp = document.querySelector(
	"#btn-contact-license-help",
);
const licenseStatusBadge = document.querySelector("#license-status-badge");
const licenseEmailDisplay = document.querySelector("#license-email-display");

// Modal elements
const modalTransferLicense = document.querySelector("#modal-transfer-license");
const btnCloseTransferModal = document.querySelector(
	"#btn-close-transfer-modal",
);
const btnCancelTransfer = document.querySelector("#btn-cancel-transfer");
const btnConfirmTransfer = document.querySelector("#btn-confirm-transfer");
const transferLicenseDetails = document.querySelector(
	"#transfer-license-details",
);
const confirmTransferLabel =
	window.i18n?.t("contact.confirmTransfer") || "Confirmer le transfert";

const contactObj = {
	init() {
		this.setupEventListeners();
		this.updateLicenseStatus();
	},

	setupEventListeners() {
		// Ouvrir email
		btnOpenEmail?.addEventListener("click", () => {
			this.openEmail();
		});

		// Ouvrir site web
		btnOpenWebsite?.addEventListener("click", () => {
			shell.openExternal("https://www.matt-buchs.me/contact");
		});

		// Me contacter (ouvre dans le navigateur)
		btnContactMe?.addEventListener("click", () => {
			shell.openExternal("https://www.matt-buchs.me/contact");
		});

		// Transférer licence
		btnTransferLicense?.addEventListener("click", () => {
			this.showTransferModal();
		});

		// Contact pour aide licence
		btnContactLicenseHelp?.addEventListener("click", () => {
			shell.openExternal("https://www.matt-buchs.me/contact");
		});

		// Fermer modal
		btnCloseTransferModal?.addEventListener("click", () => {
			this.closeTransferModal();
		});

		btnCancelTransfer?.addEventListener("click", () => {
			this.closeTransferModal();
		});

		modalTransferLicense?.addEventListener("click", (e) => {
			if (e.target === modalTransferLicense) {
				this.closeTransferModal();
			}
		});

		// Confirmer transfert
		btnConfirmTransfer?.addEventListener("click", () => {
			this.confirmTransfer();
		});
	},

	updateLicenseStatus() {
		if (window.licenseManager) {
			const licenseInfo = window.licenseManager.getLicenseInfo();
			const isPro = window.licenseManager.isPro();

			if (licenseStatusBadge) {
				const status = isPro
					? (licenseInfo.plan || licenseInfo.type).toUpperCase()
					: "FREE";
				licenseStatusBadge.textContent = status;
				licenseStatusBadge.className = `contact__license-badge ${status.toLowerCase()}`;
			}

			if (licenseEmailDisplay && licenseInfo?.email) {
				licenseEmailDisplay.textContent = licenseInfo.email;
			} else if (licenseEmailDisplay) {
				licenseEmailDisplay.textContent = "";
			}

			// Désactiver le bouton de transfert si on est en FREE
			if (btnTransferLicense) {
				btnTransferLicense.disabled = !isPro;
			}
		}
	},

	openEmail() {
		const subject = encodeURIComponent("Contact GameMaster OS");
		const body = encodeURIComponent(
			"Bonjour,\n\n" +
				"Je vous contacte concernant l'application GameMaster OS.\n\n" +
				"Cordialement",
		);
		shell.openExternal(
			`mailto:mattbuchs25@gmail.com?subject=${subject}&body=${body}`,
		);
	},

	openEmailLicenseHelp() {
		const licenseInfo = window.licenseManager?.getLicenseInfo();
		const licenseKey = licenseInfo?.email ? "[Masquée]" : "Aucune";

		const subject = encodeURIComponent(
			"Aide - Gestion de Licence GameMaster OS",
		);
		const body = encodeURIComponent(
			"Bonjour,\n\n" +
				"J'ai besoin d'aide concernant ma licence GameMaster OS.\n\n" +
				"Type de problème : [Décrivez votre problème]\n" +
				`Email de licence : ${
					licenseInfo?.email || "Non renseigné"
				}\n` +
				`Clé de licence : ${licenseKey}\n\n` +
				"Détails :\n" +
				"[Expliquez votre situation]\n\n" +
				"Cordialement",
		);
		shell.openExternal(
			`mailto:mattbuchs25@gmail.com?subject=${subject}&body=${body}`,
		);
	},

	showTransferModal() {
		if (!window.licenseManager?.isPro()) {
			this.showMessage(
				window.i18n?.t("contact.errorNoLicense") ||
					"Aucune licence PRO active",
				"error",
			);
			return;
		}

		const licenseInfo = window.licenseManager.getLicenseInfo();

		if (transferLicenseDetails) {
			// Vider le contenu
			transferLicenseDetails.textContent = "";

			// Créer le div pour le type de licence
			const typeDiv = document.createElement("div");
			const typeStrong = document.createElement("strong");
			typeStrong.textContent = `${
				window.i18n?.t("contact.licenseType") || "Type"
			} :`;
			typeDiv.appendChild(typeStrong);
			typeDiv.appendChild(
				document.createTextNode(
					` ${(licenseInfo.plan || licenseInfo.type).toUpperCase()}`,
				),
			);

			// Créer le div pour l'email
			const emailDiv = document.createElement("div");
			const emailStrong = document.createElement("strong");
			emailStrong.textContent = `${
				window.i18n?.t("contact.licenseEmail") || "Email"
			} :`;
			emailDiv.appendChild(emailStrong);
			emailDiv.appendChild(
				document.createTextNode(` ${licenseInfo.email}`),
			);

			// Ajouter les éléments
			transferLicenseDetails.appendChild(typeDiv);
			transferLicenseDetails.appendChild(emailDiv);
		}

		modalTransferLicense?.classList.remove("hidden");
	},

	closeTransferModal() {
		modalTransferLicense?.classList.add("hidden");
	},

	setConfirmTransferButtonState(isLoading) {
		if (!btnConfirmTransfer) return;

		btnConfirmTransfer.disabled = isLoading;
		btnConfirmTransfer.classList.toggle("is-loading", isLoading);
		btnConfirmTransfer.textContent = "";

		if (isLoading) {
			const spinner = document.createElement("span");
			spinner.className = "btn-spinner";
			spinner.setAttribute("aria-hidden", "true");

			const span = document.createElement("span");
			span.textContent =
				window.i18n?.t("contact.processing") || "Traitement...";

			btnConfirmTransfer.appendChild(spinner);
			btnConfirmTransfer.appendChild(span);
			return;
		}

		const svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("fill", "none");
		svg.setAttribute("stroke", "currentColor");
		svg.setAttribute("stroke-width", "2");

		const polyline = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"polyline",
		);
		polyline.setAttribute("points", "20 6 9 17 4 12");

		svg.appendChild(polyline);

		const span = document.createElement("span");
		span.setAttribute("data-i18n", "contact.confirmTransfer");
		span.textContent = confirmTransferLabel;

		btnConfirmTransfer.appendChild(svg);
		btnConfirmTransfer.appendChild(span);
	},

	async confirmTransfer() {
		if (!window.licenseManager?.isPro()) {
			this.showMessage(
				window.i18n?.t("contact.errorNoLicense") ||
					"Aucune licence PRO active",
				"error",
			);
			return;
		}

		this.setConfirmTransferButtonState(true);

		try {
			const licenseInfo = window.licenseManager.getLicenseInfo();
			const licenseKey =
				window.licenseManager.getDecryptedLicenseKey?.() ||
				window.licenseManager.license?.key;
			const machineId = window.licenseManager.getMachineId();

			if (!licenseKey) {
				throw new Error("Clé de licence introuvable");
			}

			if (!machineId) {
				throw new Error("Impossible d'identifier cette machine");
			}

			if (!window.licenseManager.isApiUrlConfigured?.()) {
				throw new Error("Configuration API invalide (API_URL).");
			}

			// Appel API pour transférer la licence (incrémenter remainingUsages)
			let response = null;
			let data = null;

			for (const endpointUrl of window.licenseManager.getApiEndpointCandidates(
				"/transfer-license",
			)) {
				response = await fetch(endpointUrl, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						licenseKey: licenseKey,
						email: licenseInfo.email,
						machineId: machineId,
						timestamp: Date.now(),
					}),
				});

				data = await response.json().catch(() => ({}));

				if (response.status !== 404) {
					break;
				}
			}

			if (!response || response.status === 404) {
				throw new Error(
					"Endpoint transfer-license introuvable (vérifiez domaine et chemin API).",
				);
			}

			if (!response.ok) {
				throw new Error(
					data.message || data.error || "Erreur lors du transfert",
				);
			}

			// Succès : réinitialiser la licence locale en FREE
			await window.licenseManager.deactivateLicense();

			this.closeTransferModal();
			this.updateLicenseStatus();

			this.showMessage(
				window.i18n?.t("contact.transferSuccess") ||
					"Licence transférée avec succès ! Vous pouvez maintenant l'utiliser sur un autre PC.",
				"success",
			);

			// Recharger l'application après 2 secondes
			setTimeout(() => {
				location.reload();
			}, 2000);
		} catch (error) {
			console.error("Erreur lors du transfert de licence:", error);
			this.showMessage(
				window.i18n?.t("contact.transferError") ||
					`Erreur : ${error.message}. Veuillez contacter le support.`,
				"error",
			);
		} finally {
			this.setConfirmTransferButtonState(false);
		}
	},

	showMessage(message, type = "info") {
		// Créer une notification simple
		const notification = document.createElement("div");
		notification.className = `contact__notification contact__notification--${type}`;
		notification.textContent = message;
		notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${
				type === "success"
					? "#10b981"
					: type === "error"
						? "#ef4444"
						: "#3b82f6"
			};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

		document.body.appendChild(notification);

		// Supprimer après 4 secondes
		setTimeout(() => {
			notification.style.animation = "slideOut 0.3s ease-out";
			setTimeout(() => {
				notification.remove();
			}, 300);
		}, 4000);
	},
};

export default contactObj;
