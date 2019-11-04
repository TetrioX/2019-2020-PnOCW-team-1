//make connection
var socket = io('/slave');

//listen for events from client
var masterButton = document.getElementById("masterButton");
var socketID = null;
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
var gridData = {
	grid: [],
	sideBorder: [],
	cornBorder: []
}

var length = 350;

//ster
function drawStar() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const cx = window.innerWidth / 2;
	const cy = window.innerHeight / 2;
	const outerRadius = 40;
	const innerRadius = 15;
	var rot = Math.PI / 2 * 3;
	var x = cx;
	var y = cy;
	var step = Math.PI / 5;

	context.beginPath();
	context.moveTo(cx, cy - outerRadius);
	for (let i = 0; i < 5; i++) {
		x = cx + Math.cos(rot) * outerRadius;
		y = cy + Math.sin(rot) * outerRadius;
		context.lineTo(x, y);
		rot += step;

		x = cx + Math.cos(rot) * innerRadius;
		y = cy + Math.sin(rot) * innerRadius;
		context.lineTo(x, y);
		rot += step
	}
	context.lineTo(cx, cy - outerRadius);
	context.closePath();
	context.lineWidth = 5;
	context.strokeStyle = 'black';
	context.stroke();
	context.fillStyle = 'black';
	context.fill();
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
    
    document.getElementById("slaveID").innerHTML = "Ik ben een slaaf nummer " + id
})


socket.on('drawLine', function(data){
    draw(data.angle);
});


socket.on('changeBackgroundOfAllSlaves', function(data, callback){
	document.body.innerHTML=""
	var entirePage = document.createElement('th');
	entirePage.setAttribute("id","entirePage");
	document.body.appendChild(entirePage);
	saveGrid(data);
	createGrid();
	// callback after 300ms
	setTimeout(function() {
		callback()
	}, 300);
});

socket.on('changeGrid', function(data, callback){
	updateGrid(data)
	// callback after 200ms
	setTimeout(function() {
		callback()
	}, 200);
});

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});

function createGrid(){
	var numberOfrows=gridData.grid.length;
	var numberOfColumns = gridData.grid[0].length;
	for (i=0; i<4;i++){
		var corner =document.createElement('div');
		corner.setAttribute("class","corner");
		corner.setAttribute("id", "corner"+i.toString());
		document.body.appendChild(corner);
		document.getElementById("corner"+i.toString()).style.backgroundColor=gridData.cornBorder[0];
	}
	for (i=0; i<numberOfrows;i++){
		var row =document.createElement('div');
		row.setAttribute("class","row");
		row.setAttribute("id", i.toString());
		document.getElementById("entirePage").appendChild(row);

		for (j=0; j<numberOfColumns; j++){

			var grid = document.createElement('div');
			grid.setAttribute("id","grid"+i.toString()+j.toString());
			grid.setAttribute("class", "grid");
			document.getElementById(i.toString()).appendChild(grid);
			document.getElementById("grid"+i.toString()+j.toString()).style.backgroundColor=gridData.grid[i][j][0];
		}
	}
	document.body.style.backgroundColor = gridData.sideBorder[0];
}

function updateGrid(c){
	var numberOfrows=gridData.grid.length;
	var numberOfColumns = gridData.grid[0].length;
	for (i=0; i<4;i++){
		document.getElementById("corner"+i.toString()).style.backgroundColor=gridData.cornBorder[c];
	}
	for (i=0; i<numberOfrows;i++){
		for (j=0; j<numberOfColumns; j++){
			document.getElementById("grid"+i.toString()+j.toString()).style.backgroundColor=gridData.grid[i][j][c];
		}
	}
	document.body.style.backgroundColor = gridData.sideBorder[c];
}

function saveGrid(data){
	// save the grid data in global variable
	gridData = data
}

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

socket.on('drawStar', function(data){
	drawStar();
});

socket.on('triangulate', function(data){
	drawStar();
	let horizontalangle = null;
});

socket.on('drawLine', function(data){
    draw(data.angle);
});

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});