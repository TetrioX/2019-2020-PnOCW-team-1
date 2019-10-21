
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
const colorDistance = function(color1, color2) {
	color1 = colorNormalise(color1)
	color2 = colorNormalise(color2)
	
	dr = Math.abs(color2[0] - color1[0])
	dg = Math.abs(color2[1] - color1[1])
	db = Math.abs(color2[2] - color1[2])
	
	// console.log(color1, " and ", color2)
	// console.log(" -> ", dr, " ", dg, " ", db)
	
	if (dr >= dg && dr >= db && dr > 50) return 0
	else if (dg >= dr && dg >= db && dg > 50) return 1
	else if (db >= dr && db >= dg && db > 50) return 2
	else return 3
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
	