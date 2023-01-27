const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
  });

let messageLog = [];
let userIDs = [];

let clients = 0;

io.on('connection', (socket) => {
    clients++;
    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);

    io.to(socket.id).emit('messageLog', messageLog);
    console.log(`sent messageLog to client #${clients}`)

    socket.on('clientMessageData', (data) => {
        messageLog.push(data);
        console.log(`received clientMessageData from client #${data.userID}`);

        io.emit('newMessageData', data);
        console.log('sent newMessageData to all clients')
    });

    socket.on('disconnect', () => {
        clients--;
        
        userIDs[userIDs.findIndex(user => user === socket.id)] = "disconnected";
        io.emit('userIDs', userIDs);
    });
});


