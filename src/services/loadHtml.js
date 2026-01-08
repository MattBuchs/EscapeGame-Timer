function loadHtml(sectionId, fileName) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById(sectionId).innerHTML = xhr.responseText;
        }
    };
    xhr.open("GET", fileName, true);
    xhr.send();
}

loadHtml("header-load", "header.html");
loadHtml("container-room", "main/sectionRoom.html");
loadHtml("container-add_room", "main/sectionAddRoom.html");
loadHtml("global-settings", "main/sectionSettings.html");
loadHtml("update-room", "main/sectionUpdateRoom.html");
loadHtml("license-section", "main/sectionLicense.html");
loadHtml("modal-settings", "modals/modalSettings.html");
loadHtml("modal-utils", "modals/modalUtils.html");
