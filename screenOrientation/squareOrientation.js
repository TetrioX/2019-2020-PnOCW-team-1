
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

const getSquareOrientation = function(corners) {
	// console.log(corners)
	assert(corners.length == 4)
	var corners = getCornerPositions(corners)
	var center = getCenter(corners)
	
	/* corners.A.z = 0
	corners.B.z = 0
	corners.C.z = 0
	corners.D.z = 0 */
	
	return transfer2Dto3D(corners)
}



const getCornerPositions = function(corners) {
	assert(corners.length == 4)
	var dict = {}
	dict.A = corners[3]
	dict.B = corners[0]
	dict.C = corners[1]
	dict.D = corners[2]
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
	
	cx = 4032
	cy = 3024
	fx = 4 * 72 / 25.4
	fy = fx
	
	x1 = - (cx - point.x) / fx
	y1 = - (cy - point.y) / fy
	return { x_ : x1, y_ : y1 }
}

const getCoefficient = function(point1, point2) {
	return point1.x1 * point2.x1 + point1.y1 * point2.y1 + 1
}

const transfer2Dto3D = function(corners) {
	
	A = get3DCoordinate(corners.A)
	B = get3DCoordinate(corners.B)
	C = get3DCoordinate(corners.C)
	D = get3DCoordinate(corners.D)
	
	console.log(A, " ", B, " ", C, " ", D)
	
	/* a = getCoefficient(A, A)
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
	n = getCoefficient(A, B)
	o = getCoefficient(D, A)
	p = getCoefficient(D, B) */
	
	verh = 1920/1080
	v = verh * Math.sqrt(1 + verh**2) * 1080**2 // Taak: Schatting maken van r en verhouding meekrijgen
	
	// console.log(A, " ", B, " ", C, " ", D)
	// console.log(a, " ", b, " ", c, " ", d, " ", e, " ", f, " ", g, " ", h, " ", i , " ", j, " ", k, " ", l, " ", m, " ", n, " ", o, " ", p)
	eq = []
	eq[0] = `x1 = z1 * ${A.x_}`
	eq[1] = `x2 = z2 * ${B.x_}`
	eq[2] = `x3 = z3 * ${C.x_}`
	eq[3] = `x4 = z4 * ${D.x_}`
	
	eq[4] = `y1 = z1 * ${A.y_}`
	eq[5] = `y2 = z1 * ${B.y_}`
	eq[6] = `y3 = z1 * ${C.y_}`
	eq[7] = `y4 = z1 * ${D.y_}`
	
	console.log(eq[0])
	
	/* 
	eq[0] = `${a} * z1 ^ 2 + ${b} * z2 * z4 - ${c} * z1 * z2 - ${d} * z1 * z4 = 0`
	eq[1] = `${e} * z2 ^ 2 + ${f} * z3 * z1 - ${g} * z2 * z3 - ${h} * z2 * z1 = 0`
	eq[2] = `${i} * z3 ^ 2 + ${j} * z4 * z2 - ${k} * z3 * z4 - ${l} * z3 * z2 = 0`
	eq[3] = `${m} * z4 ^ 2 + ${n} * z1 * z2 - ${o} * z4 * z1 - ${p} * z4 * z2 = ${v}` */
	
	/* opl = nerdamer.solveEquations(eq).toString();
	
	str = []
	substr = ''
	for (var character of opl) 
		if (character == ',') { str.push(substr); substr = '' } 
		else substr += character;
	str.push(substr)

	opl = {}
	Array.from(str, (d,i) => d[0] == 'z' ? opl[d] = parseFloat(str[i+1]) : false)

	PRECISION = 10**0

	retval = {}
	retval.A = {x: Math.round(PRECISION * A.x1 * opl.z1) / PRECISION, y: Math.round(PRECISION * A.y1 * opl.z1) / PRECISION, z: Math.round(PRECISION * opl.z1) / PRECISION}
	retval.B = {x: Math.round(PRECISION * B.x1 * opl.z2) / PRECISION, y: Math.round(PRECISION * B.y1 * opl.z2) / PRECISION, z: Math.round(PRECISION * opl.z2) / PRECISION}
	retval.C = {x: Math.round(PRECISION * C.x1 * opl.z3) / PRECISION, y: Math.round(PRECISION * C.y1 * opl.z3) / PRECISION, z: Math.round(PRECISION * opl.z3) / PRECISION}
	retval.D = {x: Math.round(PRECISION * D.x1 * opl.z4) / PRECISION, y: Math.round(PRECISION * D.y1 * opl.z4) / PRECISION, z: Math.round(PRECISION * opl.z4) / PRECISION}
	
	console.log(get3DCoordinate({x:0, y:0, z:0}))
	
	
	return retval */
}

	
testCorners = [{x:566,y:239},{x:1009,y:454},{x:585,y:417},{x:988,y:620}]
testCornersReg = [{x:100,y:10},{x:100,y:50},{x:10,y:50},{x:10,y:10}]
test_60 = [{x:1230,y:504},{x:1190,y:110},{x:137,y:110},{x:96,y:504}]
test80 = [{x:93,y:272},{x:1231,y:272},{x:1187,y:411},{x:140,y:411}]
test50 = [{x:98,y:75},{x:1227,y:75},{x:1192,y:585},{x:134,y:586}] 
test70 = [{x:95,y:204},{x:139,y:471},{x:1231,y:204},{x:1188,y:472}]
test85 = [{x:95,y:307},{x:142,y:380},{x:1233,y:307},{x:1188,y:380}]
test40 = [{x:102,y:25},{x:1224,y:26},{x:132,y:630},{x:1195,y:630}]
test40_ = [{x:115,y:295},{x:132,y:630},{x:735,y:630},{x:737,y:296}]
test40_2 = [{x:361,y:195},{x:371,y:532},{x:974,y:532},{x:983,y:195}]

testReal = [{x:2653,y:1093},{x:2733,y:2185},{x:657,y:2313},{x:661,y:1129}]

result = getSquareOrientation(testReal)
console.log(getDistance(result.A, result.B))
console.log(getDistance(result.C, result.D))
console.log(getDistance(result.A, result.D))
console.log(getDistance(result.B, result.C))
console.log(getDistance(result.A, result.C))
console.log(getDistance(result.B, result.D))
console.log(result)

module.exports = {
	getSquareOrientation: getSquareOrientation
}
