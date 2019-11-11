const assert = require('assert');  // asserting pre-conditions
const clrdis = require('./colorDistanceRGB.js'); // functions to determine color distance

precision = 30; // reference number to determine difference precision


/**
 * Calculate some pixel based difference between the input arrays-of-integers.
 *
 * @param buff
 * @param toBuff
 * @param {int} channel Amount of channels of the original picture type
 *
 * @param scale
 * @pre buff1.length == buff2.length == channel * buff3.length
 *
 * @note All arguments are allowed to alias each other since we never reuse data in the
 *  for loop below.
 * @note By working with Lab color schemes we acquire problems with the length of the buffers,
 *    therefore we introduced a changeable variable that can easy cope with this problem.
 *
 * @see https://nodejs.org/api/buffer.html
 */
const imageReading = function (buff, toBuff, channel, scale = true) {
    assert(buff.length === channel * toBuff.length);
    let scaleValue = null;
    if (scale) {
        scaleValue = 255 / 6
    } else {
        scaleValue = 1
    }
    for (let i = 0; i < buff.length; i += channel) {
        const rgb = [buff[i], buff[i + 1], buff[i + 2]];

        const k = clrdis.pixelColor(rgb);

        // console.log(i," ", rgb, " ", k)

        toBuff[i / channel] = k * scaleValue
    }
};

// To make the function accessible in other .js files
module.exports = {
	imageReading: imageReading
};
