const { BrowserWindow, screen } = require("electron");
const path = require("path");
const icon = path.join(__dirname, "../../public/img/AngelsGame.ico");

function createWindows() {
    const displays = screen.getAllDisplays();
    const mainScreen = screen.getPrimaryDisplay();
    console.log(displays);

    const windows = displays.map((display, index) => {
        let window;

        if (index === 0) {
            window = new BrowserWindow({
                width: 1200,
                height: 800,
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
        } else {
            window = new BrowserWindow({
                width: 1200,
                height: 800,
                x: display.bounds.x,
                y: display.bounds.y,
                icon,
                fullscreen: true,
                webPreferences: {
                    devTools: true,
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });
        }

        window.setMenuBarVisibility(false);
        return window;
    });

    windows.forEach((window, index) => {
        // Maximise la fenêtre dès son ouverture
        window.maximize();

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
