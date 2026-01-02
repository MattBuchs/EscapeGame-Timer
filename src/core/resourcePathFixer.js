// Fix all resource paths after HTML is loaded
const { ipcRenderer } = require("electron");

let publicPathCache = {};

async function getPublicUrl(...segments) {
    return await ipcRenderer.invoke("get-public-url", ...segments);
}

function getPublicUrlSync(relativePath) {
    // Return cached value if available
    if (publicPathCache[relativePath]) {
        return publicPathCache[relativePath];
    }

    // Fallback for initial render (will be fixed by async call)
    console.warn("Using relative path (will be fixed):", relativePath);
    return relativePath;
}

// Preload common paths
async function preloadPaths() {
    const commonPaths = [
        "img/Logo.png",
        "img/chevron-right.svg",
        "img/chevron-left.svg",
        "img/delete.svg",
        "img/back.svg",
        "img/circle-check.svg",
        "img/volume.svg",
        "img/stop.svg",
        "img/file-import.svg",
        "img/close.svg",
    ];

    for (const p of commonPaths) {
        try {
            publicPathCache[`public/${p}`] = await getPublicUrl(p);
        } catch (e) {
            console.error("Failed to preload path:", p, e);
        }
    }
}

async function fixResourcePaths() {
    await preloadPaths();

    // Fix all img tags
    document.querySelectorAll("img").forEach(async (img) => {
        const src = img.getAttribute("src");
        if (src && src.startsWith("public/")) {
            const url =
                publicPathCache[src] ||
                (await getPublicUrl(src.replace("public/", "")));
            if (!publicPathCache[src]) publicPathCache[src] = url;
            img.src = url;
        }
    });

    // Fix all image inputs (file inputs that show image preview)
    document.querySelectorAll('input[type="image"]').forEach(async (input) => {
        const src = input.getAttribute("src");
        if (src && src.startsWith("public/")) {
            const url =
                publicPathCache[src] ||
                (await getPublicUrl(src.replace("public/", "")));
            if (!publicPathCache[src]) publicPathCache[src] = url;
            input.src = url;
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
                            (async () => {
                                const url =
                                    publicPathCache[src] ||
                                    (await getPublicUrl(
                                        src.replace("public/", "")
                                    ));
                                if (!publicPathCache[src])
                                    publicPathCache[src] = url;
                                node.src = url;
                            })();
                        }
                    }
                    // Check children
                    node.querySelectorAll &&
                        node.querySelectorAll("img").forEach((img) => {
                            const src = img.getAttribute("src");
                            if (src && src.startsWith("public/")) {
                                (async () => {
                                    const url =
                                        publicPathCache[src] ||
                                        (await getPublicUrl(
                                            src.replace("public/", "")
                                        ));
                                    if (!publicPathCache[src])
                                        publicPathCache[src] = url;
                                    img.src = url;
                                })();
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

// Expose helper functions globally
window.getPublicUrl = getPublicUrl;
window.getPublicUrlSync = getPublicUrlSync;

module.exports = { fixResourcePaths };
