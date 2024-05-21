"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

connection.on("ReceivePrivateMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} : ${message}`;
});

connection.on("LoadData", function (users, messages) {
    var receiverInput = document.getElementById("users");
    receiverInput.innerHTML = ""; // Очищаем список

    var messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = ""; // Очищаем список сообщений

    console.log(users.value);

    users.forEach(function (user) {
        var option = document.createElement("option");
        option.text = user; // Добавляем имя пользователя как текст опции
        receiverInput.appendChild(option); // Добавляем опцию в список
    });

    messages.forEach(function (message) {
        var li = document.createElement("li");
        li.textContent = `${message.sender} : ${message.content}`;
        messagesList.appendChild(li);
    });
});

//connection.on("LoadUsers", function (users) {
//    var receiverInput = document.getElementById("users");
//    receiverInput.innerHTML = ""; // Очищаем список

//    users.forEach(function (user) {
//        var option = document.createElement("option");
//        option.text = user; // Добавляем имя пользователя как текст опции
//        receiverInput.appendChild(option); // Добавляем опцию в список
//    });
//});

//connection.on("LoadMessages", function (messages) {
//    var messagesList = document.getElementById("messagesList");
//    messagesList.innerHTML = ""; // Очищаем список сообщений

//    messages.forEach(function (message) {
//        var li = document.createElement("li");
//        li.textContent = `${message.sender} : ${message.content}`;
//        messagesList.appendChild(li);
//    });
//});

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

    connection.invoke("SendPrivateMessage", username, receiverEmail, message).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});