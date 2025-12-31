import roomsObj from "../rooms/rooms.js";
import { dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import phrasesAutocompleteObj from "./phrasesAutocomplete.js";

const selectEditPhrase = document.querySelector("#select-edit_phrase");
const editPhraseForm = document.querySelector("#edit-phrase");
const editPhraseFormContainer = document.querySelector("#edit-phrase-form");
const editCategoryInput = document.querySelector("#edit-phrase-category");
const editFavoriteCheckbox = document.querySelector("#edit-phrase-favorite");
const editCategoryDatalist = document.querySelector(
    "#edit-phrase-categories-list"
);
const editIconsContainer = document.querySelector("#edit-category-icons");

// Icônes disponibles (mêmes que dans addPhrases)
const CATEGORY_ICONS = [
    "💡",
    "🎯",
    "⚠️",
    "🎉",
    "📖",
    "⏰",
    "⭐",
    "🔥",
    "💬",
    "🎮",
    "🎨",
    "🎵",
    "🏆",
    "🚀",
    "💰",
    "🔑",
    "🎪",
    "🎭",
    "🎬",
    "📱",
    "💻",
    "🔒",
    "🔓",
    "❓",
    "✅",
    "❌",
    "🎲",
    "🧩",
    "🔍",
    "📍",
    "🎈",
    "🌟",
];

const editPhrasesObj = {
    currentPhrase: null,

    init() {
        selectEditPhrase.addEventListener(
            "change",
            this.selectPhrase.bind(this)
        );
        editPhraseForm.addEventListener("submit", this.saveEdit.bind(this));
        this.initCategoryIcons();
    },

    loadPhrases() {
        const indexRoom = dataloaded.findIndex(
            (el) => el.id === roomsObj.roomId
        );
        const phrases = dataloaded[indexRoom].phrases;

        selectEditPhrase.options.length = 1;
        phrases.forEach((phrase, index) => {
            const option = document.createElement("option");
            const phraseText =
                typeof phrase === "string" ? phrase : phrase.text;
            option.value = index;
            option.textContent = phraseText;
            selectEditPhrase.appendChild(option);
        });

        // Masquer le formulaire d'édition
        editPhraseFormContainer.classList.add("hidden");
    },

    selectPhrase() {
        const selectedIndex = selectEditPhrase.selectedIndex;

        if (selectedIndex === 0) {
            editPhraseFormContainer.classList.add("hidden");
            this.currentPhrase = null;
            return;
        }

        const phraseIndex = selectEditPhrase.options[selectedIndex].value;
        const roomIndex = dataloaded.findIndex(
            (el) => el.id === roomsObj.roomId
        );
        let phrase = dataloaded[roomIndex].phrases[phraseIndex];

        // Convertir en objet si c'est une string
        if (typeof phrase === "string") {
            phrase = {
                text: phrase,
                category: null,
                favorite: false,
                created: new Date().toISOString(),
                usageCount: 0,
            };
            dataloaded[roomIndex].phrases[phraseIndex] = phrase;
        }

        this.currentPhrase = { phrase, roomIndex, phraseIndex };

        // Charger les catégories existantes
        this.loadCategories();

        // Pré-remplir le formulaire
        editCategoryInput.value = phrase.category || "";
        editFavoriteCheckbox.checked = phrase.favorite || false;

        // Afficher le formulaire
        editPhraseFormContainer.classList.remove("hidden");
    },

    loadCategories() {
        if (!editCategoryDatalist) return;

        editCategoryDatalist.innerHTML = "";

        const allCategories = new Set();
        dataloaded.forEach((room) => {
            if (room.phrases) {
                room.phrases.forEach((phrase) => {
                    if (typeof phrase === "object" && phrase.category) {
                        allCategories.add(phrase.category);
                    }
                });
            }
        });

        allCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            editCategoryDatalist.appendChild(option);
        });
    },

    initCategoryIcons() {
        if (!editIconsContainer) return;

        editIconsContainer.innerHTML = "";
        CATEGORY_ICONS.forEach((icon) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "category-icon-btn";
            button.textContent = icon;
            button.title = "Ajouter cet icône";
            button.addEventListener("click", () => {
                if (editCategoryInput) {
                    const currentValue = editCategoryInput.value.trim();
                    const textWithoutEmoji = currentValue.replace(
                        /^[\p{Emoji}]\s*/u,
                        ""
                    );
                    editCategoryInput.value =
                        `${icon} ${textWithoutEmoji}`.trim();
                    editCategoryInput.focus();
                }
            });
            editIconsContainer.appendChild(button);
        });
    },

    saveEdit(e) {
        e.preventDefault();

        if (!this.currentPhrase) return;

        const { phrase, roomIndex, phraseIndex } = this.currentPhrase;

        // Mettre à jour la phrase
        phrase.category = editCategoryInput.value.trim() || null;
        phrase.favorite = editFavoriteCheckbox.checked;

        dataloaded[roomIndex].phrases[phraseIndex] = phrase;

        writeFile(dataloaded);

        // Mettre à jour l'autocomplétion
        phrasesAutocompleteObj.loadPhrases(dataloaded[roomIndex]);

        notification("Phrase mise à jour avec succès !", "success");

        // Réinitialiser
        selectEditPhrase.selectedIndex = 0;
        editPhraseFormContainer.classList.add("hidden");
        this.currentPhrase = null;

        // Recharger la liste
        this.loadPhrases();
    },
};

export default editPhrasesObj;
