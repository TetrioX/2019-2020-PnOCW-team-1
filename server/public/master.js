var passwd = prompt("master password");
// Make Connection
var socket = io('/master', { query: "passwd="+passwd });
// if authentication failed notify the user and become a slave
setTimeout(function() {
	if (socket.connected == false){
		alert("authentication failed")
		window.location.href="/";
	}
}, 2000);

//listen for events from server
socket.on('registerMaster', function (data) {
		window.location.href = '/';
});

//Emit events to server
var selectResolution = document.getElementById('exampleFormControlSelect1');
var entirePage =document.getElementById('entirePage');
var slaveButtons = {};
var numberOnButton = 0;
var drawButtonLine = document.getElementById('drawLine');
var triangulateButton = document.getElementById('triangulate');
var anglePicker = document.getElementById('anglePicker');
var broadcastPicture = document.getElementById('broadcastPicture');
var broadcastVideo = document.getElementById('broadcastVideo');
var makeGridButton = document.getElementById("calibrateButton");
var countdownButton = document.getElementById("countdownButton")
var homebutton = document.getElementById('changePageButton');
var homebutton2 = document.getElementById('changePageButton2');
var secondEntirePage = document.getElementById("secondEntirePage");
var rowPicker = document.getElementById("rowPicker");
var columnPicker = document.getElementById("columnPicker");
var countdownPicker = document.getElementById("countdownPicker");

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

var resolutions=[[1280,720],[1920,1080],[2560,1440],[3840,2160],[640,480]];
var resolutionWidth = 1280;
var resolutionHeight = 720;
selectResolution.addEventListener('input',function(){
	resolutionWidth = resolutions[selectResolution.value][0];
	resolutionHeight = resolutions[selectResolution.value][1];
	console.log( resolutionWidth,'x', resolutionHeight );
	navigator.mediaDevices.getUserMedia({
	    video: {
	        width: resolutionWidth ,
	        height: resolutionHeight,
	        facingMode: "environment"
	    }, audio: false
	}).then(function (stream) {
		video.srcObject = stream;
		video.play();
	})
	.catch(function (err) {
		console.log("An error occurred: " + err);
	});
})
/*
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
*/
//ref: https://tutorialzine.com/2016/07/take-a-selfie-with-js
function takePicture(data) {

    var hidden_canvas = document.querySelector('canvas'),
        video = document.querySelector('video.camera_stream'),
        image = document.querySelector('img.photo'),

        // Get the exact size of the video element.
        width = video.videoWidth,
        height = video.videoHeight,

        // Context object for working with the canvas.
        context = hidden_canvas.getContext('2d');

    // Set the canvas to the same dimensions as the video.
    hidden_canvas.width = width;
    hidden_canvas.height = height;

    // Draw a copy of the current frame from the video on the canvas.
    context.drawImage(video, 0, 0, width, height);

    socket.emit('upload-image', {
        image: true,
        buffer: hidden_canvas.toDataURL('image/png'),
        destination: data.destination
    });

    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute('src', imageDataURL);

}

startbutton.addEventListener('click', function () {
	takePicture({});
});

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}

ss(socket).on('takeOnePicture', function(callback){
	var context = canvas.getContext('2d');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);
	var stream = ss.createStream();
	stream.setDefaultEncoding('utf-8')
	callback(stream)
	stream.end(canvas.toDataURL('image/png'))
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
	img = getImage()

	if (getImage())
		socket.emit('broadcastImage', {image: img});
	else
		alert("Please select a picture.")
})

broadcastVideo.addEventListener('click',function(){
		socket.emit('broadcastVideo');
})


const getImage = function() {
    var ele = document.getElementsByName('picture');

    for(i = 0; i < ele.length; i++)
        if(ele[i].checked)
			return ele[i].value
}


countdownButton.addEventListener('click', function(){
	if (typeof countdownSeconds === 'undefined'){
		alert('Enter an amount of seconds first')
	} else{
		socket.emit('startCountdown', countdownSeconds)
	}
})
var CircelPicture;

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
    var CircelPicture = canvas.toDataURL();
})

socket.on('showVisualFeedback',function(){
	console.log('hou u bakkes');
	secondEntirePage.style.display="none";
	thirdEntirePage.style.display="";
	visualfeedbackcanvas=document.getElementById("visualfeedback");
	feedbackctx = visualfeedback.getContext('2d');

	var feedbackimage=new Image();
	feedbackimage.src=CircelPicture;

	feedbackctx.drawImage(feedbackimage,0,0,window.innerWidth, window.innerHeight);
});

homebutton2.addEventListener('click',function(){
	entirePage.style.display="";
	secondEntirePage.style.display="none";
	thirdEntirePage="none";
})