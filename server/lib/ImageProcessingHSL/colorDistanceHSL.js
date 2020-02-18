
const assert = require('assert')  // asserting pre-conditions

/**
 * Calculate the raw pixel color.
 *
 * @param {Array} color1 Input color 1
 * @param {Array} color2 Input color 2
 *
 * @pre color1.length == color1.length == 3
 *
 * @note The used algorithm is based upon the CIE94 algorithm.
 * @see https://en.wikipedia.org/wiki/Color_difference
 */
const pixelColor = function(color) {
	hsl = rgb2hsl(color)
	h = hsl[0]
	s = hsl[1]
	l = hsl[2]

    if (l < 10 || l > 90) {
        return 0
    }
    if (s < 20) {
        return 0
    }

	if (h >= 317 || h < 45) //rood
		return 1
	else if (h >= 45 && h < 100) //roodgroen geel
		return 4
	else if (h >= 100 && h < 160) //groen
		return 2
	else if (h >= 160 && h < 200) //groenblauw cyaan
		return 6
	else if (h >= 200 && h < 240) //blauw
		return 3
	else if (h >= 240 && h < 317) //roodblauw magenta
		return 5
	else return 0 //zwart
}

/*
* Converts an RGB color to HSL
* Parameters
*     rgbArr : 3-element array containing the RGB values
*
* Result : 3-element array containing the HSL values
*	@see https://gmigdos.wordpress.com/2011/01/13/javascript-convert-rgb-values-to-hsl/
*/
function rgb2hsl(rgbArr){
    var r1 = rgbArr[0] / 255;
    var g1 = rgbArr[1] / 255;
    var b1 = rgbArr[2] / 255;

    var maxColor = Math.max(r1,g1,b1);
    var minColor = Math.min(r1,g1,b1);

		//Calculate L:
    var L = (maxColor + minColor) / 2 ;
    var S = 0;
    var H = 0;

    if(maxColor != minColor){
        //Calculate S:
        if(L < 0.5)
            S = (maxColor - minColor) / (maxColor + minColor);
      	else S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        //Calculate H:
        if(r1 == maxColor)
            H = (g1-b1) / (maxColor - minColor);
        else if(g1 == maxColor)
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        else H = 4.0 + (r1 - g1) / (maxColor - minColor);
    }

    L = L * 100;
    S = S * 100;
    H = H * 60;

		if(H<0) H += 360;

    return [H, S, L];
}

// To make the function accesible in other .js files
module.exports = {
	pixelColor: pixelColor,
};
