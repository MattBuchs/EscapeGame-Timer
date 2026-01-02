const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

function setupIPCFunctions(windows) {
    // Expose app root path for resource loading
    ipcMain.handle("get-app-path", () => {
        return path.join(__dirname, "../..");
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

    ipcMain.handle("open-file-dialog", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
            filters: [
                {
                    name: "Fichiers MP3",
                    extensions: ["mp3", "wav", "ogg", "flac"],
                },
            ],
        });

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
}

module.exports = setupIPCFunctions;
