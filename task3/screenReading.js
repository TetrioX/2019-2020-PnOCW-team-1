
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
    console.log("listOfWhite", listOfWhite(result))
    console.log("Neighbors", Neighbors(result, {x:3,y:2}))
    
	
}	


const createMatrix = function(buffer, dimensions) {
	assert(buffer.length == dimensions.width * dimensions.height)
	matrix = []
	for(let i = 0; i < dimensions.height; i++){
		temp = buffer.slice(dimensions.width * i, dimensions.width * (i+1))
		matrix.push(bufferToArray(temp))
	}
	return matrix
}


const bufferToArray = function(buffer) {
	result = []
	for (let i = 0; i < buffer.length; i++) {
		if (buffer[i] > 100) result.push(1)
		else result.push(0)
	}
	return result
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
    result = [];
        for (let j = 0; j < matrix.length; j++) {
            for (let i = 0; i < matrix[0].length; i++) {
                if (matrix[j][i] == 1) {
                    result.push({ x: i, y: j })
                }
            }
        }
    return result
}

const Neighbors = function (matrix, loc) {//loc = key value pair x: y:
    for (let j = loc.y - 1; j <= loc.y + 1; j++) {
        for (let i = loc.x - 1; i <= loc.x + 1; i++) {
            console.log(i, j);
            if (j >= 0 && i >= 0 && j < matrix.length && i < matrix[0].length
                && !(i == loc.x && j == loc.y) && matrix[j][i] == 1) { //inside matrix & not loc & white
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