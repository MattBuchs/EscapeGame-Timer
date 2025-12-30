import roomsObj from "../rooms/rooms.js";
import { dataloaded } from "../../utils.js";

const phrasesInput = document.querySelector("#phrases-select");
const phrasesDropdown = document.querySelector("#phrases-dropdown");
const clearPhraseBtn = document.querySelector("#clear-phrase-input");
const messageTextarea = document.querySelector("#message");

const phrasesAutocompleteObj = {
    allPhrases: [],
    isDropdownOpen: false,

    init() {
        phrasesInput.addEventListener("input", this.handleInput.bind(this));
        clearPhraseBtn.addEventListener("click", this.clearInput.bind(this));

        // Écouter les touches pour une meilleure UX
        phrasesInput.addEventListener("keydown", this.handleKeyDown.bind(this));

        // Afficher toutes les phrases au focus
        phrasesInput.addEventListener("focus", this.openDropdown.bind(this));
        phrasesInput.addEventListener("click", this.openDropdown.bind(this));

        // Fermer le dropdown si on clique en dehors
        document.addEventListener("click", (e) => {
            if (
                !phrasesInput.contains(e.target) &&
                !phrasesDropdown.contains(e.target)
            ) {
                this.closeDropdown();
            }
        });
    },

    handleInput(e) {
        const value = e.target.value.trim();

        // Afficher/masquer le bouton clear
        if (value) {
            clearPhraseBtn.classList.add("visible");
        } else {
            clearPhraseBtn.classList.remove("visible");
        }

        // Filtrer et afficher les suggestions
        this.filterAndDisplayPhrases(value);
    },

    handleKeyDown(e) {
        // Si Enter est pressé et qu'il y a une valeur
        if (e.key === "Enter") {
            e.preventDefault();
            const value = phrasesInput.value.trim();
            if (value && this.allPhrases.includes(value)) {
                this.selectPhrase(value);
            }
        }

        // Si Escape est pressé, fermer le dropdown
        if (e.key === "Escape") {
            this.closeDropdown();
        }

        // Navigation avec les flèches (optionnel pour future amélioration)
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            // On pourrait ajouter la navigation au clavier ici
        }
    },

    openDropdown() {
        this.isDropdownOpen = true;
        const value = phrasesInput.value.trim();
        this.filterAndDisplayPhrases(value);
    },

    closeDropdown() {
        this.isDropdownOpen = false;
        phrasesDropdown.classList.add("hidden");
    },

    filterAndDisplayPhrases(searchValue) {
        // Vider le dropdown
        phrasesDropdown.innerHTML = "";

        let filteredPhrases = [];

        if (!searchValue) {
            // Si pas de recherche, afficher toutes les phrases (limitées pour performance)
            filteredPhrases = this.allPhrases.slice(0, 50);
        } else {
            // Filtrer les phrases qui commencent par la recherche (insensible à la casse)
            const searchLower = searchValue.toLowerCase();
            const startsWithMatches = this.allPhrases.filter((phrase) =>
                phrase.toLowerCase().startsWith(searchLower)
            );

            // Filtrer les phrases qui contiennent la recherche mais ne commencent pas par celle-ci
            const containsMatches = this.allPhrases.filter(
                (phrase) =>
                    !phrase.toLowerCase().startsWith(searchLower) &&
                    phrase.toLowerCase().includes(searchLower)
            );

            // Combiner les résultats: d'abord ceux qui commencent, puis ceux qui contiennent
            filteredPhrases = [...startsWithMatches, ...containsMatches].slice(
                0,
                50
            );
        }

        // Afficher les phrases ou un message si aucun résultat
        if (filteredPhrases.length === 0) {
            const noResultDiv = document.createElement("div");
            noResultDiv.className = "phrase-item no-results";
            noResultDiv.textContent = searchValue
                ? "Aucune phrase trouvée"
                : "Aucune phrase enregistrée";
            phrasesDropdown.appendChild(noResultDiv);
        } else {
            filteredPhrases.forEach((phrase) => {
                const phraseDiv = document.createElement("div");
                phraseDiv.className = "phrase-item";
                phraseDiv.textContent = phrase;
                phraseDiv.addEventListener("click", () =>
                    this.selectPhrase(phrase)
                );
                phrasesDropdown.appendChild(phraseDiv);
            });
        }

        // Afficher le dropdown
        phrasesDropdown.classList.remove("hidden");
    },

    selectPhrase(phrase) {
        // Insérer la phrase dans le textarea
        messageTextarea.value = phrase;

        // Déclencher l'événement input pour mettre à jour le compteur
        const event = new Event("input", { bubbles: true });
        messageTextarea.dispatchEvent(event);

        // Focus sur le textarea
        messageTextarea.focus();

        // Effacer l'input et fermer le dropdown
        phrasesInput.value = "";
        clearPhraseBtn.classList.remove("visible");
        this.closeDropdown();
    },

    clearInput() {
        phrasesInput.value = "";
        clearPhraseBtn.classList.remove("visible");
        this.closeDropdown();
        phrasesInput.focus();
    },

    loadPhrases(data) {
        // Charger toutes les phrases depuis les données
        this.allPhrases = data.phrases || [];

        // Trier les phrases par ordre alphabétique pour une meilleure UX
        this.allPhrases.sort((a, b) =>
            a.localeCompare(b, "fr", { sensitivity: "base" })
        );
    },

    addPhrase(phrase) {
        // Ajouter une nouvelle phrase à la liste
        if (!this.allPhrases.includes(phrase)) {
            this.allPhrases.push(phrase);
            this.allPhrases.sort((a, b) =>
                a.localeCompare(b, "fr", { sensitivity: "base" })
            );
            // Mettre à jour le dropdown si il est ouvert
            if (this.isDropdownOpen) {
                const currentValue = phrasesInput.value.trim();
                this.filterAndDisplayPhrases(currentValue);
            }
        }
    },

    removePhrase(phrase) {
        // Supprimer une phrase de la liste
        const index = this.allPhrases.indexOf(phrase);
        if (index > -1) {
            this.allPhrases.splice(index, 1);
            // Mettre à jour le dropdown si il est ouvert
            if (this.isDropdownOpen) {
                const currentValue = phrasesInput.value.trim();
                this.filterAndDisplayPhrases(currentValue);
            }
        }
    },
};

export default phrasesAutocompleteObj;
