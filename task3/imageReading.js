

const assert = require('assert')  // asserting pre-conditions
const clrdis = require('./colorDistance'); // functions to determine color distance

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
    assert(buff1.length == channel * buff3.length)

	for(let i = 0; i < buff1.length; i += channel) {
		lab1 = new Array(buff1[i], buff1[i+1], buff1[i+2])
		lab2 = new Array(buff2[i], buff2[i+1], buff2[i+2])
		
        buff3[i/channel] = precisionRound(clrdis.colorDistance2000(lab1,lab2), precision) * 5 // factor 5 is hier gekozen om waarden die wit zijn visueel duidelijk wit te maken
		
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