var socket = io('http://localhost:3000');
var startTime;

// Knop voor animatie te starten
var button = document.getElementById("startAnimation");
button.addEventListener('click', ()=> {
  socket.emit('start')
});


// keep the latency between the server and slave
var latency = 0;
socket.on('pong', function(ms) {
    latency += Math.min(latency*6/5 + 10,(ms - latency)/5)
		socket.emit('update-latency', latency)
    console.log(latency)
});
