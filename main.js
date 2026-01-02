const { app, screen } = require("electron");
// const isDev = require("electron-is-dev");

// Configuration de l'Application User Model ID pour Windows
if (process.platform === "win32") {
    app.setAppUserModelId("com.mattbuchs.escapetime");
}

// Rechargement automatique uniquement en développement
// if (isDev) {
//     require("electron-reload")(__dirname, { ignored: [/\.json$/] });
// }

const {
    createWindows,
    createWindowsIf1Screen,
} = require("./src/services/createWindows");
const setupIPCFunctions = require("./src/services/ipcFunctions");
// const AutoUpdater = require("./src/services/autoUpdater");

let windows = [];
// let updater = null;

const createAppWindows = () => {
    // Petit délai pour s'assurer que tous les écrans sont détectés
    // Particulièrement utile au démarrage de l'OS ou après réveil
    setTimeout(() => {
        const displays = screen.getAllDisplays();
        console.log(
            "Création des fenêtres avec",
            displays.length,
            "écran(s) détecté(s)"
        );

        if (displays.length === 1) {
            windows = createWindowsIf1Screen();
        } else {
            windows = createWindows();
        }

        setupIPCFunctions(windows);

        windows[0].on("closed", () => {
            windows.slice(1).forEach((win) => win.close());
        });

        // Auto-updater désactivé pour distribution locale
        // Pour activer les mises à jour automatiques, décommentez les lignes ci-dessous
        // et configurez l'URL du serveur dans package.json
        /*
        if (!require("electron-is-dev")) {
            updater = new AutoUpdater(windows[0]);
            setTimeout(() => {
                updater.checkForUpdatesAndNotify();
            }, 5000);
        }
        */
    }, 300); // Délai de 300ms pour la détection des écrans
};

app.whenReady().then(() => {
    createAppWindows();

    app.on("activate", () => {
        if (windows.length === 0) createAppWindows();
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });
});
