
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');


/**
 * Return the 3D coordinates of the given corners.
 *
 *
 **/
const getSquareOrientation = function(corners) {
	// console.log(corners)
	assert(corners.length == 4)
	var corners = getCornerPositions(corners)
	return transfer2Dto3D(corners)
}


/**
 * Give each corner a name corresponding with its real position on the screen.
 **/
const getCornerPositions = function(corners) {
	assert(corners.length == 4)
	return {
		A: corners[3],
		B: corners[0],
		C: corners[1],
		D: corners[2]
	}
}


/**
 * Calculate the x' and y' of a given 2D coordinate by the formula given in the @see.
 * 
 * @see https://docs.opencv.org/2.4/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html?fbclid=IwAR0VOj4yCmDC5n2-ZuesbHPwP2yYkALFEENOEzvgl5GR9yiPSrw1N6ZaGgs
 **/
const get3DCoordinate = function(point) {
	
	cx = 4032/ 2
	cy = 3024 / 2
	fx = 4 * 72 / 25.4 // Average focal length en ppi
	fy = fx
	
	x1 = (point.x - cx) / fx
	y1 = (point.y - cy) / fy
	
	return { x_ : x1, y_ : y1 }
}


/**
 * Calculate the z coordinate of each corner from the results of the get3DCoordinate fucntion.
 **/
const transfer2Dto3D = function(corners) {
	
	A = get3DCoordinate(corners.A)
	B = get3DCoordinate(corners.B)
	C = get3DCoordinate(corners.C)
	D = get3DCoordinate(corners.D)
	
	r = 1920 // AB
	s = 1080 // AD
	
	// r = 15.2 * 25.4 /Math.sqrt(1+(r/s)**2)

	eqxy = {}
	eqz = []
	
	eqxy.x1 = `${A.x_}*z1` // x = x' * z
	eqxy.x2 = `${B.x_}*z2`
	eqxy.x3 = `${C.x_}*z3`
	eqxy.x4 = `${D.x_}*z4`
	
	eqxy.y1 = `${A.y_}*z1` // y = y' * z
	eqxy.y2 = `${B.y_}*z2`
	eqxy.y3 = `${C.y_}*z3`
	eqxy.y4 = `${D.y_}*z4`
	
	eqz[0] = `(x4-x1)^2+(y4-y1)^2+(z4-z1)^2-(x3-x2)^2-(y3-y2)^2-(z3-z2)^2` // AD = BC
	eqz[1] = `(x2-x1)^2+(y2-y1)^2+(z2-z1)^2-(x3-x4)^2-(y3-y4)^2-(z3-z4)^2` // AB = CD
	eqz[2] = `(x3-x1)^2+(y3-y1)^2+(z3-z1)^2-(x4-x2)^2-(y4-y2)^2-(z4-z2)^2` // AC = DB
	eqz[3] = `(x2-x1)^2+(y2-y1)^2+(z2-z1)^2=${r**2}` // AB = r
	
	eq = Array.from(eqz, (d) => nerdamer(d, eqxy).text())
	
	opl = nerdamer.solveEquations(eq).toString();
	opl = readSolution(opl)

	for (let key in eqxy) opl[key] = nerdamer(eqxy[key]).evaluate(opl)
	
	scalingFactor = 500

	retval = {}
	retval.A = { x: roundNumber(opl.x1.text()), y: roundNumber(opl.y1.text()), z: roundNumber(opl.z1.text()) * scalingFactor }
	retval.B = { x: roundNumber(opl.x2.text()), y: roundNumber(opl.y2.text()), z: roundNumber(opl.z2.text()) * scalingFactor }
	retval.C = { x: roundNumber(opl.x3.text()), y: roundNumber(opl.y3.text()), z: roundNumber(opl.z3.text()) * scalingFactor }
	retval.D = { x: roundNumber(opl.x4.text()), y: roundNumber(opl.y4.text()), z: roundNumber(opl.z4.text()) * scalingFactor }

	return retval
}


/**
 * Round the given number with the given precision.
 **/
const roundNumber = function(numb) {
	PRECISION = 10**10
	return Math.round(nerdamer(numb).text() * PRECISION) / PRECISION
}


/**
 * Read and publish the given nerdamer system solution to an iterable dictionary.
 **/
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
