var passwd = prompt("master password");
// Make Connection
var socket = io('/master', { query: "passwd="+passwd });
// if authentication failed notify the user and become a slave
setTimeout(function() {
	if (socket.connected == false){
		alert("authentication failed")
		window.location.href="/";
	}
}, 1000);

//listen for events from server
socket.on('registerMaster', function (data) {
		window.location.href = '/';
});

//Emit events to server

var entirePage =document.getElementById('entirePage');
var slaveButtons = {};
var numberOnButton = 0;
var drawButtonLine = document.getElementById('drawLine');
var drawstarButton = document.getElementById('drawStar');
var triangulateButton = document.getElementById('triangulate');
var anglePicker = document.getElementById('anglePicker');
var broadcastPicture = document.getElementById('broadcastPicture');
var makeGridButton = document.getElementById("calibrateButton");
var countdownButton = document.getElementById("countdownButton")
var homebutton = document.getElementById('changePageButton');
var secondEntirePage = document.getElementById("secondEntirePage");
var rowPicker = document.getElementById("rowPicker");
var columnPicker = document.getElementById("columnPicker");
var countdownPicker = document.getElementById("countdownPicker")

var numberOfRows = rowPicker.valueAsNumber;
var numberOfColumns = columnPicker.valueAsNumber;
var countdownSeconds = countdownPicker.valueAsNumber

var angle = 0;
rowPicker.addEventListener('input', function(){
	numberOfRows = rowPicker.valueAsNumber
});

columnPicker.addEventListener('input', function(){
	numberOfColumns =columnPicker.valueAsNumber
})
countdownPicker.addEventListener('input', function(){
	countdownSeconds = countdownPicker.valueAsNumber
})



anglePicker.addEventListener('input', function () {
	angle = -anglePicker.value / 180 * Math.PI
})

drawstarButton.addEventListener('click', function () {
	socket.emit('drawStar')
});

triangulateButton.addEventListener('click', function () {
	socket.emit('triangulate',{
		numberOfRows:numberOfRows,
		numberOfColumns:numberOfColumns
	})
});

drawButtonLine.addEventListener('click', function() {
    socket.emit('drawLine',{
        angle:angle
    })
});

function createSlaveButton(number,id) {
		var btn = document.createElement("BUTTON");
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

var useCameraButton = document.getElementById('useCamBtn');
useCameraButton.addEventListener('click',function(){
	console.log("Hoi")
	document.getElementById("cameraDiv").style.display = "";
});

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var startbutton = document.getElementById('startbutton');

video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false})
	.then(function (stream) {
		video.srcObject = stream;
		video.play();
	})
	.catch(function (err) {
		console.log("An error occurred: " + err);
	});

function takePicture(data){
	var context = canvas.getContext('2d');
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
	var context = canvas.getContext('2d');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);
	callback(canvas.toDataURL('image/png'))
})

socket.on('takePictures', async function(data, callback){
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
})

//make the entire screen your camera for the screenrecognition
screenrecognitionbutton.addEventListener('click',function(){
	entirePage.style.display="none";
	secondEntirePage.style.display=""
	screenrecognitionvideo.setAttribute('autoplay', '');
	screenrecognitionvideo.setAttribute('muted', '');
	

	navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false})
		.then(function (stream) {
			screenrecognitionvideo.srcObject = stream;
			screenrecognitionvideo.play();
		})
		.catch(function (err) {
			console.log("An error occurred: " + err);
		});

})

homebutton.addEventListener('click',function(){
	entirePage.style.display="";
	secondEntirePage.style.display="none";
})



// Starts the calibration process and shows the result


makeGridButton.addEventListener('click',function(){
	socket.emit('changeBackgroundOfAllSlaves',{
		numberOfRows:numberOfRows,
		numberOfColumns:numberOfColumns
	});
});

broadcastPicture.addEventListener('click',function(){
	console.log('will broadcast');
	socket.emit('broadcastImage');
})


countdownButton.addEventListener('click', function(){
	if (typeof countdownSeconds === 'undefined'){
		alert('Enter an amount of seconds first')
	} else{
		socket.emit('startCountdown', countdownSeconds)
	}
})

socket.on('drawCircles', function (data) {

    //reference: https://stackoverflow.com/questions/1484506/random-color-generator
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var screenKeys = Object.keys(data)
    var context = canvas.getContext('2d');
    for (let i of screenKeys) {
        let color = getRandomColor();
        for (let j = 0; j < 4; j++) {
            context.beginPath();
            context.arc(data[i][j].x,data[i][j].y, 20, 0, 2 * Math.PI, false);
            context.lineWidth = 3;
            context.strokeStyle = color;
            context.stroke();
        }
    }
})

