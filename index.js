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

io.on('connection', (socket) => {
    socket.on('clientMessageData', (data) => {
        console.log('received clientMessageData from client');
        io.emit('newMessageData', data);
        console.log('sent newMessageData to all clients')
    });
});
