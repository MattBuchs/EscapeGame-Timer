/**
 * Utilitaires DOM sécurisés pour remplacer innerHTML
 * Ces fonctions empêchent les injections XSS en utilisant des méthodes sûres
 */

/**
 * Définit le contenu texte d'un élément de manière sécurisée
 * @param {HTMLElement|string} element - Element DOM ou sélecteur
 * @param {string} text - Texte à insérer
 */
export function setTextContent(element, text) {
    const el =
        typeof element === "string" ? document.querySelector(element) : element;
    if (el) {
        el.textContent = text || "";
    }
}

/**
 * Nettoie et insère du HTML de manière sécurisée
 * Utilise DOMParser pour parser le HTML sans exécuter de scripts
 * @param {HTMLElement|string} element - Element DOM ou sélecteur
 * @param {string} html - HTML à insérer
 */
export function setHTMLContent(element, html) {
    const el =
        typeof element === "string" ? document.querySelector(element) : element;
    if (!el) return;

    // Vide l'élément
    el.textContent = "";

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
        el.appendChild(doc.body.firstChild);
    }
}

/**
 * Crée un élément DOM à partir d'une chaîne HTML de manière sécurisée
 * @param {string} html - HTML à convertir en élément
 * @returns {HTMLElement|null} - Element DOM créé
 */
export function createElementFromHTML(html) {
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

    return doc.body.firstChild;
}

/**
 * Vide un élément de tout son contenu
 * @param {HTMLElement|string} element - Element DOM ou sélecteur
 */
export function clearElement(element) {
    const el =
        typeof element === "string" ? document.querySelector(element) : element;
    if (el) {
        el.textContent = "";
    }
}

/**
 * Crée un élément DOM avec des propriétés
 * @param {string} tag - Nom du tag HTML
 * @param {Object} props - Propriétés de l'élément (className, id, textContent, etc.)
 * @param {Array<HTMLElement>} children - Éléments enfants à ajouter
 * @returns {HTMLElement} - Element DOM créé
 */
export function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
        if (key === "className") {
            element.className = value;
        } else if (key === "textContent") {
            element.textContent = value;
        } else if (key === "dataset") {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key === "style" && typeof value === "object") {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            });
        } else if (!key.startsWith("on")) {
            // Ignore les attributs on* pour la sécurité
            element.setAttribute(key, value);
        }
    });

    children.forEach((child) => {
        if (child) {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Ajoute plusieurs éléments enfants à un parent
 * @param {HTMLElement|string} parent - Element parent ou sélecteur
 * @param {Array<HTMLElement>} children - Éléments à ajouter
 */
export function appendChildren(parent, children) {
    const parentEl =
        typeof parent === "string" ? document.querySelector(parent) : parent;
    if (!parentEl) return;

    children.forEach((child) => {
        if (child) {
            parentEl.appendChild(child);
        }
    });
}
