// Make Connection
var socket = io.connect('http://localhost:8000');

//html variables
var body =document.getElementsByTagName('body');
var masterbutton = document.getElementById('masterButton');


//Foto nemen
window.addEventListener("load", function(){
	// [1] GET ALL THE HTML ELEMENTS
	var video = document.getElementById("vid-show"),
		canvas = document.getElementById("vid-canvas"),
		take = document.getElementById("vid-take");

	// [2] ASK FOR USER PERMISSION TO ACCESS CAMERA
	// WILL FAIL IF NO CAMERA IS ATTACHED TO COMPUTER
	navigator.mediaDevices.getUserMedia({ video : true })
		.then(function(stream) {
			// [3] SHOW VIDEO STREAM ON VIDEO TAG
			video.srcObject = stream;
			video.play();

			// [4] WHEN WE CLICK ON "TAKE PHOTO" BUTTON
			take.addEventListener('click', function(){
				// Create snapshot from video
				var draw = document.createElement('canvas');
				draw.width = video.videoWidth;
				draw.height = video.videoHeight;
				var context2D = draw.getContext('2d');
				context2D.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
				// Put into canvas container
				canvas.innerHTML = "";
				canvas.appendChild(draw);
				// Upload to server
				socket.emit('sendingPicture',{
					canvas:canvas
				});
			});
		})
		.catch(function(err) {
			document.getElementById("vid-controls").innerHTML = "Please enable access and attach a camera";
		});
});


//Listening for events
var socketID = null;
var master = null;

socket.on('connect', function(){
	socketID = socket.id;
	console.log(socketID);
});
socket.on('registerMaster', function(data){
	master = data.socketID;
	if (master != socket.id){
		console.log('ik ben een slaaf');
		changeFiles("slave.html");
	}
	else{
		changeFiles("master.html");
	}
});


//Emit events
masterbutton.addEventListener('click', function(){

	socket.emit('registerMaster',{
		socketID: socketID	
	});
	


	
});

//functions
function changeFiles(file){
	window.location.href = (file);
};

















