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
var countdown = document.getElementById('countdown')
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
socket.on('connect',function(){
	socketID =socket.id;
	console.log(socketID);
});

socket.on('changeBackgroundColor',function(data){
		cleanHTML()
    document.body.style.backgroundColor = data.colorValue;
    wrapper.style.display = "none"
		countdown.style.display = "none"
		countdownTimer.style.display = "none"
		entirePage.style.display = "none"
		canvas.style.display = "none"
});

socket.on('SendingPicture', function(data){
	console.log("picture recieved");
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

socket.on('getDim', function (data, callback) {
    cleanHTML()
    callback({ height: window.innerHeight, width: window.innerWidth })
});

socket.on('changeBackgroundOfAllSlaves', function (data, callback) {
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
	for (el of gridElements){
		el.remove()
	}
	gridElements = []
	// show the start page again.
	wrapper.style.display = "block"
	// show scroll bar again
	document.body.style.overflow = 'visible';
}

socket.on('removeGrid', function(data){
	removeGrid()
})

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});

function createGrid(){
	entirePage.style.display = ""
	// hide scrollbar
	document.body.style.overflow = 'hidden';
	var numberOfrows=gridData.grid.length;
    var numberOfColumns = gridData.grid[0].length;
	let width  = window.innerWidth
    let height = window.innerHeight
	// this will make the border 50% of the size of the squares
	let spaceTop = (height / (2*numberOfrows + 2)).toString() + "px"
	let spaceSide = (width / (2*numberOfColumns + 2)).toString() + "px"
	entirePage.style.top = spaceTop
	entirePage.style.bottom = spaceTop
	entirePage.style.left = spaceSide
	entirePage.style.right = spaceSide
	for (i=0; i<4;i++){
		var corner =document.createElement('div');
		corner.setAttribute("class","corner");
		corner.setAttribute("id", "corner"+i.toString());
		corner.style.height = spaceTop
		corner.style.width = spaceSide
		document.body.appendChild(corner);
		corner.style.backgroundColor=gridData.cornBorder[0];
		gridElements.push(corner)
	}
	for (i=0; i<numberOfrows;i++){
		var row =document.createElement('div');
		row.setAttribute("class","rowclass");
		row.setAttribute("id", i.toString());
		entirePage.appendChild(row);
		gridElements.push(row)

		for (j=0; j<numberOfColumns; j++){

			var grid = document.createElement('div');
			grid.setAttribute("id","grid"+i.toString()+j.toString());
			grid.setAttribute("class", "grid");
			row.appendChild(grid);
			grid.style.backgroundColor=gridData.grid[i][j][0];
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
	canvas.style.display = "block"

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
	canvas.style.display = "block"
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
	canvas.style.display = "block"
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


//listen for events from server
socket.on('connect',function(){
	socketID =socket.id;
	console.log(socketID);
});

socket.on('changeBackgroundColor',function(data){
	cleanHTML()
  document.body.style.backgroundColor = data.colorValue;
});

socket.on('SendingPicture', function(data){
	console.log("picture recieved");
});

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
			countdownTimer.style.display = 'block';
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
