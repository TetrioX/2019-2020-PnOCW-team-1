//
// Accept a buffer and given dimensions, turn the buffer into a matrix
// and return eventual corners on the figure.
//
// (C) 2019 PnO Team 1
//

const assert = require('assert')  // asserting pre-conditions
const vctcalc = require('./vectorCalculation.js')

const screenReading = function(buffer, dimensions) {

	result = createMatrix(buffer, dimensions)
	// console.log(dimensions)
    // console.log(" ", result)
    // console.log("highWhite", locHighestWhite(result))
    // console.log("lowWhite", locLowestWhite(result))
    // console.log("leftWhite", locLeftWhite(result))
    // console.log("rightWhite", locRightWhite(result))

	// console.log("listOfWhite", listOfWhite(result)) // Deze call naar deze functie is de oorzaak van je probleem

    // console.log("NeighborsAndDiagonal", NeighborsAndDiagonal(result, { x: 3, y: 2 }))
    // console.log("Neighbors", Neighbors(result, { x: 3, y: 2 }))

    // console.log("Neighborscolor", sortColorOut(result, Neighbors(result, { x: 4, y: 4 }), 1))
		// var border = findBorder(result)
    // console.log("border", border)
		// var orderedBorder = findBorderOrdered(result, locHighestWhite(result))
    // console.log("orderedBorder", orderedBorder)
		// console.log("squares", getSquares(result))

	return getSquares(result)

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
    return null
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

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const copyMatrix = function (originalMatrix) {
    var newArray = [];
    for (var i = 0; i < originalMatrix.length; i++) {
        newArray[i] = originalMatrix[i].slice();
    }
    return newArray
}

const onlyBorder = function (matrix) {
    allwhite = listOfWhite(matrix)
    var onlyBorder = copyMatrix(matrix)
    for (w of allwhite) {
        //geen deel vd rand ==> wordt die nul
        if (!(hasNeighbors(matrix, w, 1) && hasNeighbors(matrix, w, 0))) {
            onlyBorder[w.y][w.x] = 0
        }

    }
    return onlyBorder
}


const hasNeighbors = function (matrix, loc, color) { //inside matrix & not loc & right color
    for (let j = loc.y - 1; j <= loc.y + 1; j+= 2) {
        if (j >= 0 && j < matrix.length && color == matrix[j][loc.x]) { //left & right
            return true
        }

    }
    for (let i = loc.x - 1; i <= loc.x + 1; i+= 2) {
        if (i >= 0 && i < matrix[0].length && color == matrix[loc.y][i]) { //up & down
            return true
        }
    }
    return false
}


const findBorderOrdered = function (matrix, start) {

    // check if pixel on current + angle*value is white and in screen
	function checkNeighbor(current, ang){
		var neighbor = borderMatrix[current.y + ang.y]
        if (typeof neighbor === 'undefined'){
			return false
		}
		neighbor = neighbor[current.x + ang.x]
		if (typeof neighbor === 'undefined'){
			return
        }
        return neighbor == 1
    }
    //possible angles to go to
	var angles = [
		{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1},
		{x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1},
		{x: 0, y: -1}, {x: 1, y: -1}
    ]

	borderMatrix[start.y][start.x] = 0

	var angleIndex = 0
    var current = {
		x: start.x,
		y: start.y
    };
	border = []
    while (true) {
        var foundNewBorderPixel = false;
        // Also check previous angles
        for (var add = -2; add < 4; add++) { //vanaf -3 al????
            //45graden kloksgewijs: angleIndex (huidige index) + add
            var angle = angles[(angleIndex + add + 8) % 8]
            // check in the direction of the angle if your neighbour is white
            if (checkNeighbor(current, angle)) {
                current.x += angle.x
                current.y += angle.y
                //add to the list
                border.push({
                    x: current.x,
                    y: current.y
                });
                //remove it from the matrix (make it black)
                borderMatrix[current.y][current.x] = 0
                //set the new direction to the current angle
                angleIndex = (angleIndex + add + 8) % 8
                //continue searching in the same direction
                foundNewBorderPixel = true;
                break;
            }
        }
        // only black pixels surround this pixel
        if (!foundNewBorderPixel) {
            //check if begin pixel is a neighbor
            if ((start.x == current.x || start.x == current.x + 1 || start.x == current.x - 1) &&
                (start.y == current.y || start.y == current.y + 1 || start.y == current.y - 1)) {
                break;
            }
		        else {
		            // we're stuck so we have to go back
								// angle we came from
								var angle = angles[(angleIndex + 4) % 8]
								current.x += angle.x
                current.y += angle.y
                //add to the list
                border.push({
                    x: current.x,
                    y: current.y
                });
		        }
        }

    }
    matrix = borderMatrix
    return border
}

const getSquares = function (matrix) {
    squares = []
		borderMatrix = onlyBorder(matrix)
    while (locHighestWhite(borderMatrix) != null) { //hmmmn klopt dit wel?
				var border = findBorderOrdered(borderMatrix, locHighestWhite(borderMatrix))
				var corners = getCorners(border)
				if (corners.length == 4){
						squares.push(corners)
				}
    }
    return squares
}



function getCorners(rand){

	if (rand.length < 50){
	return []
	}

	function getRand(i){
	if (i<0){
	    i += rand.length;
	}
	return rand[i%rand.length];
	}

	function getSqrDist(a, b){
	return (a.x - b.x)**2 + (a.y - b.y)**2;
	}

	function getCornerWithMinimumAngle(angles){
	// Retuns index of minimum of angles
	var indexOfMinAngle = angles.reduce((maxI, angle, i, angles) => angle > angles[maxI] ? i : maxI, 0);
	// Set values next to minimum angle to infinity so that they don't show up next time.
	for (var v = -5; v <= 5; v++){
	    angles[(indexOfMinAngle + v + angles.length)%angles.length] = -Infinity;
	}
	return getRand(indexOfMinAngle);
	}

	var angles = [];

	for (var i = 0; i < rand.length; i++){
	var avgAngle = 0;
	for (var j = 2; j <= 5; j++) {
	    // Law of Cosinus a**2 = b**2 + c**2 -2*b*c*cos(angle)
	    var aSqrt = getSqrDist(getRand(i + j), getRand(i - j));
	    var bSqrt = getSqrDist(getRand(i), getRand(i + j));
	    var cSqrt = getSqrDist(getRand(i), getRand(i - j));
	    var b = Math.sqrt(bSqrt);
	    var c = Math.sqrt(cSqrt);

	    // We don't need to do Math.acos() since if a < b then acos(a) > acos(b)
	    // and we'll be comparing them relative to each other
	    avgAngle += (bSqrt + cSqrt - aSqrt)/(2 * b * c);
	}
	// We don't have to devide the average since we'll only be comparing them
	// to each other

	angles.push(avgAngle);
	}

	var corners = []

	for (var c = 0; c < 4; c++){
	corners.push(getCornerWithMinimumAngle(angles));
	}
	return corners;
}
/*
function getSquares(matrix){

	// Calculates the difference between each end of the border on one row
	// so this part can be skipped when looking for the beginning of
	// the next square
	function getBorderJumps(border){
		// When border length is eq. to 1 or less the program might crash so
		// we handle them here
		if (border.length <= 1){
			if (border.length == 1){
				var jumps = {}
				jumps[border[0].y][border[0].x] = 0;
				return jumps
			} else{
				return {}
			}
		}
		// jumps[y][x] is an integer with the size of the jump
		// and y and x the start of the jump
		var jumps = {};
		var rightIndex = 0;
		var leftIndex = border.length - 1;
		var maxRight = border[rightIndex].x;
		var minLeft = border[leftIndex].x
		// border is stored clockwise and starts at the top
		while (rightIndex <= leftIndex){
			if (border[rightIndex].y > border[leftIndex].y){
				while (border[rightIndex].y > border[leftIndex].y){
					minLeft = Math.min(minLeft, border[leftIndex].x)
					leftIndex -= 1;
				}
				// adds new value to jumps
				jumps[border[leftIndex+1].y] = {};
				jumps[border[leftIndex+1].y][minLeft] = maxRight - minLeft;
				// reset minmax
				var maxRight = border[rightIndex].x;
				var minLeft = border[leftIndex].x;
			} else{
				maxRight = Math.max(maxRight, border[rightIndex].x)
				rightIndex += 1;
			}
		}
		// we skipped the last one so we add it now.
		jumps[border[leftIndex].y] = {};
		jumps[border[leftIndex].y][minLeft] = maxRight - minLeft;
		return jumps
	}

	var squares = [];
	var jumps = {};
	for (var j = 0; j < matrix.length; j++) {
    for (var i = 0; i < matrix[0].length; i++) {
        if (matrix[j][i] == 1) {
							if (typeof jumps[j] === 'undefined' || typeof jumps[j][i] === 'undefined'){
	            var border = findBorderOrdered(matrix, {x: i, y: j});
								// console.log('border', border)
								var corners = getCorners(border);
								// This should be changed in the future to where jumps are added even if
								// corners.length is not 4 but first findBorderOrdered should support
								// figures with outwards angles
								// console.log('corners', corners)
								if (corners.length == 4){
									squares.push(corners)

								}
								// adds new jumps
								var newjumps = getBorderJumps(border)
								// console.log('newjumps', newjumps)
								for (ii in newjumps){
									jumps[ii] = {...jumps[ii], ...newjumps[ii]}
								}
							}
						// jump
						i += jumps[j][i]
        }
    }
}
	return squares
}

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
	screenReading: screenReading,
	getSquares: getSquares,
	createMatrix: createMatrix
};
