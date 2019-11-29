var express = require('express');
var socket = require('socket.io');

var fs = fs = require('fs');

const { argv } = require('yargs')
                  .boolean('save-debug-files')
                  .default('grid-pause', 0)

var saveDebugFiles = argv['save-debug-files']
var gridPause = argv['grid-pause']




//App setup
var app = express();
var server = app.listen(8001, function(){
    console.log('listening to requests on port '+8001)
});
//Socket setup
// pingInterval is used to determine the latency
var io = socket(server, {pingInterval: 200});

var slaveIo = io.of('test').on('connect', function(socket){
	// addSlave(socket)

	io.sockets.emit('showPicture', {picture: image});
	//sending photo
});

let image = fs.readFileSync('./Test.JPG') // .toString('base64')