// Utility to resolve resource paths in both dev and production
const { ipcRenderer } = require("electron");
const path = require("path");

let appPath = null;

// Initialize app path
async function initAppPath() {
    if (!appPath) {
        appPath = await ipcRenderer.invoke("get-app-path");
    }
    return appPath;
}

// Resolve a resource path (for images, sounds, etc.)
async function getResourcePath(relativePath) {
    const base = await initAppPath();
    return path.join(base, relativePath).replace(/\\/g, "/");
}

// Convert to file:// URL for use in img src, audio src, etc.
async function getResourceUrl(relativePath) {
    const fullPath = await getResourcePath(relativePath);
    return `file:///${fullPath}`;
}

// Synchronous version after initialization
function getResourcePathSync(relativePath) {
    if (!appPath) {
        console.error(
            "pathResolver not initialized. Call initAppPath() first."
        );
        return relativePath;
    }
    return path.join(appPath, relativePath).replace(/\\/g, "/");
}

function getResourceUrlSync(relativePath) {
    const fullPath = getResourcePathSync(relativePath);
    return `file:///${fullPath}`;
}

// Expose globally for easy access
if (typeof window !== "undefined") {
    window.getResourcePath = getResourcePath;
    window.getResourceUrl = getResourceUrl;
    window.getResourcePathSync = getResourcePathSync;
    window.getResourceUrlSync = getResourceUrlSync;
}

module.exports = {
    initAppPath,
    getResourcePath,
    getResourceUrl,
    getResourcePathSync,
    getResourceUrlSync,
};
