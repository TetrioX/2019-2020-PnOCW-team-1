const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');
const sqor = require('./squareOrientation.js')


const getScreens = function(screens) {
	var scrRes = {}
	for (var id in screens) {
		// console.log(id, " ", screens[id])
		scrRes[id] = getOrientation(screens[id])
		// console.log(getOrientation(screens[id]))
	}
	return scrRes
}

const getScreenCenters = function(screens) {
  var scrRes = {}
	for (var id in screens) {
		// console.log(id, " ", screens[id])
		scrRes[id] = getCenter(screens[id])
		// console.log(getOrientation(screens[id]))
	}
	return scrRes
}

const getOrientation = function(corners) {
	// console.log(corners)
	var corners = sqor.getSquareOrientation(corners)

	center = getCenter(corners)
	tiltDir = getTiltDir(corners)
	if (getTiltDir(corners).z) zRotation = calcAngle(getDirVector(corners.B, corners.C), {x:0,y:1,z:0})
	else zRotation = 0
	// xRotation = calcAngleDirection(corners, "x")
	// yRotation = calcAngleDirection(corners, "y")
	// calcAngles(corners)
	return {center: center, rotations : {z: zRotation}}
}

const getCenter = function(corners) {
	values = Object.keys(corners).map(function(key){ return corners[key] })
	xValue = values.reduce((sum, element) => sum + element.x, 0)
	yValue = values.reduce((sum, element) => sum + element.y, 0)
	return { x: xValue / 4, y: yValue / 4}
}

const getLine3D = function(pos1, pos2) {
	p = getDirVector(pos1, pos2)
	return { p: p, q: pos1 }
}

const getDirVector = function(pos1, pos2) {
	return { x : pos2.x - pos1.x, y : pos2.y - pos1.y, z : pos2.z - pos1.z }
}

const normalizeVector = function(vector) {
	len = calcDistance(vector)
	for (var key in vector) vector[key] = vector[key]/len
	return vector
}


const calcAngles = function(corners) {
	AB = normalizeVector(getDirVector(corners.A, corners.B))
	AD = normalizeVector(getDirVector(corners.A, corners.D))

	a = AB.x
	b = AB.y
	c = AB.z
	d = AD.x
	e = AD.y
	f = AD.z

	// console.log(a, " ", b, " ", c, " ", d, " ", e, " ", f)

	eq = []
	eq[0] = `${a}=t*v+s*u*w`
	eq[1] = `${b}=r*w`
	eq[2] = `${c}=s*t*w-u*v`
	eq[3] = `${d}=s*u*v-t*w`
	eq[4] = `${e}=r*v`
	eq[5] = `${f}=u*  w+s*t*v`

	eq[6] = `s=r*tan(x)`
	eq[7] = `u=t*tan(y)`
	eq[8] = `w=v*tan(z)`

	// console.log(eq)
	// opl = nerdamer.solveEquations([eq[0], eq[1], eq[2], eq[3], eq[4], eq[5]])
	// console.log(opl.toString())
	// opl = nerdamer.solveEquations([eq[0], eq[1], eq[2], eq[3], eq[4], eq[5]])
	return 1
}

const calcAngle = function(vector1, vector2) {
	vector1.l = calcDistance(vector1)
	vector2.l = calcDistance(vector2)
	return 180 * Math.acos((vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z)
			/(vector1.l * vector2.l)) / (Math.PI)
}


const calcDistance = function(pos1, pos2 = {x:0, y:0, z:0}) {
	return Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2 + (pos2.z - pos1.z)**2)
}


const getTiltDir = function(corners) {
	xTilt = corners.A.z != corners.D.z ? true : false
	yTilt = corners.A.z != corners.B.z ? true : false
	zTilt = corners.A.y != corners.B.y ? true : false
	return { x: xTilt, y: yTilt, z: zTilt }
}

/*
testCornersXTilt = {A: {x:10,y:10,z:0}, C: {x:30,y:30,z:20}, D: {x:10,y:30,z:20}, B: {x:30,y:10,z:0}}
testCornersYTilt = {A: {x:10,y:10,z:0}, C: {x:20,y:30,z:20}, D: {x:10,y:30,z:0}, B: {x:20,y:10,z:20}}
testCornersZTilt = {A: {x:100,y:10,z:0}, C: {x:90,y:120,z:0}, D: {x:40,y:70,z:0}, B: {x:150,y:60,z:0}}
test40 = [{x:102,y:25},{x:1224,y:26},{x:132,y:630},{x:1195,y:630}]
test70 = [{x:95,y:204},{x:139,y:471},{x:1231,y:204},{x:1188,y:472}]
testScreens = {0: test40, 1: test50}
testCornersZTilt = [{x:100,y:10},{x:90,y:120},{x:40,y:70},{x:150,y:60}]
vectorTest = {x:4,y:0,z:0}
console.log(getScreens(testScreens))
// console.log(getOrientation(testCornersZTilt))
*/
module.exports = {
	getScreens: getScreens,
  getScreenCenters: getScreenCenters
}
