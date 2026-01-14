/**
 * Logo Settings Manager
 * Gère la personnalisation du logo de la seconde fenêtre (PRO/BUSINESS)
 */

const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
import { notification } from "../UI/notification.js";

const logoSettingsObj = {
    hideLogoCheckbox: null,
    uploadLogoBtn: null,
    deleteLogoBtn: null,
    logoPreview: null,
    logoPreviewImg: null,
    customLogoContainer: null,

    init() {
        this.hideLogoCheckbox = document.getElementById("hide-logo-checkbox");
        this.uploadLogoBtn = document.getElementById("btn-upload-custom-logo");
        this.deleteLogoBtn = document.getElementById("btn-delete-custom-logo");
        this.logoPreview = document.getElementById("custom-logo-preview");
        this.logoPreviewImg = document.getElementById(
            "custom-logo-preview-img"
        );
        this.customLogoContainer = document.getElementById(
            "container-custom-logo"
        );

        const licenseManager = window.licenseManager;
        console.log("licenseManager dans logoSettingsObj:", licenseManager);

        // Charger les paramètres actuels
        this.loadSettings();

        // Désactiver les fonctionnalités selon la licence
        this.setupLicenseRestrictions(licenseManager);

        // Event listeners
        if (this.hideLogoCheckbox) {
            this.hideLogoCheckbox.addEventListener("change", () => {
                if (!licenseManager || !licenseManager.isPro()) {
                    this.hideLogoCheckbox.checked = false;
                    notification(
                        "🔒 Cette fonctionnalité est réservée aux versions PRO/BUSINESS.",
                        "error"
                    );
                    return;
                }
                this.saveHideLogoSetting();
            });
        }

        if (this.uploadLogoBtn) {
            this.uploadLogoBtn.addEventListener("click", () => {
                if (!licenseManager || !licenseManager.isPro()) {
                    notification(
                        "🔒 Le logo personnalisé est réservé aux versions PRO/BUSINESS.",
                        "error"
                    );
                    return;
                }
                this.uploadCustomLogo();
            });
        }

        if (this.deleteLogoBtn) {
            this.deleteLogoBtn.addEventListener("click", () => {
                this.deleteCustomLogo();
            });
        }

        // Drag and drop pour le logo
        this.setupDragAndDrop();
    },

    setupLicenseRestrictions(licenseManager) {
        // Restreindre le masquage du logo (PRO/BUSINESS)
        if (!licenseManager || !licenseManager.isPro()) {
            this.hideLogoCheckbox.disabled = true;
            this.hideLogoCheckbox.parentElement.style.opacity = "0.5";
            this.hideLogoCheckbox.parentElement.title =
                "🔒 Version PRO/BUSINESS requise";
        }

        // Restreindre le logo personnalisé (PRO/BUSINESS)
        if (!licenseManager || !licenseManager.isPro()) {
            if (this.uploadLogoBtn) {
                this.uploadLogoBtn.disabled = true;
                this.uploadLogoBtn.style.opacity = "0.5";
                this.uploadLogoBtn.title = "🔒 Version PRO/BUSINESS requise";
            }
            if (this.customLogoContainer) {
                this.customLogoContainer.style.opacity = "0.5";
                this.customLogoContainer.style.pointerEvents = "none";
            }
        }

        // Afficher/masquer les badges premium selon la licence
        this.updatePremiumBadgesVisibility(licenseManager);
    },

    async loadSettings() {
        const settingsManager = window.settingsManager;
        if (!settingsManager) return;

        // Charger le paramètre de masquage
        const hideLogo = await settingsManager.get("hideSecondWindowLogo");
        if (this.hideLogoCheckbox && hideLogo !== undefined) {
            this.hideLogoCheckbox.checked = hideLogo;
        }

        // Charger le logo personnalisé s'il existe
        const customLogoPath = await settingsManager.get("customLogoPath");
        if (customLogoPath && fs.existsSync(customLogoPath)) {
            this.showLogoPreview(customLogoPath);
        }
    },

    async saveHideLogoSetting() {
        const settingsManager = window.settingsManager;
        if (!settingsManager) return;

        const isHidden = this.hideLogoCheckbox.checked;
        await settingsManager.set("hideSecondWindowLogo", isHidden);

        // Notifier la seconde fenêtre
        ipcRenderer.send("update-logo-visibility", isHidden);

        notification(
            isHidden
                ? "Le logo sera masqué sur la fenêtre secondaire"
                : "Le logo sera affiché sur la fenêtre secondaire",
            "success"
        );
    },

    async uploadCustomLogo() {
        console.log("uploadCustomLogo appelé");

        try {
            const result = await ipcRenderer.invoke("open-file-dialog", {
                title: "Sélectionner un logo",
                filters: [
                    {
                        name: "Images",
                        extensions: ["png", "jpg", "jpeg", "svg", "webp"],
                    },
                ],
                properties: ["openFile"],
            });

            console.log("Résultat du dialog:", result);

            // Le handler retourne un tableau d'objets ou null
            if (!result || result.length === 0) {
                console.log("Upload annulé ou aucun fichier sélectionné");
                return;
            }

            const sourcePath = result[0].path;
            console.log("Fichier sélectionné:", sourcePath);
            await this.saveCustomLogo(sourcePath);
        } catch (error) {
            console.error("Erreur dans uploadCustomLogo:", error);
            notification(
                "Erreur lors de l'ouverture du sélecteur de fichier",
                "error"
            );
        }
    },

    async saveCustomLogo(sourcePath) {
        console.log("saveCustomLogo appelé avec:", sourcePath);

        try {
            // Copier le logo dans le dossier public/img
            const fileName = `custom-logo${path.extname(sourcePath)}`;
            console.log("Nom du fichier:", fileName);

            const publicPath = await ipcRenderer.invoke("get-public-path");
            console.log("Public path:", publicPath);

            const destPath = path.join(publicPath, "img", fileName);
            console.log("Destination path:", destPath);

            // Copier le fichier
            fs.copyFileSync(sourcePath, destPath);
            console.log("Fichier copié avec succès");

            // Sauvegarder le chemin
            const settingsManager = window.settingsManager;
            if (settingsManager) {
                await settingsManager.set("customLogoPath", destPath);
                console.log("Chemin sauvegardé dans settings");
            }

            // Afficher la prévisualisation
            this.showLogoPreview(destPath);

            // Notifier la seconde fenêtre
            ipcRenderer.send("update-custom-logo", destPath);

            // Recharger la seconde fenêtre pour appliquer les changements
            setTimeout(() => {
                ipcRenderer.send("reload-second-window");
            }, 200);

            notification("Logo personnalisé ajouté avec succès !", "success");
        } catch (error) {
            console.error("Erreur lors de l'upload du logo:", error);
            notification(
                "Erreur lors de l'ajout du logo: " + error.message,
                "error"
            );
        }
    },

    showLogoPreview(logoPath) {
        console.log("showLogoPreview appelé avec:", logoPath);
        console.log("logoPreview element:", this.logoPreview);
        console.log("logoPreviewImg element:", this.logoPreviewImg);

        if (!this.logoPreview || !this.logoPreviewImg) {
            console.error("Elements de preview manquants");
            return;
        }

        // Convertir le chemin en URL avec timestamp pour éviter le cache
        const timestamp = new Date().getTime();
        const logoUrl = `file://${logoPath}?t=${timestamp}`;
        console.log("Logo URL:", logoUrl);

        this.logoPreviewImg.src = logoUrl;
        this.logoPreview.classList.remove("hidden");
        this.customLogoContainer.style.display = "none";

        console.log("Preview affiché");
    },

    async deleteCustomLogo() {
        const settingsManager = window.settingsManager;
        if (!settingsManager) return;

        const customLogoPath = await settingsManager.get("customLogoPath");

        if (customLogoPath && fs.existsSync(customLogoPath)) {
            try {
                fs.unlinkSync(customLogoPath);
            } catch (error) {
                console.error("Erreur lors de la suppression du logo:", error);
            }
        }

        // Supprimer de la config
        await settingsManager.set("customLogoPath", null);

        // Masquer la prévisualisation
        this.logoPreview.classList.add("hidden");
        this.customLogoContainer.style.display = "";

        // Notifier la seconde fenêtre
        ipcRenderer.send("update-custom-logo", null);

        // Recharger la seconde fenêtre pour appliquer les changements
        setTimeout(() => {
            ipcRenderer.send("reload-second-window");
        }, 200);

        notification("Logo personnalisé supprimé", "success");
    },

    updatePremiumBadgesVisibility(licenseManager) {
        // Afficher les badges uniquement en version FREE
        const badges = document.querySelectorAll(".premium-badge");
        const isFree = !licenseManager || !licenseManager.isPro();

        badges.forEach((badge) => {
            if (isFree) {
                badge.style.display = "inline-block";
            } else {
                badge.style.display = "none";
            }
        });
    },

    setupDragAndDrop() {
        if (!this.customLogoContainer) return;

        const licenseManager = window.licenseManager;

        this.customLogoContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (licenseManager && licenseManager.isPro()) {
                this.customLogoContainer.classList.add("dragover");
            }
        });

        this.customLogoContainer.addEventListener("dragleave", () => {
            this.customLogoContainer.classList.remove("dragover");
        });

        this.customLogoContainer.addEventListener("drop", async (e) => {
            e.preventDefault();
            this.customLogoContainer.classList.remove("dragover");

            if (!licenseManager || !licenseManager.isPro()) {
                notification(
                    "🔒 Le logo personnalisé est réservé aux versions PRO/BUSINESS.",
                    "error"
                );
                return;
            }

            const file = e.dataTransfer.files[0];
            if (!file) return;

            // Vérifier que c'est une image
            const validExtensions = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
            const ext = path.extname(file.path).toLowerCase();

            if (!validExtensions.includes(ext)) {
                notification(
                    "Format de fichier non supporté. Utilisez PNG, JPG, JPEG, SVG ou WEBP.",
                    "error"
                );
                return;
            }

            await this.saveCustomLogo(file.path);
        });
    },
};

export default logoSettingsObj;
