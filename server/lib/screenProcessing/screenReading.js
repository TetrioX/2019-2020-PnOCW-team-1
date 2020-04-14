//
// Accept a buffer and given dimensions, turn the buffer into a matrix
// and return eventual corners on the figure.
//
// (C) 2019 PnO Team 1
//

const assert = require('assert')  // asserting pre-conditions
const vctcalc = require('./vectorCalculation.js')
/*
const defaultTresholds = {
	1: [351.3, 52.5],
	2: [52.5, 88.0],
	3: [88.0, 150.7],
	4: [150.7, 204.0],
	5: [204.0, 271.9],
	6: [271.9, 351.3]
}
*/
const defaultTresholds = {
	1: [317, 45],
	2: [45, 100],
	3: [100, 160],
	4: [160, 200],
	5: [200, 240],
	6: [240, 317]
}

const sRange = [20, 101]
const lRange = [20, 80]


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
	// let border = findBorder(result)
  // console.log("border", border)
	// let orderedBorder = findBorderOrdered(result, locHighestOfColor(result,1),1)
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

function joinMatrixes(matrixes, tresholds, nbOfColors, screenTresh=[]){
	let result = []

	for (let j = 0; j < matrixes[0].length; j++){
		result.push([])
		for (let i = 0; i < matrixes[0][0].length; i++){
			result[j].push(0)
			let currTresh = tresholds
			for(elem of screenTresh) {
				if (inQuadrilateral({x:i, y:j}, elem.corners)) {
					currTresh = elem.tresh
					break;
				}
			}
			for (let m = 0; m < matrixes.length; m++){
				result[j][i] += getColorValueFromHsl(matrixes[m][j][i], currTresh) * (nbOfColors + 1) ** m
			}
		}
	}
	return result
}

function colorToValue(colorString) {
  if (colorString == "red") { return 1 }
	else if (colorString == "#FFFF00") { return 2 }
  else if (colorString == "#00FF00") { return 3 }
	else if (colorString == "#00FFFF") { return 4 }
  else if (colorString == "blue") { return 5 }
  else if (colorString == "#FF00FF") { return 6 }
  else if (colorString == "black") { return 0 }
  else { throw new Error("The string is not a valid color") }
}

function colorToValueList(list, nbOfColors) {
	let result = 0
  for (let i in list) {
    result += colorToValue(list[i]) * (nbOfColors + 1) ** i
  }
	return result
}

/**
 * returns true if the value is in the given range and false otherwise.
 * range is defined as between the values if the first edge one is smaller.
 * otherwise the range is defined outside the 2 values.
 */
function inRange(value, range) {
	if (range[0] <= range[1]){
		if (range[0] <= value && value < range[1]){
			return true;
		}
	} else {
		if (range[0] <= value || value < range[1]){
			return true;
		}
	}
	return false;
}

/**
 * returns the average angle between 2 given angles.
 * the first angle is the smaller angle and the second the bigger.
 * @param{flaot} ang1 the first angle
 * @param{flaot} ang2 the second angle
 */
function getAvrAngle(ang1, ang2) {
	if (ang1 <= ang2) {
		return (ang1 + ang2)/2
	} else {
		return ((ang1 + ang2 + 360)/2)%360
	}
}

/**
 * calculates offsets based on the already found squares
 */
function calculateTreshOffsets(squares, screens, matrixes, tresholds){
	let screenCorners = getScreenFromSquares(squares, screens)
	let offsets = {}
	for (let square of squares) {
		if (!(square.square.screen in offsets)){
			offsets[square.square.screen] = {
				1: [0],
				2: [0],
				3: [0],
				4: [0],
				5: [0],
				6: [0]
			}
		}
		for (let m = 0; m < matrixes.length; m++){
			let firstElem = square.corners.corners[0]
			let color = getColorValueFromHsl(matrixes[m][firstElem.y][firstElem.x], tresholds)
			let tresh = tresholds[color]
			let refDegree = getAvrAngle(tresh[0], tresh[1])
			let avr = 0
			for (pos of square.corners.corners) {
				avr += ((matrixes[m][pos.y][pos.x][0] - refDegree + 180)%360 - 180)**2
			}
			avr = Math.sqrt(avr)/square.corners.corners.length
			offsets[square.square.screen][color].push(avr)
		}
	}
	let screenTresh = []
	let totalAverages = []
	for (let screen of Object.keys(offsets)) {
		let averages = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0
		}
		totalAverages.push(averages)
		for (let color of Object.keys(offsets[screen])) { // calc average for each color of the screen
			for (val of offsets[screen][color]) {
				averages[color] += val
			}
			 averages[color] = averages[color]/offsets[screen][color].length
		}
		// updating  square treshods
		newTresholds = JSON.parse(JSON.stringify(tresholds)) // copy
		let colors = [1, 2, 3, 4, 5, 6] // color order
    for (let i in colors){
        next = (parseInt(i) + 1)%colors.length
        diff = (averages[colors[i]] - averages[colors[next]])
        newBound = (newTresholds[colors[i]][1] + diff + 360)%360
        newTresholds[colors[i]][1] = newBound
        newTresholds[colors[next]][0] = newBound
			}
		screenTresh.push({
			tresh: newTresholds,
			corners: screenCorners[screen]
		})
	}
	// calculating total averages
	let averages = {
		1: [0,0],
		2: [0,0],
		3: [0,0],
		4: [0,0],
		5: [0,0],
		6: [0,0]
	}
	for (avers of totalAverages) {
		for (color in avers){
			averages[color][0] += avers[color]
			averages[color][1] += 1
		}
	}
	let colors = [1, 2, 3, 4, 5, 6] // color order
	for (let i in colors){
			next = (parseInt(i) + 1)%colors.length
			avercur = averages[colors[i]][0]/averages[colors[i]][1]
			averNext = averages[colors[next]][0]/averages[colors[next]][1]
			diff = (avercur - averNext)
			newBound = (tresholds[colors[i]][1] + diff + 360)%360
			tresholds[colors[i]][1] = newBound
			tresholds[colors[next]][0] = newBound
		}
	return screenTresh
}

function inQuadrilateral(pos, corners) {
	ang = 0
	for (let i=0; i < 4; i++) {
		ang += Math.acos(getCosinus(pos, corners[i], corners[(i + 1)%4]))
	}
	// if sum of angles is 360 degree then point is in circle
	return (ang >= 2 * Math.PI - 0.02) // 0.02 is for float error
}

function getColorValueFromHsl(hsl, tresholds) {
	if (!inRange(hsl[1], sRange) || !inRange(hsl[2], lRange)){
		return 0
	}
	for (i in tresholds) {
		if (inRange(hsl[0], tresholds[i])) {
			return parseInt(i);
		}
	}
	return 0;
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
  for (let k of locations) {
    if (matrix[k.y][k.x] == colorNumber) {
      temp4.push({ x: k.x, y: k.y })
    }
  }
  return temp4
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const copyMatrix = function (originalMatrix) {
  let newArray = [];
  for (let i = 0; i < originalMatrix.length; i++) {
    newArray[i] = originalMatrix[i].slice();
  }
  return newArray
}

const onlyBorder = function (matrix,color) {
  colorLoc = locationsOfColor(matrix,color)
  let onlyBorder = copyMatrix(matrix)
  for (let w of colorLoc) {
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
		let neighbor = borderMatrix[current.y + ang.y]
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

	let angleIndex = 0
  let current = {
		x: start.x,
		y: start.y
  };
	border = []
	borderSet = new Set()
  while (true) {
    let foundNewBorderPixel = false;
    // Also check previous angles
    for (let add = -2; add < 4; add++) { //vanaf -3 al????
      //45graden kloksgewijs: angleIndex (huidige index) + add
      let angle = angles[(angleIndex + add + 8) % 8]
      // check in the direction of the angle if your neighbour is white
      if (checkNeighbor(current, angle)) {
        current.x += angle.x
        current.y += angle.y
        //add to the list
        border.push({
            x: current.x,
            y: current.y
        });
				borderSet.add(x + matrix.length * y)
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
				let angle = angles[(angleIndex + 4) % 8]
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
	// distance between pixels in the border
	// this will cause small gaps to be skipped
	const distance = 1
	// check if pixel on current + angle*i is the color and in screen
	// with i in range from 1 through distance
	function checkNeighbor(current, ang){
		for (let i = 1; i <= distance; i++){
			let neighbor = matrix[current.y + i * ang.y]
	    if (typeof neighbor === 'undefined'){
				return false
			}
			neighbor = neighbor[current.x + i * ang.x]
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

	let angleIndex = 0
	let current = {
		x: start.x,
		y: start.y
	 };
	border = []
	borderSet = new Set()
	var atStart = false
  while (true) {
    // Also check previous angles
    for (let add = -2; add <= 4; add++) { //vanaf -3 al????
      //45graden kloksgewijs: angleIndex (huidige index) + add
      let angle = angles[(angleIndex + add + 8) % 8]
      // check in the direction of the angle if your neighbour is white
      if (checkNeighbor(current, angle)) {
        current.x += angle.x
        current.y += angle.y
				if (atStart){
					if (borderSet.has(current.x + matrix[0].length * current.y)){
						return border
					} else{
						atStart = false
					}
				}
        //add to the list
        border.push({
            x: current.x,
            y: current.y
        });
				borderSet.add(current.x + matrix[0].length * current.y)
        //set the new direction to the current angle
        angleIndex = (angleIndex + add + 8) % 8
        break;
      }
    }
		if (start.x == current.x && start.y == current.y){
			if (atStart) break
			atStart = true
		}
  }
	if (border.length == 0){
		border.push(start)
	}
  return border
}

function checkNeighborsColor(corners, matrix, square, screens, border, nbOfColors) {
  // distance to check for color
  const distance = Math.max(4, Math.ceil(border.length) / 12);
  // check if there are pixels around the current pixel with certain colors
  // within a certain distance and returns true if all colors are present.
	// returns from the corners the corner that is the closest to these colors and
	// removes it from the list.
	// returns null if one of the colors is not found.
  function checkNeighbors(corners, colors, borderSizes) {
    // get color values
		let colorValues = []
		for (let col of colors){
			colorValues.push(colorToValueList(col, nbOfColors))
		}
		// make a copy for each corner
		let neigborCols = []
		for (let i = 0; i < corners.length; i++){
			neigborCols.push(colorValues.slice())
		}
    //possible angles to go to
    // for each angle and distance
		let d = 1
		let i = 0
		let x = 0
		let y = 0
		while(d <= distance){
			// sets x and y to a value around the current square on a certain distance
			// this will go to each neigbor from smallest distance to furthest distance
			//	  i=6  |  i=7  | i=0
			//	_______|_______|_______
			//	       |current|
			//    i=5  | square| i=1
			//	_______|_______|_______
			//	       |       |
			//	  i=4  |  i=3  | i=2
			if (i < 2*d){
				x = d
				y = i - d
			} else if (i < 4*d){
				x = d - (i - 2*d)
				y = d
			} else if (i < 6*d){
				x = -d
				y = d - (i - 4*d)
			} else if (i < 8*d){
				x = (i - 6*d) - d
				y = -d
			} else{
				i = 0
				d++
				continue;
			}
			for (c in corners){
				let current = corners[c]
				let neighbor = matrix[current.y + y]
				if (typeof neighbor !== 'undefined') {
					neighbor = neighbor[current.x + x]
					if (typeof neighbor !== 'undefined') {
						//check if the color is equal to one in the list (if so, remove it)
						for (let j in neigborCols[c]) {
							let color = neigborCols[c][j]
							if (neighbor == color) {
								// we remove the found color
								neigborCols[c][j] = null
								borderSizes[j] = d
								// if there are no colors left to be found return true
								if (neigborCols[c].every((el) => {return el === null})) {
									corners.splice(c, 1)
									return current
								}
								break;
							}
						}
					}
				}
			}
			i++
			}
			return null;
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
      let screen = screens[square.screen]
      let nbOfRows = screen.grid.length
      let nbOfCols = screen.grid[0].length
      // possible angles
      const angles = [
        { x: 1, y: -1 }, { x: 1, y: 1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ]
      // get row and column from i
      let rowI = square.row + angles[i].y
      let colI = square.col + angles[i].x
      // check if are col or row is out of bounds
      let rowInRange = ((0 <= rowI) && (rowI < nbOfRows))
      let colInRange = ((0 <= colI) && (colI < nbOfCols))
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

      // 1) if both are not in range take corner border and side border color
      if (!rowInRange && !colInRange) {
        return [
					screen.sideBorder,
					screen.sideBorder,
					screen.cornBorder
				]
      }
      // 2) if only row is not in range return sideBorder and the horizontal side neigbor
      if (!rowInRange) {
        return [
          screen.sideBorder,
          screen.grid[rowI - angles[i].y][colI],
					screen.sideBorder
        ]
      }
      // 3) if only col is not in range return sideBorder and the vertical side neigbor
      if (!colInRange) {
        return [
					screen.grid[rowI][colI - angles[i].x],
          screen.sideBorder,
					screen.sideBorder
        ]
      }
    return [
			screen.grid[rowI][colI - angles[i].x],
			screen.grid[rowI - angles[i].y][colI],
			screen.grid[rowI][colI]
		];
  }

  // array in which we'll put the corners in orientated sequence
	// and the border size untill the next square
  let cornersOrientated = {
		corners: [],
		border: []
	};
  // check each angle and see if edge corner exists around the corners provided
  // and use this information to also order the corners
  for (let i = 0; i < 4; i++) {
    let colors = getColorsNeighbor(i)
		cornersOrientated.border.push(new Array(colors.length))
		cornersOrientated.corners.push(checkNeighbors(corners, colors, cornersOrientated.border[i]))
  }
  return cornersOrientated
}

function allElementsOfNoise(firstElement, matrix, noise) {
	let elementsToCheck = [firstElement]
	while(elementsToCheck.length != 0){
		let element = elementsToCheck.pop()
		let neighbors = sortColorOut(matrix, NeighborsAndDiagonal(matrix, element), matrix[element.y][element.x])
		for (let i of neighbors) {
			if (!noise.has(i.x + matrix[0].length * i.y)) {
				noise.add(i.x + matrix[0].length * i.y)
				elementsToCheck.push(i)
			}
		}
	}
}

/** returns the screens of the given matrixes
	*
	* @param {Float[[[]]]} matrixes list of matrixes that include a hue value
	*	for each pixel
	* @param {Object} screens an object with as key a screen square and as value the
	* color value on that location of the screen
	* @param {Object} colorCombs an object with as key a color value and as
	* value a screen square
	@param {Float[[]]} tresholds the hue tresholds
	*/
function getScreens(matrixes, screens, colorCombs, iters=1, tresholds=null, foundScreenSquares=null, screenTresh=[]) {
	// make a matrix with the same dimensions as the joined matrix to store noise
	//let noiseMatrix = []
	//for (row of matrix){
	//	noiceMatrix.push(new Array(row.length))
	//}
	// a set of all colors that have been checked
	// 0 is the value for noise and shouldn't be checked
	if (tresholds === null) {
		tresholds = JSON.parse(JSON.stringify(defaultTresholds)) // copy
	}
	if (foundScreenSquares === null) {
		foundScreenSquares = []
	}
	let nbOfColors = Object.keys(tresholds).length
	let matrix = joinMatrixes(matrixes, tresholds, nbOfColors, screenTresh)
  let foundColValues = new Set([0])
  let noise = new Set()
	// iterate through the matrix with j the y value and i the x value
	for (let j = 0; j < matrix.length; j++){
		for (let i = 0; i < matrix[0].length; i++){
			// check if we have found a new color
      if (!foundColValues.has(matrix[j][i])) {
	      // check if the found color is in colorComb
	      // if not skip it and ad to colors to be ignored
	      if (!colorCombs.hasOwnProperty(matrix[j][i])) {
	        foundColValues.add(matrix[j][i])
	        continue;
	      }
	      if (noise.has(i + matrix[0].length * j)){
	        continue;
	      }

	      let border = findBorderOrderedRgb(matrix, { x: i, y: j }, matrix[j][i])
	      let corners = getCorners(border)

				// found square is too small or is round
				if (corners.length < 4){
	        //foundColValues.add(matrix[j][i])
	        allElementsOfNoise(border[0],matrix,noise)
					continue;
				}
				let cornersOrientated = checkNeighborsColor(corners, matrix, colorCombs[matrix[j][i]], screens, border, nbOfColors)
				// check if we've found all corners
				// so no nulls
	      if (!cornersOrientated.corners.some((value) => {return value === null})) {
	        foundScreenSquares.push({
	          corners: cornersOrientated,
	          square: colorCombs[matrix[j][i]],
						border: border
	        })
					foundColValues.add(matrix[j][i])
	      }
	      else {
		      allElementsOfNoise(border[0], matrix, noise)
		      continue;
	      }
			}
		}
	}
	if (iters <= 0){
		return foundScreenSquares
	} else {
		let screenTresh = calculateTreshOffsets(foundScreenSquares, screens, matrixes, tresholds)
		return getScreens(matrixes, screens, colorCombs, iters - 1, tresholds, foundScreenSquares, screenTresh)
	}

}

// returns a list with the best possible screens it can recognize from the calculated squares
// This is not the best solution and could be in proofd in the future
function getScreenFromSquares(squares, screens) {

    function array_Sum(t) {
        return t.reduce(function (a, b) { return a + b; }, 0);
    }

    function distance_between(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
    }

    function avg_distance_between(xCord, yCord) {
        var len = xCord.length
        var dist = []
        for (let i = 0; i < len; i++) {
            let avg = 0;
            for (let j = 0; j < len; j++) {
                if (i != j) {
                    avg += distance_between(xCord[i],yCord[i],xCord[j],yCord[j])
                }
            }
            dist[i] = avg/(len-1)
        }
        return dist
    }

    function outlierRemove(xCord, yCord) {
        var dist = avg_distance_between(xCord, yCord)
        //small check if function is working
        if (xCord.length != yCord.length || xCord.length != dist.length) {
            throw new Error("List of coordinates are not equal")
        }
        var n = xCord.length
        //avg
        var avg = array_Sum(dist) / n
        //variance
        var variance = 0
        for (let i = 0; i < n; i++) {
            variance += (dist[i] - avg) * (dist[i] - avg)
        }
        variance = Math.sqrt(variance / n)
        //nu uitfilteren met variantie
        console.log
        var pointsX = []
        var pointsY = []
        for (let i = 0; i < n; i++) {
            if (dist[i] <= avg) {
                pointsX.push(xCord[i])
                pointsY.push(yCord[i])
            }
        }
        return {x:pointsX, y:pointsY}
    }

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
    Object.keys(screenCorners).forEach(async function (screens, index) {
        results[screens] = []
        //for each corner
        for (let j = 0; j < 4; j++) {
            let listCoX = []
            let listCoY = []
            //for each square found
            for (let i = 0; i < screenCorners[screens].length; i++) {
                listCoX.push(screenCorners[screens][i][j].x)
                listCoY.push(screenCorners[screens][i][j].y)
            }
            //Only remove outliers if 2 or more points
            if (screenCorners[screens].length > 2) {
                let outliers = outlierRemove(listCoX, listCoY)
                listCoX = outliers.x
                listCoY = outliers.y
            }
            //calculate avg
            results[screens].push({
                x: Math.ceil(array_Sum(listCoX) / listCoX.length),
                y: Math.ceil(array_Sum(listCoY) / listCoY.length)
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
	let corners = locSquare.corners.corners
	let borders = locSquare.corners.border
	let square = locSquare.square
	let screen = screens[square.screen]
	let nbOfRows = screen.grid.length
	let nbOfCols = screen.grid[0].length
	// borders is an array with length 4 and each value is an array with
	// the first value the border in the x derection and as second border the
	// value in the y direction.
	let vectorTop = {
		x: corners[0].x - corners[3].x + borders[0][0]/2 + borders[3][0]/2,
		y: corners[0].y - corners[3].y + borders[0][1]/2 - borders[3][1]/2
	}
	let vectorBot = {
		x: corners[1].x - corners[2].x + borders[1][0]/2 + borders[2][0]/2,
		y: corners[1].y - corners[2].y + borders[2][1]/2 - borders[1][1]/2
	}
	let vectorRight = {
		x: corners[1].x - corners[0].x + borders[1][0]/2 - borders[0][0]/2,
		y: corners[1].y - corners[0].y + borders[1][1]/2 + borders[0][1]/2
	}
	let vectorLeft = {
		x: corners[2].x - corners[3].x + borders[3][0]/2 - borders[2][0]/2,
		y: corners[2].y - corners[3].y + borders[2][1]/2 + borders[3][1]/2
	}
	// we'll calculate all corners off te screen relative to this one.
	let corn = corners[3]
	// calculate how many times we have to add the vector to find the size of the screen
	// 0.5 is used to take into account the border around the screens which is
	// 50% the size of the blocks
	let spaceTop = square.row + 0.5
	let spaceBot = nbOfRows - square.row + 0.5
	let spaceLeft = square.col + 0.5
	let spaceRight = nbOfCols - square.col + 0.5
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
		let border = findBorderOrdered(borderMatrix, locHighestOfColor(borderMatrix,color),color)
		let corners = getCorners(border)
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
	const distance = 6
	// number of angles to check
	const nbOfAngles = 4

	function getRand(i){
	if (i<0){
    i += rand.length;
	}
	return rand[i%rand.length];
	}
    // Returns the corner with the lowest angle
	function getCornersWithMinimumAngle(angles){
		let result = []
		let currentAngle = +Infinity
		let c = 0;
		do {
			// Returns index of minimum of angles
	    let indexOfMinAngle = angles.reduce((maxI, angle, i, angles) => angle > angles[maxI] ? i : maxI, 0);
			// remember the angles to determine when the angle is small enough to stop.
			currentAngle = angles[indexOfMinAngle]
	    // Set values next to minimum angle to infinity so that they don't show up next time.
	    for (let v = -distance; v <= distance; v++){
	      angles[(indexOfMinAngle + v + angles.length)%angles.length] = -Infinity;
	    }
	    result.push(rand[indexOfMinAngle])
			c++
		}
		// stop when you have 4 corners and the last corner was significantly smaller than the previous one.
		while (c < 4 || (currentAngle > -nbOfAngles/1.5 && result.length < 15))
		return result
	}

	let angles = [];
    // Walk through each pixel in the border
	for (let i = 0; i < rand.length; i++){
	  let avgAngle = 0;
    // Apply the cosinus rule four times using the distance
	for (let j = distance - nbOfAngles + 1; j <= distance; j++) {
    // We don't need to do Math.acos() since if a < b then acos(a) > acos(b)
    // and we'll be comparing them relative to each other
    avgAngle += getCosinus(getRand(i), getRand(i + j), getRand(i - j));
	}
	// We don't have to devide the average since we'll only be comparing them
	// to each other

	angles.push(avgAngle);
	}

	let corners = []

	return getCornersWithMinimumAngle(angles)
}


// Distance between a and b
function getSqrDist(a, b){
return (a.x - b.x)**2 + (a.y - b.y)**2;
}

function getCosinus(point, from, to) {
	// Law of Cosinus a**2 = b**2 + c**2 -2*b*c*cos(angle)
	let aSqrt = getSqrDist(from, to);
	let bSqrt = getSqrDist(point, to);
	let cSqrt = getSqrDist(point, from);
	let b = Math.sqrt(bSqrt);
	let c = Math.sqrt(cSqrt);
	return (bSqrt + cSqrt - aSqrt)/(2 * b * c);
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
				let jumps = {}
				jumps[border[0].y][border[0].x] = 0;
				return jumps
			} else{
				return {}
			}
		}
		// jumps[y][x] is an integer with the size of the jump
		// and y and x the start of the jump
		let jumps = {};
		let rightIndex = 0;
		let leftIndex = border.length - 1;
		let maxRight = border[rightIndex].x;
		let minLeft = border[leftIndex].x
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
				let maxRight = border[rightIndex].x;
				let minLeft = border[leftIndex].x;
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

	let squares = [];
	let jumps = {};
	for (let j = 0; j < matrix.length; j++) {
    for (let i = 0; i < matrix[0].length; i++) {
        if (matrix[j][i] == 1) {
							if (typeof jumps[j] === 'undefined' || typeof jumps[j][i] === 'undefined'){
	            let border = findBorderOrdered(matrix, {x: i, y: j});
								// console.log('border', border)
								let corners = getCorners(border);
								// This should be changed in the future to where jumps are added even if
								// corners.length is not 4 but first findBorderOrdered should support
								// figures with outwards angles
								// console.log('corners', corners)
								if (corners.length == 4){
									squares.push(corners)

								}
								// adds new jumps
								let newjumps = getBorderJumps(border)
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
