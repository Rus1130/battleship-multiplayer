const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

server.listen(3000, () => {
    console.log('listening on *:3000');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let userArray = [];

io.on('connection', (socket) => {
    userArray.indexOf("disconnected") === -1 ? userArray.push(socket.id) : userArray[userArray.findIndex(user => user === "disconnected")] = socket.id;

    io.emit('users', userArray);

    socket.on('disconnect', () => {
        userArray[userArray.findIndex(user => user === socket.id)] = "disconnected";

        io.emit('users', userArray);
    });
});