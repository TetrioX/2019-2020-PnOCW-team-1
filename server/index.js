var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');

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

// Decoding base-64 image
// Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
function decodeBase64Image(dataString)
{
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};

    if (matches.length !== 3)
    {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
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
    var imageIndex = 0;
    console.log(slaves)-
    socket.emit('slaveSet', {
        slaves: Array.from(slaves)
    })
    socket.on('changeBackgroundColor',function(data){
		slaveIo.to(`${data.id}`).emit('changeBackgroundColor',data);
	});

    socket.on('upload-image', function (data) {
        console.log(data.buffer)
        fs.writeFileSync('image-' + imageIndex + '.png', decodeBase64Image(data.buffer).data);
        imageIndex += 1;
    });
})

var slaveIo = io.of('/slave').on('connect', function(socket){
  addSlave(socket)

  socket.on('disconnect', function() {
    deleteSlave(socket)
  }
)});
