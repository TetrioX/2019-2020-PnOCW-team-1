

const assert = require('assert')  // asserting pre-conditions
const clrdis = require('./colorDistanceRGB.js'); // functions to determine color distance

precision = 30 // reference number to determine difference precision


/**
 * Calculate some pixel based difference between the input arrays-of-integers.
 *
 * @param {Buffer} buff1 Input buffer 1.
 * @param {Buffer} buff2 Input buffer 2.
 * @param {Buffer} buff3 Output buffer.
 * @param {int} channel Amount of channels of the original picture type
 *
 * @pre buff1.length == buff2.length == channel * buff3.length
 *
 * @note All arguments are allowed to alias each other since we never reuse data in the
 *  for loop below.
 * @note By working with Lab color schemes we aquire problems with the length of the buffers, 
 *	therefore we introduced a changable variable that can easy cope with this problem.
 * 
 * @see https://nodejs.org/api/buffer.html
 */
const imageReading = function(buff1, buff2, buff3, channel) {
	assert(buff1.length == buff2.length)
    assert(buff1.length == channel * buff3.length / 3)

	for(let i = 0; i < buff1.length; i += channel) {
		rgb1 = new Array(buff1[i], buff1[i+1], buff1[i+2])
		rgb2 = new Array(buff2[i], buff2[i+1], buff2[i+2])
		
		k = clrdis.colorDistance(rgb1, rgb2)
		
		// console.log(i," ", k)
		
		if (k < 3) buff3[i + k] = 240
    }
}


/**
 * Round the given number to either 0 or 100 depending on its position to precision.
 *	
 * @param {float} number Input number
 * @param {int} precision Reference number
 *
 */ 
function precisionRound(number, precision) {
	// return Math.round(number / precision) * precision
	if (number > precision) return 100
	else return 0
}

// To make the function accesible in other .js files
module.exports = {
	imageReading: imageReading
};