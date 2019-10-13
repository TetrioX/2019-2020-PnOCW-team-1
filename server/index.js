var express = require('express');
var socket = require('socket.io');

//App setup
var app = express();
var server = app.listen(8000, function(){
    console.log('listening to requests on port 8000')
});
//Socket setup
var io = socket(server);

var slaves = {}
var number = 0

function deleteSlave(socket) {
   delete slaves[socket.id]
    masterIo.emit("removeSlave", socket.id)
}

function addSlave(socket) {
    slaves[socket.id] = ++number
    masterIo.emit('registerSlave', {
        number: number,
        socket_id: socket.id
    })
    socket.emit('slaveID', number)
}

//Static files

app.get('/master', function(req,res){
	res.sendFile(__dirname + '/public/master.html')
})

app.get('', function(req,res){
	res.sendFile(__dirname + '/public/slave.html')
})



var masterIo = io.of('/master').on('connect', function(socket){
  socket.broadcast.emit('registerMaster')
  console.log(slaves)-
  socket.emit('slaveSet', {
    slaves: slaves
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