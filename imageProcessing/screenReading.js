//
// Accept a buffer and given dimensions, turn the buffer into a matrix
// and return eventual corners on the figure.
//
// (C) 2019 PnO Team 1
//

const assert = require('assert')  // asserting pre-conditions
const vctcalc = require('./vectorCalculation.js')

// TODO
const colorValues = {}

const screenReading = function(buffer, dimensions) {

	result = createMatrix(buffer, dimensions)
	// console.log(dimensions)
    // console.log(" ", result)
    // console.log("highWhite", locHighestOfColor(result,1))
    // console.log("lowWhite", locLowestWhite(result))
    // console.log("leftWhite", locLeftWhite(result))
    // console.log("rightWhite", locRightWhite(result))

	// console.log("listOfWhite", listOfWhite(result)) // Deze call naar deze functie is de oorzaak van je probleem

    // console.log("NeighborsAndDiagonal", NeighborsAndDiagonal(result, { x: 3, y: 2 }))
    // console.log("Neighbors", Neighbors(result, { x: 3, y: 2 }))

    // console.log("Neighborscolor", sortColorOut(result, Neighbors(result, { x: 4, y: 4 }), 1))
		// var border = findBorder(result)
    // console.log("border", border)
		// var orderedBorder = findBorderOrdered(result, locHighestOfColor(result,1),1)
    // console.log("orderedBorder", orderedBorder)
		// console.log("squares", getSquares(result))
    console.log(result)
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

function joinMatrixes(matrixes, nbOfColors){
	var result = matrixes[0]
	for (var j = 0; j < result.length; j++){
		for (var i = 0; i < result[0].length; i++){
			for (var m = 1; m < matrixes.length; m++){
				result[j][i] += matrixes[m][j][i] * (nbOfColors + 1) ** m
			}
		}
	}
	return result
}

function colorToValue(colorString) {
    if (colorString == "red") { return 1 }
    else if (colorString == "green") { return 2 }
    else if (colorString == "blue") { return 3 }
    else if (colorString == "#FFFF00") { return 4 }
    else if (colorString == "#FF00FF") { return 5 }
    else if (colorString == "#00FFFF") { return 6 }
    else if (colorString == "black") { return 0 }
    else { throw new Error("The string is not a valid color") }
}

function colorToValueList(list, nbOfColors) {
	var result = 0
  for (var i in list) {
      result += colorToValue(list[i]) * (nbOfColors + 1) ** i
  }
	return result
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

const locHighestOfColor = function (matrix,color) {
    for (let j = 0; j < matrix.length; j++) {
        for (let i = 0; i < matrix[0].length; i++) {
            if (matrix[j][i] == color) {
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

const locationsOfColor = function (matrix,color) {
    temp1 = []; // Deze benaming (eerst result) veranderde de waarde van de result voorbeeld matrix
        for (let j = 0; j < matrix.length; j++) {
            for (let i = 0; i < matrix[0].length; i++) {
                if (matrix[j][i] == color) {
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
            if (j >= 0 && i >= 0 && j < matrix.length && i < matrix[0].length
                && !(i == loc.x && j == loc.y)) { //inside matrix & not loc & white
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

const onlyBorder = function (matrix,color) {
    colorLoc = locationsOfColor(matrix,color)
    var onlyBorder = copyMatrix(matrix)
    for (w of colorLoc) {
        //geen deel vd rand ==> wordt die nul
        if (!(hasNeighbors(matrix, w, color) && hasNeighbors(matrix, w, 0))) {
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


const findBorderOrdered = function (matrix, start,color) {

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
    return neighbor == color
  }
  //possible angles to go to
	const angles = [
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
    return border
}

const findBorderOrderedRgb = function (matrix, start,color) {
	// distance between 2 pixels in the border
	// this will cause small gaps to be skipped
	const distance = 3
  // check if pixel on current + angle*i is the color and in screen
	// with i in range from 1 through distance
	function checkNeighbor(current, ang){
		for (var i = 1; i <= distance; i++){
			var neighbor = matrix[current.y + ang.y]
	        if (typeof neighbor === 'undefined'){
				return false
			}
			neighbor = neighbor[current.x + ang.x]
			if (typeof neighbor === 'undefined'){
				return false
	      }
	    if(neighbor == color){
				return true
			}
	  }
		return false
	}
	 //possible angles to go to
	const angles = [
		{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1},
		{x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1},
		{x: 0, y: -1}, {x: 1, y: -1}
  ]

	var angleIndex = 0
    var current = {
		x: start.x,
		y: start.y
    };
	border = []
    while (true) {
        var foundNewBorderPixel = true;
        // Also check previous angles
        for (var add = -2; add <= 4; add++) { //vanaf -3 al????
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
                //set the new direction to the current angle
                angleIndex = (angleIndex + add + 8) % 8
                //continue searching in the same direction
                foundNewBorderPixel = true;
                break;
            }
        }
				if (foundNewBorderPixel){
					if (start.x == current.x && start.y == current.y){
						break;
					}
				}

    }
		if (border.length == 0){
			border.push(start)
		}
    return border
}

function checkNeighborsColor(corners, matrix, square, screens) {
    // distance to check for color
    const distance = 8;
    // check if there are pixels around the current pixel with certain colors
    // within a certain distance and returns true if all colors are present.
    function checkNeighbors(current, colors) {
        // copy colors
        var colors = colors.slice()
        //possible angles to go to
        const angles = [
            { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
            { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 },
            { x: 0, y: -1 }, { x: 1, y: -1 }
        ]
        // for each angle
        for (ang of angles) {
            // for each distance
            for (var i = 0; i < distance; i++) {
                var neighbor = matrix[current.y + i * ang.y]
                if (typeof neighbor === 'undefined') {
                    break;
                }
                neighbor = neighbor[current.x + i * ang.x]
                if (typeof neighbor === 'undefined') {
                    break;
                }
                //check if the color is equal to one in the list (if so, remove it)
                for (var j in colors) {
                    var color = colorToValueList(colors[j], 6) //review: this 6 == amount of colors used is hard coded
                    if (neighbor == color) {
                        // we remove the found color
                        colors.splice(j, 1)
                        // if there are no colors left to be found return true
                        if (colors.length == 0) {
                            return true
                        }
                        break;
                    }
                }
            }
        }
        return false;
    }
    // Returns the color of the neigbor of the current square as shown in the
    // figure below in an array.
    // If the current square is at the corner of the screen,
    //   return the color of the border in the corner (see case 1)
    // If the current square is at the side of the screen (not corner),
    //   return the color of the side border and a color square next to it (see case 2/3)
    //
    //	  i=3  |       | i=0			NOTE: this is orientated according to screen
    //	_______|_______|_______					and not the picture so i=0 is the upper
    //	       |current|								right corner of the screen.
    //         | square|
    //	_______|_______|_______
    //	       |       |
    //	  i=2  |       | i=1
    function getColorsNeighbor(i) {
        //data of the current square you're working with
        var screen = screens[square.screen]
        var nbOfRows = screen.grid.length
        var nbOfCols = screen.grid[0].length
        // possible angles
        const angles = [
            { x: 1, y: -1 }, { x: 1, y: 1 },
            { x: -1, y: 1 }, { x: -1, y: -1 }
        ]
        // get row and column from i
        var rowI = square.row + angles[i].y
        var colI = square.col + angles[i].x
        // check if are col or row is out of bounds
        var rowInRange = ((0 <= rowI) && (rowI < nbOfRows))
        var colInRange = ((0 <= colI) && (colI < nbOfCols))
        // visual representation of edge cases (literal edge cases)
        //  __________________________
        //  \\\\\\\\\\\side  \\\\\\|          |
        //	\\\\\\\\\\\border\\\\\\|cornBorder|
        //	\\\\\\\\\\\\\\\\\\\\\\\|__________|
        //	          |            |\\\\\\\\\\|
        //	          |            |\\\\\\\\\\|
        //	  2       |     1      |\\\\\\\\\\|
        //	          |            |\\\\\\\\\\|
        //	__________|____________|\\side  \\|
        //	          |            |\\border\\|
        //	          |     3      |\\\\\\\\\\|

        // 1) if both are not in range take corner border color
        if (!rowInRange && !colInRange) {
            return [screen.cornBorder]
        }
        // 2) if only row is not in range return sideBorder and the horizontal side neigbor
        if (!rowInRange) {
            return [
                screen.sideBorder,
                screen.grid[rowI - angles[i].y][colI]
            ]
        }
        // 3) if only col is not in range return sideBorder and the vertical side neigbor
        if (!colInRange) {
            return [
                screen.sideBorder,
                screen.grid[rowI][colI - angles[i].x]
            ]
        }
        return [screen.grid[rowI][colI]];

    }

    // array in which we'll put the corners in orientated sequence
    var cornersOrientated = [];
    // check each angle and see if edge corner exists around the corners provided
    // and use this information to also order the corners
    for (var i = 0; i < 4; i++) {
        var colors = getColorsNeighbor(i)
        for (var c in corners) {
            if (checkNeighbors(corners[c], colors)) {
                cornersOrientated.push(corners[c])
                // remove color so it won't be used twice and skip to next i
                corners.splice(c, 1)
                break;
            }
        }
    }
    return cornersOrientated
}

function allElementsOfNoise(firstElement, matrix, noise) {
	var elementsToCheck = [firstElement]
	while(elementsToCheck.length != 0){
		var element = elementsToCheck.pop()
		var neighbors = sortColorOut(matrix, NeighborsAndDiagonal(matrix, element), matrix[element.y][element.x])
		for (var i of neighbors) {
				if (typeof noise[i.y] === 'undefined') {
						noise[i.y] = {}
						noise[i.y][i.x] = 1
						elementsToCheck.push(i)
				}
				else {
						if (noise[i.y][i.x] != 1) {
								noise[i.y][i.x] = 1
								elementsToCheck.push(i)
						}
				}
		}
	}
}

/** returns the screens of the given matrixes
	*
	* @param {Integer[[[]]]} matrixes list of matrixes that include a color value
	*	for each pixel
	* @param {Object} screens an object with as key a screen square and as value the
	* color value on that location of the screen
	* @param {Object} colorCombs an object with as key a color value and as
	* value a screen square
	* @param {Integer} nbOfColors number of colors used
	*/
function getScreens(matrixes, screens, colorCombs, nbOfColors) {
	// join the matrixes in 1 matrix
	var matrix = joinMatrixes(matrixes, nbOfColors)
	// make a matrix with the same dimensions as the joined matrix to store noise
	//var noiseMatrix = []
	//for (row of matrix){
	//	noiceMatrix.push(new Array(row.length))
	//}
	// a set of all colors that have been checked
	// 0 is the value for noise and shouldn't be checked

    var foundColValues = new Set([0])
    var noise = {}
	// an array of all valide screen squares
	var foundScreenSquares = []
	// iterate through the matrix with j the y value and i the x value
	for (var j = 0; j < matrix.length; j++){
		for (var i = 0; i < matrix.length; i++){
			// check if we have found a new color
            if (!foundColValues.has(matrix[j][i])) {
                // check if the found color is in colorComb
                // if not skip it and ad to colors to be ignored
                if (!colorCombs.hasOwnProperty(matrix[j][i])) {
                    foundColValues.add(matrix[j][i])
                    break;
                }
                if (!(typeof noise[j] === 'undefined' || typeof noise[j][i] === 'undefinded')){
                    break;
                }

                var border = findBorderOrderedRgb(matrix, { x: i, y: j }, matrix[j][i])
                var corners = getCorners(border)

								// found square is too small
								if (corners.length != 4){
				            //foundColValues.add(matrix[j][i])
				            allElementsOfNoise(border[0],matrix,noise)
									break;
								}
								var cornersOrientated = checkNeighborsColor(corners, matrix, colorCombs[matrix[j][i]], screens)
								// check if we've found all corners
				                if (cornersOrientated.length == 4) {
				                    foundScreenSquares.push({
				                        corners: cornersOrientated,
				                        square: colorCombs[matrix[j][i]]
				                    })
				                }
				                else {
				                    allElementsOfNoise(border[0], matrix, noise)
				                    break;
				                }
								foundColValues.add(matrix[j][i])
							}
				}
		}
	return foundScreenSquares
}

// returns a list with the best possible screens it can recognize from the calculated squares
// This is not the best solution and could be in proofd in the future
function getScreenFromSquares(squares, screens){
	let screenCorners = {}
	// calculate all the screens
	for (let sq of squares){
		if (typeof screenCorners[sq.square.screen] === 'undefined'){
			screenCorners[sq.square.screen] = []
		}
		screenCorners[sq.square.screen].push(getScreenFromSquare(sq, screens))
	}
	let results = {}
	// get the average of the screens
	// NOTE: this could be improved by using the squares that are close to the corner
	Object.keys(screenCorners).forEach(async function(screens, index) {
		for (let i = 1; i < screenCorners[screens].length; i++){
			//for each corner
			for (let j = 0; j < 4; j++){

				screenCorners[screens][0][j].x += screenCorners[screens][i][j].x
				screenCorners[screens][0][j].y += screenCorners[screens][i][j].y
			}
		}
		results[screens] = []
		for (let j = 0; j < 4; j++){
			results[screens].push({
				x: Math.ceil(screenCorners[screens][0][j].x/screenCorners[screens].length),
				y: Math.ceil(screenCorners[screens][0][j].y/screenCorners[screens].length)
			})
		}
	})
	return results
}

// returns the corners of the screen from a given square located in that screen
function getScreenFromSquare(locSquare, screens){
	// get the vectors that define the square
	//
	//corner[3]|VTop-> |corner[0]
	//	_______|_______|_______
	//	 Vleft |current|	VRight
	//     |   | square|    |
	//	___V___|_______|____V__
	//corner[2]|Vbot-> |corner[1]
	//	       |       |
	var corners = locSquare.corners
	var square = locSquare.square
	var screen = screens[square.screen]
	var nbOfRows = screen.grid.length
	var nbOfCols = screen.grid[0].length
	var vectorTop = {
		x: corners[0].x - corners[3].x + 1,
		y: corners[0].y - corners[3].y
	}
	var vectorBot = {
		x: corners[1].x - corners[2].x + 1,
		y: corners[1].y - corners[2].y
	}
	var vectorRight = {
		x: corners[1].x - corners[0].x,
		y: corners[1].y - corners[0].y + 1
	}
	var vectorLeft = {
		x: corners[2].x - corners[3].x,
		y: corners[2].y - corners[3].y + 1
	}
	// we'll calculate all corners off te screen relative to this one.
	var corn = corners[3]
	// calculate how many times we have to add the vector to find the size of the screen
	var spaceTop = square.row
	var spaceBot = nbOfRows - square.row
	var spaceLeft = square.col
	var spaceRight = nbOfCols - square.col
	return [
		{
			x: corn.x + spaceRight * vectorTop.x - spaceTop * vectorRight.x - 1,
			y: corn.y + spaceRight * vectorTop.y - spaceTop * vectorRight.y
		}, // top right corner
		{
			x: corn.x + spaceRight * vectorBot.x + spaceBot * vectorRight.x - 1,
			y: corn.y + spaceRight * vectorBot.y + spaceBot * vectorRight.y - 1
		}, // bottem right corner
		{
			x: corn.x - spaceLeft * vectorBot.x + spaceBot * vectorLeft.x ,
			y: corn.y - spaceLeft * vectorBot.y + spaceBot * vectorLeft.y - 1
		}, //bottem left corner
		{
			x: corn.x - spaceLeft * vectorTop.x - spaceTop * vectorLeft.x ,
			y: corn.y - spaceLeft * vectorTop.y - spaceTop * vectorLeft.y
		}, // top left corner
	]
}

// Returns the 4 corners of the quadrangles with a given color in the matrix
const getSquares = function (matrix,color) {
    squares = []
    borderMatrix = onlyBorder(matrix, color) //nog omzetten dat de kleur kan gekozen worden
    while (locHighestOfColor(borderMatrix,color) != null) { //hmmmn klopt dit wel?
				var border = findBorderOrdered(borderMatrix, locHighestOfColor(borderMatrix,color),color)
				var corners = getCorners(border)
				if (corners.length == 4){
						squares.push(corners)
				}
    }
    return squares
}

// Return the 4 smallest corners of a given border.
function getCorners(rand){
    //If the border is to small we return an empty list
	if (rand.length < 24){
	return []
	}
    //Value to determen the distance that we look around corners
    // to make softer borders recognisable
	const distance = Math.max(5, Math.ceil(rand.length/12))

	function getRand(i){
	if (i<0){
	    i += rand.length;
	}
	return rand[i%rand.length];
	}
    // Distance between a and b
	function getSqrDist(a, b){
	return (a.x - b.x)**2 + (a.y - b.y)**2;
	}
    // Returns the corner with the lowest angle
	function getCornerWithMinimumAngle(angles){
	    // Returns index of minimum of angles
	    var indexOfMinAngle = angles.reduce((maxI, angle, i, angles) => angle > angles[maxI] ? i : maxI, 0);
	    // Set values next to minimum angle to infinity so that they don't show up next time.
	    for (var v = 1 - distance; v <= distance - 1; v++){
	        angles[(indexOfMinAngle + v + angles.length)%angles.length] = -Infinity;
	    }
	    return getRand(indexOfMinAngle);
	}

	var angles = [];
    // Walk through each pixel in the border
	for (var i = 0; i < rand.length; i++){
    var avgAngle = 0;
    // Apply the cosinus rule four times using the distance
	for (var j = distance - 3; j <= distance; j++) {
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
    hi = locHighestOfColor(matrix,1)
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
	createMatrix: createMatrix,
	joinMatrixes: joinMatrixes,
	colorToValue: colorToValue,
	colorToValueList: colorToValueList,
	getScreens: getScreens,
	getScreenFromSquare: getScreenFromSquare,
	getScreenFromSquares: getScreenFromSquares
};
