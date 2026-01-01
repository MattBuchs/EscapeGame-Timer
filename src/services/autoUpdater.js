/**
 * Auto Updater Module
 * Gère les mises à jour automatiques de l'application
 */

const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

class AutoUpdater {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.setupAutoUpdater();
    }

    setupAutoUpdater() {
        // Configuration
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;

        // Événements
        autoUpdater.on("checking-for-update", () => {
            console.log("Vérification des mises à jour...");
        });

        autoUpdater.on("update-available", (info) => {
            console.log("Mise à jour disponible:", info.version);
            this.showUpdateAvailableDialog(info);
        });

        autoUpdater.on("update-not-available", (info) => {
            console.log("Application à jour");
        });

        autoUpdater.on("error", (err) => {
            console.error("Erreur lors de la mise à jour:", err);
        });

        autoUpdater.on("download-progress", (progressObj) => {
            let message = `Vitesse de téléchargement: ${progressObj.bytesPerSecond}`;
            message += ` - Téléchargé ${progressObj.percent}%`;
            message += ` (${progressObj.transferred}/${progressObj.total})`;
            console.log(message);

            // Envoyer la progression à la fenêtre
            if (this.mainWindow) {
                this.mainWindow.webContents.send(
                    "download-progress",
                    progressObj
                );
            }
        });

        autoUpdater.on("update-downloaded", (info) => {
            console.log("Mise à jour téléchargée");
            this.showUpdateDownloadedDialog(info);
        });
    }

    showUpdateAvailableDialog(info) {
        dialog
            .showMessageBox(this.mainWindow, {
                type: "info",
                title: "Mise à jour disponible",
                message: `Une nouvelle version (${info.version}) est disponible !`,
                detail: `Version actuelle: ${
                    require("../package.json").version
                }\nNouvelle version: ${
                    info.version
                }\n\nVoulez-vous télécharger la mise à jour maintenant ?`,
                buttons: ["Télécharger", "Plus tard"],
                defaultId: 0,
                cancelId: 1,
            })
            .then((result) => {
                if (result.response === 0) {
                    autoUpdater.downloadUpdate();

                    // Afficher une notification de téléchargement en cours
                    dialog.showMessageBox(this.mainWindow, {
                        type: "info",
                        title: "Téléchargement en cours",
                        message:
                            "La mise à jour est en cours de téléchargement...",
                        buttons: ["OK"],
                    });
                }
            });
    }

    showUpdateDownloadedDialog(info) {
        dialog
            .showMessageBox(this.mainWindow, {
                type: "info",
                title: "Mise à jour prête",
                message: "La mise à jour a été téléchargée.",
                detail: "L'application va redémarrer pour installer la mise à jour.",
                buttons: ["Redémarrer maintenant", "Plus tard"],
                defaultId: 0,
                cancelId: 1,
            })
            .then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall(false, true);
                }
            });
    }

    checkForUpdates() {
        // Vérifier les mises à jour (à appeler manuellement si besoin)
        autoUpdater.checkForUpdates();
    }

    checkForUpdatesAndNotify() {
        // Vérifier les mises à jour et notifier l'utilisateur
        autoUpdater.checkForUpdatesAndNotify();
    }
}

module.exports = AutoUpdater;
