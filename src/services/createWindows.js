const { BrowserWindow, screen } = require("electron");
const path = require("path");
const icon = path.join(__dirname, "../../public/img/AngelsGame.ico");

function createWindows() {
    const displays = screen.getAllDisplays();
    const mainScreen = screen.getPrimaryDisplay();

    console.log("Nombre d'écrans détectés:", displays.length);
    console.log(
        "Écrans:",
        displays.map((d) => ({
            id: d.id,
            bounds: d.bounds,
            primary: d.id === mainScreen.id,
        }))
    );

    // Fenêtre principale (Game Master) sur l'écran principal
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        x: mainScreen.bounds.x,
        y: mainScreen.bounds.y,
        icon,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    mainWindow.setMenuBarVisibility(false);

    const windows = [mainWindow];

    // Créer la 2ème fenêtre sur l'écran secondaire si disponible
    if (displays.length > 1) {
        // Trouver le premier écran qui n'est PAS l'écran principal
        const secondaryDisplay = displays.find((d) => d.id !== mainScreen.id);

        if (secondaryDisplay) {
            console.log(
                "Création de la 2ème fenêtre sur l'écran secondaire:",
                secondaryDisplay.bounds
            );

            const secondWindow = new BrowserWindow({
                width: secondaryDisplay.bounds.width,
                height: secondaryDisplay.bounds.height,
                x: secondaryDisplay.bounds.x,
                y: secondaryDisplay.bounds.y,
                icon,
                fullscreen: true,
                webPreferences: {
                    devTools: true,
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });
            secondWindow.setMenuBarVisibility(false);
            windows.push(secondWindow);
        }
    }

    windows.forEach((window, index) => {
        // Maximise uniquement la fenêtre principale
        if (index === 0) {
            window.maximize();
        }

        window.loadFile(
            index === 0
                ? "src/html/mainWindow/index.html"
                : "src/html/secondWindow.html"
        );

        // Ouvrir les devtools
        window.webContents.openDevTools();
    });

    return windows;
}

function createWindowsIf1Screen() {
    const mainScreen = screen.getPrimaryDisplay();

    const window1 = new BrowserWindow({
        width: mainScreen.workAreaSize.width,
        height: mainScreen.workAreaSize.height,
        x: mainScreen.bounds.x,
        y: mainScreen.bounds.y,
        center: true,
        icon,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    const window2 = new BrowserWindow({
        width: 1200,
        height: 800,
        x: mainScreen.bounds.x,
        y: mainScreen.bounds.y,
        fullscreen: true,
        icon,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    window2.loadFile("src/html/secondWindow.html");
    window1.loadFile("src/html/mainWindow/index.html");
    window1.setMenuBarVisibility(false);
    window2.setMenuBarVisibility(false);

    // Ouvrir les devtools
    window1.webContents.openDevTools();
    window2.webContents.openDevTools();

    return [window1, window2];
}

module.exports = {
    createWindows,
    createWindowsIf1Screen,
};
