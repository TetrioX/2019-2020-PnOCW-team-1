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
	var w = window.innerWidth, h = window.innerHeight;
	var t = general2DProjection(x1, y1, 0, 0, x2, y2, w, 0, x3, y3, 0, h, x4, y4, w, h);
	for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
	t = [t[0], t[3], 0, t[6],
		 t[1], t[4], 0, t[7],
		 0   , 0   , 1, 0   ,
		 t[2], t[5], 0, t[8]];
	t = "matrix3d(" + t.join(", ") + ")"; //setup the html 3D transformation.
	elt.style.transform = t;
}

function scaleCenter(center, refPicture, newPicture){
 temp = {}
 temp.x = center.x * newPicture.x / refPicture.x;
 temp.y = center.y * newPicture.y / refPicture.y;
 return temp
}

function scalePoints(corners, refPicture, newPicture) {
	temp = [{}, {}, {}, {}]
for (let i in corners) {
	temp[i].x = corners[i].x * newPicture.x / refPicture.x;
	temp[i].y = corners[i].y * newPicture.y / refPicture.y;
}
return temp
}

const transformAngles = function(myCanvas, corners, refPictureLength){
	 corners = scalePoints(corners, refPictureLength, {x: myCanvas.width, y: myCanvas.height})

	 transform2d(myCanvas, corners[3].x, corners[3].y, corners[0].x, corners[0].y,
			 corners[2].x, corners[2].y, corners[1].x, corners[1].y);
};

function drawAnglesDegree(centers, connections, refPictureLength) {
	//Constants
	const outerRadius = 20,
	 			innerRadius = 7.5;
	var rot = Math.PI / 2 * 3,
			step = Math.PI / 5,
	 		x,
			y;

	context.fillStyle = 'black';
	context.lineWidth = 10;

	// Draw all centers
	for (let centerId in centers) {
		// Define center
		center = centers[centerId]
		center = scaleCenter(center, refPictureLength, {x: canvas.width, y: canvas.height})
		var cx = center.x;
		var cy = center.y;

		// Draw the star in the current center.
		context.beginPath();
		context.moveTo(cx, cy - outerRadius);
		for (let i = 0; i < 5; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			context.lineTo(x, y);
			rot += step;

			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			context.lineTo(x, y);
			rot += step
		}
		context.lineTo(cx, cy - outerRadius);
		context.closePath();
		context.fill();

		// Draw the lines between all connected centers.
		for(let cnctPoint of connections[centerId]){
			context.moveTo(cx, cy);	// start point
			context.lineTo(cnctPoint[0], cnctPoint[1]); // end point
			context.stroke(); // Make the line visible
		}
	}
}

canvas = document.getElementById('canvas')
context = canvas.getContext('2d')

AllScreenPositions = {
	'3': [{x: 500, y: 0}, {x: 500, y: 250}, {x: 0, y: 250}, {x: 0, y: 0}],
	'4': [{x: 1000, y: 0}, {x: 1000, y: 500}, {x: 500, y: 500}, {x: 500, y: 0}],
	'5': [{x: 500, y: 250}, {x: 500, y: 500}, {x: 0, y: 500}, {x: 0, y: 250}]
}
centers = {
  '3': { x: 250, y: 125 },
  '4': { x: 750, y: 250 },
  '5': { x: 250, y: 375 }
}
angles = {
  '3': [ 90, 14.036243467926479 ],
  '4': [ -165.96375653207352, 165.96375653207352 ],
  '5': [ -14.036243467926479, -90 ]
}
connections = {
  '3': [ [ 250, 375 ], [ 750, 250 ] ],
  '4': [ [ 250, 125 ], [ 250, 375 ] ],
  '5': [ [ 750, 250 ], [ 250, 125 ] ]
}
picDimensions = {x: 1000, y: 500}

// context.clearRect(0, 0, canvas.width, canvas.height);
canvas.style.display = "block"
canvas.width = picDimensions.x
canvas.height = picDimensions.y
context = canvas.getContext('2d');
transformAngles(canvas, AllScreenPositions['5'], picDimensions)
drawAnglesDegree(centers, connections, picDimensions)
// transformAngles(canvas, AllScreenPositions['5'], picDimensions)