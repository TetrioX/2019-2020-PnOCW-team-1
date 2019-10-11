var express = require('express');
var socket = require('socket.io');

//App setup
var app = express();
var server = app.listen(8000, function(){
    console.log('listening to requests on port 8000')
});

//Static files

app.get('/master', function(req,res){
	res.sendFile(__dirname + '/public/master.html')
})

app.get('', function(req,res){
	res.sendFile(__dirname + '/public/slave.html')
})




//Socket setup
var io =socket(server);

io.on('connect', function(socket){

//sending who is master
	socket.on('registerMaster', function(data){
		io.sockets.emit('registerMaster',data);
<<<<<<< HEAD
	});

	socket.on('changeBackgroundColor',function(data){
		io.sockets.emit('changeBackgroundColor',data);
=======
>>>>>>> Task2
	});
//sending photo
	socket.on('sendingPicture', function(data) {
		io.sockets.emit('sendingPicture',data);
	})
});







