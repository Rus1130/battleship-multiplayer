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
    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);

    console.log(`client #${userIDs.indexOf(socket.id) + 1} connected`);



    socket.on('messageLogRequest', (data) => {
        let userIDFromSocket = userIDs.indexOf(socket.id) + 1;
        console.log(userIDFromSocket)

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
        messageLog.push(data);
        console.log(`received clientMessageData from client #${data.userID}`);
        if(data.recipient === 'all'){
            io.emit('newMessageData', data);
        } else {
            let recipientSocketID = userIDs[data.recipient - 1];

            io.to(recipientSocketID).emit('newMessageData', data);
            io.to(socket.id).emit('newMessageData', data);
        }

        
        console.log('sent newMessageData to clients')
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


