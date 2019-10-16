
const assert = require('assert')  // asserting pre-conditions


const screenReading = function(buffer, dimensions) {
	endWhite = 0
	startWhite = 0
	onWhite = true
	result = []
	
	for(let i = 0; i < buffer.length; i++) {
		
		if (buffer[i] > 100) if (!onWhite) { 
		result.push(i - endWhite)
		startWhite = i; 
		onWhite = true
		}
		
		if (buffer[i] <= 100) if (onWhite) { 
		result.push(i - startWhite)
		endWhite = i
		onWhite = false
		}
	}
	
	result = createMatrix(buffer, dimensions)
	console.log(dimensions)
	console.log(" ", result)
	
}	

/**
 * Create a matrix out of a given buffer with the given dimensions.
 *
 * @param {Buffer} buffer Input buffer
 * @param {Integer[]} dimensions Input dimensions
 * 
 * @pre buffer.length == dimensions.width * dimensions.height
 * 
 * @return {Integer[][]} Return a matrix derived from a given buffer
 *
 */
const createMatrix = function(buffer, dimensions) {
	assert(buffer.length == dimensions.width * dimensions.height)
	matrix = []
	for(let i = 0; i < dimensions.height; i++){
		temp = buffer.slice(dimensions.width * i, dimensions.width * (i+1))
		matrix.push(bufferToArray(temp))
	}
	return matrix
}

/**
 * Create an array out of a given buffer with the given dimensions consisting of only 1 and 0 elements.
 *
 * @param {Buffer} buffer Input buffer
 *  * 
 * @return {Integer[]} Return an array derived from a given buffer with only 0 and 1 as elements
 *
 */
const bufferToArray = function(buffer) {
	result = []
	for (let i = 0; i < buffer.length; i++) {
		if (buffer[i] > 100) result.push(1)
		else result.push(0)
	}
	return result
}

// To make the function accesible in other .js files
module.exports = {
	screenReading: screenReading
};