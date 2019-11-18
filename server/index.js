var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');
const scrnrec = require('../imageProcessing/screenRecognitionDirect.js')
const scrnread = require('../imageProcessing/screenReading.js')
const imgprcssrgb = require('../ImageProcessingRGB/imageProcessingRGB.js')
// const screenorientation = require('../screenOrientation/UnusedScript/orientationCalculation.js')
const delaunay = require('../triangulate_divide_and_conquer/delaunay.js')
// load config file
const config = require('./config.json');

const { argv } = require('yargs')
                  .boolean('save-debug-files')
                  .default('grid-pause', 0)

var saveDebugFiles = argv['save-debug-files']
var gridPause = argv['grid-pause']
var debugPath = './debug'
var debugDirPromise = new Promise(function(resolve, reject){
  fs.mkdir(debugPath, { recursive: true }, (err) => {
  if (err) reject(err);
  else resolve()
  });
}).catch((err) => {console.log(err)})
var AllScreenPositions={};
var picDimensions = []



//App setup
var app = express();
var server = app.listen(config.port, function(){
    console.log('listening to requests on port '+config.port)
});
//Socket setup
// pingInterval is used to determine the latency
var io = socket(server, {pingInterval: 200});

var slaves = {}
var slaveSockets = {}
var number = 0

//adjust this if you want to have more colorlist
 const possibleColors =[ "red", "green", "blue", "#00FFFF","#FFFF00","#FF00FF"]


function deleteSlave(socket) {
   delete slaves[socket.id]
    masterIo.emit("removeSlave", socket.id)
}

function addSlave(socket) {
    slaves[socket.id] = ++number
    slaveSockets[socket.id] = socket
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
    let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let response = {};

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
  let copy = [], n = array.length, i;

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
  let combs = []
  for (let col of possibleColors){
    combs.push([col])
  }
  for (let i=1; i<n; i++) {
    let newCombs = []
    for (let com of combs){
      for (col of possibleColors){
        // copy
        let ccom = com.slice()
        ccom.push(col)
        newCombs.push(ccom)
      }
    }
    combs = newCombs
  }
  // remove combinations with only the same value
  // f.e. ['blue', 'blue', 'blue']
  let remIndex = [] // list of indexes to remove
  for (let i in combs){
    // set the prevCol to the first color
    let prevCol = combs[i][0]
    let diffValue = false
    // check if each color equals the prev color
    for (let col of combs[i]){
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
  for (let i = remIndex.length - 1; i >= 0; i-= 1){
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
app.use('/debug', express.static(__dirname + '/'))

app.use('/static', express.static(__dirname +  '/public'))

io.of('/master').use(function(socket, next) {
  let passwd = socket.handshake.query.passwd
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
		  }
  	});

    async function calibrate(numberOfRows, numberOfColumns){
      // number of color combinations we need
      var nbOfColorCombs = Object.keys(slaves).length * 10
      // calculate how many pictues should be taken
      let nbOfPictures = Math.ceil(Math.log(nbOfColorCombs + possibleColors.length)/Math.log(possibleColors.length))
      let allColorCombinations = getColorComb(nbOfPictures)
      let screens = {}
      let colorCombs = {};
      // all promises that will be resolved when a grid has been created
      let createGridPromises = [];
      await Promise.all(Object.keys(slaves).map(async (slave) => {
        if (numberOfRows == null && numberOfColumns == null) {
          //Get the dimensions of the screen and change the grid according to width and height of the screen.
          let waitForDim = new Promise(function (resolve, reject) {
            slaveSockets[slave].emit('getDim', 0, function (callBackData) {
              var h = callBackData.height
              var w = callBackData.width
              var wDivH = w / h
              if (1.75 <= wDivH) { numberOfRows = 2, numberOfColumns = 4 } //Math.round(wDivH * 2)
              else if (1.25 <= wDivH && wDivH < 1.75) { numberOfRows = 2, numberOfColumns = 3 }
              else if (0.75 <= wDivH && wDivH < 1.25) { numberOfRows = 3, numberOfColumns = 3 }
              else if (0.5 <= wDivH && wDivH < 0.75) { numberOfRows = 3, numberOfColumns = 2 }
              else if (wDivH < 0.5) { numberOfRows = 4, numberOfColumns = 2 } //Math.round((1 / wDivH) * 2)
              else {
                  throw new Error("Height & Width problem")
              }
              resolve({ nR: numberOfRows, nC: numberOfColumns })
            })
          })
          let dim = await waitForDim
          numberOfRows = dim.nR
          numberOfColumns = dim.nC
        }
        // slaves[slave] is the slave ID
        let gridAndCombs = createColorGrid(numberOfRows,numberOfColumns, allColorCombinations, slaves[slave])
        createGridPromises.push(new Promise(function(resolve, reject) {
          slaveSockets[slave].emit('changeBackgroundOfAllSlaves', gridAndCombs.colorGrid, function(callBackData){
            resolve()
          })
          setTimeout(function() {
            // if it takes longer than 1 seconds reject the promise
            // TODO: should be rejected and handled
            resolve()
          }, 1000);
        }))
        // add the grid to screens
        screens[slaves[slave]] = gridAndCombs.colorGrid
        // add the new color combinations to the colorComb Object
        colorCombs = {...colorCombs, ...gridAndCombs.comb}
      }))
      // wait for grids to be created
      await Promise.all(createGridPromises)
      let pictures = await takePicture(nbOfPictures)
      if (pictures == null){
        return null
      }
      // remove all the grids
      // TODO: use the callback
      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('removeGrid')
      })
      if (saveDebugFiles) {
        await debugDirPromise
        fs.writeFile(debugPath+`/screens.json`, JSON.stringify(screens), (err) => {if (err) console.log(err)})
        fs.writeFile(debugPath+`/colorCombs.json`, JSON.stringify(colorCombs), (err) => {if (err) console.log(err)})
        for (let i in pictures){
          fs.writeFile(debugPath+`/image-${i}.png`, pictures[i], (err) => {if (err) console.log(err)});
        }
      }
      let matrixes = await imgprcssrgb.doImgDiff(pictures, false, false)
      matrixes = matrixes.matrix
      if (saveDebugFiles) {
          fs.writeFile(debugPath+`/matrixes.json`, JSON.stringify(matrixes), (err) => {if (err) console.log(err)})
      }
      picDimensions = [matrixes[0].length, matrixes[0][0].length]
      let squares = scrnread.getScreens(matrixes, screens, colorCombs, possibleColors.length)
      console.log(squares)
      return scrnread.getScreenFromSquares(squares, screens)
    }

    // takes a picture with i the current picture and n the total number of pictures
    // and pictues a list with all taken pictures
    async function takePicture(n){
      let pictures = []
      // loop untill break statement
      let i = 0
      while(true){
        let picPromise = new Promise(function(resolve, reject) {
          socket.emit('takeOnePicture', {}, async function(callBackData){
            resolve(callBackData)
          })
          setTimeout(function() {
            // if it takes longer than 3 seconds reject the promise
            // TODO: should be rejected and handled
            reject()
          }, 3000);
        }).catch(function(error) {
          // failed to retrieve the image
          socket.emit('alert', "Retrieving one of the images timed out.")
          throw new Error("Retrieving one of the images timed out.")
        })
        let picture = await picPromise
        pictures.push(decodeBase64Image(picture).data)
        i += 1
        if (i < n){
          // promises that will be fulfilled once the screens have changed color
          let promises = []
          await sleep(Number(gridPause))
          Object.keys(slaves).forEach(async function(slave, index) {
            let promise = new Promise(function(resolve, reject) {
              slaveSockets[slave].emit('changeGrid', i, function(callBackData){
              // fulfill promise
              resolve()
              })
              setTimeout(function() {
                // if it takes longer than 0.5 seconds reject the promise
                // TODO: should be rejected and handled
              	resolve()
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
      await sleep(Number(gridPause))
      return pictures
    }

    socket.on('changeBackgroundOfAllSlaves', async function(data){
      var screens = await calibrate(data.numberOfRows, data.numberOfColumns)
      var screenKeys = Object.keys(screens)
      if (screenKeys.length == 0){
        socket.emit('alert', "didn't find any screens.")
        return
      } else{
        socket.emit('alert', "found these screens: "+screenKeys.toString() )
      }
      console.log(screens)
      AllScreenPositions = screens;
    });

    function sleep(ms){
    	return new Promise(resolve => setTimeout(resolve, ms));
    }

    socket.on('upload-image', function (data) {
		if (data.destination) fs.writeFileSync(`./slave-${data.destination}.png`, decodeBase64Image(data.buffer).data)
		else fs.writeFileSync(`./image-${imageIndex}.png`, decodeBase64Image(data.buffer).data);
        masterIo.emit('imageSaved')
        imageIndex += 1;
    });

    socket.on('drawLine', function(data){
      slaveIo.emit('drawLine', data);
  	});

    socket.on('drawStar', function () {
        slaveIo.emit('drawStar');
    });

    socket.on('triangulate', async function(data){
        var screens = await calibrate(data.numberOfRows, data.numberOfColumns)
        console.log(screens)
        var screenKeys = Object.keys(screens)
        if (screenKeys.length == 0){
          socket.emit('alert', "didn't find any screens.")
          return
        } else{
          socket.emit('alert', "found these screens: "+screenKeys.toString() )
        }
        var data = screenorientation.getScreens(screens);
        console.log(data)
        var angles = delaunay.getAngles(data);
        console.log(angles)
        Object.keys(slaves).forEach(function(slave, index) {
          // if we found the screen send it which angles it should draw
          if (typeof angles[slaves[slave]] !== 'undefined'){
            slaveSockets[slave].emit('triangulate', angles[slaves[slave]]);
          }
        });
    });

    socket.on('calibrate', function(data) {
        slaveIo.emit('changeBackgroundColor', {colorValue: '#000000'});
        socket.emit('takePictures', {slaves: {0: 'm'}}, function (callbackData) {
            socket.emit('takePictures', {slaves: slaves},
                function (callbackData) {
                    console.log('Took enough pictures.')
                    imgs = [`./Pictures/slave-m.png`] // If this picture doesnot exist an error may be send
                    for (var key in slaves) imgs.push(`./Pictures/slave-${slaves[key]}.png`) // Implement all slave pictures
                    scrnrec.findScreen(imgs) // Implement the screen recognition
                })
        })
    });
    socket.on('broadcastImage', function(){
      // console.log('wil broadcast image');
      // Object.keys(slaves).forEach(function(slave, index) {
      // console.log(AllScreenPositions[slaves[slave]]);
      //   slaveSockets[slave].emit('broadcastImage', AllScreenPositions[slaves[slave]]);
      //})
      // load the image that should be sent
      let image = fs.readFileSync('./public/ImageShowOffTest2.jpg').toString('base64')
      // send to each slave
      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('showPicture', {
          corners: AllScreenPositions[slaves[slave]],
          picture: image,
          picDim: picDimensions
        });
      })
    })

    var countdownUpdater = null
    socket.on('startCountdown', function(data){
      clearInterval(countdownUpdater)
      let startTime = new Date()
      slaveIo.emit('startCountdown', data)
      // updates the offset every 50ms
      countdownUpdater = setInterval(function(){
        let offset = new Date() - startTime
        slaveIo.emit('updateCountdown', offset)
      }, 200)
      // stop sending updates after the timer has been completed.
      setTimeout(function() {
      	clearInterval(countdownUpdater)
      }, data*1000);
    })

});


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
function createColorGrid(nbrows, nbcolumns, allColorCombinations, slaveID) {
    let result = {
        colorGrid: {grid: []},
        comb: {}
    }
    for (let i = 0; i < nbrows; i++) {
        result.colorGrid.grid.push([]);
        for (let j = 0; j < nbcolumns; j++) {
            let colorComb = allColorCombinations.pop()
            result.colorGrid.grid[i].push(colorComb);
            // the key is the integer value of the color comb and the value
            // is the location of the quadrangle in the grid.
            result.comb[scrnread.colorToValueList(colorComb, possibleColors.length)] = {
                screen: slaveID,
                row: i,
                col: j
            }
        }
    }
    // generate a color for the side and corner border.
    let cornBorder = allColorCombinations.pop();
    let sideBorder = allColorCombinations.pop();
    result.colorGrid['cornBorder'] = cornBorder;
    result.colorGrid['sideBorder'] = sideBorder;

    return result;
}
