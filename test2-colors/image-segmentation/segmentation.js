const fil = require('./filter.js');

// buff [r1, g1, b1, r2, g2, b2, ...]
function segmentate(buff, toBuff, channel) {
 // fil.filter(buff, toBuff, channel)
  rgbbuff2hsl(buff)
  kNN(buff,10, toBuff)
  kNN(buff,10, toBuff)
  kNN(buff,10, toBuff)

}

function rgbbuff2hsl(buff){
  for (let i = 0; i < buff.length; i += 3){
    hsl = rgb2hsl([buff[i],buff[i+1],buff[i+2]])
    buff[i] = hsl[0]
    buff[i+1] = hsl[1]
    buff[i+2] = hsl[2]
  }
}

function kNN(buff,k, toBuff){
  locPoints = Math.floor(buff.length/(k*3))
  locPoints -= locPoints%3
  pointsColor = []
  for(let i = 0; i<k*3; i+=3){
    h = buff[locPoints*i]
    pointsColor.push(h)
  }
  console.log(pointsColor)
  newPointsColor = []
  nbPointsColor = 
  for(let i = 0; i<buff.length; i+=3){
    ind = closest_to(pointsColor,buff[i])
    toBuff[i] = pointsColor[ind]
    newPointsColor[ind] += buff[i]
    toBuff[i+1] = 100
    toBuff[i+2] = 100
  }
}

function closest_to(pointsColor,color){
  let d = 500
  let dColor = 0
  for (i in pointsColor){
    if (distance(pointsColor[i],color)<d){
      d = distance(pointsColor[i],color)
      dColor = i
    }
  }
  return dColor
}

function distance(hue1,hue2){
  return Math.sqrt(hue1-hue2)**2
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
