import roomsObj from "../rooms/rooms.js";
import { dataloaded, writeFile } from "../../utils.js";

const phrasesInput = document.querySelector("#phrases-select");
const phrasesDropdown = document.querySelector("#phrases-dropdown");
const clearPhraseBtn = document.querySelector("#clear-phrase-input");
const messageTextarea = document.querySelector("#message");
const categoryFilter = document.querySelector("#phrases-category-filter");
const showFavoritesOnly = document.querySelector("#phrases-favorites-only");

const phrasesAutocompleteObj = {
    allPhrases: [],
    isDropdownOpen: false,
    selectedCategoryFilter: "all",
    favoritesOnly: false,

    init() {
        phrasesInput.addEventListener("input", this.handleInput.bind(this));
        clearPhraseBtn.addEventListener("click", this.clearInput.bind(this));

        // Initialiser les filtres de catégories
        if (categoryFilter) {
            this.initCategoryFilter();
            categoryFilter.addEventListener("change", (e) => {
                this.selectedCategoryFilter = e.target.value;
                this.filterAndDisplayPhrases(phrasesInput.value.trim());
            });
        }

        // Filtre favoris
        if (showFavoritesOnly) {
            showFavoritesOnly.addEventListener("change", (e) => {
                this.favoritesOnly = e.target.checked;
                this.filterAndDisplayPhrases(phrasesInput.value.trim());
            });
        }

        // Écouter les touches pour une meilleure UX
        phrasesInput.addEventListener("keydown", this.handleKeyDown.bind(this));

        // Afficher toutes les phrases au focus
        phrasesInput.addEventListener("focus", this.openDropdown.bind(this));
        phrasesInput.addEventListener("click", this.openDropdown.bind(this));

        // Fermer le dropdown si on clique en dehors
        document.addEventListener("click", (e) => {
            if (
                !phrasesInput.contains(e.target) &&
                !phrasesDropdown.contains(e.target) &&
                !categoryFilter?.contains(e.target) &&
                !showFavoritesOnly?.contains(e.target)
            ) {
                this.closeDropdown();
            }
        });
    },

    initCategoryFilter() {
        if (!categoryFilter) return;

        categoryFilter.textContent = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "all";
        defaultOption.textContent = "📋 Toutes les catégories";
        categoryFilter.appendChild(defaultOption);

        // Récupérer toutes les catégories uniques
        const allCategories = new Set();
        this.allPhrases.forEach((phrase) => {
            if (phrase.category) {
                allCategories.add(phrase.category);
            }
        });

        // Ajouter chaque catégorie unique
        allCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
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
        phrasesDropdown.textContent = "";

        let filteredPhrases = [...this.allPhrases];

        // Filtrer par favoris si demandé
        if (this.favoritesOnly) {
            filteredPhrases = filteredPhrases.filter((p) => p.favorite);
        }

        // Filtrer par catégorie si sélectionnée
        if (this.selectedCategoryFilter !== "all") {
            filteredPhrases = filteredPhrases.filter(
                (p) => p.category === this.selectedCategoryFilter
            );
        }

        // Filtrer par texte de recherche
        if (searchValue) {
            const searchLower = searchValue.toLowerCase();

            const startsWithMatches = filteredPhrases.filter((p) =>
                p.text.toLowerCase().startsWith(searchLower)
            );

            const containsMatches = filteredPhrases.filter(
                (p) =>
                    !p.text.toLowerCase().startsWith(searchLower) &&
                    p.text.toLowerCase().includes(searchLower)
            );

            filteredPhrases = [...startsWithMatches, ...containsMatches];
        }

        // Trier par favoris d'abord, puis par nombre d'utilisations, puis alphabétiquement
        filteredPhrases.sort((a, b) => {
            if (a.favorite !== b.favorite) {
                return b.favorite ? 1 : -1;
            }
            if (a.usageCount !== b.usageCount) {
                return b.usageCount - a.usageCount;
            }
            return a.text.localeCompare(b.text, "fr", { sensitivity: "base" });
        });

        // Limiter à 50 résultats pour les performances
        filteredPhrases = filteredPhrases.slice(0, 50);

        // Afficher les phrases ou un message si aucun résultat
        if (filteredPhrases.length === 0) {
            const noResultDiv = document.createElement("div");
            noResultDiv.className = "phrase-item no-results";
            noResultDiv.textContent = searchValue
                ? "Aucune phrase trouvée"
                : "Aucune phrase enregistrée";
            phrasesDropdown.appendChild(noResultDiv);
        } else {
            // Grouper par catégorie
            const groupedByCategory = {};
            filteredPhrases.forEach((phrase) => {
                const catKey = phrase.category || "_none";
                if (!groupedByCategory[catKey]) {
                    groupedByCategory[catKey] = [];
                }
                groupedByCategory[catKey].push(phrase);
            });

            // Afficher les catégories et phrases
            Object.entries(groupedByCategory).forEach(
                ([categoryId, phrases]) => {
                    // Afficher l'en-tête de catégorie si plusieurs catégories
                    if (
                        Object.keys(groupedByCategory).length > 1 ||
                        this.selectedCategoryFilter === "all"
                    ) {
                        const categoryHeader = document.createElement("div");
                        categoryHeader.className = "phrase-category-header";
                        if (categoryId === "_none") {
                            categoryHeader.textContent = window.i18n
                                ? window.i18n.t("room.noCategory")
                                : "📝 Sans catégorie";
                        } else {
                            // Extraire l'icône si présent (format: "🎯 NomCatégorie")
                            categoryHeader.textContent = categoryId;
                        }
                        phrasesDropdown.appendChild(categoryHeader);
                    }

                    // Afficher les phrases de cette catégorie
                    phrases.forEach((phrase) => {
                        const phraseDiv = document.createElement("div");
                        phraseDiv.className = "phrase-item";

                        if (phrase.favorite) {
                            phraseDiv.classList.add("favorite");
                        }

                        // Créer le contenu de la phrase
                        const phraseContent = document.createElement("div");
                        phraseContent.className = "phrase-content";

                        const phraseText = document.createElement("span");
                        phraseText.className = "phrase-text";
                        phraseText.textContent = phrase.text;

                        // Bouton toggle favori
                        const favoriteBtn = document.createElement("button");
                        favoriteBtn.className = "phrase-favorite-btn";
                        favoriteBtn.textContent = phrase.favorite ? "⭐" : "☆";
                        favoriteBtn.title = phrase.favorite
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris";
                        favoriteBtn.addEventListener("click", (e) => {
                            e.stopPropagation();
                            this.toggleFavorite(phrase);
                        });

                        const phraseMeta = document.createElement("span");
                        phraseMeta.className = "phrase-meta";

                        let metaText = "";
                        if (phrase.usageCount > 0)
                            metaText += `${phrase.usageCount}× `;

                        phraseMeta.textContent = metaText;

                        phraseContent.appendChild(phraseText);
                        const metaContainer = document.createElement("div");
                        metaContainer.className = "phrase-actions";
                        if (metaText) metaContainer.appendChild(phraseMeta);
                        metaContainer.appendChild(favoriteBtn);
                        phraseContent.appendChild(metaContainer);

                        phraseDiv.appendChild(phraseContent);

                        phraseDiv.addEventListener("click", (e) => {
                            // Ne pas sélectionner si on clique sur le bouton favori
                            if (!e.target.closest(".phrase-favorite-btn")) {
                                this.selectPhrase(phrase);
                            }
                        });
                        phrasesDropdown.appendChild(phraseDiv);
                    });
                }
            );
        }

        // Afficher le dropdown
        phrasesDropdown.classList.remove("hidden");
    },

    selectPhrase(phrase) {
        // Insérer la phrase dans le textarea
        messageTextarea.value = phrase.text;

        // Incrémenter le compteur d'utilisation
        phrase.usageCount = (phrase.usageCount || 0) + 1;

        // Sauvegarder les modifications dans dataloaded
        const roomIndex = dataloaded.findIndex(
            (obj) => obj.id === roomsObj.roomId
        );
        if (roomIndex !== -1) {
            const phraseIndex = dataloaded[roomIndex].phrases.findIndex(
                (p) => (typeof p === "string" ? p : p.text) === phrase.text
            );
            if (phraseIndex !== -1) {
                dataloaded[roomIndex].phrases[phraseIndex] = phrase;
            }
        }

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

    toggleFavorite(phrase) {
        phrase.favorite = !phrase.favorite;

        // Sauvegarder dans dataloaded
        const roomIndex = dataloaded.findIndex(
            (obj) => obj.id === roomsObj.roomId
        );
        if (roomIndex !== -1) {
            const phraseIndex = dataloaded[roomIndex].phrases.findIndex(
                (p) => (typeof p === "string" ? p : p.text) === phrase.text
            );
            if (phraseIndex !== -1) {
                dataloaded[roomIndex].phrases[phraseIndex] = phrase;
                writeFile(dataloaded);
            }
        }

        // Rafraîchir l'affichage
        const currentValue = phrasesInput.value.trim();
        this.filterAndDisplayPhrases(currentValue);

        // Recharger le filtre de catégories au cas où
        this.initCategoryFilter();
    },

    loadPhrases(data) {
        // Charger toutes les phrases depuis les données
        let phrases = data.phrases || [];

        // Convertir les anciennes phrases (string) en objets
        this.allPhrases = phrases.map((p) =>
            typeof p === "string"
                ? {
                      text: p,
                      category: null,
                      favorite: false,
                      created: new Date().toISOString(),
                      usageCount: 0,
                  }
                : p
        );

        // Trier les phrases
        this.allPhrases.sort((a, b) => {
            if (a.favorite !== b.favorite) {
                return b.favorite ? 1 : -1;
            }
            if (a.usageCount !== b.usageCount) {
                return b.usageCount - a.usageCount;
            }
            return a.text.localeCompare(b.text, "fr", { sensitivity: "base" });
        });

        // Recharger les catégories disponibles
        this.initCategoryFilter();
    },

    addPhrase(phrase) {
        // Ajouter une nouvelle phrase à la liste
        const phraseObj =
            typeof phrase === "string"
                ? {
                      text: phrase,
                      category: null,
                      favorite: false,
                      created: new Date().toISOString(),
                      usageCount: 0,
                  }
                : phrase;

        const exists = this.allPhrases.some((p) => p.text === phraseObj.text);
        if (!exists) {
            this.allPhrases.push(phraseObj);
            this.allPhrases.sort((a, b) =>
                a.text.localeCompare(b.text, "fr", { sensitivity: "base" })
            );
            // Mettre à jour le dropdown et les filtres
            if (this.isDropdownOpen) {
                const currentValue = phrasesInput.value.trim();
                this.filterAndDisplayPhrases(currentValue);
            }
            this.initCategoryFilter();
        }
    },

    removePhrase(phrase) {
        // Supprimer une phrase de la liste
        const phraseText = typeof phrase === "string" ? phrase : phrase.text;
        const index = this.allPhrases.findIndex((p) => p.text === phraseText);
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
