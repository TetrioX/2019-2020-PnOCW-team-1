
/********************
  * World elements *
 ********************/
let World = class {
 constructor(dim) {
   this.dimensions = dim
   this.objects = {};
   this.deadObjects = {};
   this.Id = 0;
 }

 addSnake(snake, Id = this.Id) {
   this.objects[Id] = snake;
 }

 killSnake(snakeId) {
   this.deadObjects[snakeId] = this.objects[snakeId];
   delete this.objects[snakeId];
 }

 checkCollision() {
   let colObj = []
   for (let snakeId in this.objects)
     for (let otherId in this.objects) {
       if (collision.snakeOutOfBounds(this.objects[snakeId], this.dimensions)
         || snakeId == otherId && collision.snakeCollidesWithItself(this.objects[snakeId])
         || snakeId != otherId && collision.snakeCollidesWithOther(this.objects[snakeId], this.objects[otherId]))
           colObj.push(snakeId)
      }
   return colObj
 }

 updateWorld(vel) {
   for (let snakeId in this.objects)
     this.objects[snakeId].updateSnake(vel, this.dimensions)
   let collided = this.checkCollision();
   for (let snakeId of collided)
     this.killSnake(snakeId)
 }
}

/*************************
  * Collision Detection *
 *************************/
const snakeOutOfBounds = function(snake, dimensions) {
 pos = snake.headPos
 return pos.x < 0 || pos.y < 0 || pos.x > dimensions.x || pos.y > dimensions.y
}

const snakeCollidesWithItself = function(snake){
 return snake.parts.length > 5 && snakeCollidesWith(snake.parts[0], snake.parts.slice(5, snake.length))
}

const snakeCollidesWithOther = function(snake, otherSnake) {
 return snakeCollidesWith(snake.parts[0], otherSnake.parts)
}

const snakeCollidesWith = function(object, snakeParts) {
 for (let part of snakeParts)
   if (collidesWith(part, object))
     return true;
 return false;
}

const collidesWith = function(A, B) {
 return distanceBetween(A.pos, B.pos) <= A.size/2 + B.size/2
}

const distanceBetween = function(pos1, pos2) {
 return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
}



/********************
  * Snake elements *
 ********************/

let Snake = class {

  constructor(snakeId, length, radius, startPos){
    this.Id = snakeId;
    this.len = length;
    this.rad = radius;
    this.spos = new Point(startPos, 0)
    this.epos = new Point({x: startPos.x - length, y: startPos.y}, 0)
  }

  rotPoints = []
  changeHeadDirection(newDir){
    let rotPoint = new Point({x: this.spos.pos.x, y: this.spos.pos.y}, newDir);
    this.rotPoints.push(rotPoint);
    this.spos.dir = newDir;
  }

  changeTailDirection(){
    this.epos.dir = this.rotPoints[0].dir;
    this.rotPoints.shift();
  }

  checkRotPosWillBePassed(checkDis) {
    return this.rotPoints.length != 0
        && distanceBetween(this.epos.pos, this.rotPoints[0].pos) <= checkDis
  }

  updateSnake(vel = 20, fps = 60) {
    let dis = vel / fps;
    this.spos.updatePos(dis)

    if (this.checkRotPosWillBePassed(dis)) {
      let rdis = dis - distanceBetween(this.epos.pos, this.rotPoints[0].pos);
      this.epos.pos = this.rotPoints[0].pos;
      this.changeTailDirection();
      this.epos.updatePos(rdis);
    }
    else this.epos.updatePos(dis);

    console.log(this.rotPoints)
  }
}

let Point = class {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;
  }

  updatePos(dis){
    this.pos.x += dis * Math.cos(this.dir);
    this.pos.y += dis * Math.sin(this.dir);
  }
}

/*******************
  * Snake Drawing *
 *******************/

const drawSnake = function(snake) {
  ctx.fillStyle = 'black';
  ctx.lineWidth = 0;

  ctx.beginPath();
  ctx.arc(snake.spos.pos.x, snake.spos.pos.y, snake.rad, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill()
  if (snake.rotPoints.length > 0)
    for (let rPoint of snake.rotPoints){
      ctx.beginPath();
      ctx.arc(rPoint.pos.x, rPoint.pos.y, snake.rad, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill()
    }
  ctx.beginPath();
  ctx.arc(snake.epos.pos.x, snake.epos.pos.y, snake.rad, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill()

  ctx.lineWidth = snake.rad * 2;

  ctx.beginPath();
  ctx.moveTo(snake.spos.pos.x, snake.spos.pos.y);
  if (snake.rotPoints.length > 0)
    for (let i = snake.rotPoints.length - 1; i > -1 ; i--)
      ctx.lineTo(snake.rotPoints[i].pos.x, snake.rotPoints[i].pos.y);
  ctx.lineTo(snake.epos.pos.x, snake.epos.pos.y);
  ctx.stroke();
  ctx.closePath();


}


/*****************
  * Game elements
 *****************/

// var world = new World({x: canvas.width, y: canvas.height})
// var stop = false;
var snake = new Snake(0, 300, 20, {x: 100, y: 100})
// var snake2 = new Snake(1, 300, 20, {x: 100, y: 300})
// world.addSnake(snake)
// world.addSnake(snake2)

var leftButton = document.getElementById('Left');
var upButton = document.getElementById('Up');
var rightButton = document.getElementById('Right');
var downButton = document.getElementById('Down');
var stopButton = document.getElementById('Stop');

ctx = canvas.getContext('2d')
const drawCanvas = function(canvas) {
  setInterval(function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake(snake);
    snake.updateSnake(30, 60)
  }, 1000/60) // 60 fps, gekozen door de normale
}



stopButton.addEventListener('click',function(){
  stop = stop ? false : true;
})

leftButton.addEventListener('click',function(){
  snake.changeHeadDirection(Math.PI)
})

rightButton.addEventListener('click',function(){
  snake.changeHeadDirection(0)
})

upButton.addEventListener('click',function(){
  snake.changeHeadDirection(-Math.PI/2)
})

downButton.addEventListener('click',function(){
  snake.changeHeadDirection(Math.PI/2)
})

document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37:
                    str = 'Left Key pressed!';
                    snake.changeHeadDirection(Math.PI);
                    break;
                case 38:
                    str = 'Up Key pressed!';
                    snake.changeHeadDirection(-Math.PI/2);
                    break;
                case 39:
                    str = 'Right Key pressed!';
                    snake.changeHeadDirection(0);
                    break;
                case 40:
                    str = 'Down Key pressed!';
                    snake.changeHeadDirection(Math.PI/2)
                    break;
            }
}

drawCanvas(canvas)
