const path = require("path");
const { app } = require("electron");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

/**
 * Get path to public resources (images, sounds, etc.)
 * In dev: points to project's public folder
 * In prod: points to app.asar.unpacked/public
 */
function getPublicPath(...segments) {
    if (isDev) {
        // In development, use the project root
        return path.join(__dirname, "../../public", ...segments);
    }

    // In production, use app.asar.unpacked
    return path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "public",
        ...segments
    );
}

/**
 * Get path to data files (rooms.json, etc.)
 * In dev: points to project's src/data folder
 * In prod: points to app.asar.unpacked/src/data
 */
function getDataPath(...segments) {
    if (isDev) {
        return path.join(__dirname, "../../src/data", ...segments);
    }

    return path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "src",
        "data",
        ...segments
    );
}

/**
 * Get user data path for custom files created by user
 * Always uses app.getPath("userData") for user-generated content
 */
function getUserDataPath(...segments) {
    return path.join(app.getPath("userData"), ...segments);
}

/**
 * Convert path to file:// URL for use in HTML/CSS
 */
function pathToFileUrl(filePath) {
    return `file:///${filePath.replace(/\\/g, "/")}`;
}

module.exports = {
    getPublicPath,
    getDataPath,
    getUserDataPath,
    pathToFileUrl,
    isDev,
};
