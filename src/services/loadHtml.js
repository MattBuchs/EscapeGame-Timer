/**
 * Nettoie et insère du HTML de manière sécurisée
 * Utilise DOMParser pour parser le HTML sans exécuter de scripts
 */
function setHTMLContent(element, html) {
    if (!element) return;

    // Vide l'élément
    element.textContent = "";

    // Parse le HTML de manière sécurisée avec DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Retire tous les scripts pour la sécurité
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Retire les attributs on* (onclick, onload, etc.) pour la sécurité
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((elem) => {
        Array.from(elem.attributes).forEach((attr) => {
            if (attr.name.startsWith("on")) {
                elem.removeAttribute(attr.name);
            }
        });
    });

    // Ajoute tous les nœuds du body parsé
    while (doc.body.firstChild) {
        element.appendChild(doc.body.firstChild);
    }
}

// Compteur pour suivre le chargement de toutes les sections HTML
let htmlSectionsToLoad = 0;
let htmlSectionsLoaded = 0;
window.htmlSectionsReady = false;

function loadHtml(sectionId, fileName) {
    htmlSectionsToLoad++;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const element = document.getElementById(sectionId);
            if (element) {
                setHTMLContent(element, xhr.responseText);
            }
            htmlSectionsLoaded++;

            // Si toutes les sections sont chargées, dispatcher un événement
            if (htmlSectionsLoaded === htmlSectionsToLoad) {
                console.log("All HTML sections loaded, dispatching event...");
                // Attendre un peu que le DOM soit bien mis à jour
                setTimeout(() => {
                    window.htmlSectionsReady = true;
                    window.dispatchEvent(new Event("html-sections-loaded"));
                    console.log("html-sections-loaded event dispatched");
                }, 100);
            }
        }
    };
    xhr.open("GET", fileName, true);
    xhr.send();
}

loadHtml("header-load", "header.html");
loadHtml("container-room", "main/sectionRoom.html");
loadHtml("container-add_room", "main/sectionAddRoom.html");
loadHtml("global-settings", "main/sectionSettings.html");
loadHtml("update-room", "main/sectionUpdateRoom.html");
loadHtml("license-section", "main/sectionLicense.html");
loadHtml("contact-section", "main/contact.html");
loadHtml("modal-settings", "modals/modalSettings.html");
loadHtml("modal-utils", "modals/modalUtils.html");
