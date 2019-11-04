const solveSystem3x3 = function(matrix) {
	console.log("1. ", matrix)
	while (true) {
		if (matrix[1][1] == 0)
		matrix[0] = substractArray(matrix[0], scaleArray(matrix[1], matrix[0][1] / matrix[1][1]))
		if (equalsIllegalArray(matrix[0])) return
		else if (equalsZeroArray(matrix[0])) switchArrays(matrix, 0, 2 + i)
		else {
			matrix[0] = scaleArray(matrix[0], 1 / matrix[0][0])
			break
		}
	}
	console.log("2. ", matrix)
	
	console.log("3. ", matrix)
	
	console.log("4. ", matrix)
}

const sortMatrix = function(matrix) {
	if (matrix[0] == matrix[1]) switchArrays(matrix, 0, 1)
}

const scaleArray = function(arr, factor) {
	return Array.from(arr, (d,i) => factor * d)
}

const substractArray = function(arr1, arr2) {
	assert(arr1.length == arr2.length)
	return Array.from(arr1, (d,i) => d - arr2[i])
}

const switchArrays = function(matrix, firstLine, secondLine) {
	temp = matrix[firstLine].slice()
	matrix[firstLine] = matrix[secondLine].slice()
	matrix[secondLine] = temp
}

const equalsZeroArray = function(arr) {
	return arr.reduce((isZero, element) => element != 0 ? false : true, true)
}
	
const equalsIllegalArray = function(arr) {
	return equalsZeroArray(arr.slice(0, arr.length - 2)) && arr[-1] != 0
}