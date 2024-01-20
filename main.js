const { app } = require("electron");
require("electron-reload")(__dirname, { ignored: [/\.json$/] });

const createWindows = require("./src/services/createWindows");
const setupIPCFunctions = require("./src/services/ipcFunctions");

let windows = [];

const createAppWindows = () => {
    windows = createWindows();
    setupIPCFunctions(windows);

    windows[0].on("closed", () => {
        windows.slice(1).forEach((win) => win.close());
    });
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
