
var playerId,
    playerSocket;

var wrapper = document.getElementById("wrapper"),
    loadScreen = document.getElementById("loadScreen"),
    controlScreen = document.getElementById('controlScreen'),
    losingScreen = document.getElementById('losingScreen'),

    readyButton = document.getElementById('readyButton'),

    leftButton = document.getElementById('leftButton'),
    rightButton = document.getElementById('rightButton'),
    upButton = document.getElementById('upButton'),
    downButton = document.getElementById('downButton');

function cleanHTML(){
	wrapper.style.display = "none";
  loadScreen.style.display = "none";
  controlScreen.style.display = "none";
  losingScreen.style.display = "none";
}

socket.on('setupGame', function(){
  cleanHTML();
  loadScreen.style.display = 'block';

  readyButton.addEventListener('click', function(){
  	socket.emit('ready', {
      color: {light: "#008000", dark: "#004000"},
      playerId: playerId
    })
  })
})

socket.on('startGame', function(){
  cleanHTML();
  control.style.display = 'block';
})

socket.on('youLose', function(){
  cleanHTML();
  wrapper.style.display = 'block';
})



leftButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: 0,
		direction: -Math.PI
	})
})

rightButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: 0,
		direction: 0
	})
})

upButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: 0,
		direction: -Math.PI / 2
	})
})

downButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: 0,
		direction: Math.PI / 2
	})
})
