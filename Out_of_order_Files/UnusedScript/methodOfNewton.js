

const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions

let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

const luf = require('./LUFactorization.js')  // asserting pre-conditions


const methodOfNewton = function(equationSystem, startingValue) {
	xk = startingValue
	unknown = ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
	
	for (let k = 0; k < 10; k++) {
		
		J = Array.from(new Array(startingValue.length), (d) => [])
		
		evalVal = {}
		for (let l in startingValue) evalVal[unknown[l]] = xk[l]
		
		for (var i in equationSystem) for (var j in startingValue) {
			temp = 'diff(' + eq[i] + ', ' + unknown[j] + ')'
			J[i][j] = parseFloat(nerdamer(temp).evaluate(evalVal).text())
		}
		
		fk = Array.from(equationSystem, (d) =>  - parseFloat(nerdamer(d).evaluate(evalVal).text()) )
		
		console.log("J en fk: ", J, " * h = ", fk)
		
		hk = solveLinSyst(J, fk)
		
		temp = xk.slice()
		xk = addArray(xk, hk)
		
		if (reachedPrecision(xk, temp)) break
		console.log("xk: ", xk)
	}
	
	return xk
}


const solveLinSyst = function(A, b) {
	
	// console.log("A: ", A, "b: ", b)
	LU = luf.luDecomposition(A, A.length)
	
	// console.log("LU L: ", LU.L)
	// console.log("LU U: ", LU.U)
	
	y = b.slice()
	for (let i in A) for (let k = 0; k < i; k++) y[i] -= LU.L[i][k] * y[k]
	// console.log("y: ", y)
	
	x = y.slice()
	for (let i = A.length - 1; i > -1; i--) {
		for (let k = A.length - 1; k > i; k--) x[i] -= LU.U[i][k] * x[k]
		x[i] = x[i] / LU.U[i][i]
	}
	// console.log("x: ", x)
	
	return x
}

const solveMatrix = function(matrix) {
	
	matrix = sortMatrix(matrix)
	
	for (let i in matrix) 
		for (let k = 0; k < i; k++)
			matrix[i] = substractArray(scaleArray(matrix[i], matrix[k][k]), scaleArray(matrix[k], matrix[i][k]))
	
	for (let i = matrix.length - 1; i >= 0 ; i--)
		for (let k = matrix.length - 1; k > i; k--)
			matrix[i] = substractArray(scaleArray(matrix[i], matrix[k][k]), scaleArray(matrix[k], matrix[i][k]))
	
	
	
	for (let i in matrix) {
		let j = i
		while (j < matrix.length)
			if (matrix[i][j] != 0) {
				console.log(i, " ",j)
				matrix[i] = scaleArray(matrix[i], 1/matrix[i][j])
				break
			}
			else j++

	}
	console.log(matrix)
}

const sortMatrix = function(matrix) {
	let i = 0
	let k = 0
	while (i < matrix.length) 
		if (matrix[i][i] == 0 && k < matrix.length) {
			matrix = swapArray(matrix, i)
			k++
		}
		else {
			i++
			k = i
		}
	return matrix
}

const joinMatrix = function(A, b) {
	Array.from(A, (d, i) => d.push(-b[i]))
	return A
}

const swapArray = function(matrix, from) {
	temp = matrix.splice(from, 1)
	matrix.push(temp[0])
	return matrix
}

const scaleArray = function(arr, factor) {
	// console.log(arr, " ", factor)
	return Array.from(arr, (d,i) => factor * d)
}

const substractArray = function(arr1, arr2) {
	// console.log(arr1, " ", arr2)
	assert(arr1.length == arr2.length)
	return Array.from(arr1, (d,i) => d - arr2[i])
}

const addArray = function(vector1, vector2) {
	return Array.from(vector1, (d,i) => d + vector2[i])
}

const reachedPrecision = function(xi, xk, epsilon = 10**(-10)) {
	return xi.reduce((res, element, pos) => Math.abs(element - xk[pos]) > res ? Math.abs(element - xk[pos]) : res, 0) <= epsilon
}

const addMatrix = function(matrix1, matrix2) {
	return Array.from(matrix1, (d,i) => Array.from(d, (e, k) => e + matrix2[i][k]))
}

eq = []
eq[0] = 'r^2*sqrt(s)-4'
eq[1] = 's*r-36'
eq[2] = 't^3*s-3'
eq[3] = 'u*s*r+s*r-6'

mat = [[1,3,4],[0,0,0],[0,0,1]]
vect = [0, 2, 3]

// console.log(joinMatrix(mat, vect))

// console.log(solveMatrix(joinMatrix(mat, vect)))

// console.log(methodOfNewton(eq, [3,3,4,0]));

module.exports = {
	methodOfNewton: methodOfNewton
}