
class Snake {
  constructor(size, partSize, headPos) {
    for (let i = 0; i < size; i++) {
      let pos = {x: headPos.x - partSize / 3 * i, y: headPos.y}
      let part = new SnakePart(this, i, pos, partSize, 0)
      this.parts.push(part)
    }
    this.headPos = headPos;
  }

  parts = []

  changeDirection(newDir) {
    for (let part of this.parts)
      part.cacheNewDirection(newDir, {x: this.parts[0].pos.x, y: this.parts[0].pos.y})
  }

  updateSnake(vel) {
    for (let part of this.parts)
      part.updatePosition(vel)
  }
}

class SnakePart {
  constructor(snake, name, startPosition, size, direction) {
      this.snake = snake;
      this.pos = startPosition;
      this.size = size;
      this.name = name;
      this.dir = direction;
      this.devMax = size / 6
      this.deviation = 0;
      this.devSide = 1;
  }

  newDir = [];
  startPos = [];
  newDirCached = false;
  cacheNewDirection(newDir, startPos) {
    this.newDir.push(newDir);
    this.startPos.push(startPos);
    this.newDirCached = true;
  }

  changeDirection() {
    this.dir = this.newDir[0];
    this.newDir.shift()
    this.startPos.shift()
    if (this.newDir.length < 1) this.newDirCached = false;
  }

  checkStartPosPassed(pos) {
    // console.log("check", this.name, " ", this.dir, " ", this.pos, " ", this.startPos)
    if (this.dir >= 0 && this.dir < Math.PI / 2 && pos.x >= this.startPos[0].x && pos.y >= this.startPos[0].y)
      return true;
    else if (this.dir >= Math.PI / 2 && this.dir <= Math.PI && pos.x <= this.startPos[0].x && pos.y >= this.startPos[0].y)
      return true;
    else if (this.dir >= - Math.PI / 2 && this.dir < 0 && pos.x >= this.startPos[0].x && pos.y <= this.startPos[0].y)
      return true;
    else if (this.dir >= - Math.PI && this.dir < - Math.PI / 2 && pos.x <= this.startPos[0].x && pos.y <= this.startPos[0].y)
      return true;
    else return false;
  }

  // 30 fps
  timePassed = 0;
  updatePosition(vel) {
    this.updateDeviation();
    let posX = this.pos.x + vel / 30 * Math.cos(this.dir);
    let posY = this.pos.y + vel / 30 * Math.sin(this.dir);
    if (! this.newDirCached || this.newDirCached && ! this.checkStartPosPassed({x: posX, y: posY}))
      this.pos = {x: posX, y: posY}
    else {
      let r = Math.sqrt((this.pos.x - this.startPos[0].x)**2 + (this.pos.y - this.startPos[0].y)**2)
      this.pos.x += r * Math.cos(this.dir);
      this.pos.y += r * Math.sin(this.dir);
      this.changeDirection()
      this.pos.x += (vel/30-r) * Math.cos(this.dir);
      this.pos.y += (vel/30-r) * Math.sin(this.dir);
    }
    this.timePassed++;
  }

  cycleTime = 50;
  prevDev = 0;
  updateDeviation() {
    this.prevDev = this.deviation;
    if (this.name == 0) {
      this.deviation = this.devMax * Math.sin(this.timePassed * 2 * Math.PI / this.cycleTime)
      if (Math.abs(this.deviation) >= this.devMax) this.devSide *= -1;
    }
    else this.deviation = this.snake.parts[this.name - 1].prevDev;
  }
}

const drawSnake = function(snake) {
  for (let part of snake.parts)
    drawSnakePart(part)
}

const drawSnakePart = function(snakePart) {
  if (snakePart.name % 2 == 1 || snakePart.name == 0) ctx.fillStyle = "#008000";
  else ctx.fillStyle = "#004000";
  ctx.beginPath();
  ctx.arc(snakePart.pos.x + snakePart.deviation * Math.sin(snakePart.dir) , snakePart.pos.y + snakePart.deviation * Math.cos(snakePart.dir),
    snakePart.size / 2, 0, 2 * Math.PI);
  ctx.fill();

  if (snakePart.name == 0) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(snakePart.pos.x + snakePart.size / 4 * Math.sin(snakePart.dir) + snakePart.deviation * Math.sin(snakePart.dir), snakePart.pos.y + snakePart.size / 4 * Math.cos(snakePart.dir) + snakePart.deviation * Math.cos(snakePart.dir),
      snakePart.size / 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(snakePart.pos.x - snakePart.size / 4 * Math.sin(snakePart.dir) + snakePart.deviation * Math.sin(snakePart.dir), snakePart.pos.y - snakePart.size / 4 * Math.cos(snakePart.dir) + snakePart.deviation * Math.cos(snakePart.dir),
      snakePart.size / 6, 0, 2 * Math.PI);
    ctx.fill();
  }
}


var stop = false;
// var snakePart = new SnakePart(0, {x: 5, y: 5}, 10, 0)
var snake = new Snake(100, 30, {x: 15, y: 15})
console.log(snake.parts)

var leftButton = document.getElementById('Left');
var upButton = document.getElementById('Up');
var rightButton = document.getElementById('Right');
var downButton = document.getElementById('Down');
var stopButton = document.getElementById('Stop');

const drawCanvas = function(canvas) {
  ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake(snake);
  snake.updateSnake(100)
  // console.log(snake)
  if (!stop) setTimeout(drawCanvas, 100/3, canvas);
}

stopButton.addEventListener('click',function(){
  stop = stop ? false : true;
})

leftButton.addEventListener('click',function(){
  snake.changeDirection(Math.PI)
})

rightButton.addEventListener('click',function(){
  snake.changeDirection(0)
})

upButton.addEventListener('click',function(){
  snake.changeDirection(-Math.PI/2)
})

downButton.addEventListener('click',function(){
  snake.changeDirection(Math.PI/2)
})

drawCanvas(canvas)
