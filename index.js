const e = require('express');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});


let messageLog = [];
let userIDs = [];

let clients = 0;

io.on('connection', (socket) => {
    clients++;

    setInterval(() => {
        io.emit('refreshUserID', userIDs)
    }, 50)
    

    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);

    console.log(`client #${userIDs.indexOf(socket.id) + 1} connected`);


    socket.on('messageLogRequest', (data) => {
        let userIDFromSocket = userIDs.indexOf(socket.id) + 1;

        let filteredMessageLog = [];
        messageLog.forEach((message) => {
            if(message.recipient == 'all'){
                filteredMessageLog.push(message);
            } else if(message.recipient == userIDFromSocket || message.userID == userIDFromSocket){
                filteredMessageLog.push(message);
            }
        });


        io.to(socket.id).emit('messageLogResponse', filteredMessageLog);
        console.log(`sent message log to client #${userIDs.indexOf(socket.id) + 1}`)
    });


    socket.on('clientMessageData', (data) => {


        let recipientSocketID = userIDs[data.recipient - 1];
        if(recipientSocketID == undefined && data.recipient != 'all'){
            data.flags.invalid = true
            let prematureData = data
            
            io.to(socket.id).emit('newMessageData', prematureData);
            console.log(`Error: client #${data.userID} received flags.invalid`)
        } else {

            if(data.recipient === 'all'){
                io.emit('newMessageData', data);
                console.log('sent newMessageData to all clients')
            } else {
    
                io.to(recipientSocketID).emit('newMessageData', data);
                io.to(socket.id).emit('newMessageData', data);
    
                console.log('sent newMessageData to privileged clients')
            }

            messageLog.push(data);
        }


    });

    socket.on('requestUserIDs', () => {
        io.to(socket.id).emit('userIDsResponse', userIDs);
    })

    socket.on('disconnect', () => {
        clients--;
        
        userIDs[userIDs.findIndex(user => user === socket.id)] = "disconnected";
        io.emit('userIDs', userIDs);
    });
});


