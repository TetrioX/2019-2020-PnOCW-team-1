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
var canvas = document.getElementById("canvas");
var calibrateButton = document.getElementById("calibrateButton");

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


(function() {
	// |streaming| indicates whether or not we're currently streaming
	// video from the camera. Obviously, we start at false.

	var streaming = false;

	// The various HTML elements we need to configure or control. These
	// will be set by the startup() function.

	var video = null;
	var canvas = null;
	var photo = null;
	var startbutton = null;

	function startup() {
		video = document.getElementById('video');
		canvas = document.getElementById('canvas');
		photo = document.getElementById('photo');
		startbutton = document.getElementById('startbutton');

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false})
				.then(function (stream) {
					video.srcObject = stream;
					video.play();
				})
				.catch(function (err) {
					console.log("An error occurred: " + err);
				});

		video.addEventListener('canplay', function (ev) {
			if (!streaming) {
				streaming = true;
			}
		}, false);

		startbutton.addEventListener('click', function (ev) {
			takepicture();
			ev.preventDefault();

		}, false);
	}

	// Capture a photo by fetching the current contents of the video
	// and drawing it into a canvas, then converting that to a PNG
	// format data URL. By drawing it on an offscreen canvas and then
	// drawing that to the screen, we can change its size and/or apply
	// other changes before drawing it.

	function takepicture() {
		var context = canvas.getContext('2d');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		context.drawImage(video, 0, 0);

		var Picurl = canvas.toDataURL('image/png');
		photo.setAttribute('src', Picurl);

		socket.emit('upload-image', {
			image: true,
			buffer: canvas.toDataURL()
		});
	}

	function sleep(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
	}

	socket.on('takePicture', function(data, callback){
		switch(data.mode) {
			case 'black':
				socket.emit('changeBackgroundColor', {
					colorValue: '#000000'
				});
			case 'white':
				socket.emit('changeBackgroundColor', {
					colorValue: '#ffffff'
				});
			default:
				sleep(1000);
		}
		takepicture();
		callback(true);
	});

	// Set up our event listener to run the startup process
	// once loading is complete.
	window.addEventListener('load', startup, false);
})();

// Starts the calibration process and shows the result
calibrateButton.addEventListener('click',function(){
	socket.emit('calibrate');
});
