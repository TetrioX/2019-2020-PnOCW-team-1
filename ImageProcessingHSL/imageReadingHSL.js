

const assert = require('assert')  // asserting pre-conditions
const clrdis = require('./colorDistanceHSL.js'); // functions to determine color distance

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
const imageReading = function(buff, toBuff, channel, scale=true) {
    assert(buff.length * 3 == channel * toBuff.length)
	if (scale){
    var scaleValue = 255 / 6
  } else{
    var scaleValue = 1
  }
	for(let i = 0; i < buff.length; i += channel) {
    rgb = new Array(buff[i], buff[i+1], buff[i+2])

		k = clrdis.pixelColor(rgb)

     switch (k) {
       case 1 :
         toBuff[i/channel*3] = 255;
         break;
       case 2 :
         toBuff[i/channel*3 + 1] = 255;
         break;
       case 3 :
         toBuff[i/channel*3 + 2] = 255;
         break;
       case 4 :
         toBuff[i/channel*3] = 255;
         toBuff[i/channel*3+1] = 255;
         break;
       case 5 :
         toBuff[i/channel*3] = 255;
         toBuff[i/channel*3+2] = 255;
         break;
       case 6 :
         toBuff[i/channel*3+1] = 255;
         toBuff[i/channel*3+2] = 255;
         break;
     }

	//	toBuff[i/channel] = k * scaleValue
    }
}

// To make the function accesible in other .js files
module.exports = {
	imageReading: imageReading
};
