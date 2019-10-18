
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
    console.log("highWhite", locHighestWhite(result))
    console.log("lowWhite", locLowestWhite(result))
    console.log("leftWhite", locLeftWhite(result))
    console.log("rightWhite", locRightWhite(result))
    
	console.log("listOfWhite", listOfWhite(result)) // Deze call naar deze functie is de oorzaak van je probleem
    
	console.log("Neighbors", Neighbors(result, {x:3,y:2}))
    
	
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
	arr = []
	for (let i = 0; i < buffer.length; i++) {
		if (buffer[i] > 100) arr.push(1)
		else arr.push(0)
	}
	return arr
}

const locHighestWhite = function (matrix) {
    for (let j = 0; j < matrix.length; j++) {
        for (let i = 0; i < matrix[0].length; i++) {
            if (matrix[j][i] == 1) {
                return { x: i, y: j }
            }
        }
    }
}

const locLowestWhite = function (matrix) {
    for (let j = matrix.length - 1; j > -1; j--) {
        for (let i = matrix[0].length - 1; i > -1; i--) {
            if (matrix[j][i] == 1) {
                return { x: i, y: j }
            }
        }
    }
}

const locLeftWhite = function (matrix) {
    for (let i = 0; i < matrix[0].length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[j][i] == 1) {
                return { x: i, y: j }
            }
        }
    }
}

const locRightWhite = function (matrix) {
    for (let i = matrix[0].length - 1; i > -1; i--) {
        for (let j = matrix.length - 1; j > -1; j--) {
            if (matrix[j][i] == 1) {
                return { x: i, y: j }
            }
        }
    }
}

const listOfWhite = function (matrix) {
    temp = []; // Deze benaming (eerst result) veranderde de waarde van de result voorbeeld matrix
        for (let j = 0; j < matrix.length; j++) {
            for (let i = 0; i < matrix[0].length; i++) {
                if (matrix[j][i] == 1) {
                    temp.push({ x: i, y: j })
                }
            }
        }
    return temp
}

const Neighbors = function (matrix, loc) {//loc = key value pair x: y:
    
	console.log(matrix)
	console.log("Matrix dimensions: ", matrix[1].length, " ", matrix.length)
	
	for (let j = loc.y - 1; j <= loc.y + 1; j++) {
        for (let i = loc.x - 1; i <= loc.x + 1; i++) {
            console.log(i, j);
            if (j >= 0 && i >= 0 && j < matrix.length && i < matrix[0].length
                && !(i == loc.x && j == loc.y) && matrix[i][j] == 1) { //inside matrix & not loc & white
                console.log("Why dont i get here???");
                result.push({ x: i, y: j })
            }
        }
    }
    return result
}


// To make the function accesible in other .js files
module.exports = {
	screenReading: screenReading
};