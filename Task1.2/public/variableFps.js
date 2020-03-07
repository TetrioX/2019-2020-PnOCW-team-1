//socket
var socket = io("http://localhost:3000");

// Knop voor animatie te starten
var button = document.getElementById("startAnimation");
button.addEventListener('click', ()=> {
    socket.emit('startAnimation');
});

// Knop voor animatie te stoppen
var buttonq = document.getElementById("stopAnimation");
buttonq.addEventListener('click', ()=> {
    socket.emit('stopAnimation');
});

// Socket reactie om animatie klaar te maken
var delay, maxFps
socket.on('prepareAnimation', function(data, callback) {
    delay = Date.now() - data.timeSent
    console.log("delay: ", delay);
    prepareAnimation(data.workload);
    stop = false
    callback({
      delay: delay,
      maxFps: maxFps
    })
});

// Socket reactie om animatie te starten
var fps, fpsInterval, startTime, now, then, elapsed;
socket.on('startAnimation', function(data) {
  fpsInterval = 1000 / data.fps;
  then = data.startTime
  startTime = then;
  console.log("Start", data.startTime, " ", Date.now())
  animation = requestAnimationFrame(animate)
});

// Socket reactie om animatie te stoppen
socket.on('stopAnimation', function(data) {
  stop = true
  circles = []
  ctx.clearRect(0, 0, wdth, hght);
});


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
      console.log("StartNu: ", Date.now())
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        var d1 = Date.now();
        draw(fpsInterval);
        var d2 = Date.now();
        // console.log(frameCount, ", workload: ", d2 - d1)
        frameCount++

    }
}

let circles = [];

function Circle(coordinateX, coordinateY, radius, velocityX, velocityY, color) {
    this.posX = coordinateX;
    this.posY = coordinateY;
    this.radius = radius;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color
}

Circle.prototype.update = function (tim) {
    // Draw Circle
    ctx.beginPath();
    ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();

    // if
    if (this.posX - this.radius < 0 || this.posX + this.radius > wdth)
        this.velocityX *= -1;
    if (this.posY - this.radius < 0 || this.posY + this.radius > hght)
        this.velocityY *= -1;

    // x = x0 + v*t
    this.posX += tim * this.velocityX / 1000;
    this.posY += tim * this.velocityY / 1000;
};

function createObjects(amt) {
    for (let i = 0; i < amt; i++) {

        rad = wdth / amt**(1/2);

        posX = (133 * i) % (wdth - 2 * rad) + rad;
        posY = (249 * i) % (hght - 2 * rad) + rad;

        velX = (-1) ** (i % 5) * ((i * 97) % 30);
        velY = (-1) ** (i % 7) * ((i * 43) % 30);

        r = i * 43 % 255;
        g = i * 37 % 255;
        b = i * 13 % 255;
        rgb = `rgb(${r}, ${b}, ${g}, 1)`;

        circle = new Circle(posX, posY, rad, velX, velY, rgb);
        circles.push(circle);
    }
}

function draw(dt) {
    ctx.clearRect(0, 0, wdth, hght);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, wdth, hght);

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        circle.update(dt);
    }
}
