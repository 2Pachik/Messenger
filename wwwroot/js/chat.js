"use strict";

var currentReceiverEmail = null;
var activeContactButton = null;

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

function clearMsgList() {
    document.getElementById("messagesList").innerHTML = "";
}

connection.on("ReceiveMessage", function (user, message, avatar) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";
    var container = document.createElement("div");
    container.classList.add("message-container");

    if (user === "You") {
        container.classList.add("sent");
    }

    var img = document.createElement("img");
    img.src = avatar;
    img.classList.add("avatar");

    var messageContent = document.createElement("div");

    if (user !== "You") {
        messageContent.classList.add("message-content-contact");
        var username = document.createElement("div");
        username.textContent = user;
        username.style.color = "#469af4";
        username.style.fontWeight = "bold";
        messageContent.appendChild(username);
    } else {
        messageContent.classList.add("message-content");
    }

    var text = document.createElement("div");
    text.textContent = `${message} (${new Date(message.sentAt).toLocaleTimeString()})`;
    messageContent.appendChild(text);

    container.appendChild(img);
    container.appendChild(messageContent);

    li.appendChild(container);
    document.getElementById("messagesList").appendChild(li);
});

connection.on("ReceiveFile", function (user, filePath, avatar) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";
    var container = document.createElement("div");
    container.classList.add("message-container");

    if (user === "You") {
        container.classList.add("sent");
    }

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
        link.textContent = getFileName(filePath);
        link.target = "_blank";
        link.classList.add("message-file");
        container.appendChild(img);
        container.appendChild(link);
    }

    li.appendChild(container);
    document.getElementById("messagesList").appendChild(li);
});

connection.on("LoadContacts", function (contacts) {
    var contactsContainer = document.getElementById("contactsContainer");
    document.getElementById("show").addEventListener("click", openDialog);
    contacts.forEach(function (contact) {
        var button = document.createElement("button");
        button.className = "contact-button";
        button.setAttribute("data-email", contact.email);

        var avatar = document.createElement("img");
        avatar.src = contact.avatarPath; // Используйте полученный путь  напрямую
        avatar.classList.add("contact-avatar");

        var displayName = document.createElement("span");
        displayName.className = "contact-name";
        displayName.textContent = contact.displayName;

        button.appendChild(avatar);
        button.appendChild(displayName);

        button.onclick = function () {
            loadChatHistory(contact.email);
            currentReceiverEmail = contact.email;
            setActiveContact(button);
        };

        contactsContainer.appendChild(button);
    });
});

connection.on("ChatHistory", function (messages) {
    var messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";
    messages.forEach(function (message) {
        var li = document.createElement("li");
        li.style.listStyleType = "none";
        var container = document.createElement("div");
        container.classList.add("message-container");

        if (message.email === username) {
            container.classList.add("sent");
        }

        var img = document.createElement("img");
        img.src = message.avatar;
        img.classList.add("avatar");

        if (message.messageType === "text") {
            var messageContainer = document.createElement("div");
            var username_ = document.createElement("div");
            var text = document.createElement("div");
            if (message.email === username) {
                text.textContent = `${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
                text.classList.add("message-content");
                container.appendChild(img);
                container.appendChild(text);
            } else {
                messageContainer.classList.add("message-content-contact");
                username_.textContent = message.displayName;
                username_.style.color = "#469af4";
                username_.style.fontWeight = "bold";
                messageContainer.appendChild(username_);
                text.textContent = `${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
                messageContainer.appendChild(text);
                container.appendChild(img);
                container.appendChild(messageContainer);
            }
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
                if (message.email === username) {
                    link.textContent = `${message.content.split('/').pop()} (${new Date(message.sentAt).toLocaleTimeString()})`;
                } else {
                    link.textContent = `${message.displayName} : ${message.content.split('/').pop()} (${new Date(message.sentAt).toLocaleTimeString()})`;
                }
                link.target = "_blank";
                link.classList.add("message-file");
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
    var contactsContainer = document.getElementById("contactsContainer");
    var button = document.createElement("button");
    button.className = "contact-button";
    button.setAttribute("data-email", contact.email);

    var avatar = document.createElement("img");
    avatar.src = contact.avatarPath;
    avatar.classList.add("contact-avatar");

    var displayName = document.createElement("span");
    displayName.className = "contact-name";
    displayName.textContent = contact.displayName;

    button.appendChild(avatar);
    button.appendChild(displayName);

    button.onclick = function () {
        loadChatHistory(contact.email);
        currentReceiverEmail = contact.email;
        setActiveContact(button);
    };

    contactsContainer.appendChild(button);
});

connection.on("AvatarUpdated", function (contact) {
    alert(`Avatar updated for ${contact.email}`);
    var contactButtons = document.querySelectorAll(".contact-button");
    contactButtons.forEach(function (button) {
        if (button.getAttribute("data-email") === contact.email) {
            var avatar = button.querySelector(".contact-avatar");
            avatar.src = contact.avatarPath;
        }
    });

    if (contact.email === currentReceiverEmail) {
        var messageAvatars = document.querySelectorAll(".message-container .avatar");
        messageAvatars.forEach(function (img) {
            if (img.src.includes(contact.avatarPath)) {
                img.src = contact.avatarPath;
            }
        });
    }
});

connection.on("ContactDeleted", function (contactEmail) {
    let buttons = document.querySelectorAll(".contact-button");
    buttons.forEach(function (button) {
        if (button.getAttribute("data-email") === contactEmail) {
            button.parentNode.removeChild(button);
            clearMsgList();
        }
    });
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

function getFileName(filePath) {
    var lastSlashIndex = filePath.lastIndexOf('/');

    // +1 для того, чтобы начать с символа после последнего слэша
    var fileName = filePath.substring(lastSlashIndex + 1);

    return fileName;
};


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
    document.getElementById("newDisplayNameDialogInput").value = contactEmail; // Should be current display name
    dialog.setAttribute("data-email", contactEmail);
    dialog.showModal();
}

function closeUpdateDialog() {
    var dialog = document.getElementById("updateDialog");
    dialog.close();
}

connection.on("ContactUpdated", function (contact) {
    updateContactDisplayName(contact);
});

function updateContactDisplayName(contact) {
    var contactButtons = document.querySelectorAll(".contact-button");
    contactButtons.forEach(function (button) {
        if (button.getAttribute("data-email") === contact.email) {
            var displayNameElement = button.querySelector(".contact-name");
            displayNameElement.textContent = contact.displayName;

            loadChatHistory(contact.email);
        }
    });
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

    const contactField = document.getElementById("contacts-field");
    const fixedButton = document.getElementById("show");

    contactField.addEventListener("mouseenter", function () {
        fixedButton.classList.add("no-hidden");
    });

    contactField.addEventListener("mouseleave", function () {
        fixedButton.classList.remove("no-hidden");
    });
});

// Удаление старого обработчика контекстного меню
document.removeEventListener("contextmenu", function (event) {
    if (event.target.classList.contains("contact-button")) {
        event.preventDefault();
        openUpdateDialog(event.target.getAttribute("data-email"));
    }
});

// Добавление нового контекстного меню
const contextMenu = document.getElementById("contextMenu");

document.addEventListener("contextmenu", function (event) {
    let target = event.target;

    // Проверяем, был ли клик на аватарке или имени контакта, и поднимаемся до родителя с классом 'contact-button'
    if (target.classList.contains("contact-avatar") || target.classList.contains("contact-name")) {
        target = target.closest(".contact-button");
    }

    if (target && target.classList.contains("contact-button")) {
        event.preventDefault();
        contextMenu.style.display = "block";
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;

        // Сохраняем email контакта в data-атрибуте для последующего использования
        contextMenu.setAttribute("data-email", target.getAttribute("data-email"));
    } else {
        contextMenu.style.display = "none";
    }
});


// Скрыть контекстное меню при клике в любом другом месте
document.addEventListener("click", function (e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = "none";
    }
});

document.getElementById("editName").addEventListener("click", function () {
    const email = contextMenu.getAttribute("data-email");
    openUpdateDialog(email);
    contextMenu.style.display = "none";
});

document.getElementById("deleteContact").addEventListener("click", function () {
    const email = contextMenu.getAttribute("data-email");
    if (confirm("Are you sure you want to delete this contact?")) {
        connection.invoke("DeleteContactByEmail", email).catch(function (err) {
            return console.error(err.toString());
        });
    }
    contextMenu.style.display = "none";
});

function filterContacts() {
    var input = document.getElementById("search");
    var filter = input.value.toLowerCase();
    var contacts = document.getElementById("contactsContainer").getElementsByClassName("contact-button");

    for (var i = 0; i < contacts.length; i++) {
        var contactName = contacts[i].getElementsByClassName("contact-name")[0].textContent;
        if (contactName.toLowerCase().indexOf(filter) > -1) {
            contacts[i].style.display = "";
        } else {
            contacts[i].style.display = "none";
        }
    }

    // Добавляем/удаляем класс active в зависимости от наличия текста в поле ввода
    var searchContainer = document.getElementById("searchContainer");
    if (filter.length > 0) {
        searchContainer.classList.add("active");
    } else {
        searchContainer.classList.remove("active");
    }
}
