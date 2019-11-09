
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
	
	cx = 4032 / 2
	cy = 3024 / 2
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
	
	r = 1920 // AB
	s = 1080 // AD
	
	verh = r / s // AB / AD

	eqxy = {}
	eqz = []
	
	eqxy.x1 = `${A.x_}*z1`
	eqxy.x2 = `${B.x_}*z2`
	eqxy.x3 = `${C.x_}*z3`
	eqxy.x4 = `${D.x_}*z4`
	
	eqxy.y1 = `${A.y_}*z1`
	eqxy.y2 = `${B.y_}*z2`
	eqxy.y3 = `${C.y_}*z3`
	eqxy.y4 = `${D.y_}*z4`
	
	eqz[0] = `(x4-x1)^2+(y4-y1)^2+(z4-z1)^2-(x3-x2)^2-(y3-y2)^2-(z3-z2)^2` // AD = s
	eqz[1] = `(x2-x1)^2+(y2-y1)^2+(z2-z1)^2-(x3-x4)^2-(y3-y4)^2-(z3-z4)^2` // AB = r
	eqz[2] = `(x3-x1)^2+(y3-y1)^2+(z3-z1)^2-(x4-x2)^2-(y4-y2)^2-(z4-z2)^2` // AC = DB
	eqz[3] = `(x2-x1)^2+(y2-y1)^2+(z2-z1)^2=${r**2}` // ADC = 90°
	
	eq = Array.from(eqz, (d) => nerdamer(d, eqxy).text())
	
	opl = nerdamer.solveEquations(eq).toString();
	opl = readSolution(opl)

	for (let key in eqxy) opl[key] = nerdamer(eqxy[key]).evaluate(opl)
	
	retval = {}
	retval.A = { x: roundNumber(opl.x1.text()), y: roundNumber(opl.y1.text()), z: roundNumber(opl.z1.text()) }
	retval.B = { x: roundNumber(opl.x2.text()), y: roundNumber(opl.y2.text()), z: roundNumber(opl.z2.text()) }
	retval.C = { x: roundNumber(opl.x3.text()), y: roundNumber(opl.y3.text()), z: roundNumber(opl.z3.text()) }
	retval.D = { x: roundNumber(opl.x4.text()), y: roundNumber(opl.y4.text()), z: roundNumber(opl.z4.text()) }

	return retval
}

const roundNumber = function(numb) {
	PRECISION = 10**10
	return Math.round(nerdamer(numb).text() * PRECISION) / PRECISION
}

const readSolution = function(solution) {
	str = []
	substr = ''
	for (var character of opl) 
		if (character == ',') { str.push(substr); substr = '' } 
		else substr += character;
	str.push(substr)
	
	retval = {}
	for (let i = 0; i < str.length; i += 2) retval[str[i]] = parseFloat(str[i+1])
	
	return retval
}

module.exports = {
	getSquareOrientation: getSquareOrientation
}
