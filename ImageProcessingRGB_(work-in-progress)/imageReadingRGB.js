

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
const imageReading = function(buff, toBuff, channel) {
    assert(buff.length == channel * toBuff.length / 3)
	
	for(let i = 0; i < buff.length; i += channel) {
		rgb = new Array(buff[i], buff[i+1], buff[i+2])
		
		k = clrdis.colorDistance(rgb)
		
		// console.log(i," ", rgb, " ", k)
		
		if ([1,4,5,7].includes(k)) toBuff[i*3/channel] = 255
		if ([2,4,6,7].includes(k)) toBuff[i*3/channel + 1] = 255
		if ([3,5,6,7].includes(k)) toBuff[i*3/channel + 2] = 255
		
		// console.log("-> ", toBuff[i*3/channel], " ", toBuff[i*3/channel + 1], " ", toBuff[i*3/channel + 2])
    }
}

// To make the function accesible in other .js files
module.exports = {
	imageReading: imageReading
};