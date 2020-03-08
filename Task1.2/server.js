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
  console.log("deleteted")
  delete slaves[socket.id];
}

function addSlave(socket) {
    console.log("nr.: ", slaveNumber)
    slaves[socket.id] = ++slaveNumber
    slaveSockets[socket.id] = socket
    socket.emit('ping', {
      time: Date.now(),
      id: socket.id
    })
}

/******************
  * Slave socket *
 ******************/
var maxFps = 60;

var latency = {}
var slaveIo = io.on('connection', function(socket){
    addSlave(socket)

    socket.on('pong', function(data) {
      d2 = Date.now()
      latency[data.id] = d2 - data.time
      console.log(latency)
    });

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
              workload: 100,
              timeSent: Date.now()
            },
            function(callBackData){
              if (typeof callBackData.maxFps == 'number' &&
               maxFps > callBackData.maxFps) maxFps = callBackData.maxFps;
              slaveDelays[slave] = callBackData.delay;
              console.log("Delays: ", slaveDelays);
              resolve()
            })

          setTimeout(function() {
            // if it takes longer than 0.5 seconds reject the promise
            // deleteSlave(slaveSockets[slave])
            resolve()
          }, 1000);
        })
        synchroPromises.push(promise)
      })
      await Promise.all(synchroPromises);

      console.log("Prep done: ", slaves)
      startTime = Date.now() + 50

      d1 = Date.now()
      Object.keys(slaves).forEach(function(slave, index) {
        slaveSockets[slave].emit('startAnimation', {
          delay: slaveDelays[slave],
          fps: maxFps,
          startTime: startTime
        })
      })

      console.log("MaxFps: ", maxFps)
      checkInterval = setInterval(checkFrame, checkInt * 1000 / maxFps);

    })

});

var checkInt = 10
var frame, startTime
function checkFrame() {
  delay = Date.now() - startTime
  // console.log(delay)
  frame = delay * maxFps / 1000 + 1
  slaveIo.emit('atFrame', {
    frame: frame
  })
}


var loadAdress = 3000

http.listen(loadAdress, function(){
    console.log(`listening on *:${loadAdress}`);
});

app.use('/static', express.static(__dirname + '/public'));
