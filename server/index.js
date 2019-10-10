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
	console.log('made socket connection with', socket.id);
//sending who is master
	socket.on('registerMaster', function(data){
		io.sockets.emit('registerMaster',data);
		console.log("master is send");

	});
});








