const fs = require("fs");
const { ipcRenderer } = require("electron");

const checkAndCreateFolders = async () => {
    const folders = [
        "sounds/ambient",
        "sounds/end_timer",
        "sounds/notification",
    ];

    for (const folder of folders) {
        try {
            const folderPath = await ipcRenderer.invoke(
                "get-public-path",
                ...folder.split("/")
            );

            // Check if folder exists
            if (!fs.existsSync(folderPath)) {
                // Create folder if it doesn't exist
                fs.mkdirSync(folderPath, { recursive: true });
            }
        } catch (error) {
            console.error(`Error checking/creating folder ${folder}:`, error);
        }
    }
};

export default checkAndCreateFolders;
