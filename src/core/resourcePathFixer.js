// Fix all resource paths after HTML is loaded
const path = require("path");
const { ipcRenderer } = require("electron");

let appPath = null;

async function initAppPath() {
    if (!appPath) {
        appPath = await ipcRenderer.invoke("get-app-path");
    }
    return appPath;
}

function getResourceUrlSync(relativePath) {
    if (!appPath) {
        console.warn("pathResolver not initialized yet, using relative path");
        return relativePath;
    }
    const fullPath = path.join(appPath, relativePath).replace(/\\/g, "/");
    return `file:///${fullPath}`;
}

async function fixResourcePaths() {
    await initAppPath();

    // Fix all img tags
    document.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        if (src && src.startsWith("public/")) {
            img.src = getResourceUrlSync(src);
        }
    });

    // Fix all image inputs (file inputs that show image preview)
    document.querySelectorAll('input[type="image"]').forEach((input) => {
        const src = input.getAttribute("src");
        if (src && src.startsWith("public/")) {
            input.src = getResourceUrlSync(src);
        }
    });

    // Observer for dynamically added images
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Element node
                    if (node.tagName === "IMG") {
                        const src = node.getAttribute("src");
                        if (src && src.startsWith("public/")) {
                            node.src = getResourceUrlSync(src);
                        }
                    }
                    // Check children
                    node.querySelectorAll &&
                        node.querySelectorAll("img").forEach((img) => {
                            const src = img.getAttribute("src");
                            if (src && src.startsWith("public/")) {
                                img.src = getResourceUrlSync(src);
                            }
                        });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Auto-fix when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixResourcePaths);
} else {
    fixResourcePaths();
}

// Also fix on window load
window.addEventListener("load", fixResourcePaths);

module.exports = { fixResourcePaths };
