

const assert = require('assert')  // asserting pre-conditions


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
	let matrix = []
	for(let i = 0; i < dimensions.height; i++){
		let temp = buffer.slice(dimensions.width * i, dimensions.width * (i+1))
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
	return Array.from(Array(buffer.length), (d,i) => buffer[i])
}

module.exports = {
	createMatrix: createMatrix
}
