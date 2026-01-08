import { notification } from "../UI/notification.js";

const licenseKeyInput = document.querySelector("#license-key-input");
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
                this.activateLicense()
            );
        }

        // Entrée sur Enter
        if (licenseKeyInput) {
            licenseKeyInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.activateLicense();
                }
            });
        }

        // Lien d'achat (à personnaliser avec votre URL)
        if (purchaseLink) {
            purchaseLink.addEventListener("click", (e) => {
                e.preventDefault();
                // TODO: Ouvrir la page d'achat dans le navigateur
                const { shell } = require("electron");
                shell.openExternal("https://votre-site.com/acheter-escapetime");
            });
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
                "license-badge--free"
            );
        } else {
            licenseTypeText.textContent = "Version Gratuite";
            licenseTypeText.parentElement.classList.add("license-badge--free");
            licenseTypeText.parentElement.classList.remove(
                "license-badge--pro"
            );
        }
    },

    async activateLicense() {
        const licenseManager = window.licenseManager;
        if (!licenseManager || !licenseKeyInput) return;

        const key = licenseKeyInput.value.trim();

        if (!key) {
            this.showMessage("Veuillez entrer une clé de licence.", "error");
            return;
        }

        // Validation du format
        if (!licenseManager.validateLicenseKey(key)) {
            this.showMessage(
                "Format de clé invalide. Format attendu : XXXX-XXXX-XXXX-XXXX",
                "error"
            );
            return;
        }

        // Tentative d'activation
        const success = licenseManager.activatePro(key);

        if (success) {
            this.showMessage(
                "✓ Licence activée avec succès ! Toutes les fonctionnalités PRO sont maintenant disponibles.",
                "success"
            );
            this.updateLicenseDisplay();

            notification(
                "🎉 Licence PRO activée ! Profitez de toutes les fonctionnalités.",
                "success"
            );

            // Recharger la page après 2 secondes pour appliquer les changements
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            this.showMessage(
                "✗ Clé de licence invalide. Veuillez vérifier et réessayer.",
                "error"
            );
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
