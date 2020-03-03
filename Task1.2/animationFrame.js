
  // variables
  var fpsGiven = 30
  var amtGiven = 100

  // Static code
  var myCanvas = document.getElementById("myCanvas");
  var ctx = myCanvas.getContext("2d");
  hght = myCanvas.height
  wdth = myCanvas.width
  src = 0

  var stop = false;
  var frameCount = 0;
  var results = "#results";
  var fps, fpsInterval, startTime, now, then, elapsed;


  // initialize the timer variables and start the animation

  function startAnimating(fps, amtCir) {
      fpsInterval = 1000 / fps;
      then = Date.now();
      startTime = then;
      createCircles(amtCir)
  }

  // the animation loop calculates time elapsed since the last loop
  // and only draws if your specified fps interval is achieved

  function animate() {

      // request another frame
      requestAnimationFrame(animate);

      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - then;

      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {
          // Get ready for next frame by setting then=now, but also adjust for your
          // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
          then = now - (elapsed % fpsInterval);

          draw(fpsInterval)

      }
  }

  let circles = new Array()

  function Circle (coordinateX, coordinateY, radius, velocityX, velocityY, color) {
    this.posX = coordinateX
    this.posY = coordinateY
    this.radius = radius
    this.velocityX = velocityX
    this.velocityY = velocityY
    this.color = color
  }

  Circle.prototype.update = function(tim) {
    // Draw Circle
    ctx.beginPath();
	  ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
	  ctx.closePath();
	  ctx.fillStyle = this.color;
	  ctx.fill();

    // if
    if (this.posX - this.radius <= 0 || this.posX + this.radius >= wdth)
      this.velocityX *= -1
    if (this.posY - this.radius <= 0 || this.posY + this.radius >= hght)
      this.velocityY *= -1

    // x = x0 + v*t
    this.posX += tim * this.velocityX / 1000
    this.posY += tim * this.velocityY / 1000
  }

  function createCircles(amt){
    for (let i = 0; i < amt; i++) {

      posX = (133 * i) % wdth
      posY = (249 * i) % hght

      velX = (-1)**(i % 5) * ((i * 97) % 30)
      velY = (-1)**(i % 7) * ((i * 43) % 30)

      rad = wdth / amt

      r = i * 43 % 255
      g = i * 37 % 255
      b = i * 13 % 255
      rgb = `rgb(${r}, ${b}, ${g}, 1)`

      circle = new Circle(posX, posY, rad, velX, velY, rgb)
      circles.push(circle)
      console.log(circles)
    }

    requestAnimationFrame(animate);
  }

  function draw(delay) {
  	ctx.clearRect(0, 0, wdth, hght);
    ctx.fillStyle = '#FFFFFF';
  	ctx.fillRect(0, 0, wdth, hght);

  	for (let i = 0; i < circles.length; i++) {
  		let circle = circles[i];
  		circle.update(delay);
  	}
  }

startAnimating(fpsGiven, amtGiven)
