var express = require('express');

var app = express();
var server = app.listen(8000, "0.0.0.0");
app.use(express.static('public'));

var players = [];

console.log("My server is running");

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);



function newConnection(socket) {
    console.log('new connection: ' + socket.id);

    socket.on('player', playerUpdated);
    socket.on('disconnect', connectionLost);

    function connectionLost() {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id === socket.id)
                players.splice(i, 1);
        }
        io.sockets.emit('players', players);
    }

    function playerUpdated(data) {
        var playerUpdated = false;
        //loop through the players and see if this one exist yet
        for (var i = 0; i < players.length; i++) {
            if (players[i].name === data.name) {
                players[i].leading = data.leading;
                players[i].r = data.c.levels[0];
                players[i].g = data.c.levels[1];
                players[i].b = data.c.levels[2];
                console.log('player updated!');
                playerUpdated = true;
            }
        }
        if (!playerUpdated) {
            var newPlayer = {};
            newPlayer.id = socket.id;
            newPlayer.name = data.name;
            newPlayer.leading = data.leading;
            newPlayer.r = data.c.levels[0];
            newPlayer.g = data.c.levels[1];
            newPlayer.b = data.c.levels[2];
            players.push(newPlayer);
            console.log('player added!');
        }
        io.sockets.emit('players', players);
    }
}

