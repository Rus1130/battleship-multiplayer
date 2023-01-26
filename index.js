const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = newServer(server, {
    cors: {
        origin: "https://rus1130.github.io/battleship-multiplayer/",
        methods: ["GET", "POST"]
    }
});

app.set('port', process.env.PORT || 3000);
server.listen(port); 

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