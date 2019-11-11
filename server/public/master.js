const passwd = prompt("master password");
// Make Connection
const socket = io('/master', { query: "passwd="+passwd });
// if authentication failed notify the user and become a slave
setTimeout(function() {
	if (socket.connected === false){
		alert("authentication failed");
		window.location.href="/";
	}
}, 1000);

//listen for events from server
socket.on('registerMaster', function (data) {
		window.location.href = '/';
});

//Emit events to server

const entirePage = document.getElementById('entirePage'),
	slaveButtons = {},
	numberOnButton = 0,
	drawButtonLine = document.getElementById('drawLine'),
	triangulateButton = document.getElementById('triangulate'),
	anglePicker = document.getElementById('anglePicker'),

	makeGridButton = document.getElementById("calibrateButton"),
	countdownButton = document.getElementById("countdownButton"),

	rowPicker = document.getElementById("rowPicker"),
	columnPicker = document.getElementById("columnPicker"),
	countdownPicker = document.getElementById("countdownPicker");

let numberOfRows = rowPicker.valueAsNumber,
	numberOfColumns = columnPicker.valueAsNumber,
	countdownSeconds = countdownPicker.valueAsNumber;

let angle = 0;

//EventListeners
rowPicker.addEventListener('input', function(){
	numberOfRows = rowPicker.valueAsNumber
});

columnPicker.addEventListener('input', function(){
	numberOfColumns =columnPicker.valueAsNumber
});

countdownPicker.addEventListener('input', function(){
	countdownSeconds = countdownPicker.valueAsNumber
});

anglePicker.addEventListener('input', function () {
	angle = -anglePicker.value / 180 * Math.PI
});

triangulateButton.addEventListener('click', function () {
	socket.emit('triangulate', {
		numberOfRows: numberOfRows,
		numberOfColumns: numberOfColumns
	})
});

drawButtonLine.addEventListener('click', function() {
    socket.emit('drawLine',{
        angle:angle
    })
});

function createSlaveButton(number,id) {
		let btn = document.createElement("BUTTON");
		btn.innerHTML = "Change color of " + number;
		entirePage.appendChild(btn);
		btn.addEventListener('click', function () {
				socket.emit('changeBackgroundColor', {
						colorValue: colorValue,
						id: id
				});
		});
		slaveButtons[id] = btn;
}

function removeSlaveButton(slave) {
	if (slave in slaveButtons) {
		slaveButtons[slave].remove();
		delete slaveButtons[slave];
	}
}

socket.on('slaveSet', function (data) {
	for (let socket_id in data.slaves) {
		createSlaveButton(data.slaves[socket_id], socket_id);
	}
});

socket.on('registerSlave', function (data) {
		createSlaveButton(data.number,data.socket_id);
});

socket.on('removeSlave', function (data) {
		removeSlaveButton(data)
});

//Foto nemen
let useCameraButton = document.getElementById('useCamBtn');

useCameraButton.addEventListener('click',function(){
	console.log("Hoi");
	document.getElementById("cameraDiv").style.display = "";
});

let video = document.getElementById('video'),
	canvas = document.getElementById('canvas'),
	startbutton = document.getElementById('startbutton');

//Fixt video op iPhone
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}, audio: false})
	.then(function (stream) {
		video.srcObject = stream;
		video.play();
	})
	.catch(function (err) {
		console.log("An error occurred: " + err);
	});

function takePicture(data) {
	let context = canvas.getContext('2d');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);

	socket.emit('upload-image', {
		image: true,
		buffer: canvas.toDataURL('image/png'),
		destination: data.destination
	});
}

startbutton.addEventListener('click', function () {
	takePicture({});
});

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}

socket.on('takeOnePicture', function(data, callback){
	let context = canvas.getContext('2d');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);
	callback(canvas.toDataURL('image/png'))
});

socket.on('takePictures', async function (data, callback) {
	for (var key in data.slaves) {
		if (key) socket.emit('changeBackgroundColor', {
			colorValue: '#ffffff',
			id: key
		});
	}
	await sleep(1000);
	// console.log(key, " ", data.slaves[key])
	takePicture({destination: data.slaves[key]});
	await sleep(100)

	callback(true);
});

socket.on('alert', function(data){
	alert(data)
});

// Starts the calibration process and shows the result
makeGridButton.addEventListener('click',function(){
	socket.emit('changeBackgroundOfAllSlaves',{
		numberOfRows:numberOfRows,
		numberOfColumns:numberOfColumns
	});
});

countdownButton.addEventListener('click', function () {
	if (typeof countdownSeconds === 'undefined') {
		alert('Enter an amount of seconds first')
	} else {
		socket.emit('startCountdown', countdownSeconds)
	}
});
