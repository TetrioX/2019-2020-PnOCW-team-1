var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var socket = require('socket.io');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/client.HTML');
});


/*****************
  * Slave setup *
 *****************/
var slaves = {}
var slaveSockets = {}
var slaveNumber = 0

function deleteSlave(socket) {
  console.log("deleteted")
  delete slaves[socket.id];
}

function addSlave(socket) {
    console.log("nr.: ", slaveNumber)
    slaves[socket.id] = ++slaveNumber
    slaveSockets[socket.id] = socket
    socket.emit('id', socket.id)
}


/******************
  * Slave socket *
 ******************/

var slaveIo = io.on('connection', function(socket){
    addSlave(socket)

    socket.on('disconnect', function() {
      deleteSlave(socket)
    })
})



var loadAdress = 3000

var server = http.listen(loadAdress, function(){
    console.log(`listening on *:${loadAdress}`);
});

var io = socket(server, {pingInterval: 200, pingTimeout: 600000});

app.use('/static', express.static(__dirname + '/public'));
