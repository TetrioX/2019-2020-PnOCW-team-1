
const assert = require('assert')  // asserting pre-conditions
const vctcalc = require('./vectorCalculation.js')

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
		var orderedBorder = findBorderOrdered(result, locHighestWhite(result))
    console.log("orderedBorder", orderedBorder)
		console.log("squares", getSquares(result))
		
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

	const findBorderOrdered = function (matrix, start){

		function checkNeighbor(current, ang, value){
			var neighbor = matrix[current.y + value*(ang.y)]
			if (typeof neighbor === 'undefined'){
				return false
			}
			neighbor = neighbor[current.x + value*(ang.x)]
			if (typeof neighbor === 'undefined'){
				return false
			}
			return neighbor == 1
		}

		var angles = [
			{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1},
			{x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1},
			{x: 0, y: -1}, {x: 1, y: -1}
		]

		function checkAngle(current, angle, distance, border){
			for (var currDistance = 1; currDistance <= distance; currDistance++){
				if (checkNeighbor(current, angle, currDistance)){
					return true;
				}
			}
			return false;
		}

		var angleIndex = 0
    current = {
			x: start.x,
			y: start.y
		};
		border = []
		while(true){
			var foundNewBorder = false;
			// Also check previous angle
			for (var prev = -1; prev < 1; prev++){
				var angle = angles[(angleIndex+prev+8)%8]
				if (checkAngle(current, angle, 3)){
					current.x += angle.x
					current.y += angle.y
					border.push({
						x: current.x,
						y: current.y
					})
					foundNewBorder = true;
					break;
				}
			}
			if (!foundNewBorder){
				angleIndex += 1;
				if (angleIndex == 9){
					break;
				}
			} else if (current.x == start.x && current.y == start.y){
				break;
			}
		}

		return border
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
	    for (j = 2; j <= 5; j++) {
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
									console.log('border', border)
									var corners = getCorners(border);
									// This should be changed in the future to where jumps are added even if
									// corners.length is not 4 but first findBorderOrdered should support
									// figures with outwards angles
									console.log('corners', corners)
									if (corners.length != 4){
										// temporarily create 0 value for next jump
										if (typeof jumps[j] === 'undefined'){
											jumps[j] = {}
										}
										jumps[j][i] = 0

									} else{
										squares.push(corners)
										// adds new jumps
										var newjumps = getBorderJumps(border)
										console.log('newjumps', newjumps)
										for (ii in newjumps){
											jumps[ii] = {...jumps[ii], ...newjumps[ii]}
										}
									}
								}
							// jump
							i += jumps[j][i]
            }
        }
    }
		return squares
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
