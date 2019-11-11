let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

// Working in a 2D space these are possible transformation matrixes.
translation = [[1, 0, 'X'], [0, 1, 'Y'], [0, 0, 1]]
scaling = [['X', 0, 0], [0, 'Y', 0], [0, 0, 1]
rotation = [['cos(phi)', '-sin(phi)', 0], ['sin(phi)', 'cos(phi)', 0], [0, 0, 1]]

const scaleMatrix = function(matrix, val) {
	return Array.from(matrix, (d) => Array.from(d, (e) => multiply(e, val)))
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