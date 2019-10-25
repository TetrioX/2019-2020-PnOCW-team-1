//
// Accept a buffer and given dimensions, turn the buffer into a matrix
// and return eventual corners on the figure.
//
// (C) 2019 PnO Team 1
//

const assert = require('assert')  // asserting pre-conditions


const screenReading = function(buff1, buff2, buff3, dimensions) {
	for(let k = 0; k < buff1.length; k += 3) {
		rgb1 = new Array(buff1[k], buff1[k+1], buff1[k+2])
		rgb2 = new Array(buff2[k], buff2[k+1], buff2[k+2])
		
		v1 = rgb(rgb1)
		v2 = rgb(rgb2)
		
		result = (Math.abs(v1 - v2) * v1 * v2 * (3 * v1 + v2) / 2) % 8 // Possible values: 1 to 7 without 4 
		// console.log(val1, " + ", val2, " = ", result)
		
		buff3[k/3] = 255 / (7) * result
    }
	console.log(buff3)
}

const rgb = function(rgbCol) {
	if (rgbCol[0] > 0) return 1
	else if (rgbCol[1] > 0) return 2
	else if (rgbCol[2] > 0) return 3
	else return 0
}

module.exports = {
	screenReading: screenReading
}