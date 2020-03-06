var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/variableFps.HTML');
});


slave = io.on('connection', function(socket){
    socket.on('start', function() {
        slave.emit('startAnimation')
    })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

app.use('/static', express.static(__dirname + '/public'));