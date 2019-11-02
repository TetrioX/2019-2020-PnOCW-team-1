var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');
const scrnrec = require('../imageProcessing/screenRecognitionDirect.js')
const scrnread = require('../imageProcessing/screenReading.js')
// load config file
const config = require('./config.json');

//App setup
var app = express();
var server = app.listen(config.port, function(){
    console.log('listening to requests on port '+config.port)
});
//Socket setup
var io = socket(server);

var slaves = {}
var salveSockets = {}
var number = 0

//adjust this if you want to have more colorlist
 const possibleColors =[ "red", "green", "blue", "#00FFFF","#FFFF00","#FF00FF"]


function deleteSlave(socket) {
   delete slaves[socket.id]
    masterIo.emit("removeSlave", socket.id)
}

function addSlave(socket) {
    slaves[socket.id] = ++number
    salveSockets[socket.id] = socket
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

// Fisher–Yates Shuffle
// source: https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var copy = [], n = array.length, i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
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
  return shuffle(combs)
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
			slaveIo.emit('changeBackgroundColor', data);
		  };
  	});

    socket.on('changeBackgroundOfAllSlaves', async function(data){
      // number of color combinations we need
      var nbOfColorCombs = Object.keys(slaves).length * (data.numberOfRows * data.numberOfColumns + 2)
      // calculate how many pictues should be taken
      var nbOfPictures = Math.ceil(Math.log(nbOfColorCombs + possibleColors.length)/Math.log(possibleColors.length))
      var allColorCombinations = getColorComb(nbOfPictures)
      var screens = {}
      var colorCombs = {};
      Object.keys(slaves).forEach(function(slave, index) {
        // slaves[slave] is the slave ID
        var colorGrid = createColorGrid(data.numberOfRows,data.numberOfColumns, allColorCombinations, slaves[slave])
        slaveIo.to(`${slave}`).emit('changeBackgroundOfAllSlaves',{
          grid: colorGrid.grid,
          cornBorder: colorGrid.grid.cornBorder,
          sideBorder: colorGrid.grid.sideBorder
        });
        // after we've transimited the cornBorder and sideBorder we change its value
        // to its color value.
        colorGrid.grid['cornBorder'] = scrnread.colorToValueList(colorGrid.grid.cornBorder)
        colorGrid.grid['sideBorder'] = scrnread.colorToValueList(colorGrid.grid.sideBorder)
        // add the grid to screens
        screens[slaves[slave]] = colorGrid.grid
        // add the new color combinations to the colorComb Object
        colorCombs = {...colorCombs, ...colorGrid.comb}
      })
      // TODO: matrixes should be get out of array of buffers and used for getScreens
      console.log(await takePicture(nbOfPictures))
    });

    // takes a picture with i the current picture and n the total number of pictures
    // and pictues a list with all taken pictures
    async function takePicture(n){
      var pictures = []
      // loop untill break statement
      var i = 0
      while(true){
        var picPromise = new Promise(function(resolve, reject) {
          socket.emit('takeOnePicture', {}, async function(callBackData){
            resolve(callBackData)
          })
          setTimeout(function() {
            // if it takes longer than 0.5 seconds reject the promise
            reject()
          }, 500);
        })
        var picture = await picPromise
        pictures.push(decodeBase64Image(picture).data)
        i += 1
        if (i < n){
          // promises that will be fulfilled once the screens have changed color
          var promises = []
          Object.keys(slaves).forEach(async function(slave, index) {
            var promise = new Promise(function(resolve, reject) {
              salveSockets[slave].emit('changeGrid', i, function(callBackData){
              // fulfill promise
              resolve()
              })
              setTimeout(function() {
                // if it takes longer than 0.5 seconds reject the promise
              	reject()
              }, 500);
            })
            promises.push(promise)
          })
          // wait untill all screens have changed
          await Promise.all(promises)
        }
        else{
          break
        }
      }
      return pictures
    }

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
function createColorGrid(nbrows, nbcolumns, allColorCombinations, slaveID){
  var colorGrid = {
    grid: [],
    comb: {}
  }
  for (var i = 0; i<nbrows; i++){
    colorGrid.grid.push([]);
    for (var j = 0; j<nbcolumns; j++){
      var colorComb = allColorCombinations.pop()
      colorGrid.grid[i].push(colorComb);
      // the key is the integer value of the color comb and the value
      // is the location of the quadrangle in the grid.
      colorGrid.comb[scrnread.colorToValueList(colorComb)] = {
        screen:slaveID,
        row:i,
        col:j
      }
    }
  }
  // generate a color for the side and corner border.
  var cornBorder = allColorCombinations.pop()
  var sideBorder = allColorCombinations.pop()
  colorGrid.grid['cornBorder'] = cornBorder
  colorGrid.grid['sideBorder'] = sideBorder

  return colorGrid;
  }
