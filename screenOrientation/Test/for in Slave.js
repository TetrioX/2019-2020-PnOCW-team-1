var ctx;
var canvas;
var img = new Image();

const pastePicture = function(corners){
	
	document.body.style.backgroundColor = "black";
	
	img.height = window.innerHeight;
	img.width = window.innerWidth;
	
    canvas = document.getElementById("myCanvas");
	canvas.width = img.width;
	canvas.height = img.height;
    ctx = canvas.getContext('2d');
	
	ctx.beginPath();
    ctx.moveTo(corners.A.x, corners.A.y);
	ctx.lineTo(corners.B.x, corners.B.y);
	ctx.lineTo(corners.C.x, corners.C.y);
	ctx.lineTo(corners.D.x, corners.D.y);
	ctx.lineTo(corners.A.x, corners.A.y);
    ctx.clip(); //call the clip method so the next render is clipped in last path
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
                   0, 0, canvas.width, canvas.height); // destination rectangle
	
	transform2d(canvas, corners.A.x, corners.A.y, corners.B.x, corners.B.y, 
			corners.D.x, corners.D.y, corners.C.x, corners.C.y);

};
