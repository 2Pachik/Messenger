"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

// Обработчик для приема сообщений
connection.on("ReceivePrivateMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} says ${message}`;
});

// Обработчик для загрузки списка пользователей
connection.on("LoadUsers", function (users) {
    var receiverInput = document.getElementById("users");
    receiverInput.innerHTML = ""; // Очищаем список

    // Добавляем каждого пользователя в список
    users.forEach(function (user) {
        var option = document.createElement("option");
        option.text = user; // Добавляем имя пользователя как текст опции
        receiverInput.appendChild(option); // Добавляем опцию в список
    });
});


// Запуск подключения
connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

// Обработчик для кнопки отправки сообщения
document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value;
    var receiverEmail = document.getElementById("users").value; // Получаем email получателя

    // Вызываем метод SendPrivateMessage на сервере
    connection.invoke("SendPrivateMessage", username, receiverEmail, message).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});
