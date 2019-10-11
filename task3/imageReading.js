

const assert = require('assert')  // asserting pre-conditions
const clrdis = require('./colorDistance');

/**
 * Calculate some pixel based difference between the input arrays-of-integers.
 *
 * @param {Buffer} buff1 Input buffer 1.
 * @param {Buffer} buff2 Input buffer 2.
 * @param {Buffer} buff3 Output buffer.
 * @param
 *
 * @pre buff1.length == buff2.length == version * buff3.length
 *
 * @note All arguments are allowed to alias each other since we never reuse data in the
 * for loop below.
 *
 * @see https://nodejs.org/api/buffer.html
 */
exports.imageReading = function(buff1, buff2, buff3, version) {
	console.log(version)
	assert(buff1.length == buff2.length)
    assert(buff1.length == version * buff3.length)
	startWhite = 0
	onWhite = true

	for(let i = 0; i < buff1.length; i += version) {
		lab1 = new Array(buff1[i], buff1[i+1], buff1[i+2])
		lab2 = new Array(buff2[i], buff2[i+1], buff2[i+2])
		
		// console.log(i, " ", lab1, " ", lab2, " ", colorDistance(lab1,lab2))
		precision = 30
        buff3[i/version] = precisionRound(clrdis.colorDistance2000(lab1,lab2), precision) * 5
		
		if (buff3[i/version] > 50) if (!onWhite) { 
		startWhite = i/version; 
		onWhite = true
		}
		if (buff3[i/version] <= 50) if (onWhite) { 
		if(i/version - startWhite > 256) console.log(i/version - startWhite); 
		onWhite = false
		}
    }
}

function precisionRound(number, precision) {
	// return Math.round(number / precision) * precision
	if (number > precision) return 100
	else return 0
}