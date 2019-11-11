let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');


const m = [['s'*'u'],['s'*'v'],['s']]

const M = [['x'], ['y'], ['z'], [1]]

const A = [['fx', 0, 'cx'], [0, 'fy', 'cy'], [0, 0, 1]]

let RT = [['r11', 'r12', 'r13', 't1'], ['r21', 'r22', 'r23', 't2'], ['r31', 'r32', 'r33', 't3']]


const getTransformation = function() {
	
}


const substituteMatrix = function(matrix, values) {
	return Array.from(matrix, (d) => Array.from(d, (e) => nerdamer(e).evaluate(values).text()))
}

RT = substituteMatrix(RT, {r11: 1, r12: 0, r13: 0, r21: 0, r22: 1, r23: 0, r31: 0, r32: 0, r33: 1, t1: 0, t2: 0, t3: 0})

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


console.log(matrixMultiply(matrixMultiply(A, RT), M))