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

	var screenPositions = {};
	var screenUpdater;
	var startPic

	// tracking options

	var TrackingOptions = {
		none: 0,
		sticker: 1,
		keypoint: 2
	}
	var trackingBoxes = document.getElementById("tracking").children
	trackingOption = null
	for (let i=0; i< trackingBoxes.length; i++){
		if (trackingBoxes[i].checked){
			trackingOption = i
			break
		}
	}
	trackingBoxes[TrackingOptions.none].addEventListener( 'change', function() {
		trackingOption = TrackingOptions.none
		socket.emit("removeStickers")
	})
	trackingBoxes[TrackingOptions.sticker].addEventListener( 'change', function() {
		trackingOption = TrackingOptions.sticker
		if (calibrated){
			alert("WARNING: sticker tracking might faile when the camera has mooved after screen recognition. If it doesn't work please run screen recognition again")
			setTimeout(updateScreens)
		}
	})
	trackingBoxes[TrackingOptions.keypoint].addEventListener( 'change', function() {
		trackingOption = TrackingOptions.keyPoint
		if (calibrated){
			setTimeout(updateScreens)
		}
		socket.emit("removeStickers")
	})
	var gyroCehckbox = document.getElementById("gyroscoop")
	gyroCehckbox.addEventListener( 'change', function() {
    updateAngle = this.checked
		if (trackingOption == TrackingOptions.none && updateAngle) {
			setTimeout(updateScreens)
		}
});
	var updateAngle = gyroCehckbox.checked; // when tracking interpolate with gyro
	var calibrated = false;

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

	 var orientationbutton = document.getElementById("orientationbutton");
	 var fourtentirepage = document.getElementById("fourthEntirePage");
	 var zerobutton = document.getElementById("zeroorientation");
	 var masterorientationdiv =document.getElementById("masterorientation");
	 var realor = document.getElementById("realor");
	 var relativeor = document.getElementById("relativeor")
	 var realorientation =0;

	 var angle = 0;

	 orientationbutton.addEventListener('click',function(){
	 	entirePage.style.display="none";
	 	fourtentirepage.style.display="";
	 })


	zerobutton.addEventListener('click',calibrateOrientation)


	// var updateAngle = false;
	var cnsdf = 0;
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(event){
		 	alfa = event.alpha
			printRelativeOrientation(alfa)
			if (updateAngle) {
				cnsdf++
				if(cnsdf%1000 == 0) alert("Ye")
				newAlpha = Math.sign(event.alpha-realorientation) == 1? Math.round((event.alpha-realorientation+90) % 180 - 90) : Math.round((event.alpha-realorientation-90) % 180 + 90)
				socket.emit('updateAlpha', Math.round(((event.alpha-realorientation+360)%360 + 90)%180 - 90))
			}
		 },false);
	}

	var updateRealAngle = false;
	function calibrateOrientation(){

		updateRealAngle = true;
		zerobutton.onclick ="";
	 	masterorientationdiv.style.display=""
	 	document.getElementById("currentanglediv").style.display="none"

	}

	window.addEventListener('deviceorientation', function(calibration){
		while (updateRealAngle){
			realorientation = calibration.alpha;
			updateRealAngle = false;
		}

	},false)

	function printRelativeOrientation(alfa){
		relativeorientation=Math.round(event.alpha-realorientation)
		relativeor.innerText = relativeorientation.toString();
		realor.innerText = Math.round(realorientation).toString();
	}

	window.addEventListener('deviceorientation', function(data){
		document.getElementById('orientationsupport?').innerText = "Gyroscoop is supported";
		document.getElementById("currentangle").innerText = Math.round(data.alpha).toString();

	}, true);

	var homebutton5 =document.getElementById('4home');
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
		var resolutionWidth = resolutions[selectResolution.value][0];
		var resolutionHeight = resolutions[selectResolution.value][1];
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
		socket.emit("removeStickers")
		clearInterval(screenUpdater);
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

		screenPositions = data;
		calibrated = true
		startPic = takeTrackingPicture();
		updateScreens();

	});

	socket.on('showVisualFeedback',function(){
		secondEntirePage.style.display="none";
		var thirdEntirePage = document.getElementById('thirdEntirePage');
		thirdEntirePage.style.display="";
		var visualfeedbackcanvas=document.getElementById("visualfeedback");
		visualfeedbackcanvas.width = window.innerWidth;
		visualfeedbackcanvas.height = window.innerHeight;


		var feedbackctx = visualfeedback.getContext('2d');

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

	/****************************
	 * Tracker Update functions *
	 ****************************/

	async function updateScreens() {
		if (Object.keys(screenPositions).length == 0){
			return
		}
		let screenRatios
		let stickerLocations
		// copy of screenPositions so tracking can base on original positions
		let AllScreenPositions = JSON.parse(JSON.stringify(screenPositions))
		if (trackingOption == TrackingOptions.sticker) {
			// draw stickers
			screenRatios = await new Promise(function(resolve, reject) {
				socket.emit("drawStickers", null, function(callbackData) {
					resolve(callbackData)
				})
			})
		}
		screenUpdater = setInterval( function() {
			if (updateAngle){
				updateRealAngle = true;
			}
			if (trackingOption == TrackingOptions.none) {
					break
			} else if (trackingOption == TrackingOptions.sticker) {
				stickerLocations = calculateStickerLocations(AllScreenPositions, screenRatios)
				let newStickerLocations = {}
				newStickerLocations = await findNewPointsFromLocationLastPoints(stickerLocations, takeTrackingPicture()).catch(alert("error in finding stickers:\n"+error.message)) // TODO: remove catch for demo
				// console.log(newStickerLocations)
				updateStickerPositions(stickerLocations, newStickerLocations, AllScreenPositions)
				socket.emit('updateScreens', AllScreenPositions);
			} else if (trackingOption == TrackingOptions.tracking) {
				let pic = takeTrackingPicture();
				// console.log(imageObjects)
				AllScreenPositions = JSON.parse(JSON.stringify(screenPositions))
				findVectors(startPic, pic, AllScreenPositions)
				socket.emit('updateScreens', AllScreenPositions);
			}
		}, 30)
	}

	function calculateStickerLocations(screenPositions, screenRatios){
		stickerLocations = {}
		for (screen of Object.keys(screenPositions)){
			corners = screenPositions[screen]
			let vectorTop = {
				x: corners[0].x - corners[3].x,
				y: corners[0].y - corners[3].y
			}
			let vectorBot = {
				x: corners[1].x - corners[2].x,
				y: corners[1].y - corners[2].y
			}
			let vectorRight = {
				x: corners[1].x - corners[0].x,
				y: corners[1].y - corners[0].y
			}
			let vectorLeft = {
				x: corners[2].x - corners[3].x,
				y: corners[2].y - corners[3].y
			}
			let yscale = 0.06
			let xscale = screenRatios[screen]*yscale
			stickerLocations[screen] = [
				{
					x: corners[0].x - vectorTop.x*xscale,
					y: corners[0].y + vectorRight.y*yscale
				},
				{
					x: corners[1].x - vectorBot.x*xscale,
					y: corners[1].y - vectorRight.y*yscale
				},
				{
					x: corners[2].x + vectorBot.x*xscale,
					y: corners[2].y - vectorLeft.y*yscale
				},
				{
					x: corners[3].x + vectorTop.x*xscale,
					y: corners[3].y + vectorLeft.y*yscale
				}
			]
		}
		return stickerLocations
	}

	function updateStickerPositions(oldStickerLocations, newStickerLocations, AllScreenPositions){
		for (screen of Object.keys(newStickerLocations)){
			// define matches
			matches = []
			for (let i=0; i<4; i++){
				matches.push({keypoint1: [oldStickerLocations[screen][i].x, oldStickerLocations[screen][i].y],
											keypoint2: [newStickerLocations[screen][i].x, newStickerLocations[screen][i].y]})
			}
			find_transform(matches, matches.length);
			AllScreenPositions[screen] = transformCorners(homo3x3.data, AllScreenPositions[screen]);
			oldStickerLocations[screen] = newStickerLocations[screen]
		}

	}

	function takeTrackingPicture() {
		let canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		let context = canvas.getContext('2d');
		context.drawImage(video, 0, 0);
		return context.getImageData(0, 0, canvas.width, canvas.height);
	}

	// Homography matrix
	var homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
// all mathces will be marked as good (1) or bad (0)
	var match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);

	function find_transform(matches, count) {
		// motion kernel (Used later to compute homography)
		var mm_kernel = new jsfeat.motion_model.homography2d();
		// ransac params
		var num_model_points = 4;
		var reproj_threshold = 3;
		var ransac_param = new jsfeat.ransac_params_t(num_model_points,
			reproj_threshold, 0.5, 0.99);

		var pattern_xy = [];
		var screen_xy = [];

		// construct correspondences
		for (var i = 0; i < count; ++i) {
			var m = matches[i];
			pattern_xy[i] = {"x": m.keypoint1[0], "y": m.keypoint1[1]};
			screen_xy[i] = {"x": m.keypoint2[0], "y": m.keypoint2[1]};
		}

		// estimate motion with ransac
		var ok = false;
		ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
			pattern_xy, screen_xy, count, homo3x3, match_mask, 1000);

		var pattern_xy2 = [];
		var screen_xy2 = [];
		// extract good matches and re-estimate
		var good_cnt = 0;
		if (ok) {
			for (var i = 0; i < count; ++i) {
				if (match_mask.data[i]) {
					pattern_xy2[good_cnt] = {"x": pattern_xy[i].x, "y": pattern_xy[i].y};
					screen_xy2[good_cnt] = {"x": screen_xy[i].x, "y": screen_xy[i].y};
					good_cnt++;
				}
			}
			// run kernel directly with inliers only
			mm_kernel.run(pattern_xy2, screen_xy2, homo3x3, good_cnt);
		} else {
			jsfeat.matmath.identity_3x3(homo3x3, 1.0);
		}

		return good_cnt;
	}

// console.log(homo3x3.data);

// Multiplies the given matrix with the given points
	function transformCorners(M, oldCorners) {
		var pt = oldCorners;
		var z = 0.0, i = 0, px = 0.0, py = 0.0;
		for (; i < 4; ++i) {
			px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
			py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
			z = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
			pt[i].x = px / z;
			pt[i].y = py / z;
		}

		return pt;
	}

// Searches matches between two images and updates AllScreenPositions
	function findVectors(image1, image2, AllScreenPositions) {
		width1 = image1.width;
		height1 = image1.height;

		width2 = image2.width;
		height2 = image2.height;

		// Parameters for Fast & Brief algorithms
		var descriptorLength = 512;
		var matchesShown = 30;
		var blurRadius = 3;
		tracking.Fast.THRESHOLD = 30;
		tracking.Brief.N = descriptorLength;

		// Set images to grayscale
		var gray1 = tracking.Image.grayscale(tracking.Image.blur(image1.data, width1, height1, blurRadius), width1, height1);
		var gray2 = tracking.Image.grayscale(tracking.Image.blur(image2.data, width2, height2, blurRadius), width2, height2);

		// find corners on the two images
		var corners1 = tracking.Fast.findCorners(gray1, width1, height1);
		var corners2 = tracking.Fast.findCorners(gray2, width2, height2);

		// find descriptors of images
		var descriptors1 = tracking.Brief.getDescriptors(gray1, width1, corners1);
		var descriptors2 = tracking.Brief.getDescriptors(gray2, width2, corners2);

		// Matches are found using Brief
		var matches = tracking.Brief.reciprocalMatch(corners1, descriptors1, corners2, descriptors2);
		matches.sort(function (a, b) {
			return b.confidence - a.confidence;
		});

		find_transform(matches, matches.length);

		for (const [key, value] of Object.entries(AllScreenPositions)) {
			newCorners = transformCorners(homo3x3.data, AllScreenPositions[key]);
			AllScreenPositions[key] = newCorners;
		}
	}



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
