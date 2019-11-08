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
var entirePage = document.createElement('th');
var length = 1000;
var gridElements = []


//listen for events from server

socket.on('changeBackgroundColor',function(data){
    document.body.style.backgroundColor = data.colorValue;
    document.getElementById('wrapper').setAttribute('class', 'hidden') //delete hidden to see everything
});

// Sending number to slave (also usefull for angle of arrow!)
socket.on('slaveID', function (id) {
	if (id ==1){
		var text ="st "
	}
	else if(id ==2){
		var text ="nd "
	}

	else{
		var text ="th "
	}
    document.getElementById("slaveID").innerHTML = id+text;
})


socket.on('drawLine', function(data){
    draw(data.angle);
});


socket.on('changeBackgroundOfAllSlaves', function(data, callback){
	let wrapper = document.getElementById("wrapper")
	wrapper.style.display = "none";
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

socket.on('removeGrid', function(data){
	document.body.style.backgroundColor = 'white'
	wrapper.style.display="";
	for (el of gridElements){
		el.remove()
	}
	gridElements = []
})

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

socket.on('drawStar', function(data){
	drawStar();
});

socket.on('triangulate', function(angles){
	wrapper.style.display = "none";
	drawStar();
	console.log(angles)
	drawAnglesDegree(angles)
});

socket.on('drawLine', function(data){
    draw(data.angle);
});




socket.on('drawImage',function(data){
	wrapper.style.display ="none";
	var imgcanvas = document.createElement('canvas');
	imgcanvas.setAttribute('id','imgcanvas');
	document.body.appendChild(imgcanvas);
	var slavecorners = data
})

//events on client side
masterButton.addEventListener('click',function(){
	window.location.href="/master";
});

//functions
function createGrid(){
	var numberOfrows=gridData.grid.length;
	var numberOfColumns = gridData.grid[0].length;
	for (i=0; i<4;i++){
		var corner =document.createElement('div');
		corner.setAttribute("class","corner");
		corner.setAttribute("id", "corner"+i.toString());
		document.body.appendChild(corner);
		document.getElementById("corner"+i.toString()).style.backgroundColor=gridData.cornBorder[0];
		gridElements.push(corner)
	}
	for (i=0; i<numberOfrows;i++){
		var row =document.createElement('div');
		row.setAttribute("class","rowclass");
		row.setAttribute("id", i.toString());
		document.getElementById("entirePage").appendChild(row);
		gridElements.push(row)

		for (j=0; j<numberOfColumns; j++){

			var grid = document.createElement('div');
			grid.setAttribute("id","grid"+i.toString()+j.toString());
			grid.setAttribute("class", "grid");
			document.getElementById(i.toString()).appendChild(grid);
			document.getElementById("grid"+i.toString()+j.toString()).style.backgroundColor=gridData.grid[i][j][0];
			gridElements.push(grid)
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

	// start point
	context.moveTo(from.x, from.y);
	// end point
	context.lineTo(to.x, to.y);

	context.lineWidth = 10;
	// Make the line visible

	context.stroke();

}

function drawAnglesDegree(radianAngles) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	// center
	const cx = window.innerWidth / 2;
	const cy = window.innerHeight / 2;
	//draw star
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

	//draw lines
	for(radianAngle of radianAngles){
		var dx = length * Math.cos(Number(radianAngle) * Math.PI * 2 / 360);
		var dy = length * Math.sin(Number(radianAngle) * Math.PI * 2 / 360);

		// start point
		context.moveTo(cx, cy);
		// end point
		context.lineTo(cx+dx, cy+dy);

		context.lineWidth = 10;
		// Make the line visible

		context.stroke();
	}
}
var slavecorners = [[0,2280],[0,1000],[500,1000],[500,2280]];
var imgcanvas =document.getElementById('imgcanvas');
var tempcanvas = document.createElement('canvas');
var tempctx = tempcanvas.getContext('2d');

//create a new image object
var img = new Image();

//the canvas needs to be off the size of the picture taken by the master
// this is to make sure that the corners from the screenrecognition are used in their real size
//assumption: size of picture is 2280X1080
tempcanvas.height = 2280;
tempcanvas.width = 1080;
//Get a reference to the 2d drawing context
var ctx = imgcanvas.getContext("2d");

img.onload =function(){

	tempctx.beginPath();
 	tempctx.moveTo(slavecorners[0][0],slavecorners[0][1]);
    slavecorners.forEach(([x, y]) => {
		tempctx.lineTo(x, y);
     });
    tempctx.clip();
 	tempctx.drawImage(img,0,0);


 	

}


//callback, when the image is loaded

//start the image loading
img.src ='/static/ImageShowOffTest2.jpg';










