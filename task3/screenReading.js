
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

    console.log("NeighborsAndDiagonal", NeighborsAndDiagonal(result, { x: 3, y: 2 }))
    console.log("Neighbors", Neighbors(result, { x: 3, y: 2 }))

    console.log("Neighborscolor", sortColorOut(result, Neighbors(result, { x: 4, y: 4 }), 1))
		var border = findBorder(result)
    console.log("border", border)
		var orderedBorder = findBorderOrdered(result)
    console.log("orderedBorder", orderedBorder)

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
    temp1 = []; // Deze benaming (eerst result) veranderde de waarde van de result voorbeeld matrix
        for (let j = 0; j < matrix.length; j++) {
            for (let i = 0; i < matrix[0].length; i++) {
                if (matrix[j][i] == 1) {
                    temp1.push({ x: i, y: j })
                }
            }
        }
    return temp1
}

const NeighborsAndDiagonal = function (matrix, loc) {//loc = key value pair x: y:
    temp2 = [];
	for (let j = loc.y - 1; j <= loc.y + 1; j++) {
        for (let i = loc.x - 1; i <= loc.x + 1; i++) {
            console.log(i, j);
            if (j >= 0 && i >= 0 && j < matrix.length && i < matrix[0].length
                && !(i == loc.x && j == loc.y)) { //inside matrix & not loc & white
                console.log("ook schuin");
                temp2.push({ x: i, y: j })
            }
        }
    }
    return temp2
}

const Neighbors = function (matrix, loc) {//loc = key value pair x: y:
    temp3 = []
    for (let j = loc.y - 1; j <= loc.y + 1; j++) {
        if (j >= 0 && j < matrix.length && j != loc.y) { //inside matrix & not loc & white
            temp3.push({ x: loc.x, y: j })
        }

    }
    for (let i = loc.x - 1; i <= loc.x + 1; i++) {
        if (i >= 0 && i < matrix[0].length && i != loc.x) { //inside matrix & not loc & white
            temp3.push({ x: i, y: loc.y })
        }
    }
    return temp3
}

const sortColorOut = function (matrix, locations, colorNumber) {
    temp4 = []
    for (k of locations) {
        if (matrix[k.y][k.x] == colorNumber) {
            temp4.push({ x: k.x, y: k.y })
        }
    }
    return temp4
}

const findBorder = function (matrix) {
    border = []
    allwhite = listOfWhite(matrix)
    for (w of allwhite) {
        console.log("1",w);
        if (sortColorOut(matrix, Neighbors(matrix, w), 1).length > 0 &&
            sortColorOut(matrix, Neighbors(matrix, w), 0).length > 0) {
            console.log("2",w);
            border.push({ x: w.x, y: w.y })
        }
    }
    return border
}

	const findBorderOrdered = function (matrix){

		function checkNeighbour(current, ang, value){
			console.log('y value', current.y - value*(ang.y))
			console.log('x value', current.x + value*(ang.x))
			var neighbour = matrix[current.y - value*(ang.y)]
			if (typeof neighbour === 'undefined'){
				return false
			}
			neighbour = neighbour[current.x + value*(ang.x)]
			if (typeof neighbour === 'undefined'){
				return false
			}
			console.log('value neighbour', neighbour)
			return neighbour == 1
		}

		var finishedLoop = false
    current = locHighestWhite(matrix);
		border = []
		angle = {x: 1, y: 0}
		while(false == finishedLoop){
			console.log('angle', angle)
			console.log('current', current)
			if (checkNeighbour(current, angle, 1) ||
				checkNeighbour(current, angle, 2) ||
				checkNeighbour(current, angle, 3)){
				console.log('im here')
				current.x += angle.x
				current.y -= angle.y
				border.push({
					x: current.x,
					y: current.y
				})
				console.log(border)
			}else{
				console.log('else')

				if(angle.x == 1 && angle.y ==0){
					angle = {x: 1, y: -1}
				}else if(angle.x == 1 && angle.y ==-1){
					angle = {x: 0, y: -1}
				}else if(angle.x == 0 && angle.y ==-1){
					angle = {x: -1, y: -1}
				}else if(angle.x ==-1 && angle.y ==-1){
					angle = {x: -1, y: 0}
				}else if(angle.x == -1 && angle.y ==0){
					angle = {x: -1, y: 1}
				}else if(angle.x == -1 && angle.y ==1){
					angle = {x: 0, y: 1}
				}else if(angle.x == 0 && angle.y ==1){
					angle = {x: 1, y: 1}
				}else{
					finishedLoop = true
				}
			}
		}

		return border
	}

/*
const findCorners = function (matrix) {
    hi = locHighestWhite(matrix)
    lo = locLowestWhite(matrix)
    if (lo.x < hi.x) {
        //hi doorschuiven nr rechts
        //lo doorschuiven nr links
    }
    le = locLeftWhite(matrix)
    re = locRightWhite(matrix)
}
*/

// To make the function accesible in other .js files
module.exports = {
	screenReading: screenReading
};
