
const trans = require('./transformationCalc.js');


socket.on('showPicture', function(data){

	// Or whatever canvas you want your picture in.
	trans.pastePicture(document.getElementById("myCanvas"), data.picture, data.corners);
	// This is for smoother picture monitoring. Else white borders are possible.
	document.body.style.backgroundColor = "black";
});



testReal = {B: {x:2345, y: 1005}, C: {x: 2717,y: 1705}, D: {x: 1393,y: 2131}, A: {x: 1001, y:1161}} 
testReal2 = {B: {x:2653,y:1093}, C: {x:2733,y:2185}, D: {x:657,y:2313}, A: {x:661,y:1129}}
testReal3 = {B: {x:1069,y:2273},C: {x:1089,y:1289},D: {x:2801,y:1268},A: {x:2857,y:2229}}