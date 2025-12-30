import roomsObj from "../rooms/rooms.js";
import { dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import phrasesAutocompleteObj from "./phrasesAutocomplete.js";

const selectDeletePhrase = document.querySelector("#select-delete_phrase");
const deletePhraseForm = document.querySelector("#delete-phrase");

const deletePhrasesObj = {
    init() {
        deletePhraseForm.addEventListener(
            "submit",
            this.deletePhrase.bind(this)
        );
    },

    loadPhrases() {
        const indexRoom = dataloaded.findIndex(
            (el) => el.id === roomsObj.roomId
        );
        const phrases = dataloaded[indexRoom].phrases;

        selectDeletePhrase.options.length = 1;
        phrases.forEach((el) => {
            const option = document.createElement("option");
            const content = document.createTextNode(el);

            option.appendChild(content);
            selectDeletePhrase.appendChild(option);
        });
    },

    deletePhrase(e) {
        e.preventDefault();

        if (selectDeletePhrase.selectedIndex === 0) return;

        const indexRoom = dataloaded.findIndex(
            (el) => el.id === roomsObj.roomId
        );
        const phrases = dataloaded[indexRoom].phrases;
        const optionSelected =
            selectDeletePhrase.options[selectDeletePhrase.selectedIndex];

        const findIndex = phrases.indexOf(optionSelected.textContent);
        dataloaded[indexRoom].phrases.splice(findIndex, 1);

        writeFile(dataloaded);

        // Supprimer de l'autocomplétion
        phrasesAutocompleteObj.removePhrase(optionSelected.textContent);

        this.loadPhrases();
        roomsObj.loadOption();

        notification("La phrase à été supprimé.", "success");
    },
};

export const { loadPhrases } = deletePhrasesObj;
export default deletePhrasesObj;
