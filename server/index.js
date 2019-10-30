var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');
const scrnrec = require('../imageProcessing/screenRecognitionDirect.js')
// load config file
const config = require('./config.json');

//App setup
var app = express();
var server = app.listen(8001, function(){
    console.log('listening to requests on port 8001')
});
//Socket setup
var io = socket(server);

var slaves = {}
var number = 0

//adjust this if you want to have more colorlist
 var possibleColors =[ "red", "green", "blue", "#00FFFF","#FFFF00","#FF00FF"]
// TODO: should be created when the calibration button is pressed
var allColorCombinations = getColorComb(4)

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

// generates a list of color combinations
function getColorComb(n){
  //create combinations of all colors (n=1)
  var combs = []
  for (var col of possibleColors){
    combs.push([col])
  }
  for (var i=1; i<n; i++) {
    var newCombs = []
    for (var com of combs){
      for (col of possibleColors){
        // copy
        var ccom = com.slice()
        ccom.push(col)
        newCombs.push(ccom)
      }
    }
    combs = newCombs
  }
  // remove combinations with only the same value
  // f.e. ['blue', 'blue', 'blue']
  var remIndex = [] // list of indexes to remove
  for (var i in combs){
    // set the prevCol to the first color
    var prevCol = combs[i][0]
    var diffValue = false
    // check if each color equals the prev color
    for (var col of combs[i]){
      if (prevCol != col){
        // there is a color difference
        diffValue = true
        break
      }
      prevCol = col
    }
    if (diffValue == false){
      remIndex.push(Number(i))
    }
  }
  // we iterate backwards so we don't affect the indexes of the values that
  // we still have to remove.
  for (var i = remIndex.length - 1; i >= 0; i-= 1){
    // remove value on index i
    combs.splice(remIndex[i], 1)
  }
  return combs
}

//Static files

app.get('/master', function(req,res){
	res.sendFile(__dirname + '/public/master.html')
})

app.get('', function(req,res){
	res.sendFile(__dirname + '/public/slave.html')
})

app.use('/static', express.static(__dirname +  '/public'))

io.of('/master').use(function(socket, next) {
  var passwd = socket.handshake.query.passwd
  if (passwd == config.masterPasswd){
    next();
  } else{
     next(new Error("not authorized"));
  }

});

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
  	});
    
    socket.on('changeBackgroundOfAllSlaves', function(data){
      console.log("message recieved, should make grid")
      const slavesID = Object.keys(slaves);
      for (i=0;i < slavesID.length;i++){
        slaveIo.to(`${slavesID[i]}`).emit('changeBackgroundOfAllSlaves',createColorGrid(data.numberOfRows,data.numberOfColumns));
      }
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
    colorGrid.push([]);
    for (var j = 0; j<nbcolumns; j++){
      colorGrid[i].push(allColorCombinations.pop());
      
    }
  }
  return colorGrid;
}
