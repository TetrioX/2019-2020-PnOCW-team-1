var express = require('express');
var socket = require('socket.io');
var fs = fs = require('fs');
var ss = require('socket.io-stream');
// const scrnrec = require('../screenProcessing/screenRecognitionDirect.js')
const scrnread = require('./lib/screenProcessing/screenReading.js')
const imgprcss = require('./lib/screenProcessing/readImage.js')
const screenorientation = require('./lib/screenOrientation/orientationCalculation.js')
const delaunay = require('./lib/triangulate_divide_and_conquer/delaunay.js')
const geometry = require('./lib/triangulate_divide_and_conquer/geometry.js')
var snakeJs = require('./lib/SnakeLogic/snake.js')
var worldJs = require('./lib/SnakeLogic/world.js')

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
AllScreenPositions = {}
var latSlaves = {}
var picDimensions = [];
var calibrationPicture;


//App setup
var app = express();
var server = app.listen(config.port, function(){
    console.log('listening to requests on port '+ config.port)
});
//Socket setup
// pingInterval is used to determine the latency
var io = socket(server, {pingInterval: 200, pingTimeout: 600000});

var slaves = {}
var slaveSockets = {}
var playerColors = {}
var players = {}
var playerSockets = {}
var slaveNumber = 0
var playerNumber = 0

//adjust this if you want to have more colorlist
 const possibleColors =[ "red", "#00FF00", "blue", "#00FFFF","#FFFF00","#FF00FF"]

/*****************
  * Slave setup *
 *****************/
function deleteSlave(socket) {
  delete AllScreenPositions[slaves[socket.id]];
  delete slaves[socket.id];
  masterIo.emit("removeSlave", socket.id);
}

function addSlave(socket) {
    slaves[socket.id] = ++slaveNumber
    slaveSockets[socket.id] = socket
    masterIo.emit('registerSlave', {
        number: slaveNumber,
        socket_id: socket.id
    })
    socket.emit('slaveID', slaveNumber)
}

/*****************
  * Player setup *
 *****************/
function deletePlayer(socket) {
  delete AllScreenPositions[slaves[socket.id]];
  delete players[socket.id];
}

function addPlayer(socket) {
    players[socket.id] = ++playerNumber
    playerSockets[socket.id] = socket
    console.log("hello, ik ben ", playerNumber)
    socket.emit('playerID', {number: playerNumber, socket: socket.id})
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Decoding base-64 image
// Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
async function decodeBase64Image(dataString)
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


/**************************
  * Recognition function *
 **************************/

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


/***************
  * App setup *
 ***************/

app.get('/master', function(req,res){
	res.sendFile(__dirname + '/public/master.html')
})

app.get('/player', function(req,res){
  res.sendFile(__dirname + '/public/player.html')
})

app.get('', function(req,res){
	res.sendFile(__dirname + '/public/slave.html')
})
app.use('/debug', express.static(__dirname + '/debug'))

app.use('/static', express.static(__dirname +  '/public'))


/***************
  * Master Io *
 ***************/

io.of('/master').use(function(socket, next) {
  let passwd = socket.handshake.query.passwd
  if (passwd == config.masterPasswd){
    next();
  } else{
     next(new Error("not authorized"));
  }

});

// variables/function needed for video by master and slave
var videoUpdater = null
async function resumeVideo(startTime){
  clearInterval(videoUpdater)
  let maxLat = Math.max(Object.values(latSlaves))
  slaveIo.emit('playVideo', {
    maxLat: maxLat
  })
  await sleep(maxLat)
  /**resumeTime = new Date()
  videoUpdater = setInterval(function(){
    let offset = startTime - resumeTime + Date.parse(new Date())
    slaveIo.emit('updateVideo', offset)
  }, 200)*/
}

var masterIo = io.of('/master').on('connect', function(socket){
    socket.broadcast.emit('registerMaster')
    var imageIndex = 0;
    socket.emit('slaveSet', {
        slaves: slaves
    });

    socket.on('changeBackgroundColor', function(data){
		if (data.id) slaveIo.to(`${data.id}`).emit('changeBackgroundColor',data);
		else slaveIo.emit('changeBackgroundColor', data);
  	});

    ///////////////
    // clear all //
    ///////////////
    var checkInterval;
    function clearAll() {
      stopGame = true;
      deleteWorld();
      clearInterval(checkInterval);
      clearInterval(videoUpdater);
      clearInterval(countdownUpdater);
      slaveIo.emit('clearAll');
      playerIo.emit('clearAll');
    }

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

            setTimeout(() => reject(new Error("Failed to show grid on screens")), 1000);
        }).catch(function() {
            deleteSlave(slaveSockets[slave]);
        }));
        // add the grid to screens
        screens[slaves[slave]] = gridAndCombs.colorGrid
        // add the new color combinations to the colorComb Object
        colorCombs = {...colorCombs, ...gridAndCombs.comb}
      }))
      // wait for grids to be created
      await Promise.all(createGridPromises)
      let pictures = await takePicture(nbOfPictures).catch((err) => {
        console.log(err)
        return
      })
      for (pic of pictures){
        if (typeof pic === 'undefined'){
          return
        }
      }
		  calibrationPicture = pictures[0]
      // remove all the grids
      // TODO: use the callback
      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('removeGrid')
      })
      pictures = await Promise.all(pictures) // wait for pictures to be recieved
      if (saveDebugFiles) {
        await debugDirPromise
        fs.writeFile(debugPath+`/screens.json`, JSON.stringify(screens), (err) => {if (err) console.log(err)})
        fs.writeFile(debugPath+`/colorCombs.json`, JSON.stringify(colorCombs), (err) => {if (err) console.log(err)})
        for (let i in pictures){
          fs.writeFile(debugPath+`/image-${i}.png`, pictures[i], (err) => {if (err) console.log(err)});
        }
      }
      let matrixes = await imgprcss.getImagesHslMatrix(pictures)
      if (saveDebugFiles) {
          fs.writeFile(debugPath+`/matrixes.json`, JSON.stringify(matrixes), (err) => {if (err) console.log(err)})
      }
      picDimensions = [matrixes[0].length, matrixes[0][0].length]
      let squares = scrnread.getScreens(matrixes, screens, colorCombs)
      console.log(squares)
      let result = scrnread.getScreenFromSquares(squares, screens)
      socket.emit('drawCircles', result)
      return result
    }


    // takes a picture with i the current picture and n the total number of pictures
    // and pictues a list with all taken pictures
    async function takePicture(n){
      let pictures = []
      // loop untill break statement
      let i = 0
      while(true){
        let picPromise = new Promise(function(resolve, reject) {
          ss(socket).emit('takeOnePicture', async function(stream){
            resolve(new Promise(async function(resolve, reject) {
              stream.setEncoding('utf-8') // we want to recieve a string
              stream.on('data', async (chunk) => {
                let image = await decodeBase64Image(chunk.toString())
                resolve(image.data)
              });
              stream.on('error', (err) => reject(err))
            }).catch((err) => reject(err)))
          })
          setTimeout(() => reject(new Error("Failed to take picture")), 5000);
        }).catch(function(error) {
          console.log(error)
          // failed to retrieve the image
          socket.emit('alert', "Retrieving one of the images timed out.")
        })
        let pic = await picPromise
        pictures.push(pic)
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
        else break;
      }
      return pictures
    }

    socket.on('changeBackgroundOfAllSlaves', async function(data){
      var screens = await calibrate(data.numberOfRows, data.numberOfColumns)
      var screenKeys = Object.keys(screens)
      if (screenKeys.length == 0){
        socket.emit('alert', "didn't find any screens.")
        socket.emit('showVisualFeedback');
        return
      } else{
        socket.emit('alert', "found these screens: "+screenKeys.toString() )
        socket.emit('showVisualFeedback');
      }
      console.log(screens)
      AllScreenPositions = {...AllScreenPositions, ...screens};
    });

    socket.on('upload-image', async function (data) {
      let image = await decodeBase64Image(data.buffer)
  		if (data.destination)
        fs.writeFileSync(`./slave-${data.destination}.png`, image.data)
  		else
        fs.writeFileSync(`./image-${imageIndex}.png`, image.data);
      masterIo.emit('imageSaved')
      imageIndex += 1;
    });

    socket.on('reset', function(data){
      AllScreenPositions = {}
      clearInterval(videoUpdater)
      clearInterval(countdownUpdater)
      slaveIo.emit('refresh')
    })

    socket.on('drawLine', function(data){
      slaveIo.emit('drawLine', data);
  	});

    ////////////////////////////
    // Triangulation show-off //
    ////////////////////////////

    socket.on('triangulate', async function(data){
      if (Object.keys(AllScreenPositions).length < 1) {
  			socket.emit('alert', 'Please do screen recognition first');
  			return;
  		}

      var centers = screenorientation.getScreenCenters(AllScreenPositions);
      var connections = delaunay.getConnections(centers);

      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('triangulate', {
  				corners: AllScreenPositions[slaves[slave]],
  				picDim: picDimensions,
          connections: connections,
          centers: centers
        });
      })
    });

          // socket.on('calibrate', function(data) {
          //     slaveIo.emit('changeBackgroundColor', {colorValue: '#000000'});
          //     socket.emit('takePictures', {slaves: {0: 'm'}}, function (callbackData) {
          //         socket.emit('takePictures', {slaves: slaves},
          //             function (callbackData) {
          //                 console.log('Took enough pictures.')
          //                 imgs = [`./Pictures/slave-m.png`] // If this picture doesnot exist an error may be send
          //                 for (var key in slaves) imgs.push(`./Pictures/slave-${slaves[key]}.png`) // Implement all slave pictures
          //                 scrnrec.findScreen(imgs) // Implement the screen recognition
          //             })
          //     })
          // });

  ////////////////////
  // Image show-off //
  ////////////////////

	socket.on('broadcastImage', function(data){
    clearInterval(videoUpdater)

		// load the image that should be sent
		let image = selectImage(data.image)

		// send to each slave
		Object.keys(slaves).forEach(function(slave, index) {
			slaveSockets[slave].emit('showPicture', {
				corners: AllScreenPositions[slaves[slave]],
				picture: image,
				picDim: picDimensions
			});
		})
  })

	const selectImage = function(selection) {
		console.log(selection)
		switch (selection) {
			case "Colorgrid" :
				return fs.readFileSync('./public/Colorgrid.jpg').toString('base64');
			case "TestImage1" :
				return fs.readFileSync('./public/ImageShowOffTest.jpg').toString('base64');
			case "TestImage2" :
				return fs.readFileSync('./public/ImageShowOffTest2.jpg').toString('base64');
			case "FaculteitsFoto" :
				return fs.readFileSync('./public/FaculteitsFoto.jpg').toString('base64');
			case "CalibrationPicture" :
				if (calibrationPicture)
					return calibrationPicture.toString('base64');
				else socket.emit('alert', 'Please do screen recognition first');
				break;
		}
	}

  ////////////////////
  // Video show-off //
  ////////////////////

	socket.on('broadcastVideo', async function(){
    clearInterval(videoUpdater)

    // AllScreenPositions = {'3': [{x: 500, y: 0}, {x: 500, y: 500}, {x: 0, y: 500}, {x: 0, y: 0}],
    //                    '4': [{x: 1000, y: 0}, {x: 1000, y: 500}, {x: 500, y: 500}, {x: 500, y: 0}]}
    // picDimensions = [500, 1000]

    // send to each slave
    let videoPromises = []
    // start loading the video
		Object.keys(slaves).forEach(function(slave, index) {
      if (slaves[slave] in AllScreenPositions){
        videoPromises.push(new Promise(function(resolve, reject){
          slaveSockets[slave].emit('loadVideo', {
    				corners: AllScreenPositions[slaves[slave]],
    				picDim: picDimensions
    			}, function(callbackData){
            resolve()
          })
          setTimeout(function(){
            deleteSlave(slaveSockets[slave])
            resolve()
          }, 5000);
        }))
      }
		})
    await Promise.all(videoPromises)
    // start all videos at the start time (0s) at the same time
    // and start the updater
    resumeVideo(0)
    // get promises that resolve when the video has finished
    vidEndedPromises = []
    Object.keys(slaves).forEach(function(slave, index) {
      if (slaves[slave] in AllScreenPositions){
        vidEndedPromises.push(new Promise((resolve, reject) => {
          slaveSockets[slave].emit('vidEnded', null, resolve)
        }))
      }
    })
    await Promise.all(vidEndedPromises)
    console.log('all videos ended')
    clearInterval(videoUpdater)
  })

  ///////////////
  // Countdown //
  ///////////////

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


  ////////////////////////
  // Animation show-off //
  ////////////////////////

  // socket.on('startSnake', function(data){
  //   AllScreenPositions = {'3': [{x: 500, y: 0}, {x: 500, y: 500}, {x: 0, y: 500}, {x: 0, y: 0}],
  //                      '4': [{x: 1000, y: 0}, {x: 1000, y: 500}, {x: 500, y: 500}, {x: 500, y: 0}]}
  //   picDimensions = [500, 1000]
  //   centers = screenorientation.getScreenCenters(AllScreenPositions)
  //   connections = delaunay.getConnections(centers)
  //   console.log(connections)
  // });

  //   const firstSlave = Object.keys(AllScreenPositions)[0]
  //   const startPos = centers[firstSlave]
  //
  //   var randInt = Math.floor(Math.random() * connections[firstSlave].length)
  //   var nextPoint = {x: connections[firstSlave][randInt][0], y: connections[firstSlave][randInt][1]}
  //   var direction = geometry.radianAngleBetweenPointsDict(startPos, nextPoint)
  //   var nextSlave = getSlaveByPosition(nextPoint)
  //
  //   snake = new snakeJs.Snake(data.size, picDimensions[0] / 25, startPos, {light: "#008000", dark: "#004000"})
  //   snake.changeDirectionOnPosition(direction, startPos, nextSlave)
  //
  //   Object.keys(slaves).forEach(function(slave, index) {
  //     slaveSockets[slave].emit('createSnake', {
  //       corners: AllScreenPositions[slaves[slave]],
  //       picDim: picDimensions,
  //     });
  //   })
  //
  //   snakeUpdater = setInterval(function(){
  //     slaveIo.emit('updateSnake', {
  //       maxLat: Math.max(Object.values(latSlaves)),
  //       snake: snake
  //     })
  //     changed = snake.updateSnake(70)
  //     if (changed) changeSnakeDirection(snake)
  //   }, 100/3) // 33 fps, gekozen door de normale
  // });
  //
  socket.on('stopSnake', function(){
    clearAll()
  })
  //
  //
  // function changeSnakeDirection(snake) {
  //   var currentPoint = centers[snake.nextSlave]
  //   if (!connections[snake.nextSlave]){
  //     clearInterval(snakeUpdater)
  //     return
  //   }
  //   var randInt = Math.floor(Math.random() * connections[snake.nextSlave].length)
  //
  //   var nextPoint = {x: connections[snake.nextSlave][randInt][0], y: connections[snake.nextSlave][randInt][1]}
  //   var nextSlave = getSlaveByPosition(nextPoint)
  //   var direction = geometry.radianAngleBetweenPointsDict(currentPoint, nextPoint)
  //   snake.changeDirectionOnPosition(direction, currentPoint, nextSlave)
  // }
  //
  // function getSlaveByPosition(pos){
	//     // var slaveIDs = Object.keys(AllScreenPositions)
  //     for(let slaveId of Object.keys(AllScreenPositions)){
  //       center = centers[slaveId]
  //       if(center.x == pos.x && center.y == pos.y)
  //         return slaveId
  //     }
  // }

  // Run the animation showoff
  socket.on('startAnimation', async function(data) {

    AllScreenPositions = {'3': [{x: 500, y: 0}, {x: 500, y: 500}, {x: 0, y: 500}, {x: 0, y: 0}],
                       '4': [{x: 1000, y: 0}, {x: 1000, y: 500}, {x: 500, y: 500}, {x: 500, y: 0}],
                    '5': [{x: 700, y: 0}, {x: 1000, y: 250}, {x: 500, y: 500}, {x: 500, y: 0}]}
    picDimensions = [500, 1000]

    if (Object.keys(AllScreenPositions).length < 1) {
      socket.emit('alert', 'Please do screen recognition first');
      return;
    }

    clearAll()

    var maxLat = 0, maxFps = 60;
    var synchroPromises = [];
    var slaveOffsets = {};

    console.log('startAnimation')
    getPath()

    // Send all the data to slaves and wait for them to end their preparation.
    Object.keys(slaves).forEach(async function(slave, index) {
      let promise = new Promise(function(resolve, reject) {
        slaveSockets[slave].emit('prepareAnimation',
          {
            animation: {
              type: "snake",
              path: path,
              length: data.size
            },
            corners: AllScreenPositions[slaves[slave]],
            picDim: picDimensions,
            timeSent: Date.now(),
          },
          function(callBackData){
            if (typeof callBackData.maxFps == 'number' &&
               maxFps > callBackData.maxFps) maxFps = callBackData.maxFps;
            if (typeof callBackData.lat == 'number' &&
              maxLat < callBackData.lat) maxLat = callBackData.lat;
            slaveOffsets[slave] = callBackData.offset;
            resolve()
          })
        // Define a timeout for slaves that take too long to answer
        setTimeout(function() { resolve() }, 2000);
      })
      synchroPromises.push(promise)
    })
    // Wait for all slaves
    await Promise.all(synchroPromises);

    console.log("Prep done: ", slaves)
    startTime = Date.now() + maxLat * 2

    // d1 = Date.now()
    Object.keys(slaves).forEach(function(slave, index) {
      slaveSockets[slave].emit('startAnimation', {
        offset: slaveOffsets[slave],
        fps: maxFps,
        startTime: startTime
      })
    })

    console.log("MaxFps: ", maxFps)
    checkInterval = setInterval(checkFrame, checkInt * 1000 / maxFps);

  })

  var checkInt = 3; // The amount of frames the code will wait between iterations
  var startTime;
  function checkFrame() {
    slaveIo.emit('atFrame', {
      dt: Date.now() - startTime
    });
  }

  var slavesPassed, centers, connections, firstSlave;
  function getPath(){
    centers = screenorientation.getScreenCenters(AllScreenPositions)
    connections = delaunay.getConnections(centers)

    // Update result of connections
    Object.keys(connections).forEach((slave, j) => {
      for (let i = 0; i < connections[slave].length; i++)
        connections[slave][i] = connectSlave(connections[slave][i])
    });

    // Start with lowest slave.
    slavesPassed = new Set(Object.keys(AllScreenPositions))
    firstSlave = Object.keys(AllScreenPositions)[0];
    console.log("first slave data ", slavesPassed, " ", centers[firstSlave])
    path = []

    getConnection(firstSlave)

    return path;
  }

  function connectSlave(pos) {
    for (slave in centers)
      if (pos[0] == centers[slave].x && pos[1] == centers[slave].y)
        return slave
  }

  var path;
  function getConnection(node) {
    if (slavesPassed.size < 1 && node === firstSlave) return
    var randInt = Math.floor(Math.random() * connections[node].length)
    var nextNode = connections[node][randInt];
    var direction = angleBetweenPoints(centers[node], centers[nextNode])
    path.push({
      pos: centers[node],
      dir: direction
    })
    slavesPassed.delete(node)
    // console.log("data: ", randInt, " ", nextNode, " ", direction, " ", slavesPassed)
    getConnection(nextNode)
  }

  function angleBetweenPoints(point1, point2) {
      return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  };


  /////////////////
  // Game set up //
  /////////////////
  socket.on('startGame', async function(data) {
    var gamePromises = []
    playerColors = {}
    deleteWorld()

    playerColors[0] = {light: "#666666", dark: "#333333"};

    Object.keys(players).forEach(async function(player, index) {
      let promise = new Promise(function(resolve, reject) {
        playerSockets[player].emit('setupGame', null, function(callBackData){
          playerColors[player] = callBackData.colors;
          playerSockets[player].emit('startGame')
          resolve()
        })
        setTimeout(function() {
          // if it takes longer than 0.5 seconds reject the promise
          deletePlayer(playerSockets[player])
          resolve()
        }, 60 * 1000);
      })
      gamePromises.push(promise)
    })
    await Promise.all(gamePromises);
    socket.emit('startGame')


    // Game start

    // AllScreenPositions = {'3': [{x: 500, y: 0}, {x: 500, y: 500}, {x: 0, y: 500}, {x: 0, y: 0}],
    //                    '4': [{x: 1000, y: 0}, {x: 1000, y: 500}, {x: 500, y: 500}, {x: 500, y: 0}]}
    // picDimensions = [500, 1000]

    clearInterval(snakeUpdater)
    createWorld();

    console.log(playerColors)

    for (let playerId in playerColors) {
      startY = Math.floor(Math.random() * picDimensions[0])
      var snake = new snakeJs.Snake(data.size, picDimensions[0] / 75, {x: 1, y: startY}, playerColors[playerId])
      world.addSnake(snake, playerId)
    }

    Object.keys(slaves).forEach(function(slave, index) {
      slaveSockets[slave].emit('createSnake', {
        corners: AllScreenPositions[slaves[slave]],
        picDim: picDimensions,
      });
    })

    snakeUpdater = setInterval(function(){
      slaveIo.emit('updateWorld', {
        maxLat: Math.max(Object.values(latSlaves)),
        world: world
      })
      if (world == null) clearInterval(snakeUpdater)
      else world.updateWorld(30)
      for (let plId in world.objects) {
        if (plId == 0) socket.emit('updatePosition', {
          headPos : world.objects[plId].headPos,
          dim: world.dimensions
        })
        else playerSockets[plId].emit('updatePosition', {
          headPos : world.objects[plId].headPos,
          dim: world.dimensions
        })
      }
    }, 1000/60) // 60 fps, gekozen door de normale
  })

  socket.on('changeSnakeDirection', function(data){
    changeSnakeDirectionGame(data.playerId, data.direction)
  })

  socket.on('clearAll', function() {
    clearAll()
  });

});

/***************
  * Slave Io *
 ***************/
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
  socket.on('update-latency', function(lat){
    latSlaves[socket] = lat
  })
  socket.on('uBuffer', function(time){
    console.log('wait for buffer')
    slaveIo.emit('pauseAt', time)
    socket.emit('waitForBuffer', null, resumeVideo(time*1000))
  })
});


/***************
  * Player Io *
 ***************/
var playerIo = io.of('/player').on('connect', function(socket){
  addPlayer(socket)

  socket.on('changeSnakeDirection', function(data){
    changeSnakeDirectionGame(data.playerId, data.direction)
  })

  socket.on('disconnect', function() {
    deletePlayer(socket)
  })
})


/********************
  * Grid functions *
 ********************/

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

/*********************
  * Snake functions *
 *********************/
var world;
function createWorld() {
  console.log({x: picDimensions[1], y: picDimensions[0]})
  world = new worldJs.World({x: picDimensions[1], y: picDimensions[0]});
}

function deleteWorld() {
  world = null;
}

function changeSnakeDirectionGame(playerId, newDir) {
  snake = world.objects[playerId]
  if (snake && snake.parts[0].dir - newDir != Math.PI
            && snake.parts[0].dir - newDir != -Math.PI)
    snake.changeDirection(newDir);
}
