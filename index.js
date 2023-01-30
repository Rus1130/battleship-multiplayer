const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, () => {
    console.log('Server started');
});


let messageLog = [];
let userIDs = [];

let rooms = {
    "0": {
        type: 'public',
        password: ''
    }
};

let clients = 0;

io.on('connection', (socket) => {
    clients++;

    let roomID = 0;

    setInterval(() => {
        io.emit('refreshUserID', userIDs)
    }, 50)
    

    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);

    console.log(`client #${userIDs.indexOf(socket.id) + 1} connected`);

    socket.on('switchRoom', (data) => {
        let response;
        if(rooms[data] === undefined){
            response = 'invalidRoomID';
        } else {
            response = rooms[data]
            roomID = data;
        }

        io.to(socket.id).emit('roomSwitchResponse', [response, roomID]);
    });

    socket.on('createRoom', (data) => {
        roomID = data[0]
        let roomType = data[1]
        let roomPassword = data[2]

        if(rooms[roomID] !== undefined || roomID === null){
            io.to(socket.id).emit('roomCreationResponse', 'roomIDTaken');
        } else if(roomType == null || (roomType != 'public' && roomType != 'private')){
            io.to(socket.id).emit('roomCreationResponse', 'invalidRoomType');
        } else if(roomType == 'private' && roomPassword == null){
            io.to(socket.id).emit('roomCreationResponse', 'invalidRoomPassword');
        } else {
            rooms[roomID] = {
                type: roomType,
                password: roomPassword
            }
            io.to(socket.id).emit('roomCreationResponse', roomID);
        }
    })


    socket.on('messageLogRequest', (data) => {
        let userIDFromSocket = userIDs.indexOf(socket.id) + 1;

        let filteredMessageLog = [];
        messageLog.forEach((message) => {
            if(message.roomID != roomID) return;
            if(message.recipient == 'all'){
                filteredMessageLog.push(message);
            } else if(message.recipient == userIDFromSocket || message.userID == userIDFromSocket){
                filteredMessageLog.push(message);
            }
        });

        io.to(socket.id).emit('messageLogResponse', filteredMessageLog);
        console.log(`sent messageLog to client #${userIDs.indexOf(socket.id) + 1}`)
    });

    socket.on('printMessageLog', (data) => {
        console.log(`Client #${data[0]} on socketID ${data[1]} requested message log:`, messageLog);
    })


    socket.on('clientMessageData', (data) => {
        let recipientSocketID = userIDs[data.recipient - 1];

        let prematureData;
        if(data.message === ''){
            data.flags.invalidContent = true
            prematureData = data
            io.to(socket.id).emit('newMessageData', prematureData);
            console.log(`Error: client #${data.userID} received flags.invalidContent`)

        } else if((recipientSocketID == undefined && data.recipient != 'all') || (data.recipient == data.userID)){
            data.flags.invalidRecipient = true
            prematureData = data;
            io.to(socket.id).emit('newMessageData', prematureData);
            console.log(`Error: client #${data.userID} received flags.invalidRecipient`)

        } else {
            if(data.recipient === 'all'){ 
                io.emit('newMessageData', data);
                console.log('sent messageData to all clients')
            } else {
    
                io.to(recipientSocketID).emit('newMessageData', data);
                io.to(socket.id).emit('newMessageData', data);
    
                console.log('sent messageData to privileged clients')
            }

            messageLog.push(data);
        }
    });

    socket.on('requestUserIDs', () => {
        io.to(socket.id).emit('userIDsResponse', userIDs);
    })

    socket.on('disconnect', () => {
        console.log(`client #${userIDs.indexOf(socket.id) + 1} disconnected`);
        clients--;
        
        userIDs[userIDs.findIndex(user => user === socket.id)] = "disconnected";
        io.emit('userIDs', userIDs);
    });
});


