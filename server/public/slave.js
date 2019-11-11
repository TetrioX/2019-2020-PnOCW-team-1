//make connection
const socket = io('/slave');

//listen for events from client
let masterButton = document.getElementById("masterButton");
let socketID = null;
let canvas = document.getElementById("canvas");
let context = canvas.getContext('2d');
let gridData = {
	grid: [],
	sideBorder: [],
	cornBorder: []
};
let entirePage = document.createElement('th');
let countdownTimer = document.getElementById('timer');
let wrapper = document.getElementById("wrapper");
const length = 1000;
let gridElements = [];

function cleanHTML() {
	removeGrid();
	wrapper.style.display = "none";
	countdownTimer.style.visibility = "hidden";
	context.clearRect(0, 0, canvas.width, canvas.height);
}

//listen for events from server
socket.on('connect',function(){
	socketID =socket.id;
	console.log(socketID);
});

socket.on('changeBackgroundColor', function (data) {
	cleanHTML();
	document.body.style.backgroundColor = data.colorValue;
	document.getElementById('wrapper').setAttribute('class', 'hidden') //delete hidden to see everything
});

socket.on('SendingPicture', function(data){
	console.log("picture received");
});

// Sending number to slave (also useful for angle of arrow!)
socket.on('slaveID', function (id) {
	let text = null;
	if (id === 1) {
		text = "st ";
	} else if (id === 2) {
		text = "nd ";
	} else {
		text = "th ";
	}
    document.getElementById("slaveID").innerHTML = id+text;
});

socket.on('drawLine', function(data){
    draw(data.angle);
});

socket.on('changeBackgroundOfAllSlaves', function (data, callback) {
	cleanHTML();
	entirePage.setAttribute("id", "entirePage");
	document.body.appendChild(entirePage);
	saveGrid(data);
	createGrid();
	// callback after 300ms
	setTimeout(function () {
		callback()
	}, 300);
});

socket.on('changeGrid', function (data, callback) {
	updateGrid(data);
	// callback after 200ms
	setTimeout(function () {
		callback()
	}, 200);
});

function removeGrid() {
	document.body.style.backgroundColor = 'white';
	wrapper.style.display = "";
	for (let el of gridElements) {
		el.remove()
	}
	gridElements = []
}

socket.on('removeGrid', function (data) {
	removeGrid()
});

masterButton.addEventListener('click', function () {
	window.location.href = "/master";
});

function createGrid() {
	const numberOfRows = gridData.grid.length;
	const numberOfColumns = gridData.grid[0].length;
	for (let i = 0; i < 4; i++) {
		let corner = document.createElement('div');
		corner.setAttribute("class", "corner");
		corner.setAttribute("id", "corner" + i.toString());
		document.body.appendChild(corner);
		document.getElementById("corner" + i.toString()).style.backgroundColor = gridData.cornBorder[0];
		gridElements.push(corner);
	}
	for (let i = 0; i < numberOfRows; i++) {
		let row = document.createElement('div');
		row.setAttribute("class", "rowclass");
		row.setAttribute("id", i.toString());
		document.getElementById("entirePage").appendChild(row);
		gridElements.push(row);

		for (let j = 0; j < numberOfColumns; j++) {
			let grid = document.createElement('div');
			grid.setAttribute("id", "grid" + i.toString() + j.toString());
			grid.setAttribute("class", "grid");
			document.getElementById(i.toString()).appendChild(grid);
			document.getElementById("grid" + i.toString() + j.toString()).style.backgroundColor = gridData.grid[i][j][0];
			gridElements.push(grid)
		}
	}
	document.body.style.backgroundColor = gridData.sideBorder[0];
}

function updateGrid(c) {
	const numberOfRows = gridData.grid.length;
	const numberOfColumns = gridData.grid[0].length;
	for (let i = 0; i < 4; i++) {
		document.getElementById("corner" + i.toString()).style.backgroundColor = gridData.cornBorder[c];
	}
	for (let i = 0; i < numberOfRows; i++) {
		for (let j = 0; j < numberOfColumns; j++) {
			document.getElementById("grid" + i.toString() + j.toString()).style.backgroundColor = gridData.grid[i][j][c];
		}
	}
	document.body.style.backgroundColor = gridData.sideBorder[c];
}

function saveGrid(data){
	// save the grid data in global variable
	gridData = data
}

function drawArrowHead(from, to, radius) {
	const x_center = to.x;
	const y_center = to.y;

	let arrowAngle;
	let x;
	let y;

	context.beginPath();

	arrowAngle = Math.atan2(to.y - from.y, to.x - from.x);
	x = radius * Math.cos(arrowAngle) + x_center;
	y = radius * Math.sin(arrowAngle) + y_center;

	context.moveTo(x, y);

	arrowAngle += (1.0 / 3.0) * (2 * Math.PI);
	x = radius * Math.cos(arrowAngle) + x_center;
	y = radius * Math.sin(arrowAngle) + y_center;

	context.lineTo(x, y);

	arrowAngle += (1.0 / 3.0) * (2 * Math.PI);
	x = radius * Math.cos(arrowAngle) + x_center;
	y = radius * Math.sin(arrowAngle) + y_center;

	context.lineTo(x, y);

	context.closePath();

	context.fill();
}

function draw(radianAngle) {

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const dx = length * Math.cos(radianAngle);
	const dy = length * Math.sin(radianAngle);
	const centreX = window.innerWidth / 2;
	const centreY = window.innerHeight / 2;
	const from = {
		x: centreX,
		y: centreY
	};
	const to = {
		x: centreX + dx,
		y: centreY + dy
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
	//TODO: grootte aanpassen tov grootte scherm.
	const outerRadius = 40;
	const innerRadius = 15;
	let rot = Math.PI / 2 * 3;
	let x = cx;
	let y = cy;
	const step = Math.PI / 5;

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
	for(let radianAngle of radianAngles){
		const dx = length * Math.cos(Number(radianAngle) * Math.PI * 2 / 360);
		const dy = length * Math.sin(Number(radianAngle) * Math.PI * 2 / 360);

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
socket.on('connect', function () {
	socketID = socket.id;
	console.log(socketID);
});

socket.on('changeBackgroundColor',function(data){
    document.body.style.backgroundColor = data.colorValue;
    document.getElementById('wrapper').setAttribute('class', 'hidden') //delete hidden to see everything
});

socket.on('SendingPicture', function(data){
	console.log("picture received");
});

socket.on('triangulate', function(angles){
	cleanHTML();
	drawAnglesDegree(angles)
});

socket.on('drawLine', function(data){
	cleanHTML();
	draw(data.angle);
});

masterButton.addEventListener('click',function(){
	window.location.href="/master";
});

// Countdown
// Original version https://gist.github.com/LogIN-/e1e3feff907066a1b5ed
// Modified to work with socket.io and to be able to adjust the time from the server
(function () {
	// offset in ms of time difference between server en slave
	let offset = 0;
	// start time
	let timer_start;
	// pointer to the interval for finishing animation
	let finishAnimTimer = null;

	socket.on('startCountdown', function (data) {
		cleanHTML();
		countdownTimer.style.visibility = 'visible';
		start_countdown(data)
	});
	socket.on('updateCountdown', function (data) {
		offset = new Date() - timer_start - data
	});

	function start_countdown(timeInSeconds) {
		timer_start = new Date();
		const main_container = document.getElementById('svg_download_countdown');
		let loader = document.getElementById('loader');
		let border = document.getElementById('border');
		let countdown = document.getElementById('countdown');
		countdown.style.display = 'block';
		// stop finishing animation if it's running
		stopFinishAnimation();
		let π = Math.PI
			, total_seconds = timeInSeconds
			, elapsed_seconds = 0
			, refresh_rate = 25 // (100 / total_seconds) * 100
			, α = 0
			, last_loop = false
			, scaleAnimation = 84;
		InitiateCountDownLoop();

		function InitiateCountDownLoop() {
			drawCountdown();
			if (Math.round(elapsed_seconds % 60) !== total_seconds) {
				setTimeout(InitiateCountDownLoop, refresh_rate);
			} else if (last_loop === false) {
				last_loop = true;
				setTimeout(InitiateCountDownLoop, refresh_rate);
			} else {
				appendCountdownSeconds();
				countdown.innerHTML = "Done";
				adjustCountDownOffset();
				startFinishAnimation();
			}
		}

		function drawCountdown() {

			getElapsedSeconds();
			if (last_loop === false) {
				α = ((elapsed_seconds * (360 / (total_seconds * 1000))) * 1000);
				α %= 360;
				var r = (α * π / 180)
					, x = Math.round((Math.sin(r) * 125) * 100) / 100
					, y = Math.round((Math.cos(r) * -125) * 100) / 100
					, mid = (α > 180) ? 1 : 0
					, anim = 'M 0 0 v -125 A 125 125 1 '
					+ mid + ' 1 '
					+ x + ' '
					+ y + ' z';
			} else {
				anim = 'M 0 0 v -125 A 125 125 1 1 1 -0.1 -125 z';
			}
			loader.setAttribute('d', anim);
			border.setAttribute('d', anim);
			appendCountdownSeconds();
		} // drawCountdown END
		function getElapsedSeconds() {
			elapsed_seconds = (new Date() - timer_start - offset) / 1000;
		} // getElapsedSeconds END
		function appendCountdownSeconds() {
			countdown.textContent = (total_seconds - Math.round(elapsed_seconds % 60)).toString();
			adjustCountDownOffset();
		} // appendCountdownSeconds END

		function adjustCountDownOffset() {
			const main_container_width = main_container.getAttribute("width");
			const main_container_height = main_container.getAttribute("height");
			const counter_width = countdown.getBBox().width;
			const counter_height = countdown.getBBox().height;
			const countdown_x = Math.round((main_container_width - counter_width) / 2);
			const countdown_y = Math.round((main_container_height - counter_height) - (counter_height / 2));
			countdown.setAttribute("x", countdown_x);
			countdown.setAttribute("y", countdown_y);
		}

		function startFinishAnimation() {
			if (finishAnimTimer == null) {
				finishAnimTimer = setInterval(finishAnimation, 100);
			}
		}

		function stopFinishAnimation() {
			if (finishAnimTimer != null) {
				clearInterval(finishAnimTimer);
				loader.setAttribute("transform", "translate(125, 125) scale(.84)");
				finishAnimTimer = null;
			}
		}

		function finishAnimation() {
			loader.getAttribute("transform");
			if (scaleAnimation >= 84 && scaleAnimation < 95) {
				scaleAnimation = scaleAnimation + 1;
			} else if (scaleAnimation === 95) {
				scaleAnimation = 84;
			}
			const transform = "translate(125, 125) scale(." + scaleAnimation + ")";
			loader.setAttribute("transform", transform);
		}
	} // start_countdown END
})();
