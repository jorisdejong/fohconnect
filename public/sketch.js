var c1;
var c2;
var c3;
var c4;
var c5;

var player = {};
var button = {};

var players = [];

var cButtons = [];
var colors = [];
var colorPicker;

var tempName;

var socket;

var input;


function setup() {

    createCanvas(windowWidth, windowHeight);
    tempName = "";

    c1 = color(11, 19, 43);
    c2 = color(28, 37, 65);
    c3 = color(58, 80, 107);
    c4 = color(141, 219, 224);
    c5 = color(91, 192, 190);

    player.name = tempName;
    player.c = color(255, 0, 0);
    player.leading = false;

    colorMode(HSB);
    angleMode(DEGREES);

    colorPicker = false;
    for (var i = 0; i < 12; i++) {
        var c = (360 / 12) * i;
        colors.push(color(c, 100, 100));
    }

    colorMode(RGB);
    noStroke();

    socket = io.connect('192.168.1.7:8000');
    socket.on('players', playersUpdated);

    input = createInput();
    input.position((width - 180) / 2, height / 2 + 60);
    input.changed(nameEntered);
}

function nameEntered() {
    player.name = input.value();
    input.hide();
}

function playersUpdated(newPlayers) {

    //loop through the players and only add the ones we don't already have
    //or the main player
    players = [];
    for (var i = 0; i < newPlayers.length; i++) {
        if (newPlayers[i].name != player.name) {
            var newPlayer = {};
            newPlayer.name = newPlayers[i].name;
            newPlayer.leading = newPlayers[i].leading;
            newPlayer.c = color(newPlayers[i].r, newPlayers[i].g, newPlayers[i].b);
            players.push(newPlayer);
        }
    }

}

function drawColorPicker() {
    background(c1);
    var d = min(width, height) / 3;
    cButtons = [];
    for (var i = 0; i < colors.length; i++) {
        fill(colors[i]);
        var c = 360 / colors.length;
        var x = width / 2 + sin(i * c) * d;
        var y = height / 2 - cos(i * c) * d;
        var r = 100;
        ellipse(x, y, r, r);
        var e = { x: x, y: y, r: r, c: colors[i] };
        cButtons.push(e);
    }
}

function draw() {

    background(c1);
    if (player.name === "") {
        background(c2);
        fill(c4);
        textAlign(CENTER);
        textSize(min(height, width) / 20);
        text("What's your name, stranger?", width / 2, height / 2);
        fill(c3);
        text(tempName, width / 2, height / 2 + 100);
    }
    else if (colorPicker) {
        drawColorPicker();
    }
    else {
        writePlayerLine(player, true, 150);

        stroke(c5);
        line(0, 300, width, 300);
        noStroke();

        for (var i = 0; i < players.length; i++) {
            writePlayerLine(players[i], false, 400 + i * 90);
        }
    }
}


function writePlayerLine(aPlayer, main, y) {
    var size = 1;
    if (main)
        size = 1.5;

    var aButton = {};
    aButton.x = 100;
    aButton.y = y;
    aButton.r = 50;
    if (main) {
        aButton.r *= 2;
        button = aButton; //this is used for hit detection
    }
    fill(aPlayer.c);
    ellipse(aButton.x, aButton.y, aButton.r, aButton.r);

    textSize(min(height, width) / 10 * size);

    if (aPlayer.leading)
        fill(c4);
    else
        fill(c3);
    textAlign(LEFT);
    text(aPlayer.name, aButton.x + aButton.r / 2 + 30, int(y + aButton.r / 2.2));
}

function keyPressed() {
    /*
    if (player.name === "") {
        if (keyCode === SHIFT)
        { }
        else
            tempName += key;
        if (keyCode === ENTER) {
            player.name = tempName;
            var data = player;
            socket.emit('player', player);
        }
    }*/
}

function mousePressed() {

    if (!colorPicker) {
        if (dist(mouseX, mouseY, button.x, button.y) < button.r / 2) {
            colorPicker = !colorPicker;
        }
        else if (mouseY < 300)
            player.leading = !player.leading;
    }
    else {
        for (var i = 0; i < cButtons.length; i++) {
            if (dist(mouseX, mouseY, cButtons[i].x, cButtons[i].y) < cButtons[i].r / 2) {
                player.c = colors[i];
                colorPicker = !colorPicker;
            }
        }
    }

    //update the server whenever we pressed the mouse and we have an active player
    if (player.name != "") {
        var data = player;
        socket.emit('player', player);
    }

    //apparently needed to make touch work
    false;
}

function touchStarted() {

}