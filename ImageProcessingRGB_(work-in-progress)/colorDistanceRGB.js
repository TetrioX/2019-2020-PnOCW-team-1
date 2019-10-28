
const assert = require('assert')  // asserting pre-conditions

/**
 * Calculate the difference between two colors.
 *
 * @param {Array} color1 Input color 1
 * @param {Array} color2 Input color 2
 *
 * @pre color1.length == color1.length == 3
 *
 * @note The used algorithm is based upon the CIE94 algorithm.
 * @see https://en.wikipedia.org/wiki/Color_difference
 */
const colorDistance = function(color) { // color2) {
	color = colorNormalise(color)
	
	dr = color[0] 
	dg = color[1] 
	db = color[2] 
	
	inferum = 40
	
	if (dr > inferum && dr / 2 >= dg && dr / 2 >= db) return 1
	else if (dg > inferum && dg / 2 >= dr && dg / 2 >= db) return 2
	else if (db > inferum && db / 2 >= dg && db / 2 >= dr) return 3
	else if (dr > inferum && dg > inferum && (dr / 2 <= dg && dr / 2 >= db || dg / 2 <= dr && dg / 2 >= db)) return 4
	else if (dr > inferum && db > inferum && (dr / 2 <= db && dr / 2 >= dg || db / 2 <= dr && db / 2 >= dg)) return 5
	else if (dg > inferum && db > inferum && (dg / 2 <= db && dg / 2 >= dr || db / 2 <= dg && db / 2 >= dr)) return 6
	else return 0
}

const colorNormalise = function(color) {
	if (color[0] <= color[1] && color[0] <= color[2]) subst = color[0]
	else if (color[1] <= color[0] && color[1] <= color[2]) subst = color[1]
	else if (color[2] <= color[0] && color[2] <= color[1]) subst = color[2]
	
	return new Array(color[0] - subst, color[1] - subst, color[2] - subst)
}

// To make the function accesible in other .js files
module.exports = {
	colorDistance: colorDistance,
};
	