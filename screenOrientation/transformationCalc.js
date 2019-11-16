 //
 // This code was written by nickname MvG
 //
 // For the origin of the code see:
 // @see http://jsfiddle.net/dFrHS/1/
 //
 // No license was connected to the written code below,
 // but all credits belong to the rightful owner.

/**
 * Return the adjugate of a given matrix.
 **/
const adj = function(m) { // Compute the adjugate of m
	return [
		m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
		m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
		m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
	];
}

/**
 * Compute the product of two given matrices.
 **/
const multmm = function(a, b) { // multiply two matrices
	var c = Array(9);
	for (var i = 0; i != 3; ++i)
		for (var j = 0; j != 3; ++j) {
			var cij = 0;
			for (var k = 0; k != 3; ++k)
				cij += a[3*i + k]*b[3*k + j];
			c[3*i + j] = cij;
		}
	}
	return c;
}

/**
 * Compute the product of a given matrix and a given vector.
 **/
const multmv = function(m, v) { // multiply matrix and vector
	return [
		m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
		m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
		m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
	];
}

/**
 * Compute the solution of the given system.
 **/
const basisToPoints = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var m = [
		x1, x2, x3,
		y1, y2, y3,
		1,  1,  1
	];
	var v = multmv(adj(m), [x4, y4, 1]);
	return multmm(m, [
		v[0], 0, 0,
		0, v[1], 0,
		0, 0, v[2]
	]);
}

/**
 * Calculate the transformation matrix to transform given source points onto given destination points.
 **/
const general2DProjection = function(x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d,
		x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
	var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
	var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
	return multmm(d, adj(s));
}

/**
 * Transform the given html element from a given point set to a rectangle.
 **/
function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
	var w = elt.width, h = elt.height;
	var t = general2DProjection(x1, y1, 0, 0, x2, y2, w, 0, x3, y3, 0, h, x4, y4, w, h);
	for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
	t = [t[0], t[3], 0, t[6],
		 t[1], t[4], 0, t[7],
		 0   , 0   , 1, 0   ,
		 t[2], t[5], 0, t[8]];
	t = "matrix3d(" + t.join(", ") + ")"; //setup the html 3D transformation.
	elt.style.transform = t;
}

/**
 * Paste the given part of the given picture on the client canvas.
 **/
const pastePicture = function(myCanvas, picture, corners){
	
	picture.height = window.innerHeight;
	picture.width = window.innerWidth;
	
	myCanvas.width = picture.width;
	myCanvas.height = picture.height;
    ctx = myCanvas.getContext('2d');
	
	ctx.beginPath();
    ctx.moveTo(corners.A.x, corners.A.y);
	ctx.lineTo(corners.B.x, corners.B.y);
	ctx.lineTo(corners.C.x, corners.C.y);
	ctx.lineTo(corners.D.x, corners.D.y);
	ctx.lineTo(corners.A.x, corners.A.y);
    ctx.clip(); //call the clip method so the next render is clipped in last path
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(picture, 0, 0, picture.width,    picture.height,     // source rectangle
                   0, 0, myCanvas.width, myCanvas.height); // destination rectangle
	
	transform2d(myCanvas, corners.A.x, corners.A.y, corners.B.x, corners.B.y, 
			corners.D.x, corners.D.y, corners.C.x, corners.C.y);

};


module.exports = {
	pastePicture: pastePicture
};
