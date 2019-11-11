let nerdamer = require('nerdamer');  // cannot be const, nerdamer object is updated below
require('nerdamer/Algebra.js');
require('nerdamer/Calculus.js');
require('nerdamer/Solve.js');

const rot = require('./rotationMatrixes.js')


const m = [['s'*'u'],['s'*'v'],['s']]

const M = [['x'], ['y'], ['z'], [1]]

const A_ = [['fx', 0, 'cx'], [0, 'fy', 'cy'], [0, 0, 1]]

const RT = [['r11', 'r12', 'r13', 't1'], ['r21', 'r22', 'r23', 't2'], ['r31', 'r32', 'r33', 't3']]


const getTransformation = function(point) {
	Rt = substituteMatrix(RT, {r11: 1, r12: 0, r13: 0, r21: 0, r22: 1, r23: 0, r31: 0, r32: 0, r33: 1, t1: 0, t2: 0, t3: 0})
	
	// console.log("Point: ", point)
	
	point = {x: point[0][0], y: point[1][0], z: point[2][0]}
	
	// console.log("Point2: ", point)
	
	cx = 4032 / 2
	cy = 3024 / 2
	fx = 4 * 72 / 25.4 // Average focal length en ppi
	fy = fx
	
	uv = matrixMultiply(matrixMultiply(A_, Rt), M)
	uv = substituteMatrix(uv, {cx : cx, cy: cy, fx: fx, fy: fy, x: point.x, y: point.y, z: point.z})
	
	// console.log(uv)
	
	s = uv[2][0]
	
	
	
	temp = {u: uv[0][0] / s, v: uv[1][0] / s}
	// console.log("uv: ", temp)
	return temp
	
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

const calcDistance = function(pos1, pos2 = {x:0, y:0, z:0}) {
	return Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2 + (pos2.z - pos1.z)**2)
}

const Test = function() {
	Tst = rot.getRotatedTest()
	
	A = Tst.A
	B = Tst.B
	C = Tst.C
	D = Tst.D
	
	for (let i in A) {
		console.log()
		console.log("Iteration: ", i)
		
		tempA = getTransformation(A[i])
		tempB = getTransformation(B[i])
		tempC = getTransformation(C[i])
		tempD = getTransformation(D[i])
		
		
		
		console.log("AB/DC: ", calcDistance({x: tempA.u, y: tempA.v, z: 0}, {x: tempB.u, y: tempB.v, z: 0})
			/calcDistance({x: tempC.u, y: tempC.v, z: 0}, {x: tempD.u, y: tempD.v, z: 0}))
		console.log("AD/BC: ", calcDistance({x: tempA.u, y: tempA.v, z: 0}, {x: tempD.u, y: tempD.v, z: 0})
			/calcDistance({x: tempC.u, y: tempC.v, z: 0}, {x: tempB.u, y: tempB.v, z: 0}))
		console.log("AC/BD: ", calcDistance({x: tempA.u, y: tempA.v, z: 0}, {x: tempC.u, y: tempC.v, z: 0})
			/calcDistance({x: tempB.u, y: tempB.v, z: 0}, {x: tempD.u, y: tempD.v, z: 0}))
		
	}
}

Test()