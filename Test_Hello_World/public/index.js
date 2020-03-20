let request;
var button = document.getElementById("startAnimation");
var myCanvas = document.getElementById("myCanvas");
var ctx = myCanvas.getContext("2d");
var lenght = 10;
var k = 1;
var numberofrows = 12;
var numberofcols = 4;

var socket = io("http://localhost:3000");

const animate = () => {
    request = requestAnimationFrame(animate);
    draw()
};

const draw = () => {
    if (lenght >= 100 || lenght < 0){
        k = -1*k
    }
    lenght += k;


    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);
    for (i=0; i<=numberofrows; i++){
        for (j=0; j<=numberofcols; j++){
            ctx.fillStyle = 'red';
            ctx.fillRect(110*i,110*j,lenght, lenght)
        }
    }
};

var squares = []
function Square(coordinateX, coordinateY, maxSize) {
    this.posX = coordinateX;
    this.posY = coordinateY;
    this.size = 0;
    this.maxSize = maxSize;
    this.updateFactor = 1;
    this.color = "#FF0000"
}

Square.prototype.draw = function () {
    // Draw Circle
    ctx.fillStyle = this.color;
    ctx.fillRect(this.posX,this.posY, this.size, this.size)
};

Square.prototype.update = function (tim) {
  if (this.size >= 100 || this.size < 0){
      this.updateFactor = -1 * this.updateFactor
  }
  this.size += this.updateFactor;
};

function createObjects(amt) {
    squares = []
    for (let i = 0; i < 32; i++) {

        rad = wdth / amt**(1/2);

        size = 1500 / 8

        posX = (size * i) % 1500;
        posY = size * Math.floor(i / 8) ;

        square = new Square(posX, posY, size);
        squares.push(square);
    }
    console.log(squares)
}
