const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "https://battleship-multiplayer.netlify.app'",
        methods: ["GET", "POST"]
    }
});

app.set('port', process.env.PORT || 3000);
server.listen(port); 

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

// fix