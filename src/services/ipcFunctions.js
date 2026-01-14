const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { getPublicPath, getDataPath, pathToFileUrl } = require("./paths");

function setupIPCFunctions(windows) {
    // Expose resource paths for renderer processes
    ipcMain.handle("get-public-path", (_, ...segments) => {
        return getPublicPath(...segments);
    });

    ipcMain.handle("get-public-url", (_, ...segments) => {
        return pathToFileUrl(getPublicPath(...segments));
    });

    ipcMain.handle("get-data-path", (_, ...segments) => {
        return getDataPath(...segments);
    });

    // Get installer language preference
    ipcMain.handle("get-installer-language", () => {
        try {
            const langFile = path.join(
                process.resourcesPath,
                ".installer-lang"
            );
            return langFile;
        } catch (e) {
            return null;
        }
    });

    ipcMain.on("play-timer", () => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("play-timer");
        }
    });

    ipcMain.on("stop-timer", () => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("stop-timer");
        }
    });

    ipcMain.on(
        "reset-timer",
        (_, resetHours, resetMinutes, isPreferenceTimer) => {
            for (let i = 1; i < windows.length; i++) {
                windows[i].webContents.send(
                    "reset-timer",
                    resetHours,
                    resetMinutes,
                    isPreferenceTimer
                );
            }
        }
    );

    ipcMain.on("send-message", (_, message) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("send-message", message);
        }
    });

    ipcMain.on("clear-message", () => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("clear-message");
        }
    });

    ipcMain.on("update-preference", (_, isPreferenceTimer) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("update-preference", isPreferenceTimer);
        }
    });

    ipcMain.on("load-timer", (_, isPreferenceTimer) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("load-timer", isPreferenceTimer);
        }
    });

    ipcMain.on("change-theme", (_, themeName) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("change-theme", themeName);
        }
    });

    ipcMain.on("language-changed", (_, locale) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("language-changed", locale);
        }
    });

    ipcMain.handle("open-file-dialog", async (_, options = {}) => {
        const defaultOptions = {
            properties: ["openFile", "multiSelections"],
            filters: [
                {
                    name: "Fichiers MP3",
                    extensions: ["mp3", "wav", "ogg", "flac"],
                },
            ],
        };

        // Fusionner avec les options personnalisées
        const dialogOptions = { ...defaultOptions, ...options };

        const result = await dialog.showOpenDialog(dialogOptions);

        if (!result.canceled) {
            const filePaths = result.filePaths;
            const files = [];

            // Pour chaque fichier sélectionné
            for (const filePath of filePaths) {
                const fileName = path.basename(filePath); // Obtenir le nom de fichier
                const fileStats = fs.statSync(filePath); // Obtenir les statistiques du fichier

                // Récupérer la taille du fichier (en octets)
                const fileSize = fileStats.size;

                files.push({
                    name: fileName,
                    path: filePath,
                    size: fileSize,
                    type: "audio/mpeg",
                });
            }

            return files;
        }

        return null;
    });

    // Logo settings handlers
    ipcMain.on("update-logo-visibility", (_, isHidden) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("logo-visibility-updated", isHidden);
        }
    });

    ipcMain.on("update-custom-logo", (_, logoPath) => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.send("custom-logo-updated", logoPath);
        }
    });

    // Recharger la seconde fenêtre
    ipcMain.on("reload-second-window", () => {
        for (let i = 1; i < windows.length; i++) {
            windows[i].webContents.reload();
        }
    });

    ipcMain.handle("get-logo-settings", async () => {
        try {
            const settingsPath = getDataPath("settings.json");
            if (fs.existsSync(settingsPath)) {
                const settingsData = fs.readFileSync(settingsPath, "utf8");
                const settings = JSON.parse(settingsData);
                return {
                    hideSecondWindowLogo:
                        settings.hideSecondWindowLogo || false,
                    customLogoPath: settings.customLogoPath || null,
                };
            }
        } catch (error) {
            console.error("Error loading logo settings:", error);
        }
        return { hideSecondWindowLogo: false, customLogoPath: null };
    });
}

module.exports = setupIPCFunctions;
