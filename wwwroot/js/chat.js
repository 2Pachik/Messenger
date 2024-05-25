"use strict";

var currentReceiverEmail = null;
var activeContactButton = null;

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.on("ReceiveMessage", function (user, message, avatar) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";  // Add this line to remove the dot
    var container = document.createElement("div");
    container.classList.add("message-container");

    var img = document.createElement("img");
    img.src = avatar;
    img.classList.add("avatar");

    var text = document.createElement("span");
    text.textContent = `${user} : ${message}`;

    container.appendChild(img);
    container.appendChild(text);

    li.appendChild(container);
    document.getElementById("messagesList").appendChild(li);
});

connection.on("ReceiveFile", function (user, filePath, avatar) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";
    var container = document.createElement("div");
    container.classList.add("message-container");

    var img = document.createElement("img");
    img.src = avatar;
    img.classList.add("avatar");

    var fileExtension = filePath.split('.').pop().toLowerCase();
    var isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension);

    if (isImage) {
        var image = document.createElement("img");
        image.src = filePath;
        image.classList.add("message-image");
        container.appendChild(img);
        container.appendChild(image);
    } else {
        var link = document.createElement("a");
        link.href = filePath;
        link.textContent = `${user} sent a file: ${filePath.split('/').pop()}`;
        link.target = "_blank";
        container.appendChild(img);
        container.appendChild(link);
    }

    li.appendChild(container);
    document.getElementById("messagesList").appendChild(li);
});

connection.on("LoadContacts", function (contacts) {
    var contactsContainer = document.getElementById("contactsContainer");
    contactsContainer.innerHTML = '<button id="show">Add friend</button>';
    document.getElementById("show").addEventListener("click", openDialog);
    contacts.forEach(function (contact) {
        var button = document.createElement("button");
        button.className = "contact-button";
        button.textContent = contact.displayName;
        button.onclick = function () {
            loadChatHistory(contact.email);
            currentReceiverEmail = contact.email;
            setActiveContact(button);
        };
        button.oncontextmenu = function (event) {
            event.preventDefault();
            openUpdateDialog(contact.email);
        };
        contactsContainer.appendChild(button);
    });
});

connection.on("ChatHistory", function (messages) {
    var messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";
    messages.forEach(function (message) {
        var li = document.createElement("li");
        li.style.listStyleType = "none";  // Add this line to remove the dot
        var container = document.createElement("div");
        container.classList.add("message-container");

        var img = document.createElement("img");
        img.src = message.avatar;
        img.classList.add("avatar");

        if (message.messageType === "text") {
            var text = document.createElement("span");
            if (message.email === username) {
                text.textContent = `You : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
            } else {
                text.textContent = `${message.displayName} : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
            }
            container.appendChild(img);
            container.appendChild(text);
        } else if (message.messageType === "file") {
            var fileExtension = message.content.split('.').pop().toLowerCase();
            var isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension);

            if (isImage) {
                var image = document.createElement("img");
                image.src = message.content;
                image.classList.add("message-image");
                container.appendChild(img);
                container.appendChild(image);
            } else {
                var link = document.createElement("a");
                link.href = message.content;
                link.textContent = `${message.displayName} sent a file: ${message.content.split('/').pop()} (${new Date(message.sentAt).toLocaleTimeString()})`;
                link.target = "_blank";
                container.appendChild(img);
                container.appendChild(link);
            }
        }

        li.appendChild(container);
        messagesList.appendChild(li);
    });
});

connection.on("ContactAdded", function (contact) {
    alert(`Contact with email ${contact.email} was added successfully`);
});

connection.on("ContactUpdated", function (contact) {
    alert(`Contact display name updated to ${contact.displayName}`);
});

connection.on("Error", function (message) {
    alert(`Error: ${message}`);
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value.trim();
    if (message === "") {
        return; // Prevent sending empty messages
    }
    if (currentReceiverEmail) {
        connection.invoke("SendMessage", currentReceiverEmail, message).catch(function (err) {
            return console.error(err.toString());
        });
        document.getElementById("messageInput").value = ""; // Clear the input
        document.getElementById("sendButton").disabled = true; // Disable the send button
    } else {
        alert("Please select a contact first.");
    }
    event.preventDefault();
});

document.getElementById("uploadButton").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file && currentReceiverEmail) {
        var formData = new FormData();
        formData.append("file", file);
        formData.append("receiverEmail", currentReceiverEmail);

        fetch("/upload", {
            method: "POST",
            body: formData
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("File sent successfully");
                } else {
                    alert("Error sending file: " + data.error);
                }
            }).catch(error => {
                console.error("Error uploading file:", error);
            });
    } else {
        alert("Please select a contact first.");
    }
});

document.getElementById("addContactButton").addEventListener("click", function (event) {
    var email = document.getElementById("contactEmailInput").value;
    connection.invoke("AddContactByEmail", email).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
    closeDialog();
});

function loadChatHistory(contactEmail) {
    connection.invoke("LoadChatHistory", contactEmail).catch(function (err) {
        return console.error(err.toString());
    });
}

function setActiveContact(button) {
    if (activeContactButton) {
        activeContactButton.classList.remove("active-contact");
    }
    activeContactButton = button;
    activeContactButton.classList.add("active-contact");
}

function openDialog() {
    var dialog = document.getElementById("dialog");
    dialog.showModal();
}

function closeDialog() {
    var dialog = document.getElementById("dialog");
    dialog.close();
}

function openUpdateDialog(contactEmail) {
    var dialog = document.getElementById("updateDialog");
    document.getElementById("newDisplayNameDialogInput").value = contactEmail; // Устанавливаем текущее имя в поле ввода
    dialog.setAttribute("data-email", contactEmail);
    dialog.showModal();
}

function closeUpdateDialog() {
    var dialog = document.getElementById("updateDialog");
    dialog.close();
}

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
                    alert("Avatar updated successfully");
                    // Optionally, reload or update the avatar in the UI
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

document.addEventListener("DOMContentLoaded", function () {
    // Отключаем кнопку отправки при загрузке страницы
    document.getElementById("sendButton").disabled = true;

    // Обработчик для включения/выключения кнопки отправки
    document.getElementById("messageInput").addEventListener("input", function () {
        var message = document.getElementById("messageInput").value.trim();
        document.getElementById("sendButton").disabled = message === "";
    });

    document.querySelector("#dialog .close").addEventListener("click", closeDialog);
    document.querySelector("#updateDialog .close").addEventListener("click", closeUpdateDialog);
    document.querySelector("#updateAvatarDialog .close").addEventListener("click", closeAvatarDialog);
});

document.addEventListener("contextmenu", function (event) {
    if (event.target.classList.contains("contact-button")) {
        event.preventDefault();
        openUpdateDialog(event.target.getAttribute("data-email"));
    }
});
