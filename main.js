const { app, screen } = require("electron");
require("electron-reload")(__dirname, { ignored: [/\.json$/] });

const {
    createWindows,
    createWindowsIf1Screen,
} = require("./src/services/createWindows");
const setupIPCFunctions = require("./src/services/ipcFunctions");

let windows = [];

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
