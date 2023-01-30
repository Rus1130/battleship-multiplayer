const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, () => {
    console.log('Server started');
});


let messageLog = {"0": [
]};

let userIDs = [];

let clients = 0;

function makeConsoleMessage(message){
    let _date = new Date();
    let date = `${_date.getDate()}/${_date.getMonth() + 1}/${_date.getFullYear()}`;
    let time = `${String(_date.getHours()).padStart(2, '0')}:${String(_date.getMinutes()).padStart(2, '0')}:${String(_date.getSeconds()).padStart(2, '0')}`

    let clientMessageData = {
        userID: 'Console',
        message: message,
        time: time,
        date: date,
        roomID: roomID,
    }
}

io.on('connection', (socket) => {
    clients++;
    console.log(`client #${clients} connected`);
    userIDs.indexOf("disconnected") === -1 ? userIDs.push(socket.id) : userIDs[userIDs.findIndex(user => user === "disconnected")] = socket.id;
    io.emit('userIDs', userIDs);


    socket.on('messageLogRequest', (data) => {
        if(messageLog[data] === undefined){
            messageLog[data] = [];
        }


        // FIX
        socket.emit('messageLogResponse', messageLog[data]);
    })

    socket.on('newMessage', (data) => {

        // message code

    })

    socket.on('disconnect', () => {
        console.log(`client #${userIDs.indexOf(socket.id) + 1} disconnected`);
        clients--;
        
        userIDs[userIDs.findIndex(user => user === socket.id)] = "disconnected";
        io.emit('userIDs', userIDs);
    });
});


