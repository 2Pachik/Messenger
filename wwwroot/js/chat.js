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

    scrollToBottom();
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

    scrollToBottom();
});

connection.on("LoadContacts", function (contacts) {
    var contactsContainer = document.getElementById("contactsContainer");
    document.getElementById("show").addEventListener("click", openDialog);

    if (contacts == null) {

    }
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
            var chatHeaderImg = document.getElementById("chatHeaderImg");
            var userNameHeader = document.getElementById("user-header");
            var chatHeader = document.getElementById("chat-header");
            chatHeaderImg.src = contact.avatarPath;
            chatHeaderImg.style.display = 'flex';
            userNameHeader.textContent = button.textContent;
            chatHeader.style.display = "flex";
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
        var username_ = document.createElement("div");

        if (message.email === username) {
            container.classList.add("sent");
        }

        var img = document.createElement("img");
        img.src = message.avatar;
        img.classList.add("avatar");

        if (message.messageType === "text") {
            var messageContainer = document.createElement("div");
            var text = document.createElement("div");
            var time = document.createElement("span");
            if (message.email === username) {
                text.textContent = `${message.content}`;
                text.classList.add("message-content");

                time.style.position = "relative";
                time.style.fontSize = "10px";
                time.style.top = "10px";
                time.style.left = "5px";
                time.style.float = "right";
                time.style.color = "#56b762";
                time.textContent = new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                text.appendChild(time);
                container.appendChild(img);
                container.appendChild(text);
            } else {
                messageContainer.classList.add("message-content-contact");
                username_.textContent = message.displayName;
                username_.style.color = "#3390ec";
                username_.style.fontWeight = "bold";
                messageContainer.appendChild(username_);
                text.textContent = `${message.content}`;
                //text.textContent = `${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
                messageContainer.appendChild(text);

                time.style.position = "relative";
                time.style.fontSize = "10px";
                time.style.top = "10px";
                time.style.left = "5px";
                time.style.float = "right";
                time.style.color = "#9c9fa2";
                time.textContent = new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                text.appendChild(time);

                container.appendChild(img);
                container.appendChild(messageContainer);
            }
        } else if (message.messageType === "file") {
            var fileExtension = message.content.split('.').pop().toLowerCase();
            var isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension);

            if (isImage) {
                var messageContainer = document.createElement("div");
                messageContainer.style.position = "relative";
                messageContainer.style.display = "inline-block";
                var image = document.createElement("img");
                image.src = message.content;
                image.classList.add("message-image");
                if (message.email === username) {
                    image.classList.add("sent");
                    image.style.display = "block";
                    var time = document.createElement("span");
                    time.style.position = "absolute";
                    time.style.fontSize = "10px";
                    time.style.color = "white";
                    time.style.bottom = "5px";
                    time.style.right = "5px";
                    time.style.backgroundColor = "rgb(0, 0, 0, 0.5)"
                    time.style.borderRadius = "5px"
                    time.style.paddingLeft = "3px"
                    time.style.paddingRight = "3px"
                    time.textContent = new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    messageContainer.appendChild(image);
                    messageContainer.appendChild(time);
                    container.appendChild(img);
                    container.appendChild(messageContainer);
                }
                else {
                    var time = document.createElement("span");
                    time.style.position = "relative";
                    time.style.fontSize = "10px";
                    time.style.top = "5px";
                    time.style.textAlign = "right";
                    time.style.color = "#9c9fa2";
                    time.textContent = new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    container.appendChild(img);
                    container.appendChild(image);
                }
            }
            else {
                var messageContainer = document.createElement("div");
                messageContainer.classList.add("message-content");
                messageContainer.style.display = "flex";
                messageContainer.style.alignItems = "center";


            }
        }

        li.appendChild(container);
        messagesList.appendChild(li);

        scrollToBottom();
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

    scrollToBottom();
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

    scrollToBottom();
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
            var chatName = document.getElementById("user-header");
            displayNameElement.textContent = contact.displayName;
            chatName.textContent = contact.displayName;

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

    // show/hide searchIcon
    const searchInput = document.getElementById('search');
    const searchIcon = document.getElementById('searchIcon');

    searchIcon.style.display = 'flex';
    // Hide icon when the search input is focused
    searchInput.addEventListener('focus', function () {
        searchIcon.classList.add('hidden-icon');
        setTimeout(() => {
            searchIcon.style.display = 'none';
        }, 300);            
    });

    // Show icon when the search input loses focus and there's no input
    searchInput.addEventListener('blur', function () {
        searchIcon.style.display = 'flex';
        setTimeout(() => {
            searchIcon.classList.remove('hidden-icon');
        }, 300); 
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
    event.preventDefault();  // Предотвращение стандартного контекстного меню
    const contextMenu = document.querySelector('.context-menu');

    // Проверка цели клика и поднятие до родителя с классом 'contact-button'
    let target = event.target;
    if (target.classList.contains("contact-avatar") || target.classList.contains("contact-name")) {
        target = target.closest(".contact-button");
    }

    if (target && target.classList.contains("contact-button")) {
        // Проверяем, отображается ли меню
        if (contextMenu.classList.contains('show')) {
            // Скрываем с анимацией, затем показываем снова
            contextMenu.classList.replace('show', 'hide');
            setTimeout(() => {
                showContextMenu(event, target, contextMenu);
            }, 100); // Соответствует длительности анимации скрытия
        } else {
            showContextMenu(event, target, contextMenu);
        }
    } else {
        // Скрываем меню, если клик был вне контекста контакта
        contextMenu.classList.replace('show', 'hide');
        setTimeout(() => {
            contextMenu.style.display = 'none';
            contextMenu.classList.remove('hide');
        }, 100);
    }
});

// Функция для отображения контекстного меню
function showContextMenu(event, target, menu) {
    menu.style.display = "block";
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    menu.style.transformOrigin = 'top left'; // Устанавливаем origin для анимации
    menu.classList.remove('hide');
    menu.classList.add('show');

    // Сохранение email контакта в data-атрибуте для последующего использования
    menu.setAttribute("data-email", target.getAttribute("data-email"));
}

// Скрыть контекстное меню при клике в любом другом месте
document.addEventListener("click", function (e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.classList.replace("show", "hide");
        setTimeout(() => {
            contextMenu.style.display = 'none';
            contextMenu.classList.remove('hide');
        }, 100);
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
}
function scrollToBottom() {
    const content = document.querySelector('.content');
    content.scrollTop = content.scrollHeight;
}

//
var localStream;
var peerConnection;
var callTimer;

function ensurePeerConnection() {
    if (!peerConnection) {
        peerConnection = new RTCPeerConnection();
        console.log("Created RTCPeerConnection");

        peerConnection.ontrack = function (event) {
            console.log("Received remote track");
            document.getElementById("remoteVideo").srcObject = event.streams[0];
        };

        peerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                console.log(`Sending ICE candidate: ${JSON.stringify(event.candidate)}`);
                connection.invoke("SendSignal", JSON.stringify({ type: 'candidate', candidate: event.candidate }), currentReceiverEmail).catch(function (err) {
                    console.error(`Error sending ICE candidate: ${err.toString()}`);
                });
            }
        };
    }
}
document.getElementById("startCallButton").addEventListener("click", function () {
    var calleeEmail = currentReceiverEmail;
    console.log(`Starting call to ${calleeEmail}`);
    ensurePeerConnection();
    connection.invoke("StartCall", calleeEmail).catch(function (err) {
        console.error(`Error starting call: ${err.toString()}`);
    });
});

document.getElementById("endCallButton").addEventListener("click", function () {
    var calleeEmail = currentReceiverEmail;
    connection.invoke("EndCall", calleeEmail).catch(function (err) {
        return console.error(err.toString());
    });
});

document.getElementById("muteVideoButton").addEventListener("click", function () {
    if (localStream && localStream.getVideoTracks().length > 0) {
        localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
    }
});

connection.on("IncomingCall", function (callerEmail) {
    if (confirm("Incoming call from " + callerEmail + ". Do you want to answer?")) {
        startCall();
        connection.invoke("AcceptCall", callerEmail).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        connection.invoke("DeclineCall", callerEmail).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

connection.on("CallAccepted", function (calleeEmail) {
    console.log(`Call accepted by ${calleeEmail}`);
    ensurePeerConnection(); // Убедитесь, что peerConnection создан
    startCall();
});

connection.on("CallDeclined", function (calleeEmail) {
    alert("Call declined by " + calleeEmail);
    endCall();
});

connection.on("CallEnded", function (callerEmail) {
    alert("Call ended by " + callerEmail);
    endCall();
});

connection.on("ReceiveSignal", function (senderEmail, signal) {
    console.log(`Received signal from ${senderEmail}: ${signal}`);
    ensurePeerConnection(); // Убедитесь, что peerConnection создан

    var signalData = JSON.parse(signal);
    if (signalData.type === "offer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signalData)).then(() => {
            return peerConnection.createAnswer();
        }).then(answer => {
            return peerConnection.setLocalDescription(answer);
        }).then(() => {
            connection.invoke("SendSignal", JSON.stringify(peerConnection.localDescription), senderEmail).catch(function (err) {
                console.error(`Error sending answer signal: ${err.toString()}`);
            });
        }).catch(function (err) {
            console.error(`Error handling offer: ${err.toString()}`);
        });
    } else if (signalData.type === "answer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signalData)).catch(function (err) {
            console.error(`Error setting remote description from answer: ${err.toString()}`);
        });
    } else if (signalData.type === "candidate") {
        peerConnection.addIceCandidate(new RTCIceCandidate(signalData.candidate)).catch(function (err) {
            console.error(`Error adding received ICE candidate: ${err.toString()}`);
        });
    }
});

function startCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (stream) {
        localStream = stream;
        document.getElementById("localVideo").srcObject = stream;

        peerConnection = new RTCPeerConnection();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = function (event) {
            document.getElementById("remoteVideo").srcObject = event.streams[0];
        };

        peerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                connection.invoke("SendSignal", JSON.stringify({ type: 'candidate', candidate: event.candidate }), currentReceiverEmail).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        };

        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer);
            connection.invoke("SendSignal", JSON.stringify(offer), currentReceiverEmail).catch(function (err) {
                return console.error(err.toString());
            });
        });

        callTimer = setTimeout(function () {
            connection.invoke("CancelCall", currentReceiverEmail).catch(function (err) {
                return console.error(err.toString());
            });
        }, 20000); // 20 секунд ожидания
    }).catch(function (err) {
        console.error("Error accessing media devices.", err);
    });

    document.getElementById("startCallButton").disabled = true;
    document.getElementById("endCallButton").disabled = false;
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    clearTimeout(callTimer);
    document.getElementById("localVideo").srcObject = null;
    document.getElementById("remoteVideo").srcObject = null;

    document.getElementById("startCallButton").disabled = false;
    document.getElementById("endCallButton").disabled = true;
}
