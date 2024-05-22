"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} : ${message}`;
});

connection.on("LoadContacts", function (contacts) {
    var receiverInput = document.getElementById("users");
    receiverInput.innerHTML = ""; // Очищаем список
    contacts.forEach(function (contact) {
        var option = document.createElement("option");
        option.text = contact; // Добавляем email контакта как текст опции
        option.value = contact; // Добавляем email контакта как значение опции
        receiverInput.appendChild(option); // Добавляем опцию в список
    });
});

connection.on("ChatHistory", function (messages) {
    var messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = ""; // Очищаем список сообщений
    messages.forEach(function (message) {
        var li = document.createElement("li");
        if (message.email == username) {
            li.textContent = `You : ${message.content}`;
        } else {
            li.textContent = `${message.email} : ${message.content}`;
        }
        messagesList.appendChild(li);
    });
});

connection.on("ContactAdded", function (email) {
    alert(`Contact with email ${email} was added successfully`);
    // Перезагрузим список контактов
    connection.invoke("LoadContacts").catch(function (err) {
        return console.error(err.toString());
    });
});

connection.on("Error", function (message) {
    alert(`Error: ${message}`);
});

var selectedChatId; // Переменная для хранения идентификатора выбранного чата

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value;
    var receiverEmail = document.getElementById("users").value; // Получаем email получателя

    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `You : ${message}`;

    connection.invoke("SendMessage", receiverEmail, message).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});

document.getElementById("addContactButton").addEventListener("click", function (event) {
    var email = document.getElementById("contactEmailInput").value;
    connection.invoke("AddContactByEmail", email).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});

document.getElementById("users").addEventListener("change", function (event) {
    var contactEmail = event.target.value;
    connection.invoke("LoadChatHistory", contactEmail).catch(function (err) {
        return console.error(err.toString());
    });
});
