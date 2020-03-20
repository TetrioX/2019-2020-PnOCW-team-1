var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  pingInterval: 1000,
  pingTimeout: 500
});
var socket = require('socket.io');


app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/variableFps.HTML');
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
}

var offsets


/******************
  * Slave socket *
 ******************/
var maxFps, maxLat;
var checkInterval

var slaveIo = io.on('connection', function(socket){
    addSlave(socket)
    socket.removeAllListeners()

    socket.on('stopAnimation', function() {
        slaveIo.emit('stopAnimation')
        clearInterval(checkInterval)
    })

    socket.on('disconnect', function() {
      deleteSlave(socket)
    })

    var stop = false;
    socket.on('startAnimation', async function() {
      var maxLat = 0, maxFps = 60
      var synchroPromises = []
      var slaveOffsets = {}

      slaveIo.emit('stopAnimation')
      clearInterval(checkInterval)

      console.log('startAnimation')

      Object.keys(slaves).forEach(async function(slave, index) {
        let promise = new Promise(function(resolve, reject) {

            slaveSockets[slave].emit('prepareAnimation', {
              animation: ...,
              timeSent: Date.now()
            },
            function(callBackData){
              if (typeof callBackData.maxFps == 'number' &&
                 maxFps > callBackData.maxFps) maxFps = callBackData.maxFps;
              if (typeof callBackData.lat == 'number' &&
                maxLat < callBackData.lat) maxLat = callBackData.lat;
              slaveOffsets[slave] = {
                offset: callBackData.offset,
              };
              console.log("Delays: ", slaveOffsets);
              resolve()
            })

          setTimeout(function() {
            resolve()
          }, 2000);
        })
        synchroPromises.push(promise)
      })
      await Promise.all(synchroPromises);

      console.log("Prep done: ", slaves)
      startTime = Date.now() + maxLat * 2

      // d1 = Date.now()
      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('startAnimation', {
          offset: slaveOffsets[slave].offset,
          fps: maxFps,
          startTime: startTime
        })
      })

      console.log("MaxFps: ", maxFps)
      checkInterval = setInterval(checkFrame, checkInt * 1000 / maxFps);

    })

});

var checkInt = 3;
var frame, startTime, iteration = 0;
function checkFrame() {
  slaveIo.emit('atFrame', {
    dt: Date.now() - startTime
  });
}


var loadAdress = 7001

var server = http.listen(loadAdress, function(){
    console.log(`listening on *:${loadAdress}`);
});

app.use('/static', express.static(__dirname + '/public'));
