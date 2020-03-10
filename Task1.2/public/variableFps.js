//socket
var socket = io("/");
socket.removeAllListeners()

// Knop voor animatie te starten
var button = document.getElementById("startAnimation");
button.addEventListener('click', () => {
    socket.emit('startAnimation');
});

// Knop voor animatie te stoppen
var buttonq = document.getElementById("stopAnimation");
buttonq.addEventListener('click', () => {
    socket.emit('stopAnimation');
});

// keep the latency between the server and slave
var latency = 0;
socket.on('pong', function (ms) {
    latency += Math.min(latency * 6 / 5 + 10, (ms - latency) / 5)
});

// Socket reactie om animatie klaar te maken
var maxFps
socket.on('prepareAnimation', function (data, callback) {
    var clock = Date.now()
    prepareAnimation(data.workload);
    stop = false
    frameCount = 0
    callback({
        lat: latency,
        offset: clock - data.timeSent - latency,
        maxFps: maxFps
    })
});

// Socket reactie om animatie te starten
var fps, fpsInterval, startTime, now, then, elapsed;
socket.on('startAnimation', function(data) {
  fpsInterval = 1000 / data.fps;
  then = data.startTime + data.offset
  startTime = then;
  frameCount = 0
  console.log("Start", then, " ", Date.now())
  animation = requestAnimationFrame(animate)
});

// Socket reactie om animatie te stoppen
socket.on('stopAnimation', function (data) {
    stop = true
    circles = []
    ctx.clearRect(0, 0, wdth, hght);

    var sum = 0;
    for (var i = 0; i < corrections.length; i++) {
        sum += parseInt(corrections[i], 10); //don't forget to add the base
    }

    var avg = sum / corrections.length;

    console.log("Data: ", corrections.length, " ", avg)
    console.log("List: ", corrections)
});

var corrections = []
var framesToCorrect = 0
socket.on('atFrame', function (data) {
    framesToCorrect = Math.round((data.dt + latency) / fpsInterval) - frameCount
    if (framesToCorrect) corrections.push(framesToCorrect)
})


// variables
var fpsGiven = 60;
var amtGiven = 10;


// Static code
var myCanvas = document.getElementById("myCanvas");
var ctx = myCanvas.getContext("2d");
hght = myCanvas.height;
wdth = myCanvas.width;

// initialize the timer variables and start the animation

function prepareAnimation(amtCir) {
    createObjects(amtCir)
    // console.log("circles: ", circles)

    w1 = new Date()
    draw(0)
    w2 = new Date()
    workload = w2 - w1
    maxFps = 1000 / workload
    console.log("workload: ", workload)

}

// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved
var stop = false;
var frameCount = 0;
var results = "#results";
var animation

function animate() {

    // request another frame
    if (!stop) animation = requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        // console.log("StartNu: ", Date.now())
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // var d1 = Date.now();
        draw(fpsInterval);
        // var d2 = Date.now();
        // console.log(frameCount, ", workload: ", d2 - d1)

    }
}

var scaling = 1
var colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000']

function draw(dt) {
    ctx.clearRect(0, 0, wdth, hght);
    // console.log(frameCount)
    // colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000']
    // color = Math.floor(frameCount % 5)
    // ctx.fillStyle = colors[color];
    // ctx.fillRect(0, 0, wdth, hght);

    if (framesToCorrect) {
        console.log("correction: ", framesToCorrect)
        var correctionFactor = framesToCorrect // > 0 ? 1 * scaling : -1 * scaling;
        var correction = correctionFactor
        frameCount += correctionFactor
        framesToCorrect -= correctionFactor
    } else var correction = 0

    for (let i = 0; i < squares.length; i++) {
        let square = squares[i];
        square.draw();
        square.update(1);
        if (correction) square.update(correctionFactor);
    }
    frameCount++
}


var squares = []

function Square(coordinateX, coordinateY, maxSize) {
    this.posX = coordinateX;
    this.posY = coordinateY;
    this.size = 10;
    this.maxSize = maxSize;
    this.updateFactor = 1;
    this.color = "#FF0000"
}

Square.prototype.draw = function () {
    // Draw Circle
    ctx.fillStyle = this.color;
    ctx.fillRect(this.posX, this.posY, this.size, this.size)
};

var newSize
Square.prototype.update = function (frame = 0) {
  console.log(this.size, frame)
    newSize = this.size + frame * this.updateFactor;
    if (newSize > this.maxSize) {
        newSize = 2 * this.maxSize - newSize
        this.updateFactor = -1
    } else if (newSize < 0) {
        newSize = -newSize
        this.updateFactor = 1
    }
    this.size = newSize
};

function createObjects(amt) {
    for (let i = 0; i < 32; i++) {

        rad = wdth / amt ** (1 / 2);

        size = 1500 / 8

        posX = (size * i) % 1500;
        posY = size * Math.floor(i / 8);

        square = new Square(posX, posY, size);
        squares.push(square);
    }
}
