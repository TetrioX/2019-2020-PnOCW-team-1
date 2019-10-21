var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');


//App setup
var app = express();
var server = app.listen(8001, function(){
    console.log('listening to requests on port 8001')
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

app.use('/static', express.static(__dirname +  '/public'))

var masterIo = io.of('/master').on('connect', function(socket){
    socket.broadcast.emit('registerMaster')
    var imageIndex = 0;
    socket.emit('slaveSet', {
        slaves: slaves
    })

    socket.on('changeBackgroundColor',function(data){
      if (data.id){
        slaveIo.to(`${data.id}`).emit('changeBackgroundColor',data);
      } else{
        slaveIo.emit('changeBackgroundColor',data);
      }

	});

    socket.on('upload-image', function (data) {
        fs.writeFileSync(`image-${imageIndex}.png`, decodeBase64Image(data.buffer).data); //Deze lijn netter gemaakt, zou moeten werken
        masterIo.emit('imageSaved')
        imageIndex += 1;
    });

    socket.on('drawLine', function(data){
      slaveIo.emit('drawLine', data);
  	});

    socket.on('calibrate', function(data){
		socket.emit('takePicture', { mode: 'white' }, 
		function(callbackData){
			console.log('test')
			socket.emit('takePicture', { mode: 'black' }, 
				function(callbackData){
					console.log('took 2 pictures.')
				})
		})
		imgs = []
		for (let i = 0; i < slaves.length; i++) imgs.push(`image-${imageIndex}.png`)
		scrnrec.findScreen(imgs) // Alleen nog exporten, ik kan dit niet testen dus pakt dat we dit doen tijdens de zitting maandag
    })
})

var slaveIo = io.of('/slave').on('connect', function(socket){
  addSlave(socket)

	socket.on('changeBackgroundColor',function(data){
		io.sockets.emit('changeBackgroundColor',data);
	});
//sending photo
	socket.on("SendingPicture", function(data) {
		io.sockets.emit("SendingPicture", data);
	})
  socket.on('disconnect', function() {
    deleteSlave(socket)
  })
});
