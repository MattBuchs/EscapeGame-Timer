import { notification } from "../UI/notification.js";

const licenseKeyInput = document.querySelector("#license-key-input");
const licenseEmailInput = document.querySelector("#license-email-input");
const activateLicenseBtn = document.querySelector("#activate-license-btn");
const licenseMessage = document.querySelector("#license-activation-message");
const purchaseLink = document.querySelector("#purchase-license-link");
const licenseTypeText = document.querySelector("#license-type-text");

const licenseModalObj = {
	init() {
		// Initialiser le licenseManager
		const licenseManager = window.licenseManager;
		if (licenseManager) {
			licenseManager.init().then(() => {
				this.updateLicenseDisplay();
				this.updateLicenseBadge();
			});
		}

		// Badge de licence dans la page d'accueil
		const licenseBadge = document.querySelector("#btn-license-badge");
		if (licenseBadge) {
			licenseBadge.addEventListener("click", () => {
				console.log("TESTTT");

				// Naviguer vers la section contact
				const btnContact = document.querySelector("#btn-contact");
				if (btnContact) {
					btnContact.click();
				}

				// Scroll vers le formulaire d'activation
				setTimeout(() => {
					const activationSection = document.querySelector(
						"#license-activation-section",
					);
					if (activationSection) {
						activationSection.scrollIntoView({
							behavior: "smooth",
							block: "start",
						});
					}
				}, 300);
			});
		}

		// Format automatique de la clé de licence
		if (licenseKeyInput) {
			licenseKeyInput.addEventListener("input", (e) => {
				let value = e.target.value
					.toUpperCase()
					.replace(/[^A-Z0-9]/g, "");
				let formatted = "";
				for (let i = 0; i < value.length && i < 16; i++) {
					if (i > 0 && i % 4 === 0) {
						formatted += "-";
					}
					formatted += value[i];
				}
				e.target.value = formatted;
			});
		}

		// Bouton d'activation
		if (activateLicenseBtn) {
			activateLicenseBtn.addEventListener("click", () =>
				this.activateLicense(),
			);
		}

		// Boutons d'activation PRO et Business
		const btnActivatePro = document.querySelector("#btn-activate-pro");
		const btnActivateBusiness = document.querySelector(
			"#btn-activate-business",
		);

		if (btnActivatePro) {
			btnActivatePro.addEventListener("click", () => {
				const activationForm = document.querySelector(
					"#license-activation-form",
				);
				if (activationForm) {
					activationForm.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			});
		}

		if (btnActivateBusiness) {
			btnActivateBusiness.addEventListener("click", () => {
				const activationForm = document.querySelector(
					"#license-activation-form",
				);
				if (activationForm) {
					activationForm.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			});
		}

		// Entrée sur Enter
		if (licenseKeyInput) {
			licenseKeyInput.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
					this.activateLicense();
				}
			});
		}

		if (licenseEmailInput) {
			licenseEmailInput.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
					this.activateLicense();
				}
			});
		}

		// Lien d'achat (à personnaliser avec votre URL)
		if (purchaseLink) {
			purchaseLink.addEventListener("click", (e) => {
				e.preventDefault();
				const { shell } = require("electron");
				shell.openExternal(
					"https://matt-buchs.me/gamemaster-os#pricing",
				);
			});
		}
	},

	updateLicenseBadge() {
		const licenseManager = window.licenseManager;
		const badge = document.querySelector("#btn-license-badge");
		const badgeText = document.querySelector("#license-badge-text");

		if (!licenseManager || !badge || !badgeText) return;

		const licenseInfo = licenseManager.getLicenseInfo();

		if (licenseInfo.isPro) {
			const plan = licenseInfo.plan || licenseInfo.type || "PRO";
			badgeText.textContent = `Version ${plan.toUpperCase()}`;
			badge.classList.add("license-active");
		} else {
			badgeText.textContent = "Version Gratuite";
			badge.classList.remove("license-active");
		}
	},

	updateLicenseDisplay() {
		const licenseManager = window.licenseManager;
		if (!licenseManager || !licenseTypeText) return;

		const licenseInfo = licenseManager.getLicenseInfo();

		if (licenseInfo.isPro) {
			licenseTypeText.textContent = "Version PRO ✓";
			licenseTypeText.parentElement.classList.add("license-badge--pro");
			licenseTypeText.parentElement.classList.remove(
				"license-badge--free",
			);
		} else {
			licenseTypeText.textContent = "Version Gratuite";
			licenseTypeText.parentElement.classList.add("license-badge--free");
			licenseTypeText.parentElement.classList.remove(
				"license-badge--pro",
			);
		}
	},

	async activateLicense() {
		const licenseManager = window.licenseManager;
		if (!licenseManager || !licenseKeyInput || !licenseEmailInput) return;

		const key = licenseKeyInput.value.trim();
		const email = licenseEmailInput.value.trim();

		if (!email) {
			this.showMessage("Veuillez entrer votre adresse email.", "error");
			return;
		}

		if (!key) {
			this.showMessage("Veuillez entrer une clé de licence.", "error");
			return;
		}

		// Désactiver le bouton pendant la validation
		if (activateLicenseBtn) {
			activateLicenseBtn.disabled = true;
			activateLicenseBtn.textContent = "";

			const span = document.createElement("span");
			span.textContent = "Validation en cours...";

			const svg = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"svg",
			);
			svg.setAttribute("class", "spinner");
			svg.setAttribute("viewBox", "0 0 24 24");
			svg.setAttribute("fill", "none");
			svg.setAttribute("stroke", "currentColor");
			svg.setAttribute("stroke-width", "2");

			const circle = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"circle",
			);
			circle.setAttribute("cx", "12");
			circle.setAttribute("cy", "12");
			circle.setAttribute("r", "10");

			svg.appendChild(circle);

			activateLicenseBtn.appendChild(span);
			activateLicenseBtn.appendChild(svg);
		}

		try {
			// Tentative d'activation via l'API
			const result = await licenseManager.activatePro(key, email);

			if (result.success) {
				this.showMessage(
					`✓ Licence ${result.data.plan} activée avec succès ! Toutes les fonctionnalités sont maintenant disponibles.`,
					"success",
				);
				this.updateLicenseDisplay();

				notification(
					`🎉 Licence ${result.data.plan} activée pour ${result.data.email}`,
					"success",
				);

				// Recharger la page après 2 secondes pour appliquer les changements
				setTimeout(() => {
					location.reload();
				}, 2000);
			} else {
				this.showMessage(`✗ ${result.error}`, "error");
			}
		} catch (error) {
			console.error("Error activating license:", error);
			this.showMessage(
				"✗ Erreur lors de l'activation. Vérifiez votre connexion internet.",
				"error",
			);
		} finally {
			// Réactiver le bouton
			if (activateLicenseBtn) {
				activateLicenseBtn.disabled = false;
				activateLicenseBtn.textContent = "";

				const span = document.createElement("span");
				span.textContent = "Activer";

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
				polyline.setAttribute("points", "9 18 15 12 9 6");

				svg.appendChild(polyline);

				activateLicenseBtn.appendChild(span);
				activateLicenseBtn.appendChild(svg);
			}
		}
	},

	showMessage(text, type) {
		if (!licenseMessage) return;

		licenseMessage.textContent = text;
		licenseMessage.className = `license-message license-message--${type}`;
	},
};

// Exposer globalement
if (typeof window !== "undefined") {
	window.licenseModalObj = licenseModalObj;
}

export default licenseModalObj;
