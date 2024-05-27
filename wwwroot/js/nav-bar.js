"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.querySelector(".navbar-avatar");

    if (avatar) {
        avatar.addEventListener("click", function () {
            document.querySelector("#updateAvatarDialog .close").addEventListener("click", closeAvatarDialog);
        });
    }
});

    function openAvatarDialog() {
    var dialog = document.getElementById("updateAvatarDialog");
    dialog.showModal();
}

    function closeAvatarDialog() {
    var dialog = document.getElementById("updateAvatarDialog");
    dialog.close();
}

    document.getElementById("saveAvatarButton").addEventListener("click", function (event) {
    var avatarInput = document.getElementById("avatarInput");
    var file = avatarInput.files[0];
    if (file) {
        var formData = new FormData();
    formData.append("avatar", file);

    fetch("/upload/avatar", {
        method: "POST",
    body: formData
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
        document.querySelector(".navbar-avatar").src = data.avatarPath;

    // Обновляем все аватарки этого пользователя на странице
    var userId = document.querySelector(".navbar-avatar").dataset.userId;
    var avatarImages = document.querySelectorAll(`img[data-user-id="${userId}"]`);
                    avatarImages.forEach(img => {
        img.src = data.avatarPath;
                    });
                } else {
        alert("Error updating avatar: " + data.error);
                }
            }).catch(error => {
        console.error("Error uploading avatar:", error);
            });
    }
    closeAvatarDialog();
    event.preventDefault();
});
