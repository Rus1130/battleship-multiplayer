const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "https://Rus1130.github.io'",
        methods: ["GET", "POST"]
    }
});

app.set('port', 3000);
server.listen(3000); 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let userArray = [];

io.on('connection', (socket) => {
    userArray.indexOf("disconnectedUser") === -1 ? userArray.push(socket.id) : userArray[userArray.findIndex(user => user === "disconnectedUser")] = socket.id;

    io.emit('users', userArray);

    socket.on('disconnect', () => {
        userArray[userArray.findIndex(user => user === socket.id)] = "disconnectedUser";

        io.emit('users', userArray);
    });
});