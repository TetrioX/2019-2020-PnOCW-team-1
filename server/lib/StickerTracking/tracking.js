const sharp = require('sharp')    // image processing

let ri = require("../screenProcessing/readImage.js");
let sc = require("../screenProcessing/screenReading");

main();

async function main(){
    // afb om op te tekenen
    img = "testimage1.jpg"
    imageMatrixes = await ri.getImagesHslMatrix([img]);
    /// [[[h,s,l],[h,s,l],...],
    //   [ ... ],
    //     ...                 ]
    // mee werken maar gebruik maken van sc.defaultTresholds
    HslImageMatrix = imageMatrixes[0];
    let nbOfColors = Object.keys(sc.defaultTresholds).length;
    // [[1,..],[,,]...]
    // kleuren van 1->6 met 1 = rood
    // gebruiken? want je kan ook met hsl imagematrix werken
    colorValueMatrix = sc.joinMatrixes(imageMatrixes,sc.defaultTresholds,nbOfColors);

    // Hiermee teken je op u afb
    //listOfPoints = [{x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3}]
    listOfPoints = findMarker(colorValueMatrix)
    if(listOfPoints == null){console.log("null als result")}
    printOnImage(img,listOfPoints); 
}

const findMarker = function (matrix) {
    let listOfPoints = []
    //Step 1: go through image for first instance of color
    let borderFirstCircle = []
    for(row=0;row<matrix.length;row++){
        for(col=0;col<matrix[0].length;col++){
            if(matrix[row][col]==4){
                //Step 2: check for blue border
                borderFirstCircle = findBorderOrderedRgb(matrix,{x:col,y:row},4,matrix[0].length,matrix.length,1000,0)

                if (borderFirstCircle != null && border.length>10){
                    outlines = findNewBorders(borderFirstCircle,matrix);
                    console.log(outlines);
                    listOfPoints = listOfPoints.concat(borderFirstCircle)
                    //Step 2: find red innerCircle in square
                    borderSecondCircle = findCircleInBox(matrix,1,outlines.max_x,outlines.max_y,outlines.min_x,outlines.min_y);
                    if (borderSecondCircle != null){
                        outlines = findNewBorders(borderSecondCircle,matrix);
                        console.log(outlines);
                        listOfPoints = listOfPoints.concat(borderSecondCircle)
                        //Step 3: find blue innerCircle
                        borderThirdCircle = findCircleInBox(matrix,4,outlines.max_x,outlines.max_y,outlines.min_x,outlines.min_y)
                        if (borderThirdCircle != null){
                            outlines = findNewBorders(borderThirdCircle,matrix)
                            console.log(outlines)
                            listOfPoints = listOfPoints.concat(borderThirdCircle)
                            //Step 4: check center
                            center = findCenter(borderThirdCircle);
                            console.log(center);
                            listOfPoints = listOfPoints.concat([center,{x:center.x+1,y:center.y},{x:center.x-1,y:center.y},{x:center.x,y:center.y+1},{x:center.x,y:center.y-1}]);
                            return listOfPoints
                        }
                    }
                }
            }
        }
    }
    return null;
}

const findCircleInBox = function (matrix, color,maxX,maxY,minX,minY) {
    let border = []
    for(row=minY;row<=maxY;row++){
        for(col=minX;col<=maxX;col++){
            if(matrix[row][col]==color){
                border = findBorderOrderedRgb(matrix,{x:col,y:row},color,maxX,maxY,minX,minY)
                if (border.length>10){
                    return border
                }
            }
        }
    }
    return null;
}

const findNewBorders = function (border, matrix){
    let maxX = 0;
    let maxY = 0;
    let minX = matrix[0].length;
    let minY = colorValueMatrix.length;
    for(let pixel of border){
        if(pixel.x>maxX){
            maxX = pixel.x
        }
        if(pixel.x<minX){
            minX = pixel.x
        }
        if(pixel.y>maxY){
            maxY = pixel.y
        }
        if(pixel.y<minY){
            minY = pixel.y
        }
    }
    return {max_x:maxX,max_y:maxY,min_x:minX,min_y:minY}
}

//checkCenterColor
const findCenter = function (border){
    let gemX = 0;
    let gemY = 0;
    for(let pixel of border){
        gemX = gemX + pixel.x
        gemY = gemY + pixel.y
    }
    gemX = Math.round(gemX/border.length)
    gemY = Math.round(gemY/border.length)
    return {x:gemX,y:gemY}
}

//const borderCheckNeighbors = function (border,color,nextToColor){

const findBorderOrderedRgb = function (matrix, start,color,maxX,maxY,minX,minY) {
	// distance between pixels in the border
	// this will cause small gaps to be skipped
	const distance = 1
	// check if pixel on current + angle*i is the color and in screen
	// with i in range from 1 through distance
	function checkNeighbor(current, ang){
		for (let i = 1; i <= distance; i++){
			let neighbor = matrix[current.y + i * ang.y]
	    if (typeof neighbor === 'undefined'){
				return false
			}
			neighbor = neighbor[current.x + i * ang.x]
			if (typeof neighbor === 'undefined'){
				return false
          }
	    if(neighbor == color){
			return true
		}
	  }
		return false
	}
	 //possible angles to go to
	const angles = [
		{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1},
		{x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1},
		{x: 0, y: -1}, {x: 1, y: -1}
	]

	let angleIndex = 0
	let current = {
		x: start.x,
		y: start.y
	 };
	border = []
	borderSet = new Set()
	var atStart = false
  while (true) {
    // Also check previous angles
    for (let add = -2; add <= 4; add++) { //vanaf -3 al????
      //45graden kloksgewijs: angleIndex (huidige index) + add
      let angle = angles[(angleIndex + add + 8) % 8]
      // check in the direction of the angle if your neighbour is white
      if (checkNeighbor(current, angle)) {
        current.x += angle.x
        current.y += angle.y
				if (atStart){
					if (borderSet.has(current.x + matrix[0].length * current.y)){
						return border
					} else{
						atStart = false
					}
				}
        //add to the list
        border.push({
            x: current.x,
            y: current.y
        });
				borderSet.add(current.x + matrix[0].length * current.y)
        //set the new direction to the current angle
        angleIndex = (angleIndex + add + 8) % 8
        break;
      }
    }
    if (start.x == current.x && start.y == current.y){
        if (atStart) break
        atStart = true
    }
    if(current.x>maxX || current.x<minX || current.y>maxY || current.y<minY){
        border = [];
        break;
    }
  }
	if (border.length == 0){
		border.push(start)
	}
  return border
}

async function printOnImage(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 0;
            buff[pos+1] = 0;
            buff[pos+2] = 0;
        }
        output_meta = { raw: { width: meta.width, height: meta.height, channels: meta.channels } }
        sharp(buff,output_meta).toFile("img2.jpg")
    }
    ).catch(
    err => console.log(err.message)
    )
  }

