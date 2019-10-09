// Make Connection
var socket = io.connect('http://localhost:8000');

//html variables
var body =document.getElementsByTagName('body');
var masterbutton = document.getElementById('masterButton');


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

















