var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

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
  delete slaves[socket.id];
}

function addSlave(socket) {
    console.log("nr.: ", slaveNumber)
    slaves[socket.id] = ++slaveNumber
    slaveSockets[socket.id] = socket
    // socket.emit('slaveID', slaveNumber)
}

/******************
  * Slave socket *
 ******************/
var maxFps = 60;

var slaveIo = io.on('connection', function(socket){
    addSlave(socket)

    socket.on('stopAnimation', function() {
        slaveIo.emit('stopAnimation')
        clearInterval(checkInterval)
    })

    var stop = false;
    var checkInterval
    socket.on('startAnimation', async function() {
      var synchroPromises = []
      var slaveDelays = {}

      slaveIo.emit('stopAnimation')
      clearInterval(checkInterval)

      Object.keys(slaves).forEach(async function(slave, index) {
        let promise = new Promise(function(resolve, reject) {

            slaveSockets[slave].emit('prepareAnimation', {
              workload: 1000,
              timeSent: Date.now()
            },
            function(callBackData){
              if (maxFps > callBackData.maxFps) maxFps = callBackData.maxFps
              slaveDelays[slave] = callBackData.delay
              console.log("Delays: ", slaveDelays)
              resolve()
            })

          setTimeout(function() {
            // if it takes longer than 0.5 seconds reject the promise
            deleteSlave(slaveSockets[slave])
            resolve()
          }, 1000);
        })
        synchroPromises.push(promise)
      })
      await Promise.all(synchroPromises);

      console.log("Prep done")
      var startTime = Date.now() + 50

      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('startAnimation', {
          delay: slaveDelays[slave],
          fps: maxFps,
          startTime: startTime
        })
      })

      checkInterval = setInterval(checkFrame, 3000);

    })

});

var checkPromises
async function checkFrame() {
  checkPromises = []
  slaveFrame = []
  Object.keys(slaves).forEach(async function(slave, index) {
    let promise = new Promise(function(resolve, reject) {
        slaveSockets[slave].emit('checkframe', null, function(callBackData){
          slaveFrame[slave] = callBackData
          resolve()
        })
      setTimeout(function() {
        resolve();
      }, 50);
    })
    checkPromises.push(promise)
  })
  await Promise.all(checkPromises);
  console.log(slaveFrame)
}

var loadAdress = 3000

http.listen(loadAdress, function(){
    console.log(`listening on *:${loadAdress}`);
});

app.use('/static', express.static(__dirname + '/public'));
