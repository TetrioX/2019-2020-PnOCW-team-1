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
	});

	socket.on('changeBackgroundColor',function(data){
		io.sockets.emit('changeBackgroundColor',data);
	});
	socket.on('drawLine', function (data) {
		io.sockets.emit('drawLine', data);
	});
//sending photo
	socket.on("SendingPicture", function(data) {
		io.sockets.emit("SendingPicture", data);
	})
});
