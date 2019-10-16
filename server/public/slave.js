//make connection
var socket = io('/slave');

//listen for events from client
var masterButton = document.getElementById("masterButton");
var socketID = null;
var canvas=document.getElementById("canvas");
var context = canvas.getContext('2d');

var length = 350;


function drawArrowHead(from, to, radius){


	var x_center = to.x;
	var y_center = to.y;

	var arrowAngle;
	var x;
	var y;

	context.beginPath();

	arrowAngle = Math.atan2(to.y - from.y, to.x - from.x)
	x = radius * Math.cos(arrowAngle) + x_center;
	y = radius * Math.sin(arrowAngle) + y_center;

	context.moveTo(x, y);

	arrowAngle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(arrowAngle) + x_center;
	y = radius * Math.sin(arrowAngle) + y_center;

	context.lineTo(x, y);

	arrowAngle += (1.0/3.0) * (2 * Math.PI)
	x = radius *Math.cos(arrowAngle) + x_center;
	y = radius *Math.sin(arrowAngle) + y_center;

	context.lineTo(x, y);

	context.closePath();

	context.fill();


}



function draw(radianAngle) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var dx = length * Math.cos(radianAngle);
	var dy = length * Math.sin(radianAngle);
	var centreX = window.innerWidth / 2;
	var centreY =  window.innerHeight / 2;
	var from = {
		x: centreX,
		y: centreY
	};
	var to = {
		x: centreX+dx,
		y: centreY+dy
	};



	// Reset the current path
	context.beginPath();

	// start point
	context.moveTo(from.x, from.y);
	// end point
	context.lineTo(to.x, to.y);

	context.lineWidth = 50;
	// Make the line visible

	context.stroke();
	drawArrowHead(from, to, 60);

}



//listen for events from server
socket.on('connect',function(){
	socketID =socket.id;
	console.log(socketID);
});

socket.on('changeBackgroundColor',function(data){
    document.body.style.backgroundColor = data.colorValue;
    document.getElementById('wrapper').setAttribute('class', 'hidden') //delete hidden to see everything
});

socket.on('SendingPicture', function(data){
	console.log("picture recieved");
});
// Sending number to slave (also usefull for angle of arrow!)
socket.on('slaveID', function (id) {
    console.log(id)
    document.getElementById("slaveID").innerHTML = "Ik ben een slaaf nummer " + id
})


socket.on('drawLine', function(data){
    draw(data.angle);
});

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});