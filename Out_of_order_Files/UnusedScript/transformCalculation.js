let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

// Working in a 2D space these are possible transformation matrixes.
const translation = [[1, 0, 'X'], [0, 1, 'Y'], [0, 0, 1]]
const scaling = [['X', 0, 0], [0, 'Y', 0], [0, 0, 1]]
const rotation = [['cos(phi)', '-sin(phi)', 0], ['sin(phi)', 'cos(phi)', 0], [0, 0, 1]]
const shearing = [[1, 'X', 0], ['Y', 1, 0], [0, 0, 1]]


const getMaxelMethod = function(corners, data = {r: 1920, s: 1080}) {
	A = [[corners.A.x, corners.B.x, corners.D.x], [corners.A.y, corners.B.y, corners.D.y], [1, 1, 1]]
	variables = [['l'], ['m'], ['t']]
	b = [[corners.C.x], [corners.C.y], [1]]
	
	A = matrixMultiply(A, variables)
	
	eq = []
	for (let i in A) eq[i] = A[i] + '-' + b[i]
	
	// console.log(A)
	
	opl = nerdamer.solveEquations(eq)
	sol = {}
	for (let solution of opl) 
		sol[solution[0]] = solution[1]
	
	console.log(sol)
	
	A = [[multiply(corners.A.x, 'l'), multiply(corners.B.x, 'm'), multiply(corners.D.x, 't')], 
		 [multiply(corners.A.y, 'l'), multiply(corners.B.y, 'm'), multiply(corners.D.y, 't')], 
		 ['l', 'm', 't']]
	A = substituteMatrix(A, sol)
	
	console.log(A)
	
	B = [[0, data.r, 0], [0, 0, data.s], [1, 1, 1]]
	b = [[data.r], [data.s], [1]]
	
	B = matrixMultiply(B, variables)
	for (let i in B) eq[i] = B[i] + '=' + b[i]
	
	opl = nerdamer.solveEquations(eq)
	
	sol = {}
	for (let solution of opl) 
		sol[solution[0]] = solution[1]
	
	B = [[0, multiply(data.r, 'm'), 0 ], [0, 0, multiply(data.s, 't')], ['l', 'm', 't']]
	B = substituteMatrix(B, sol)
	
	console.log(B)
	
	A_ = inverseMatrix(A)
	
	C = matrixMultiply(B, A_)
	
	return C
}

const getTransformation = function(corners, data = {verh: 1920/1080}) {
	console.log("1. ", corners)
	
	verh = data.verh
	
	T1 = substituteMatrix(translation, {X: -corners.A.x, Y: -corners.A.y})
	corners = transformScreen(corners, T1)
	T = T1
	console.log("2. ", corners, " -> ", T1)
	
	angle = corners.B.y > 0 ? -getAngle(coordToVector(corners.B), [[1],[0],[0]]) : getAngle(coordToVector(corners.B), [[1],[0],[0]])
	R1 = substituteMatrix(rotation, {phi: angle})
	corners = transformScreen(corners, R1)
	console.log("3. ", corners, " -> ", R1)
	
	S1 = substituteMatrix(scaling, {X: 1920 / corners.B.x, Y: 1080 / corners.D.y})
	corners = transformScreen(corners, S1)
	T = matrixMultiply(S1, T)
	console.log("4. ", corners, " -> ", S1)
	
	Sh1 = substituteMatrix(shearing, {X: -corners.D.x/corners.D.y, Y:0})
	corners = transformScreen(corners, Sh1)
	T = matrixMultiply(Sh1, T)
	console.log("5. ", corners, " -> ", Sh1)
	
	console.log(T)
	
}

const coordToVector = function(coordinate) {
	return [[coordinate.x], [coordinate.y], [1]]
}

const vectorToCoord = function(vector) {
	return {x: vector[0][0], y: vector[1][0]}
}

const transformScreen = function(corners, transformation) {
	A = coordToVector(corners.A)
	B = coordToVector(corners.B)
	C = coordToVector(corners.C)
	D = coordToVector(corners.D)
	
	A = roundMatrix(matrixMultiply(transformation, A))
	B = roundMatrix(matrixMultiply(transformation, B))
	C = roundMatrix(matrixMultiply(transformation, C))
	D = roundMatrix(matrixMultiply(transformation, D))
	
	return {A: vectorToCoord(A), B: vectorToCoord(B), C: vectorToCoord(C), D: vectorToCoord(D)}
}

const inverseMatrix = function(matrix) {
	return scaleMatrix(
		[[	calculateDeterminant2x2([[matrix[1][1], matrix[1][2]], [matrix[2][1], matrix[2][2]]]),
			calculateDeterminant2x2([[matrix[0][2], matrix[0][1]], [matrix[2][2], matrix[2][1]]]),
			calculateDeterminant2x2([[matrix[0][1], matrix[0][2]], [matrix[1][1], matrix[1][2]]]) ],
		 [	calculateDeterminant2x2([[matrix[1][2], matrix[1][0]], [matrix[2][2], matrix[2][0]]]),
			calculateDeterminant2x2([[matrix[0][0], matrix[0][2]], [matrix[2][0], matrix[2][2]]]),
			calculateDeterminant2x2([[matrix[0][2], matrix[0][0]], [matrix[1][2], matrix[1][0]]]) ],
		 [	calculateDeterminant2x2([[matrix[1][0], matrix[1][1]], [matrix[2][0], matrix[2][1]]]),
			calculateDeterminant2x2([[matrix[0][1], matrix[0][0]], [matrix[2][1], matrix[2][0]]]),
			calculateDeterminant2x2([[matrix[0][0], matrix[1][0]], [matrix[1][0], matrix[1][1]]]) ]],			
		 1 / calculateDeterminant3x3(matrix))
}

const calculateDeterminant3x3 = function(matrix) {
	console.log(matrix)
	
	temp = add(multiply(multiply(matrix[0][0], matrix[1][1]), matrix[2][2]), 
				multiply(multiply(matrix[0][1], matrix[1][2]), matrix[2][0]))
	temp = add(temp, multiply(multiply(matrix[0][2], matrix[1][0]), matrix[2][1]))
	temp = add(temp, - multiply(multiply(matrix[0][2], matrix[1][1]), matrix[2][0]))
	temp = add(temp, - multiply(multiply(matrix[0][1], matrix[1][0]), matrix[2][2]))
	temp = add(temp, - multiply(multiply(matrix[0][0], matrix[1][2]), matrix[2][1]))
	
	return temp
}

const calculateDeterminant2x2 = function(matrix) {
	return add(multiply(matrix[0][0], matrix[1][1]), - multiply(matrix[0][1], matrix[1][0]))
}

const transpose = function(vector) {
	return [[vector[0][0], vector[1][0], vector[2][0]]]
}

const scaleMatrix = function(matrix, val) {
	return Array.from(matrix, (d) => Array.from(d, (e) => multiply(e, val)))
}

const substituteMatrix = function(matrix, values) {
	return Array.from(matrix, (d) => Array.from(d, (e) => parseFloat(nerdamer(e).evaluate(values).text())))
}


const roundMatrix = function(matrix) {
	PRECISION = 10**10
	return Array.from(matrix, (d) => Array.from(d, (e) => Math.round(e * PRECISION)/PRECISION))
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

const getAngle = function(vector1, vector2) {
	return Math.acos( matrixMultiply(transpose(vector1), vector2) / (getLength(vector1) * getLength(vector2))) 
}

const getLength = function(vector) {
	return Math.sqrt((vector[0][0])**2 + (vector[1][0])**2)
}


// matrix = [[1, 0, 0], [0, 2, 2], [0, 0, 1]]

// console.log(inverseMatrix(matrix))

testReal = {B: {x:2345, y: 1005}, C: {x: 2717,y: 1705}, D: {x: 1393,y: 2131}, A: {x: 1001, y:1161}} 

getTransformation(testReal)