"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    li.style.listStyleType = "none";  // Add this line to remove the dot
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} : ${message}`;
});

connection.on("LoadContacts", function (contacts) {
    var receiverInput = document.getElementById("users");
    receiverInput.innerHTML = "";
    contacts.forEach(function (contact) {
        var option = document.createElement("option");
        option.text = contact.displayName;
        option.value = contact.email;
        receiverInput.appendChild(option);
    });
});

connection.on("ChatHistory", function (messages) {
    var messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";
    messages.forEach(function (message) {
        var li = document.createElement("li");
        li.style.listStyleType = "none";  // Add this line to remove the dot
        if (message.email == username) {
            li.textContent = `You : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
        } else {
            li.textContent = `${message.displayName} : ${message.content} (${new Date(message.sentAt).toLocaleTimeString()})`;
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

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value;
    var receiverEmail = document.getElementById("users").value;
    connection.invoke("SendMessage", receiverEmail, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

function loadChatHistory() {
    var contactEmail = document.getElementById("users").value;
    connection.invoke("LoadChatHistory", contactEmail).catch(function (err) {
        return console.error(err.toString());
    });
}