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
var countdownTimer = document.getElementById('timer')
var wrapper = document.getElementById("wrapper")
var length = 1000;
var gridElements = []

function cleanHTML(){
	removeGrid()
	wrapper.style.display = "none"
	countdownTimer.style.visibility = "hidden"
	context.clearRect(0, 0, canvas.width, canvas.height);
}

//listen for events from server

socket.on('changeBackgroundColor',function(data){
		cleanHTML()
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
	cleanHTML()
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

function removeGrid(){
	document.body.style.backgroundColor = 'white'
	wrapper.style.display="";
	for (el of gridElements){
		el.remove()
	}
	gridElements = []
}

socket.on('removeGrid', function(data){
	removeGrid()
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


//BROADCASTING IMAGES AND VIDEOS

socket.on('broadcastingImage'),function(data){
	console.log('willBroadcast')
	var slaveCorners = [data[3],data[0],data[1],data[2]];
	broadcast(slaveCorners);
}

//corners: LT,RT,RB,LB
//var slaveCorners = [[200,200],[600,200],[600,400],[200,400]]
//var slaveCorners = [[100,100],[300,200],[300,300],[100,200]];
//var slaveCorners = [[0,400],[400,0],[600,200],[200,600]];

//create a new image object
var img = new Image();


function broadcast(slaveCorners){
	var angle = calculateAngle(slaveCorners)
	var slaveWidth =(slaveCorners[1][0]-slaveCorners[0][0])/Math.cos(angle);
	var slaveHeigth = (slaveCorners[2][1]-slaveCorners[1][1])/Math.cos(angle);

	//canvas for the real image
	var imgcanvas = document.getElementById('imgcanvas');
	var imgctx = imgcanvas.getContext('2d');
	imgcanvas.width = window.innerWidth;
	imgcanvas.height = window.innerHeight;

	//canvas fot testing purposes
	var tempcanvas = document.getElementById('tempcanvas');
	var tempctx = tempcanvas.getContext('2d');
	tempcanvas.height = window.innerHeight;
	tempcanvas.width = window.innerWidth;



	img.onload =async function(){
		//translation
		const widthMultiplier =imgcanvas.width/slaveWidth;
		const heightMultiplier = imgcanvas.height /slaveHeigth;
		imgctx.translate(-slaveCorners[0][0]*widthMultiplier, -slaveCorners[0][1]*heightMultiplier);
		var	LeftTopcorner = [slaveCorners[0][0]*widthMultiplier, slaveCorners[0][1]*heightMultiplier]

		//rotation
		imgctx.translate(slaveCorners[0][0]*widthMultiplier, slaveCorners[0][1]*heightMultiplier)
		imgctx.rotate(angle)
		imgctx.translate(-slaveCorners[0][0]*widthMultiplier, -slaveCorners[0][1]*heightMultiplier)

		//skew werkt voorlopig nog niet helemaal

		//var LeftBottomCorner =[slaveCorners[3][0]*widthMultiplier, slaveCorners[3][1]*heightMultiplier]
		LeftBottomCorner = rotate_point(LeftTopcorner[0],LeftTopcorner[1],angle,LeftBottomCorner);
		var horizontalskew = -(LeftBottomCorner[0]-LeftTopcorner[0])/(LeftBottomCorner[1]-LeftTopcorner[1]);
		imgctx.translate(slaveCorners[0][0]*widthMultiplier,slaveCorners[0][1]*heightMultiplier);
		imgctx.transform(1,0,horizontalskew,1,0,0)

		imgctx.translate(-slaveCorners[0][0]*widthMultiplier, -slaveCorners[0][1]*heightMultiplier);

		//now 3 of the 4 corners are perfect in place
		imgctx.drawImage(img,0,0,imgcanvas.width*widthMultiplier,imgcanvas.height*heightMultiplier);

		tempctx.beginPath();
	 	tempctx.moveTo(slaveCorners[0][0],slaveCorners[0][1]);
	  	for (let i =1; i<slaveCorners.length; i++){
	  		tempctx.lineTo(slaveCorners[i][0],slaveCorners[i][1]);
	  	}
	  	tempctx.lineTo(slaveCorners[0][0],slaveCorners[0][1]);
	    tempctx.clip();
	 	tempctx.drawImage(img,0,0, tempcanvas.width,tempcanvas.height);
	}
}


function calculateAngle(corners){
	let dx =corners[1][0] - corners[0][0];
	let dy = corners[0][1] - corners[1][1];
	let angle =Math.atan(dy/dx);
	return angle
}

function rotate_point(cx,cy,angle,p){
	var s =Math.sin(angle);
	var c = Math.cos(angle);

	//translate point back to origin:
	p[0] -= cx;
	p[1] -= cy;

	//rotate point:
	var xnew = p[0]*c -p[1]*s;
	var ynew = p[0]*s + p[1]*c;

	//translate point back:
	p[0] = xnew+cx;
	p[1] = ynew +cy;
	return p;
}

//callback, when the image is loaded

//start the image loading
img.src ='/static/Colorgrid.jpg';







socket.on('drawStar', function(data){
	cleanHTML()
	drawStar();
});

socket.on('triangulate', function(angles){
	cleanHTML()
	drawAnglesDegree(angles)
});

socket.on('drawLine', function(data){
	cleanHTML()
	draw(data.angle);
});

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});

// Original version https://gist.github.com/LogIN-/e1e3feff907066a1b5ed
// Modified to work with socket.io and to be able to adjust the time from the server
(function() {
		// offset in ms of time difference between server en slave
		var offset = 0
		// start time
		var timer_start
		// pointer to the interval for finishing animation
		var finishAnimTimer = null
    socket.on('startCountdown', function(data){
			cleanHTML()
			countdownTimer.style.visibility = 'visible';
			start_countdown(data)
		})
		socket.on('updateCountdown', function(data){
			offset = new Date() - timer_start - data
		})
    function start_countdown(timeInSeconds){
				timer_start = new Date()
        var main_container = document.getElementById('svg_download_countdown')
        var loader = document.getElementById('loader')
       	var border = document.getElementById('border')
        var countdown = document.getElementById('countdown')
				countdown.style.display = 'block';
				// stop finishing animation if it's running
				stopfinishAnimation()
        var π = Math.PI
          , total_seconds = timeInSeconds
          , elipsed_seconds = 0
          , refresh_rate = 25 // (100 / total_seconds) * 100
          , α = 0
          , last_loop = false
          , scaleAnimation = 84;
        InitiateCountDownLoop();
        function InitiateCountDownLoop(){
            drawCountdown();
            if(Math.round(elipsed_seconds % 60) != total_seconds){
                setTimeout(InitiateCountDownLoop, refresh_rate);
            }else if(last_loop === false){
                last_loop = true;
                setTimeout(InitiateCountDownLoop, refresh_rate);
            }else{
                appendCountdownSeconds();
                countdown.innerHTML = "Done";
                adjustCountDownOffset();
                startfinishAnimation();
                return;
            }
        };
        function drawCountdown() {
            getElapsedSeconds();
            if(last_loop === false){
                α = ((elipsed_seconds * (360 / (total_seconds * 1000))) * 1000);
                α %= 360;
                var r = ( α * π / 180 )
                , x = Math.round((Math.sin( r ) * 125) * 100) / 100
                , y = Math.round((Math.cos( r ) * - 125) * 100) / 100
                , mid = ( α > 180 ) ? 1 : 0
                , anim = 'M 0 0 v -125 A 125 125 1 '
                + mid + ' 1 '
                +  x  + ' '
                +  y  + ' z';
            }else{
                var anim = 'M 0 0 v -125 A 125 125 1 1 1 -0.1 -125 z';
            }
            loader.setAttribute( 'd', anim );
            border.setAttribute( 'd', anim );
            appendCountdownSeconds();
        }; // drawCountdown END
        function getElapsedSeconds(){
            var timeDifference = (new Date() - timer_start - offset) / 1000;
            elipsed_seconds = timeDifference;
        }; // getElapsedSeconds END
        function appendCountdownSeconds(){
            countdown.textContent = (total_seconds - Math.round(elipsed_seconds % 60)).toString();
            adjustCountDownOffset();
        }; // appendCountdowSeconds END
        function adjustCountDownOffset(){
            var main_container_width = main_container.getAttribute("width");
            var main_container_height = main_container.getAttribute("height");
            var counter_width = countdown.getBBox().width;
            var counter_height = countdown.getBBox().height;
            var countdown_x = Math.round((main_container_width - counter_width) / 2);
            var countdown_y = Math.round((main_container_height - counter_height) - (counter_height / 2));
            countdown.setAttribute("x", countdown_x);
            countdown.setAttribute("y", countdown_y);
        };
        function startfinishAnimation() {
            if(finishAnimTimer == null) {
                finishAnimTimer = setInterval(finishAnimation, 100);
            }
        };
        function stopfinishAnimation() {
            if(finishAnimTimer != null){
                clearInterval(finishAnimTimer);
                loader.setAttribute("transform", "translate(125, 125) scale(.84)");
                finishAnimTimer = null;
            }
        };
        function finishAnimation() {
            var x = loader.getAttribute("transform");
            if(scaleAnimation >= 84 & scaleAnimation < 95){
                scaleAnimation = scaleAnimation + 1;
            }else if(scaleAnimation == 95){
                scaleAnimation = 84;
            }
            var transform = "translate(125, 125) scale(." + scaleAnimation + ")";
            loader.setAttribute("transform", transform);
        };
    }; // start_countdown END
})();
