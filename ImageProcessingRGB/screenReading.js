//
// Accept a buffer and given dimensions, turn the buffer into a matrix
// and return eventual corners on the figure.
//
// (C) 2019 PnO Team 1
//

const assert = require('assert')  // asserting pre-conditions


const screenReading = function(buff1, buff2, buff3, dimensions) {
	for(let k = 0; k < buff1.length; k++) {
		v1 = rgb(buff1[k])
		v2 = rgb(buff2[k])
		
		result = (Math.abs(v1 - v2) * v1 * v2 * (3 * v1 + v2) / 2) % 8 // Possible values: 1 to 7 without 4 
		// console.log(v1, " + ", v2, " = ", result)
		
		buff3[k] = 255 / (7) * result
    }
}

const rgb = function(rgbCol) {
	precision = 255/3 + 5
	if (rgbCol > precision * 2) return 3
	else if (rgbCol > precision) return 2
	else if (rgbCol > 0) return 1
	else return 0
}

module.exports = {
	screenReading: screenReading
}