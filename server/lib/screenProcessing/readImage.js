const sharp = require('sharp')    // image processing

async function getImagesHslMatrix(imgs){
  return await Promise.all(imgs.map( img => {
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
      values => {
        let meta = values[0]
        let buff = values[1]
        let matrix = []
        for (let j = 0; j < meta.height; j++) {
          matrix.push([])
          for (let i = 0; i < meta.width; i++) {
            let pos = meta.channels*(i + j*meta.width)
            matrix[j].push(rgb2hsl(buff[pos], buff[pos + 1], buff[pos + 2]))
          }
        }
        return matrix
      }
    ).catch(
      err => console.log(err.message)
    )
  }))
}

async function getImagesGrayscaleMatrix(imgs){
  return await Promise.all(imgs.map( img => {
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
      values => {
        let meta = values[0]
        let buff = values[1]
        let matrix = []
        for (let j = 0; j < meta.height; j++) {
          matrix.push([])
          for (let i = 0; i < meta.width; i++) {
            let pos = meta.channels*(i + j*meta.width)
            matrix[j].push(rgb2grayscale(buff[pos], buff[pos + 1], buff[pos + 2]))
          }
        }
        return matrix
      }
    ).catch(
      err => console.log(err.message)
    )
  }))
}

/*
* Converts an RGB color to HSL
* Parameters
*     rgbArr : 3-element array containing the RGB values
*
* Result : 3-element array containing the HSL values
*	@see https://gmigdos.wordpress.com/2011/01/13/javascript-convert-rgb-values-to-hsl/
*/
function rgb2hsl(r1, g1, b1){
    r1 /= 255;
    g1 /= 255;
    b1 /= 255;

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
// Y' =  0.2126R + 0.7152G + 0.0722B
function rgb2grayscale(r1, g1, b1){
  r1 /= 255;
  g1 /= 255;
  b1 /= 255;
  return Math.round((r1*0.2126 + g1*0.7152 + b1*0.0722)*100)
}

module.exports = {
  getImagesHslMatrix: getImagesHslMatrix,
  getImagesGrayscaleMatrix: getImagesGrayscaleMatrix
}
