var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');
const scrnrec = require('../imageProcessing/screenRecognitionDirect.js')

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
    response.data = new Buffer.alloc(matches[2].length, matches[2], 'base64'); //¨Possible bug present

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
    });

    socket.on('changeBackgroundColor', function(data){
		if (data.id) slaveIo.to(`${data.id}`).emit('changeBackgroundColor',data);
		else {
			console.log(data)
			slaveIo.emit('changeBackgroundColor', data);
		};

    socket.on('changeBackgroundOfAllSlaves', function(data){
      const slavesID = Object.keys(slaves);
      for (i=0;i < slavesID.length;i++){
        slaveIo.to(`${slavesID[i]}`).emit('changeBackgroundOfAllSlaves',createColorGrid(data.nbrows,data.nbcolumns));
      }
    });

	});

    socket.on('upload-image', function (data) {
		if (data.destination) fs.writeFileSync(`./Pictures/slave-${data.destination}.png`, decodeBase64Image(data.buffer).data)
		else fs.writeFileSync(`./Pictures/image-${imageIndex}.png`, decodeBase64Image(data.buffer).data);
        masterIo.emit('imageSaved')
        imageIndex += 1;
    });

    socket.on('drawLine', function(data){
      slaveIo.emit('drawLine', data);
  	});

    socket.on('calibrate', function(data){
		slaveIo.emit('changeBackgroundColor', {colorValue: '#000000'});
		socket.emit('takePictures', {slaves: {0:'m'}}, function(callbackData){
			socket.emit('takePictures', {slaves: slaves},
				function(callbackData){
					console.log('Took enough pictures.')
					imgs = [`./Pictures/slave-m.png`] // If this picture doesnot exist an error may be send
					for (var key in slaves) imgs.push(`./Pictures/slave-${slaves[key]}.png`) // Implement all slave pictures
					scrnrec.findScreen(imgs) // Implement the screen recognition
				})
		})
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



//creating grids with a number of columns and a number of rows
function createColorGrid(nbrows, nbcolumns){
  var colorGrid =[];
  for (var i = 0; i<nbrows; i++){
    matrix[i] = [];
    for (var j = 0; j<nbcolumns; j++)
      matrix[i][j]= allColorCombinations[allColorCombinations.length-1];
      allColorCombinations.pop();
  return colorGrid;
  }
}

// make a list of #pictures-taken colors( if you take 4
//pictures the list will be 4 items long)


//adjust this if you want to have more colorlist
 var possibleColors =[ "red", "green", "blue", "#00FFFF","#FFFF00","#FF00FF"]
const allColorCombinations = function getCombColors(nbOfpictures, list){
  // end of recursion
  if (nbOfpictures == 0){
    return list
  }
  // create a list with color values
  if (list === 'undefined'){
    return getCombColors(n-1, possibleColors.slice())
  }
  // add all color values to each combination to the list once.
  for (comb of list){
    for (col of possibleColors){
      comb.push(col)
    }
  }
  return getCombColors(nbOfpictures-1, list)
}
