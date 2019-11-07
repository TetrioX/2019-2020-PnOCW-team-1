
const rot = require('./rotationMatrixes.js')

const PRECISION = 10**10

const getAngles = function(corners) {
	return getAnglesNorm(getNorm(corners))
}

const getAnglesNorm = function(norm) {
	theta = Math.atan(norm.x / norm.z)
	gamma = Math.asin(-norm.y)
	
	return { x: gamma, y: theta }
}

const getNorm = function(corners) {
	AB = normalizeVector(getDirVector(corners.A, corners.B))
	AD = normalizeVector(getDirVector(corners.A, corners.D))
	
	norm = crossProduct(AB, AD)
	
	return norm
}

const crossProduct = function(vector1, vector2) {
	return {
		x: vector1.y * vector2.z - vector1.z * vector2.y,
		y: vector1.z * vector2.x - vector1.x * vector2.z,
		z: vector1.x * vector2.y - vector1.y * vector2.x
	}
}

const normalizeVector = function(vector) {
	len = calcDistance(vector)
	for (var key in vector) vector[key] = Math.round( vector[key]/len * PRECISION) / PRECISION
	return vector
}

const getDirVector = function(pos1, pos2) {
	return { x : pos2.x - pos1.x, y : pos2.y - pos1.y, z : pos2.z - pos1.z }
}

const calcDistance = function(pos1, pos2 = {x:0, y:0, z:0}) {
	return Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2 + (pos2.z - pos1.z)**2)
}


module.exports = {
	getAngles: getAngles,
	normalizeVector: normalizeVector,
	getDirVector: getDirVector
}