var express = require('express');
var socket = require('socket.io');

//App setup
var app = express();
var server = app.listen(8000, function(){
    console.log('listening to requests on port 8000')
});

var slaves = new Set();

function deleteSlave(slave){
  masterIo.emit("removeSlave", slave.id)
  slaves.delete(slave.id)
}

function addSlave(slave){
  masterIo.emit('registerSlave', slave.id);
  slaves.add(slave.id)
}

//Static files

app.get('/master', function(req,res){
	res.sendFile(__dirname + '/public/master.html')
})

app.get('', function(req,res){
	res.sendFile(__dirname + '/public/slave.html')
})

//Socket setup
var io =socket(server);

var masterIo = io.of('/master').on('connect', function(socket){
  socket.broadcast.emit('registerMaster')
  console.log(slaves)-
  socket.emit('slaveSet', {
    slaves: Array.from(slaves)
  })
  socket.on('changeBackgroundColor',function(data){
		slaveIo.to(`${data.id}`).emit('changeBackgroundColor',data);
	});
})

var slaveIo = io.of('/slave').on('connect', function(socket){
  addSlave(socket)
//sending photo
	socket.on('SendingPicture', function(data) {
		console.log("geraak ik hier?");
		io.sockets.emit("SendingPicture", data);
	})

  socket.on('disconnect', function() {
    deleteSlave(socket)
  }
)});
