
var playerId;

//make connection
var socket = io('/player');

var wrapper = document.getElementById("wrapper"),
    loadScreen = document.getElementById("loadScreen"),
    controlScreen = document.getElementById('controlScreen'),
    losingScreen = document.getElementById('losingScreen'),

    readyButton = document.getElementById('readyButton'),

    leftButton = document.getElementById('leftButton'),
    rightButton = document.getElementById('rightButton'),
    upButton = document.getElementById('upButton'),
    downButton = document.getElementById('downButton');

var selectColor = document.getElementById('colorSelect');

function cleanHTML(){
	wrapper.style.display = "none";
  loadScreen.style.display = "none";
  controlScreen.style.display = "none";
  losingScreen.style.display = "none";
}

socket.on('setupGame', function(data, callback){
  cleanHTML();
  loadScreen.style.display = 'block';

  readyButton.addEventListener('click', function(){
    colors = colorSelector(selectColor.value)
    callback({
      colors: colors
    })
  })
})

const colorSelector = function(val) {
  switch (val) {
    case "0" : // Green
      return {light: "#008000", dark: "#004000"};
    case "1" : // Red
      return {light: "#800000", dark: "#400000"};
    case "2" : // Blue
      return {light: "#000080", dark: "#000040"};
    case "3" : // Yellow
      return {light: "#F0EA38", dark: "#9A9625"};
    case "4" : // Orange
      return {light: "#E69C2D", dark: "#A26F22"};
    case "5" : // Purple
      return {light: "#A82BDE", dark: "#641686"};
  }
}

socket.on('playerID', function(number){
  console.log(number)
  playerId = number
  document.getElementById("playerID").innerHTML = number;
})

socket.on('startGame', function(){
  cleanHTML();
  controlScreen.style.display = 'block';
})

socket.on('youLose', function(){
  cleanHTML();
  wrapper.style.display = 'block';
})



leftButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: playerId,
		direction: -Math.PI
	})
})

rightButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: playerId,
		direction: 0
	})
})

upButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: playerId,
		direction: -Math.PI / 2
	})
})

downButton.addEventListener('click', function(){
	socket.emit('changeSnakeDirection', {
		playerId: playerId,
		direction: Math.PI / 2
	})
})
