/**
 * Second Window Info Handler
 * Gère l'affichage de l'aide pour la fenêtre secondaire
 */

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

function showSecondWindowInfo() {
    const modal = document.createElement("div");
    modal.className = "modal modal--info";
    modal.style.position = "fixed";
    modal.innerHTML = `
        <div class="modal__overlay"></div>
        <div class="modal__content modal__content--info">
    <button class="modal__content--close" id="btn-close-info">
        <img src="../../../public/img/close.svg" alt="Fermer" />
    </button>
    
    <h2>Fenêtre secondaire</h2>
    
    <div class="info-content">
        <p>
            La fenêtre secondaire est censée s’ouvrir automatiquement sur votre deuxième écran.
        </p>
        
        <div class="info-section">
            <h3>🖥️ Si elle ne s’affiche pas sur le bon écran</h3>
            <ol>
                <li>
                    Localisez la fenêtre secondaire. Elle peut être minimisée ou cachée. 
                    La combinaison <kbd>Alt</kbd> + <kbd>Tab</kbd> peut vous aider à la retrouver.
                </li>
                <li>
                    Une fois la fenêtre visible et active, appuyez sur <kbd>F11</kbd> pour quitter le mode plein écran.
                </li>
                <li>
                    Cliquez et maintenez le bouton de la souris sur la barre de titre de la fenêtre.
                </li>
                <li>
                    Faites glisser la fenêtre vers votre deuxième écran.
                </li>
                <li>
                    Une fois positionnée, appuyez de nouveau sur <kbd>F11</kbd> pour réactiver le mode plein écran.
                </li>
            </ol>
        </div>
    </div>
</div>

    `;

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
