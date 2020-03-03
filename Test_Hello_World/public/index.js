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

button.addEventListener('click', ()=> {
    socket.emit('start');
});

socket.on('startAnimation', function() {
    animate()
});