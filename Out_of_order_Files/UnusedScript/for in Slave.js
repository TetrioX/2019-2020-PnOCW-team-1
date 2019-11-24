
const trans = require('./transformationCalc.js'); // Or to wherever you store the trans file.



socket.on('showPicture', function(data){

	// Or whatever canvas you want your picture in.
	trans.pastePicture(document.getElementById("myCanvas"), data.picture, data.corners);
	// This is for smoother picture monitoring. Else white borders are possible.
	document.body.style.backgroundColor = "black";
});


/* How do we store corners? That needs to be changed. I worked around the way I always did it.
	Perhaps that is no longer the case, could you note me of that?
	For the rest some fine tuning can be used. This should be the right way though.
*/
