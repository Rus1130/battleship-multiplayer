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

let messageLog = [];
let userData = [];



io.on('connection', (socket) => {
    io.to(socket.id).emit('messageLog', messageLog);
    console.log(`sent messageLog to client ${socket.id}`)

    

    socket.on('usernameValidation', (data) => {
        if(userData.includes(data)){
            io.to(socket.id).emit('usernameValidationResponse', false);
        } else {
            io.to(socket.id).emit('usernameValidationResponse', true);
            userData.push(data);
        }
    })

    socket.on('clientMessageData', (data) => {
        messageLog.push(data);
        console.log(`received clientMessageData from client ${socket.id}`);


        io.emit('newMessageData', data);
        console.log('sent newMessageData to all clients')


    });
});
