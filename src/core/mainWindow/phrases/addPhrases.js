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
const modalParamsSound = document.querySelector("#modal-params_sound");
const openParamsSound = document.querySelector("#params-sound");
const counterMessage = document.querySelector("#counter-add-phrases");

const addPhrasesObj = {
    init() {
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

    addPhrases() {
        const value = phrases.value.trim();

        if (!value) {
            notification("Veuillez entrer une phrase.", "error");
            return;
        }

        // Trouve l'index de l'objet avec l'ID donné dans le tableau
        const index = dataloaded.findIndex((obj) => obj.id === roomsObj.roomId);

        // Vérifier si la phrase existe déjà
        if (dataloaded[index].phrases.includes(value)) {
            notification("Cette phrase existe déjà.", "warning");
            return;
        }

        dataloaded[index].phrases.push(value);

        writeFile(dataloaded);

        // Ajouter la phrase à l'autocomplétion
        phrasesAutocompleteObj.addPhrase(value);

        phrases.value = "";
        counterMessage.textContent = "0";

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
