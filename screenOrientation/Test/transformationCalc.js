const adj = function(m) { // Compute the adjugate of m
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
  ];
}

const multmm = function(a, b) { // multiply two matrices
  var c = Array(9);
  for (var i = 0; i != 3; ++i) {
    for (var j = 0; j != 3; ++j) {
      var cij = 0;
      for (var k = 0; k != 3; ++k) {
        cij += a[3*i + k]*b[3*k + j];
      }
      c[3*i + j] = cij;
    }
  }
  return c;
}

const multmv = function(m, v) { // multiply matrix and vector
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

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

const general2DProjection = function(
  x1s, y1s, x1d, y1d,
  x2s, y2s, x2d, y2d,
  x3s, y3s, x3d, y3d,
  x4s, y4s, x4d, y4d
) {
  var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
  var w = elt.width, h = elt.height;
  var t = general2DProjection
    (x1, y1, 0, 0, x2, y2, w, 0, x3, y3, 0, h, x4, y4, w, h);
  for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
  t = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
       0   , 0   , 1, 0   ,
       t[2], t[5], 0, t[8]];
  t = "matrix3d(" + t.join(", ") + ")";
  elt.style.transform = t;
}

var ctx;
var canvas;
var img = new Image();

img.onload = function(){
	
	document.body.style.backgroundColor = "black";
	
	img.height = window.innerHeight;
	img.width = window.innerWidth;
	
    canvas = document.getElementById("myCanvas");
	canvas.width = img.width;
	canvas.height = img.height;
	
	console.log(canvas.width, " ", canvas.height)
	
    ctx = canvas.getContext('2d');
	
	ctx.beginPath();
    ctx.moveTo(testReal.A.x, testReal.A.y);
	ctx.lineTo(testReal.B.x, testReal.B.y);
	ctx.lineTo(testReal.C.x, testReal.C.y);
	ctx.lineTo(testReal.D.x, testReal.D.y);
    ctx.clip(); //call the clip method so the next render is clipped in last path
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
                   0, 0, canvas.width, canvas.height); // destination rectangle
	
	transform2d(canvas, testReal.A.x, testReal.A.y, testReal.B.x, testReal.B.y, 
			testReal.D.x, testReal.D.y, testReal.C.x, testReal.C.y);

};

const scalePoints = function(corners, factorX, factorY) {
	for (key in corners) {
		corners[key].x = corners[key].x * factorX;
		corners[key].y = corners[key].y * factorY;
	}
	return corners
}


img.src = "Test.JPG";
testReal = {B: {x:2345, y: 1005}, C: {x: 2717,y: 1705}, D: {x: 1393,y: 2131}, A: {x: 1001, y:1161}} 
testReal2 = {B: {x:2653,y:1093}, C: {x:2733,y:2185}, D: {x:657,y:2313}, A: {x:661,y:1129}}
testReal3 = {B: {x:1069,y:2273},C: {x:1089,y:1289},D: {x:2801,y:1268},A: {x:2857,y:2229}}
