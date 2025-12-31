import roomsObj from "../rooms/rooms.js";
import { openModal, closeModal, dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import phrasesAutocompleteObj from "./phrasesAutocomplete.js";

const containerRoom = document.querySelector("#container-room");
const btnAddPhrases = document.querySelector("#btn-add_phrases");
const modalAddPhrases = document.querySelector("#modal-add_phrases");
const modalContent = document.querySelector("#modal-add_phrases__content");
const btnCloseModal = document.querySelector("#close-modal_addphrases");
const btnValidate = document.querySelector("#btn-validate_addphrases");
const phrases = document.querySelector("#add-phrases");
const categoryInput = document.querySelector("#phrase-category");
const favoriteCheckbox = document.querySelector("#phrase-favorite");
const modalParamsSound = document.querySelector("#modal-params_sound");
const openParamsSound = document.querySelector("#params-sound");
const counterMessage = document.querySelector("#counter-add-phrases");
const categoryDatalist = document.querySelector("#phrase-categories-list");
const iconButtonsContainer = document.querySelector("#category-icons");

// Icônes disponibles pour les catégories
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

const addPhrasesObj = {
    init() {
        // Initialiser le select des catégories
        this.initCategorySelect();
        // Initialiser les icônes
        this.initCategoryIcons();

        btnAddPhrases.addEventListener("click", () => {
            openModal(
                containerRoom,
                modalAddPhrases,
                modalContent,
                modalParamsSound,
                btnAddPhrases,
                openParamsSound
            );
        });
        btnCloseModal.addEventListener("click", () =>
            closeModal(modalAddPhrases, btnAddPhrases)
        );
        modalAddPhrases.addEventListener("click", () =>
            closeModal(modalAddPhrases, btnAddPhrases)
        );
        btnValidate.addEventListener("click", this.addPhrases.bind(this));
        phrases.addEventListener("input", this.updatePhrases.bind(this));

        // Initialiser l'autocomplétion
        phrasesAutocompleteObj.init();
    },

    initCategorySelect() {
        if (!categoryDatalist) return;

        // Vider la datalist
        categoryDatalist.innerHTML = "";

        // Récupérer toutes les catégories uniques de toutes les phrases
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

        // Ajouter chaque catégorie unique à la datalist
        allCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            categoryDatalist.appendChild(option);
        });
    },

    initCategoryIcons() {
        if (!iconButtonsContainer) return;

        iconButtonsContainer.innerHTML = "";
        CATEGORY_ICONS.forEach((icon) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "category-icon-btn";
            button.textContent = icon;
            button.title = "Ajouter cet icône";
            button.addEventListener("click", () => {
                if (categoryInput) {
                    // Ajouter l'icône au début du texte s'il n'y en a pas déjà
                    const currentValue = categoryInput.value.trim();
                    // Supprimer l'ancien emoji s'il existe
                    const textWithoutEmoji = currentValue.replace(
                        /^[\p{Emoji}]\s*/u,
                        ""
                    );
                    categoryInput.value = `${icon} ${textWithoutEmoji}`.trim();
                    categoryInput.focus();
                }
            });
            iconButtonsContainer.appendChild(button);
        });
    },

    addPhrases() {
        const value = phrases.value.trim();

        if (!value) {
            notification("Veuillez entrer une phrase.", "error");
            return;
        }

        // Trouve l'index de l'objet avec l'ID donné dans le tableau
        const index = dataloaded.findIndex((obj) => obj.id === roomsObj.roomId);

        // Créer l'objet phrase avec métadonnées
        const category = categoryInput ? categoryInput.value.trim() : "";
        const phraseObj = {
            text: value,
            category: category || null,
            favorite: favoriteCheckbox ? favoriteCheckbox.checked : false,
            created: new Date().toISOString(),
            usageCount: 0,
        };

        // Initialiser le tableau phrases s'il n'existe pas ou convertir anciennes phrases
        if (!dataloaded[index].phrases) {
            dataloaded[index].phrases = [];
        } else {
            // Convertir les anciennes phrases (string) en objets
            dataloaded[index].phrases = dataloaded[index].phrases.map((p) =>
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
        }

        // Vérifier si la phrase existe déjà (comparer le texte uniquement)
        const phraseExists = dataloaded[index].phrases.some(
            (p) => (typeof p === "string" ? p : p.text) === value
        );
        if (phraseExists) {
            notification("Cette phrase existe déjà.", "warning");
            return;
        }

        dataloaded[index].phrases.push(phraseObj);

        writeFile(dataloaded);

        // Ajouter la phrase à l'autocomplétion
        phrasesAutocompleteObj.addPhrase(phraseObj);

        phrases.value = "";
        counterMessage.textContent = "0";
        if (categoryInput) categoryInput.value = "";
        if (favoriteCheckbox) favoriteCheckbox.checked = false;

        // Recharger la datalist
        this.initCategorySelect();

        closeModal(modalAddPhrases, btnAddPhrases);
        notification("La phrase a été ajoutée au timer.", "success");
    },

    loadOption(data) {
        // Charger les phrases dans le système d'autocomplétion
        phrasesAutocompleteObj.loadPhrases(data);
    },

    updatePhrases() {
        counterMessage.textContent = phrases.value.length;
    },
};

export default addPhrasesObj;
