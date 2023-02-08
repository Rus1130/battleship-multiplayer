const app = require('express')();
app.set('trust proxy', true);
const http = require('http').Server(app);
const io = require('socket.io')(http);

let blockConnection = false;

const maintainance = false;

app.get('/', function(req, res){
    if(maintainance) return res.sendFile('/private/serverMaintenance.html', {root: '../'});
    if(blockConnection) return res.sendFile('/private/serverClosed.html', {root: '../'});
    res.sendFile('/public/index.html', {root: '../'});
});

let host = 'localhost';
let port = 3000;

http.listen({
    host: host,
    port: port,
    }, () => {
        console.log(`Server started on ${host}:${port} (${new Date().toLocaleString()})`);
    }
);


let messageLog = [];

let userIDs = [];
let userAliases = {};

let rooms = {
    "Global": {
        type: 'public',
        password: '',
        connectedUsers: 0,
    }
};

let clients = 0;


io.on('connection', (socket) => {
    if(blockConnection) return;
    clients++;
    
    userAliases[socket.id] = socket.id;


    let roomID = 'Global';
    rooms[roomID].connectedUsers++;
    socket.join(roomID);

    let inacTimerAlert = false;

    setInterval(() => {
        io.emit('refreshUserID', userIDs)
        io.to(socket.id).emit("refreshRoomDisplay", [roomID, rooms[roomID].connectedUsers])

        // if there are no clients for 1 hour, close the server
        if(clients === 0){
            if(!inacTimerAlert) console.log(`beginning inactivity timer (${new Date().toLocaleString()})`);
            inacTimerAlert = true;
            setTimeout(() => {
                if(!blockConnection) console.log(`================================ Server closed due to inactivity. ================================ (${new Date().toLocaleString()})`);
                blockConnection = true;
            }, 3600000);
        }
    }, 50);
    

    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);

    console.log(`${socket.id} connected (${new Date().toLocaleString()})`);

    socket.on("sendLocalConsoleMessage", (data) => {
        io.to(socket.id).emit('consoleMessage', data);
    })

    socket.on("sendGlobalConsoleMessage", (data) => {
        io.to(roomID).emit('consoleMessage', data);
    })

    socket.on('switchRoom', (data) => {
        let response;
        if(rooms[data] === undefined){
            response = 'invalidRoomID';
        } else {
            rooms[roomID].connectedUsers--;
            socket.leave(roomID);
            response = rooms[data]
            roomID = data;
            rooms[roomID].connectedUsers++;
            socket.join(roomID);
        }

        io.to(socket.id).emit('roomSwitchResponse', [response, roomID]);
    });

    socket.on('createRoom', (data) => {
        let roomType = data[1]
        let roomPassword = data[2]

        if(rooms[data[0]] !== undefined || data[0] === null){
            io.to(socket.id).emit('roomCreationResponse', 'roomIDTaken');
        } else if(roomType == null || (roomType != 'public' && roomType != 'private')){
            io.to(socket.id).emit('roomCreationResponse', 'invalidRoomType');
        } else if(roomType == 'private' && roomPassword == null){
            io.to(socket.id).emit('roomCreationResponse', 'invalidRoomPassword');
        } else {
            rooms[roomID].connectedUsers--;
            socket.leave(roomID);

            roomID = data[0]
            socket.join(roomID);

            rooms[roomID] = {
                type: roomType,
                password: roomPassword,
                connectedUsers: 0,
            }

            rooms[roomID].connectedUsers++;
        
            io.to(socket.id).emit('roomCreationResponse', roomID);
            io.to(socket.id).emit("refreshRoomDisplay", [roomID, rooms[roomID].connectedUsers])
        }
    })

    socket.on('changeAlias', (data) => {
        // check if there is any other user with the same alias
        let alias = data;
        let userID = socket.id;
        let aliasTaken = false;

        Object.keys(userAliases).forEach((key) => {
            if(userAliases[key] == alias){
                aliasTaken = true;
            }
        });

        if(aliasTaken){
            io.to(socket.id).emit('aliasChangeResponse', 'aliasTaken');
        } else {
            userAliases[userID] = alias;
            io.to(socket.id).emit('aliasChangeResponse', alias);
        }
    })


    socket.on('messageLogRequest', () => {
        let userID = socket.id;
        let filteredMessageLog = [];
        messageLog.forEach((message) => {
            if(message.roomID != roomID) return;
            if(message.recipient == 'all'){
                filteredMessageLog.push(message);
            } else if(message.recipient == userID || message.userID == userID){
                filteredMessageLog.push(message);
            }
        });

        io.to(socket.id).emit('messageLogResponse', filteredMessageLog);
        console.log(`sent messageLog to client ${socket.id} (${new Date().toLocaleString()})`)
    });

    socket.on('printMessageLog', (data) => {
        console.log(`Client ${data} requested message log: (${new Date().toLocaleString()})`);
        console.log(messageLog);
    })

    socket.on("printRoomList", (data) => {
        console.log(`Client ${data} requested room list: (${new Date().toLocaleString()})`);
        console.log(rooms);
    })


    socket.on('clientMessageData', (data) => {
        let recipient = data.recipient;
        let userID = data.userID;

        let prematureData;

        if(data.message === ''){
            data.flags.invalidContent = true
            prematureData = data
            io.to(userID).emit('newMessageData', prematureData);
            console.log(`Error: Client ${data.userID} received flags.invalidContent (${new Date().toLocaleString()})`)

        } else if((recipient == undefined && recipient != 'all') || (recipient == userID)){
            data.flags.invalidRecipient = true
            prematureData = data;
            io.to(socket.id).emit('newMessageData', prematureData);
            console.log(`Error: Client ${data.userID} received flags.invalidRecipient (${new Date().toLocaleString()})`)

        } else {
            if(recipient === 'all'){ 
                io.emit('newMessageData', data);
                console.log(`sent messageData to all clients (${new Date().toLocaleString()})`)
            } else {
    
                io.to(recipient).emit('newMessageData', data);
                io.to(userID).emit('newMessageData', data);
    
                console.log(`sent messageData to privileged clients (${new Date().toLocaleString()})`)
            }

            messageLog.push(data);
        }
    });

    socket.on('requestUserIDs', () => {
        io.to(socket.id).emit('userIDsResponse', userIDs);
    })

    socket.on('disconnect', () => {
        if(blockConnection) return;

        io.to(roomID).emit('consoleMessage', `${userAliases[socket.id]} left.`);

        let userAliasKey = Object.keys(userAliases).find(key => userAliases[key] === socket.id);
        delete userAliases[userAliasKey];


        console.log(`${socket.id} disconnected. (${new Date().toLocaleString()})`);
        clients--;

        
        rooms[roomID].connectedUsers--;

        
        
        userIDs[userIDs.findIndex(user => user === socket.id)] = "disconnected";
        io.emit('userIDs', userIDs);
    });
});


