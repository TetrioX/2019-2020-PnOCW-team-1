
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
var algebra = require('algebra.js'); // Solving equations

const getSquareOrientation = function(corners) {
	assert(corners.length == 4)
	corners = getCornerPositions(corners)
	console.log(corners)
	center = getCenter(corners)

	
	// console.log(" Center: ", center)
	// console.log(" Verhouding Zijden: ", sides.AB / sides.CD, ' - ',  sides.AD / sides.BC )
	// console.log(" Verhouding Diagonalen: ", diagonals.AO / diagonals.DO , ' - ',  diagonals.BO / diagonals.CO )
	// console.log(" Cos: ", 1.0769/(Math.PI/3 + Math.PI/18*5))
	
	return transfer2Dto3D(corners)
}



const getCornerPositions = function(corners) {
	assert(corners.length == 4)
	dict = {}
	dict.A = corners.reduce((A, corner) => corner.y < A.y || corner.y == A.y && corner.x < A.x ? corner : A);
	corners.splice(corners.indexOf(dict.A), 1)
	dict.B = corners.reduce((B, corner) => getCos(dict.A, corner) >= getCos(dict.A, B) ? corner : B);
	corners.splice(corners.indexOf(dict.B), 1)
	dict.D = corners.reduce((D, corner) => getCos(dict.A, corner) <= getCos(dict.A, D) ? corner : D);
	corners.splice(corners.indexOf(dict.D), 1)
	dict.C = corners[0]
	return dict
}

const getCos = function(pos1, pos2) {
	sign = pos2.y >= pos1.y ? 1 : -1
	// console.log(pos1, " + ", pos2, " : ", sign * (pos2.x - pos1.x)/getDistance(pos1, pos2))
	return sign * (pos2.x - pos1.x)/getDistance(pos1, pos2)
}

const getDistance = function(pos1, pos2) {
	return Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2)
}



const getCenter = function(corners) {
	AC = getLine(corners.A, corners.C)
	BD = getLine(corners.B, corners.D)
	
	x = - (BD.q - AC.q) / (BD.p - AC.p)
	y = ((AC.p * x + AC.q) + (BD.p * x + BD.q))/2
	
	return { x: x, y: y }
}

const getLine = function(pos1, pos2) {
	p = getRico(pos1, pos2)
	q = ((pos1.y - p * pos1.x) + (pos2.y - p * pos2.x))/2
	return {p: p, q: q}
}

const getRico = function(pos1, pos2) {
	return (pos2.y - pos1.y) / (pos2.x - pos1.x)
}



const getAngles = function(corners) {
	// assert(dict.A + dict.B + dict.C + dict.D > 359.5 && dict.A + dict.B + dict.C + dict.D < 360.5)
	return {
		A : getAngle(corners.A, corners.B, corners.D),
		B : getAngle(corners.B, corners.C, corners.A),
		C : getAngle(corners.C, corners.D, corners.B),
		D : getAngle(corners.D, corners.A, corners.C)
	}
}

const getAngle = function(pos1, pos2, pos3) {
	u = { x: pos2.x - pos1.x, y: pos2.y - pos1.y, l: getDistance(pos2, pos1) }
	v = { x: pos3.x - pos1.x, y: pos3.y - pos1.y, l: getDistance(pos3, pos1) }
	// console.log(pos1, " :  ", u, " - ", v, " -> ", (u.x * v.x + u.y * v.y)/(u.l * v.l))
	return 180 * Math.acos((u.x * v.x + u.y * v.y)/(u.l * v.l)) / (Math.PI)
}


const getSideLength = function(corners) {
	return { 	
		AB : getDistance(corners.A, corners.B),
		BC : getDistance(corners.B, corners.C),
		CD : getDistance(corners.C, corners.D),
		DA : getDistance(corners.D, corners.A)
	}
}

const getDiagonalLength = function(corners, center) {
	return { 	
		AO : getDistance(corners.A, center),
		BO : getDistance(corners.B, center),
		CO : getDistance(corners.C, center),
		DO : getDistance(corners.D, center)
	}
}


const get3DCoordinate = function(point) {
	
	cx = 675
	cy = 339.5
	fx = 4.8 * 72 / 25.4
	fy = fx
	
	x1 = - (cx - point.x) / fx
	y1 = - (cy - point.y) / fy
	return { x1 : x1, y1 : y1 }
}

const getCoefficient = function(point1, point2) {
	return point1.x1 * point2.x1 + point1.y1 * point2.y1 + 1
}

const transfer2Dto3D = function(corners) {
	
	A = get3DCoordinate(corners.A)
	B = get3DCoordinate(corners.B)
	C = get3DCoordinate(corners.C)
	D = get3DCoordinate(corners.D)
	
	a = getCoefficient(A, A)
	b = getCoefficient(B, D)
	c = getCoefficient(A, B)
	d = getCoefficient(A, D)
	
	e = getCoefficient(B, B)
	f = getCoefficient(C, A)
	g = getCoefficient(B, C)
	h = getCoefficient(B, A)
	
	i = getCoefficient(C, C)
	j = getCoefficient(D, B)
	k = getCoefficient(C, D)
	l = getCoefficient(C, B)
	
	m = getCoefficient(D, D)
	n = getCoefficient(A, C)
	o = getCoefficient(D, A)
	p = getCoefficient(D, C)
	
	console.log(A, " ", B, " ", C, " ", D)
	console.log(a, " ", b, " ", c, " ", d, " ", e, " ", f, " ", g, " ", h, " ", i , " ", j, " ", k, " ", l, " ", m, " ", n, " ", o, " ", p)
	// eq = algebra.parse(`${a} * z1 ^ 2 + ${b} * z2 * z3 - ${c} * z1 * z2 - ${d} * z1 * z3 = 0`)

	// console.log(eq.toString());
	
	// var Answer1 = eq.solveFor("z2");
	
	// console.log("x = " + Answer1.toString());


}

	
testCorners = [{x:566,y:239},{x:1009,y:454},{x:585,y:417},{x:988,y:620}]
testCornersReg = [{x:10,y:50},{x:100,y:10},{x:10,y:10},{x:100,y:50}]
test_60 = [{x:1190,y:110},{x:1230,y:504},{x:96,y:504},{x:137,y:110}]
test80 = [{x:93,y:272},{x:1231,y:272},{x:140,y:411},{x:1187,y:411}]
test50 = [{x:98,y:75},{x:1227,y:75},{x:1192,y:585},{x:134,y:586}] 
test70 = [{x:95,y:204},{x:139,y:471},{x:1231,y:204},{x:1188,y:472}]
test85 = [{x:95,y:307},{x:142,y:380},{x:1233,y:307},{x:1188,y:380}]
test40 = [{x:102,y:25},{x:1224,y:26},{x:132,y:630},{x:1195,y:630}]
test40_ = [{x:115,y:295},{x:132,y:630},{x:735,y:630},{x:737,y:296}]
test40_2 = [{x:361,y:195},{x:371,y:532},{x:974,y:532},{x:983,y:195}]

result = getSquareOrientation(test70)
console.log(result)


