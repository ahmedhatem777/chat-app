const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMsg} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

//Socket.io setup
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000;

app.use(express.static(publicDirPath));

//Listening to a predefined/built-in event when a connection is established 'connection'
io.on('connection', (socket) => {
    console.log('New WebSocket connection!');

    //Listening to when a new user joins
    socket.on('join', ({username, room}, callback) => {

        //Adding a new user or sending an error in case of failure
        const {error, user} = addUser({id: socket.id, username, room});
        if(error) return callback(error);

        //Joining the user to his room
        socket.join(user.room);

        //Setting a custom event, which is then listened to in the client-side js file "chat.js"
        socket.emit('message', generateMessage('Room Admin', 'Welcome!'))

        //Broadcasting an event to all sockets except this particular socket that established the connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Room Admin', `${user.username} has joined!`))

        //Sending room data
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        //calling the acknowledgement callback without an error
        callback()

    })

    //Listening to a custom event coming from the client-side js file
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);

        //Using filter to remove profanity
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('No profanity allowed bitch!')
        }

        //emitting the event and the count to all established connections
        io.to(user.room).emit('message', generateMessage(user.username, msg));
        callback('Message was delivered!');
    })

    //Listening to sendLocation event, then emitting it to all connections
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMsg(user.username, `https://google.com/maps?q=${location.lat},${location.long}`));
        callback('Location shared!')
    })

    //Listening to when a socket/connection is closed (built-in event name)
    socket.on('disconnect', () => {
        const users = removeUser(socket.id);
        if(users) {
            io.to(users[0].room).emit('message', generateMessage('Room Admin',`${users[0].username} has left.`));
            io.to(users[0].room).emit('roomData', {
                room: users[0].room,
                users: getUsersInRoom(users[0].room)
            })
        } 
    })
})

server.listen(port, () => console.log('App is running on port ' + port))