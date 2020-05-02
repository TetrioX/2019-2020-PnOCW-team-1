var passwordPage = document.getElementById('passwordPage');
var userspassword = document.getElementById('masterpassword');
var passwordbutton = document.getElementById('passwordbutton');
var entirePage =document.getElementById('entirePage');
new Promise(function(resolve, reject){

	userspassword.focus();
	userspassword.select();
	userspassword.addEventListener("keyup", function(event) {
  		if (event.keyCode === 13) {
   		event.preventDefault();
   		passwordbutton.click();
  		}
	});
	passwordbutton.addEventListener('click',function(){
		var socket = io('/master', { query: "passwd="+userspassword.value });
		setTimeout(function(){
			if (socket.connected === true){
				resolve(socket)
			} else {
				document.getElementById('alertdiv').style.display="";
			}
		}, 500)

	});
}).then(function(socket){
	passwordPage.style.display="none";
	entirePage.style.display="";


	//Emit events to server
	var selectResolution = document.getElementById('exampleFormControlSelect1');
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
	var homebutton3 = document.getElementById('changePageButton3');
	var homebutton4 = document.getElementById('changePageButton4');
	var secondEntirePage = document.getElementById("secondEntirePage");
	var rowPicker = document.getElementById("rowPicker");
	var columnPicker = document.getElementById("columnPicker");
	var countdownPicker = document.getElementById("countdownPicker");
	var resetButton = document.getElementById("resetbutton");

	var snakeButton = document.getElementById("snakeButton");
	var snakeLengthPicker = document.getElementById('snakeLengthPicker');
	var triangulationSnake = document.getElementById('triangulationSnake');
	var gameSnake = document.getElementById('gameSnake');
	var triangulationSnakeStop = document.getElementById('triangulationSnakeStop'),
			leftButton = document.getElementById('leftButton'),
			rightButton = document.getElementById('rightButton'),
			upButton = document.getElementById('upButton'),
			downButton = document.getElementById('downButton'),
			snakeCanvas = document.getElementById('positionCanvas');


	var numberOfRows = rowPicker.valueAsNumber;
	var numberOfColumns = columnPicker.valueAsNumber;
	var countdownSeconds = countdownPicker.valueAsNumber;
	var snakeLength = snakeLengthPicker.valueAsNumber;

	var angle = 0;

	rowPicker.addEventListener('input', function(){
		numberOfRows = rowPicker.valueAsNumber
	});

	columnPicker.addEventListener('input', function(){
		numberOfColumns = columnPicker.valueAsNumber
	})
	countdownPicker.addEventListener('input', function(){
		countdownSeconds = countdownPicker.valueAsNumber
	})
	snakeLengthPicker.addEventListener('input', function(){
		snakeLength = snakeLengthPicker.valueAsNumber
	})

	resetButton.addEventListener('click', function(){
		socket.emit('reset')
	})

	anglePicker.addEventListener('input', function () {
		angle = -anglePicker.value / 180 * Math.PI
	})

	triangulateButton.addEventListener('click', function () {
		socket.emit('clearAll');
		socket.emit('triangulate',{
			numberOfRows:numberOfRows,
			numberOfColumns:numberOfColumns
		})
	});

	drawButtonLine.addEventListener('click', function() {
			socket.emit('clearAll');
			socket.emit('drawLine',{
	        angle:angle
	    })
	});

	/***********************************
	  * Orientation functions *
	 ***********************************/

	 orientationbutton = document.getElementById("orientationbutton");
	 fourtentirepage = document.getElementById("fourthEntirePage");
	 zerobutton = document.getElementById("zeroorientation");
	 masterorientationdiv =document.getElementById("masterorientation");
	 realor = document.getElementById("realor");
	 relativeor = document.getElementById("relativeor")
	 var realorientation =0;


	 orientationbutton.addEventListener('click',function(){
	 	entirePage.style.display="none";
	 	fourtentirepage.style.display="";
	 })


	zerobutton.addEventListener('click',calibrateOrientation)
	
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(event){
		 	alfa = event.alpha
			printRelativeOrientation(alfa)
		 },false);
	}

	
	function calibrateOrientation(){

		var update = true;
		zerobutton.onclick ="";
	 	masterorientationdiv.style.display=""
	 	document.getElementById("currentanglediv").style.display="none"
		window.addEventListener('deviceorientation', function(calibration){
			while (update == true){
		 		realorientation = calibration.alpha;
		 		update = false;
		 	}		
		},false)
	}

	function printRelativeOrientation(alfa){
		relativeorientation=Math.round(event.alpha-realorientation)
		relativeor.innerText = relativeorientation.toString();
		realor.innerText = Math.round(realorientation).toString();
	}

	window.addEventListener('deviceorientation', function(data){
		document.getElementById('orientationsupport?').innerText = "Gyroscoop is supported"; 
		document.getElementById("currentangle").innerText = Math.round(data.alpha).toString();
		
	}, true);

	homebutton5 =document.getElementById('4home');
	homebutton5.addEventListener('click',function(){
		entirePage.style.display="";
		fourtentirepage.style.display="none";
		removeCalibration();
	})

	function removeCalibration(){
		document.getElementById("currentanglediv").style.display=""
		masterorientationdiv.style.display="none";
		realorientation = 0;
	}

	show3dbutton = document.getElementById('show3D');
	show3dbutton.addEventListener('click',function(){
			console.log('sent')
			if (window.DeviceOrientationEvent) {
				window.addEventListener('deviceorientation', function(event){
					console.log('sent')
		 			animationorientation =-Math.round(event.alpha-realorientation)
		 			console.log()
		 			socket.emit('animationorientation', {
						orientation :animationorientation
		 			})
			
		 		},false);
			}
	});




	
	


	/***********************************
	  * Slave communication functions *
	 ***********************************/

	function createSlaveButton(number,id) {
		/*
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
		*/
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


	/**************************
	  * Foto nemen functions *
	 **************************/

	var video = document.getElementById('video');
	var canvas = document.getElementById('canvas');
	var startbutton = document.getElementById('startbutton');

	video.setAttribute('autoplay', '');
	video.setAttribute('muted', '');
	video.setAttribute('playsinline', '');


	var resolutions=[[1280,720],[1920,1080],[2560,1440],[3840,2160],[640,480]];


	function choosePictureResolution(value){
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
	}

	choosePictureResolution(4);
	selectResolution.addEventListener('input',choosePictureResolution(selectResolution.value));
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
		socket.emit('clearAll');
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
		socket.emit('clearAll');
		entirePage.style.display="none";
		secondEntirePage.style.display="";
		screenrecognitionvideo = document.getElementById("screenrecognitionvideo");
		screenrecognitionvideo.setAttribute('autoplay', '');
		screenrecognitionvideo.setAttribute('muted', '');
		//screenrecognitionvideo.setAttribute('playsinline', '');


		navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false})
			.then(function (stream) {
				screenrecognitionvideo.srcObject = stream;
				screenrecognitionvideo.play();
				screenrecognitionvideo.height=window.innerHeight
			})
			.catch(function (err) {
				console.log("An error occurred: " + err);
			});

	})

	homebutton.addEventListener('click',function(){
		socket.emit('clearAll');
		entirePage.style.display="";
		secondEntirePage.style.display="none";
	})



	// Starts the calibration process and shows the result


	makeGridButton.addEventListener('click',function(){
		socket.emit('clearAll');
		socket.emit('changeBackgroundOfAllSlaves',{
			numberOfRows:numberOfRows,
			numberOfColumns:numberOfColumns
		});
	});


	/*********************
	  * Image functions *
	 *********************/

	broadcastPicture.addEventListener('click',function(){
		socket.emit('clearAll');
		img = getImage()

		if (getImage())
			socket.emit('broadcastImage', {image: img});
		else
			alert("Please select a picture.")
	})

	const getImage = function() {
			var ele = document.getElementsByName('picture');

			for(i = 0; i < ele.length; i++)
					if(ele[i].checked)
				return ele[i].value
	}


	/*********************
	  * Video functions *
	 *********************/

	broadcastVideo.addEventListener('click',function(){
		socket.emit('clearAll');
		socket.emit('broadcastVideo');
	})


	/*************************
	  * Countdown functions *
	 *************************/

	countdownButton.addEventListener('click', function(){
		socket.emit('clearAll');
		if (typeof countdownSeconds === 'undefined'){
			alert('Enter an amount of seconds first')
		} else{
			socket.emit('startCountdown', countdownSeconds)
		}
	})

	/*******************************
	  * Visual feedback functions *
	 *******************************/

	socket.on('drawCircles', function (data) {
		socket.emit('clearAll');
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
	;

	});

	socket.on('showVisualFeedback',function(){
		secondEntirePage.style.display="none";
		var thirdEntirePage = document.getElementById('thirdEntirePage');
		thirdEntirePage.style.display="";
		visualfeedbackcanvas=document.getElementById("visualfeedback");
		visualfeedbackcanvas.width = window.innerWidth;
		visualfeedbackcanvas.height = window.innerHeight;


		feedbackctx = visualfeedback.getContext('2d');

		var feedbackimage=new Image();
		var CircelPicture = canvas.toDataURL();

		feedbackimage.onload = async function(){



			feedbackctx.drawImage(feedbackimage,0,0, visualfeedbackcanvas.width,visualfeedbackcanvas.height);
		}
		feedbackimage.src=CircelPicture;

	});

	homebutton3.addEventListener('click',function(){
		entirePage.style.display="";
		thirdEntirePage.style.display="none"
	})


	/*********************
	  * Snake functions *
	 *********************/

	snakeButton.addEventListener('click', function(){
		socket.emit('clearAll');
		entirePage.style.display="none";
		snakeEntirePage.style.display="";
		window.scrollTo(0, 0);
	})

	triangulationSnake.addEventListener('click', function(){
		socket.emit('clearAll');
		if (snakeLength)
			socket.emit("startAnimation", {
				animation: triangulationSnake,
				size: snakeLength
			})
		else alert('You gotta choose a length.')
	})

	triangulationSnakeStop.addEventListener('click', function(){
		socket.emit('stopSnake')
	})

	homebutton2.addEventListener('click',function(){
		entirePage.style.display="";
		snakeEntirePage.style.display="none";
		socket.emit('stopSnake')
	})

	// players = [0, 1, 2]
	gameSnake.addEventListener('click', function(){
		alert('Not available')
		// socket.emit('clearAll');
		// if (snakeLength)
		// 	socket.emit("startGame", { size: snakeLength })
		// else alert('You gotta choose a length.')
	})

	triangulationSnakeStop.addEventListener('click', function(){
		socket.emit('stopSnake')
	})

	homebutton2.addEventListener('click',function(){
		entirePage.style.display="";
		snakeEntirePage.style.display="none";
		socket.emit('stopSnake')
	})

	leftButton.addEventListener('click', function(){
		socket.emit('changeSnakeDirection', {
			playerId: 0,
			direction: -Math.PI
		})
	})

	rightButton.addEventListener('click', function(){
		socket.emit('changeSnakeDirection', {
			playerId: 0,
			direction: 0
		})
	})

	upButton.addEventListener('click', function(){
		socket.emit('changeSnakeDirection', {
			playerId: 0,
			direction: -Math.PI / 2
		})
	})

	downButton.addEventListener('click', function(){
		socket.emit('changeSnakeDirection', {
			playerId: 0,
			direction: Math.PI / 2
		})
	})

	socket.on('startGame', function(){
		snakeEntirePage.style.display="none";
		controlSnakePage.style.display="";
	})

	socket.on('updatePosition', function(data){
	  ctxt = snakeCanvas.getContext('2d')
	  ctxt.clearRect(0, 0, canvas.width, canvas.height);
	  ctxt.fillStyle = "#FF0000";
	  ctxt.beginPath();
	  ctxt.arc(data.headPos.x * canvas.width / data.dim.x, data.headPos.y * canvas.height / data.dim.y,
	              canvas.height / 50, 0, 2 * Math.PI);
	  ctxt.fill();
	})

	homebutton4.addEventListener('click',function(){
		snakeEntirePage.style.display="";
		controlSnakePage.style.display="none";
		socket.emit('clearAll');
		socket.emit('stopSnake')
	})

	socket.on('disconnect', function() {
		alert("Was disconnected. Another user might have logged in as master.")
		window.location.reload(false)
	})

})
