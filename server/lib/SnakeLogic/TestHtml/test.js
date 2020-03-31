
class World {
  constructor() {
    this.square = new this.Square(0, 0, 300)
    console.log(this.square)
  }

  update(dt) {
    this.square.update(dt)
  }

  draw(ctx) {
    this.square.draw(ctx)
  }

  Square = class {
    constructor(coordinateX, coordinateY, maxSize) {
      this.posX = coordinateX;
      this.posY = coordinateY;
      this.size = 10;
      this.maxSize = maxSize;
      this.updateFactor = 1;
      this.color = "#FF0000"
    }

    draw(ctx) {
        // Draw Circle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX, this.posY, this.size, this.size)
    }

    update(frame = 0) {
      // console.log(this.size, frame)
        var newSize = this.size + frame * this.updateFactor;
        if (newSize > this.maxSize) {
            newSize = 2 * this.maxSize - newSize
            this.updateFactor = -1
        } else if (newSize < 0) {
            newSize = -newSize
            this.updateFactor = 1
        }
        this.size = newSize
    }
  }
}

var world;
function createWorld(anim) {
  console.log(anim)
  world = anim
}

/*****************
  * Game elements
 *****************/

// createWorld(new World())

var leftButton = document.getElementById('Left');
var upButton = document.getElementById('Up');
var rightButton = document.getElementById('Right');
var downButton = document.getElementById('Down');
var stopButton = document.getElementById('Stop');

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
const drawCanvas = function(canvas) {
  setInterval(function(){
    console.log("Ye")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.draw(ctx)
    world.update(1)
  }, 1000/30) // 60 fps, gekozen door de normale
}

stopButton.addEventListener('click',function(){
  hi()
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

// drawCanvas(canvas)
