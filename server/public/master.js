// Make Connection
var socket = io('/master');

//listen for events from server
socket.on('registerMaster', function (data) {
		window.location.href = '/';
});

//Emit events to server
var backgroundButton = document.getElementById('changeBackgroundColor');
var colorPicker = document.getElementById('color');
var colorValue = colorPicker.value;
var entirePage =document.getElementById('entirePage');

colorPicker.addEventListener('input', function () {
		colorValue = colorPicker.value
});

var slaveButtons = {};
var numberOnButton = 0;

var drawButtonLine = document.getElementById('drawLine');
var anglePicker = document.getElementById('anglePicker');
		var canvas=document.getElementById("canvas");

var angle = 0;
anglePicker.addEventListener('input', function () {
	angle = -anglePicker.value / 180 * Math.PI
})


drawButtonLine.addEventListener('click', function(){
    socket.emit('drawLine',{
        angle:angle
    })
});

colorPicker.addEventListener('input',function(){
	colorValue = colorPicker.value
})

function createSlaveButton(number,id) {
		var btn = document.createElement("BUTTON");
		btn.innerHTML = "Change collor of " + number;
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
		for (socket_id in data.slaves) {
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

var useCameraButton =document.getElementById('useCamBtn');
useCameraButton.addEventListener('click',function(){
	document.getElementById("cameraDiv").style.display = "";
});

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var startbutton = document.getElementById('startbutton');

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false})
	.then(function (stream) {
		video.srcObject = stream;
		video.play();
	})
	.catch(function (err) {
		console.log("An error occurred: " + err);
	});

startbutton.addEventListener('click', function () {
	var context = canvas.getContext('2d');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);

	socket.emit('upload-image', {
		image: true,
		buffer: canvas.toDataURL('image/png')
	});
});