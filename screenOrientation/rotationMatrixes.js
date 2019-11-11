
let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

const assert = require('assert')  // asserting pre-conditions
const plno = require('./planeNorm.js')


const PRECISION = 10**6

const Rx = [[1, 0, 0], [0, 'cos(x)', '-sin(x)'], [0, 'sin(x)', 'cos(x)']];
// const Rx = [[1, 0, 0], [0, 'a', '-b'], [0, 'b', 'a']];
const Ry = [['cos(y)', 0, 'sin(y)'], [0, 1, 0], ['-sin(y)', 0, 'cos(y)']];
// const Ry = [['c', 0, 'd'], [0, 1, 0], ['-d', 0, 'c']];
// const Rz = [['cos(z)', '-sin(z)', 0], ['sin(z)', 'cos(z)', 0], [0, 0, 1]];
const Rz = [['r', '-s', 0], ['s', 'r', 0], [0, 0, 1]];

// R = Ry * Rx * Rz

const getRotationZ = function(corners) {
	val = plno.getAngles(corners)
	
	console.log(180/Math.PI*val.x, " ", 180/Math.PI*val.y)
	
	R = getRotationMatrix(val)
	
	AB = plno.normalizeVector(plno.getDirVector(corners.A, corners.B))
	eq = matrixMultiply(R, [[1], [0], [0]])

	eq[0] = eq[0] + '-' + AB.x
	eq[1] = eq[1] + '-' + AB.y
	eq[2] = eq[2] + '-' + AB.z
	
	z1 = isSquareSystem(eq[0], eq[1]) ? nerdamer.solveEquations([eq[0], eq[1]]).toString() : false
	z2 = isSquareSystem(eq[1], eq[2]) ? nerdamer.solveEquations([eq[1], eq[2]]).toString() : false
	z3 = isSquareSystem(eq[0], eq[2]) ? nerdamer.solveEquations([eq[0], eq[2]]).toString() : false
	
	z1 = z1 ? readSolution(z1) : z1
	z2 = z2 ? readSolution(z2) : z2
	z3 = z3 ? readSolution(z3) : z3
	
	z = getAverageZ(z1, z2, z3)
	
	console.log(180/Math.PI*Math.asin(z.s))
	
	return substituteMatrix(R, z)
}


const getAverageZ = function(z1, z2, z3) {
	if (z1 && z2 && z3 && isKindaEqualDict(z1, z2) && isKindaEqualDict(z1, z3)) 
		z = getAverageDict([z1, z2, z3])
	else if (z1 && z2 && !z3 && isKindaEqualDict(z1, z2)) 
		z = getAverageDict([z1, z2])
	else if (!z1 && z2 && z3 && isKindaEqualDict(z2, z3)) 
		z = getAverageDict([z2, z3])
	else if (z1 && !z2 && z3 && isKindaEqualDict(z1, z3)) 
		z = getAverageDict([z1, z3])
	else if (z1 && !z2 && !z3) 
		z = z1
	else if (!z1 && z2 && !z3) 
		z = z2
	else if (!z1 && !z2 && z3) 
		z = z3
	else console.log("wtf you doing bruh")
	return z
}


const getAverageDict = function(dicts) {
	avDict = {}
	for (let key in dicts[0]) {
		sum = 0
		for (let dict of dicts) sum += dict[key]
		avDict[key] = sum / dicts.length
	}
	return avDict
}


const isKindaEqualDict = function(dict1, dict2) {
	for (var key in dict1) 
		if (! isKindaEqual(dict1[key], dict2[key])) {
			console.log("Whut?")
			return false
		}
	return true
}


const isKindaEqual = function(number1, number2) {
	Precision = 10**(-5)
	return number1 - Precision <= number2 && number2 <= number1 + Precision
}


const isSquareSystem = function(eq1, eq2) {
	return (eq1.includes('r') && eq2.includes('s')) || (eq1.includes('s') && eq2.includes('r'))
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
		if (character == ',') { 
			str.push(substr); 
			substr = '';
		} 
		else substr += character;
	str.push(substr)
	
	retval = {}
	for (let i = 0; i < str.length; i += 2) 
		retval[str[i]] = roundNumber(parseFloat(nerdamer(str[i+1]).evaluate().text()))
	
	return retval
}


const roundNumber = function(numb) {
	return Math.round(numb * PRECISION) / PRECISION
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

