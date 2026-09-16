/**
 * Second Window Info Handler
 * Gère l'affichage de l'aide pour la fenêtre secondaire
 */

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

function initSecondWindowInfo() {
    // Attendre que le DOM soit chargé
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachInfoButtonListener);
    } else {
        attachInfoButtonListener();
    }
}

function attachInfoButtonListener() {
    const infoBtn = document.getElementById("btn-second-window-info");

    if (!infoBtn) {
        console.warn("Bouton info non trouvé");
        return;
    }

    infoBtn.addEventListener("click", showSecondWindowInfo);
}

// Fallback pour les textes français par défaut
function getDefaultTextFr(key) {
    const defaults = {
        "home.secondWindowModal.close": "Fermer",
        "home.secondWindowModal.title": "Fenêtre secondaire",
        "home.secondWindowModal.intro":
            "La fenêtre secondaire est censée s'ouvrir automatiquement sur votre deuxième écran.",
        "home.secondWindowModal.wrongScreenTitle":
            "🖥️ Si elle ne s'affiche pas sur le bon écran",
        "home.secondWindowModal.step1":
            "Localisez la fenêtre secondaire. Elle peut être minimisée ou cachée. La combinaison",
        "home.secondWindowModal.step1Keys": "Alt + Tab",
        "home.secondWindowModal.step1End": "peut vous aider à la retrouver.",
        "home.secondWindowModal.step2":
            "Une fois la fenêtre visible et active, appuyez sur",
        "home.secondWindowModal.step2Key": "F11",
        "home.secondWindowModal.step2End": "pour quitter le mode plein écran.",
        "home.secondWindowModal.step3":
            "Cliquez et maintenez le bouton de la souris sur la barre de titre de la fenêtre.",
        "home.secondWindowModal.step4":
            "Faites glisser la fenêtre vers votre deuxième écran.",
        "home.secondWindowModal.step5":
            "Une fois positionnée, appuyez de nouveau sur",
        "home.secondWindowModal.step5Key": "F11",
        "home.secondWindowModal.step5End":
            "pour réactiver le mode plein écran.",
    };
    return defaults[key] || key;
}

function showSecondWindowInfo() {
    const i18n = window.i18n;
    const t = (key) => (i18n ? i18n.t(key) : getDefaultTextFr(key));

    const modal = document.createElement("div");
    modal.className = "modal modal--info";
    modal.style.position = "fixed";

    // Get close image URL (async but will be fixed by resourcePathFixer)
    let closeImgSrc = "../../../public/img/close.svg";
    if (window.getPublicUrl) {
        window.getPublicUrl("img", "close.svg").then((url) => {
            const img = modal.querySelector(".modal__content--close img");
            if (img) img.src = url;
        });
    }

    setHTMLContent(
        modal,
        `
        <div class="modal__overlay"></div>
        <div class="modal__content modal__content--info">
    <button class="modal__content--close" id="btn-close-info">
        <img src="${closeImgSrc}" alt="${t("home.secondWindowModal.close")}" />
    </button>
    
    <h2>${t("home.secondWindowModal.title")}</h2>
    
    <div class="info-content">
        <p>
            ${t("home.secondWindowModal.intro")}
        </p>
        
        <div class="info-section">
            <h3>${t("home.secondWindowModal.wrongScreenTitle")}</h3>
            <ol>
                <li>
                    ${t("home.secondWindowModal.step1")} <kbd>${t(
            "home.secondWindowModal.step1Keys"
        )}</kbd> ${t("home.secondWindowModal.step1End")}
                </li>
                <li>
                    ${t("home.secondWindowModal.step2")} <kbd>${t(
            "home.secondWindowModal.step2Key"
        )}</kbd> ${t("home.secondWindowModal.step2End")}
                </li>
                <li>
                    ${t("home.secondWindowModal.step3")}
                </li>
                <li>
                    ${t("home.secondWindowModal.step4")}
                </li>
                <li>
                    ${t("home.secondWindowModal.step5")} <kbd>${t(
            "home.secondWindowModal.step5Key"
        )}</kbd> ${t("home.secondWindowModal.step5End")}
                </li>
            </ol>
        </div>
    </div>
</div>

    `
    );

    document.body.appendChild(modal);

    // Animation d'apparition
    setTimeout(() => modal.classList.add("active"), 10);

    // Event listeners pour fermer
    const closeBtn = modal.querySelector("#btn-close-info");
    const overlay = modal.querySelector(".modal__overlay");

    closeBtn.addEventListener("click", () => closeInfoModal(modal));
    overlay.addEventListener("click", () => closeInfoModal(modal));
}

function closeInfoModal(modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
}

export { initSecondWindowInfo };
