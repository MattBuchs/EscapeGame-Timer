import { dataloaded, writeFile } from "../../utils.js";
import { notification } from "../UI/notification.js";
import roomsObj from "./rooms.js";

const btnDeleteRoom = document.querySelector("#params-delete_room");
const roomsSelect = document.querySelector("#rooms-select");

const deleteRoomsObj = {
	init() {
		this.loadRoomsInSettings();
		btnDeleteRoom.addEventListener("click", this.deleteRoom.bind(this));
	},

	loadRoomsInSettings() {
		roomsSelect.length = 1;

		dataloaded.forEach((room) => {
			const option = document.createElement("option");
			option.textContent = room.name;
			option.value = room.name;

			roomsSelect.appendChild(option);
		});
	},

	deleteRoom() {
		const optionSelected =
			roomsSelect.options[roomsSelect.selectedIndex].value;

		if (optionSelected === "")
			return notification("Veuillez choisir une salle.", "error");

		this.deleteRoomFromJson(optionSelected);
		notification(`Le timer "${optionSelected}" à été supprimé.`, "success");
	},

	deleteRoomFromJson(valueSelectedOption) {
		// Trouver l'index de l'objet avec l'ID donné dans le tableau
		const index = dataloaded.findIndex(
			(obj) => obj.name === valueSelectedOption,
		);

		// Vérifie si l'objet a été trouvé
		if (index !== -1) {
			// Supprime l'objet du tableau
			dataloaded.splice(index, 1);

			// Enregistre le tableau mis à jour dans le fichier JSON
			writeFile(dataloaded);
		}

		this.loadRoomsInSettings();
		roomsObj.loadRooms();
	},
};

export const { loadRoomsInSettings } = deleteRoomsObj;
export default deleteRoomsObj;
