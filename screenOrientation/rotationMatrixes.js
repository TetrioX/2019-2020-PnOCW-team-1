
let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

const assert = require('assert')  // asserting pre-conditions
const plno = require('./planeNorm.js')


const PRECISION = 10**10

const Rx = [[1, 0, 0], [0, 'cos(x)', '-sin(x)'], [0, 'sin(x)', 'cos(x)']];
// const Rx = [[1, 0, 0], [0, 'a', '-b'], [0, 'b', 'a']];
const Ry = [['cos(y)', 0, 'sin(y)'], [0, 1, 0], ['-sin(y)', 0, 'cos(y)']];
// const Ry = [['c', 0, 'd'], [0, 1, 0], ['-d', 0, 'c']];
const Rz = [['cos(z)', '-sin(z)', 0], ['sin(z)', 'cos(z)', 0], [0, 0, 1]];
// const Rz = [['r', '-s', 0], ['s', 'r', 0], [0, 0, 1]];

// R = Ry * Rx * Rz

const getRotationZ = function(corners) {
	val = plno.getAngles(corners)
	R = getRotationMatrix(val)
	
	AB = plno.normalizeVector(plno.getDirVector(corners.A, corners.B))
	eq = matrixMultiply(R, [[1], [0], [0]])
	
	console.log(corners.A, " ", corners.B, " ", AB)
	
	eq[0] = eq[0] + '-' + AB.x
	eq[1] = eq[1] + '-' + AB.y
	eq[2] = eq[2] + '-' + AB.z
	
	z2 = nerdamer.solve(eq[1], 'z').text()
	z1 = nerdamer(eq[0]) == 0 ? z2 : nerdamer.solve(eq[0], 'z').text()
	z3 = nerdamer(eq[2]) == 0 ? z1 : nerdamer.solve(eq[2], 'z').text()
	
	z1 = readSolution(z1)
	z2 = readSolution(z2)
	z3 = readSolution(z3)
	
	// console.log(z1, z2, z3)
	
	z = []
	for (let zi of z1)
		if (z2.includes(zi) && z3.includes(zi))
			z.push(modulo(zi, 2 * Math.PI))	
	
	z = z.reduce((sum, d) => sum + d, 0) / z.length
	
	console.log("r1: ", nerdamer(eq[0]).evaluate({z: z}).text(), " r2: ", nerdamer(eq[1]).evaluate({z: z}).text(), " r3: ", nerdamer(eq[2]).evaluate({z: z}).text()) 
	

	return {x: parseFloat(nerdamer(val.x).text()), y: parseFloat(nerdamer(val.y).text()), z: z}
}

const modulo = function(numb, mod) {
	while (Math.abs(numb) > mod/2)
		numb = numb >= 0 ? numb - mod : numb + mod
	return numb
}

const readSolution = function(solution) {
	str = []
	substr = ''
	for (var character of solution) 
		if (character == ',') { str.push(parseFloat(nerdamer(substr).evaluate().text())); substr = '' } 
		else if (character == '[' || character == ']') continue
		else substr += character;
	str.push(parseFloat(nerdamer(substr).evaluate().text()))
	return str
}

const getRotationMatrix = function(values) {
	return matrixMultiply(matrixMultiply(substituteMatrix(Ry, values), substituteMatrix(Rx, values)), Rz)
}

const substituteMatrix = function(matrix, values) {
	return Array.from(matrix, (d) => Array.from(d, (e) => nerdamer(e).evaluate(values).text()))
}

const matrixMultiply = function(matrix1, matrix2) {
	result = Array.from(new Array(matrix1.length), (d) => new Array(matrix2[0].length ).fill(0))
	for (let i in matrix1) 
		for (let j in matrix2[0])
			for (let k in matrix1[i]) 
				result[i][j] = add(result[i][j], multiply(matrix1[i][k], matrix2[k][j]))
	return result
}

const multiply = function(expr1, expr2) {
	return nerdamer(expr1).multiply(expr2).text()
}

const add = function(expr1, expr2) {
	return nerdamer(expr1).add(expr2).text()
}


module.exports = {
	getRotationZ: getRotationZ,
	getRotationMatrix: getRotationMatrix,
	matrixMultiply: matrixMultiply
}

