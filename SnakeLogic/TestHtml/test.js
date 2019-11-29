
class World {
  constructor() {
    this.objects = []
}
}

let Snake = class {
  constructor(size, partSize, headPos) {
    for (let i = 0; i < size; i++) {
      let pos = {x: headPos.x - partSize / 3 * i, y: headPos.y}
      let part;
      if (i > size - size / 10) part = new SnakePart(this, i, pos, (size - i + 1) * partSize / (size / 10 + 1), 0)
      else part = new SnakePart(this, i, pos, partSize, 0)
      this.parts.push(part)
    }
    this.headPos = headPos;
  }

  parts = []

  changeDirection(newDir) {
    for (let part of this.parts)
      part.cacheNewDirection(newDir, {x: this.parts[0].pos.x, y: this.parts[0].pos.y})
  }

  nextSlave;
  changeDirectionOnPosition(newDir, pos, nextSlave) {
    // console.log("det:", newDir, pos, nextSlave)
    this.nextSlave = nextSlave;
    for (let part of this.parts)
      part.cacheNewDirection(newDir, pos)
  }

  updateSnake(vel) {
    let res = false;
    for (let part of this.parts){
      let changed = part.updatePosition(vel)
      if (changed) res = true;
    }
    return res;
  }
}

let SnakePart = class {
  constructor(snake, name, startPosition, size, direction) {
      // this.snake = snake;
      this.pos = startPosition;
      this.size = size;
      this.name = name;
      this.dir = direction;
      this.devMax = size / 5;
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
    // console.log('changed')
    this.newDir.shift()
    this.startPos.shift()
    if (this.newDir.length < 1) this.newDirCached = false;
    return true;
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
    let changed = false;
    this.updateDeviation();
    let posX = this.pos.x + vel / 30 * Math.cos(this.dir);
    let posY = this.pos.y + vel / 30 * Math.sin(this.dir);
    if (! this.newDirCached || this.newDirCached && ! this.checkStartPosPassed({x: posX, y: posY}))
      this.pos = {x: posX, y: posY}
    else {
      let r = Math.sqrt((this.pos.x - this.startPos[0].x)**2 + (this.pos.y - this.startPos[0].y)**2)
      this.pos.x += r * Math.cos(this.dir);
      this.pos.y += r * Math.sin(this.dir);
      changed = this.changeDirection()
      this.pos.x += (vel/30-r) * Math.cos(this.dir);
      this.pos.y += (vel/30-r) * Math.sin(this.dir);
    }
    this.timePassed++;
    if (this.name == 0) return changed
  }

  cycleTime = 40;
  updateDeviation() {
    this.deviation = this.devMax * Math.sin((this.timePassed - this.name) * 2 * Math.PI / this.cycleTime)
    if (Math.abs(this.deviation) >= this.devMax) this.devSide *= -1;
  }
}

const drawSnake = function(snake) {
  for (let part of snake.parts)
    drawSnakePartShadow(part)
  for (let part of snake.parts)
    drawSnakePart(part)
}

const drawSnakePartShadow = function(snakePart) {
  z = 1000
  partPosX = snakePart.pos.x + snakePart.deviation * Math.sin(snakePart.dir)
  partPosY = snakePart.pos.y + snakePart.deviation * Math.cos(snakePart.dir)
  verh = (1 + (snakePart.size / 2) / (z - snakePart.size / 2))
  // console.log(partPosX, " ", canvas.width, " ", partPosY)
  r = Math.sqrt((partPosX - canvas.width / 2)**2 + (partPosY - canvas.height / 2)**2)
  t = Math.sqrt(z**2 + r**2) - (snakePart.size / 2) / Math.sin(Math.atan((z - (snakePart.size / 2)) / r))
  l = z * Math.tan(Math.atan((snakePart.size / 2) / t) + Math.atan(r * verh / z)) - r * verh

  ctx.fillStyle = "#333333"
  ctx.beginPath();
  ctx.ellipse(verh * (partPosX - canvas.width / 2) + canvas.width / 2,
              verh * (partPosY - canvas.height / 2) + canvas.height / 2,
              snakePart.size / 2, l, snakePart.dir, 0, 2 * Math.PI);
  ctx.fill();
}

const drawSnakePart = function(snakePart) {
  partPosX = snakePart.pos.x + snakePart.deviation * Math.sin(snakePart.dir)
  partPosY = snakePart.pos.y + snakePart.deviation * Math.cos(snakePart.dir)

  if (snakePart.name % 2 == 1 || snakePart.name == 0) ctx.fillStyle = "#008000";
  else ctx.fillStyle = "#004000";
  ctx.beginPath();
  ctx.arc(partPosX, partPosY, snakePart.size / 2, 0, 2 * Math.PI);
  ctx.fill();

  if (snakePart.name == 0) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(partPosX + snakePart.size / 4 * Math.sin(snakePart.dir),
            partPosY + snakePart.size / 4 * Math.cos(snakePart.dir),
            snakePart.size / 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(partPosX - snakePart.size / 4 * Math.sin(snakePart.dir),
            partPosY - snakePart.size / 4 * Math.cos(snakePart.dir),
            snakePart.size / 6, 0, 2 * Math.PI);
    ctx.fill();
  }
}


var stop = false;
var snake = new Snake(100, 20, {x: 100, y: 100})
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

document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37:
                    str = 'Left Key pressed!';
                    snake.changeDirection(Math.PI);
                    break;
                case 38:
                    str = 'Up Key pressed!';
                    snake.changeDirection(-Math.PI/2);
                    break;
                case 39:
                    str = 'Right Key pressed!';
                    snake.changeDirection(0);
                    break;
                case 40:
                    str = 'Down Key pressed!';
                    snake.changeDirection(Math.PI/2)
                    break;
            }
}

drawCanvas(canvas)
