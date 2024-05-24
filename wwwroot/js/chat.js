"use strict";

var currentReceiverEmail = null;
var activeContactButton = null;

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";  // Add this line to remove the dot
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} : ${message}`;
});

connection.on("ReceiveFile", function (user, filePath) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";
    var link = document.createElement("a");
    link.href = filePath;
    link.textContent = `${user} sent a file: ${filePath.split('/').pop()}`;
    link.target = "_blank";
    li.appendChild(link);
    document.getElementById("messagesList").appendChild(li);
});

connection.on("LoadContacts", function (contacts) {
    var contactsContainer = document.getElementById("contactsContainer");
    contactsContainer.innerHTML = '<button id="show"><i class="material-icons">add  </i></button>';
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
        if (message.messageType === "text") {
            if (message.email === username) {
                li.textContent = `You : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
            } else {
                li.textContent = `${message.displayName} : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
            }
        } else if (message.messageType === "file") {
            var link = document.createElement("a");
            link.href = message.content;
            link.textContent = `${message.displayName} sent a file: ${message.content.split('/').pop()} (${new Date(message.sentAt).toLocaleTimeString()})`;
            link.target = "_blank";
            li.appendChild(link);
        }
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
    var message = document.getElementById("messageInput").value;
    if (currentReceiverEmail) {
        connection.invoke("SendMessage", currentReceiverEmail, message).catch(function (err) {
            return console.error(err.toString());
        });
        document.getElementById("messageInput").value = ""; // Clear the input
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

document.getElementById("saveDisplayNameButton").addEventListener("click", function (event) {
    var newDisplayName = document.getElementById("newDisplayNameDialogInput").value;
    var contactEmail = document.getElementById("updateDialog").getAttribute("data-email");
    connection.invoke("UpdateContactDisplayName", contactEmail, newDisplayName).catch(function (err) {
        return console.error(err.toString());
    });
    closeUpdateDialog();
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
});
