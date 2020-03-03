const fil = require('./filter.js');

// bugg [r1, g1, b1, r2, g2, b2, ...]
function segmentate(buff, toBuff, channel) {
  fil.filter(buff, toBuff, channel)

}

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


module.exports = {
  segmentate: segmentate
}
