const sharp = require('sharp')    // image processing


async function getImagesHslMatrix2(imgs){

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

                        matrix[j].push([buff[pos], buff[pos + 1], buff[pos + 2]])
                    }
                }
                //console.log(matrix[220][850])
                equalize(matrix);
                //console.log('_____________________________________')
                //console.log(matrix[220][850])
                return matrix
            }
        ).catch(
            err => console.log(err.message)
        )
    }))
}


function equalize(matrix){
    var level,ratio,val;
    let height = matrix.length;
    let width = matrix[0].length;
    let n = width*height;
    var mCopy = new Array(height)
    for(var j=0;j<height;j++){
        mCopy[j] = new Array(width);
    }

    var pdf = new Array(256);
    for(i=0;i<256;i++){
        pdf[i] = 0;
    }
    var z = 0;
    for(var i=0;i<height;i++){
        for(var j=0;j<width;j++){
            var current = matrix[i][j];
            val = Math.round(0.3*current[0]+0.59*current[1]+0.11*current[2]);
            level = Math.min(255,Math.max(val,0));
            mCopy[i][j] = level;
            pdf[level]++;
        }
    }

    var cdf = new Array(256);
    cdf[0] = pdf[0];
    for(i=1;i<256;i++) {
        cdf[i] = cdf[i-1] + pdf[i];
    }
    for(i=0;i<256;i++) {
        cdf[i] = cdf[i] / n * 255.0;
    }

    for (i=0;i<height;i++) {
        for(j=0;j<width;j++){
            level = mCopy[i][j];
            //console.log(level)
            ratio = cdf[level] / (level || 1);
            //console.log(ratio);
            var current = matrix[i][j]
            var r =  Math.min(255, Math.max(Math.round(current[0] * ratio), 0));
            var g = Math.min(255, Math.max(Math.round(current[1] * ratio), 0));
            var b =  Math.min(255, Math.max(Math.round(current[2] * ratio), 0));
            matrix[i][j] = rgb2hsl(r,g,b)
        }
    }

    return matrix
}

//var testimg = ['./TestImages/nothing.png']
//var buff = getImagesHslMatrix(testimg)




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

module.exports = {
  getImagesHslMatrix: getImagesHslMatrix
}
