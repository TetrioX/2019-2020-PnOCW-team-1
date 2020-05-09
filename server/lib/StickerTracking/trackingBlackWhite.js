const sharp = require('sharp')    // image processing

let ri = require("../screenProcessing/readImage.js");
let sc = require("../screenProcessing/screenReading");

findNewPointsFromLocationLastPoints([{x:531,y:899},{x:3221,y:1107},{x:479,y:3053},{x:3249,y:3007}],"IMG_20200504_145407.jpg");

async function findNewPointsFromLocationLastPoints(lastFound,img){
    //Linksboven, Rechtsboven, Linksonder, Rechtsonder -> Locatie vorige foto
    size = 400
    imageMatrixesGray = await ri.getImagesGrayscaleMatrix([img]);
    grayImageMatrix = imageMatrixesGray[0];
    let showpoints = []
    for (testPoint of lastFound){
        subMatrixGray = creatSubMatrixAroundPoint(grayImageMatrix,testPoint,size)

        let result = createContrastMatrixAndAvg(subMatrixGray);
        contrastMatrix = result.matrix;
        contrastValue = result.avg;

        points = findMarker2(subMatrixGray,contrastMatrix,contrastValue)
        points = relativeToAbsolutePoint(grayImageMatrix,points,testPoint,size)
        if(points == null){console.log("null als result")}
        showpoints = showpoints.concat(points)
    }
    printOnImage(img,showpoints);
    console.log(showpoints)
    //printOnImage(img,testfunction(grayImageMatrix,contrastMatrix,contrastValue))
    return showpoints
}
const relativeToAbsolutePoint = function (matrix,transfers,point,size){
    result = []
    let startpoint= absoluteStartPointAroundPoint(matrix,point,size)
    for (t of transfers){
        result.push({x: (startpoint.x + t.x),y: (startpoint.y + t.y)})
    }
    return result
}

const creatSubMatrixAroundPoint = function (matrix,point,size){
    let subMatrix = []
    let startPoint = absoluteStartPointAroundPoint(matrix,point,size)
    let endPoint = absoluteEndPointAroundPoint(matrix,point,size)
    let horizontalSize = endPoint.x-startPoint.x+1
    let verticalSize = endPoint.y-startPoint.y+1
    for(row=0;row<verticalSize;row++){
        subMatrix.push([])
        for(col=0;col<horizontalSize;col++){
            subMatrix[row][col] = matrix[startPoint.y + row][startPoint.x + col]
        }
    }
    return subMatrix
}

const absoluteStartPointAroundPoint = function (matrix, point, size){
    let startHor = point.x-size/2
    if (startHor<=0){startHor=0}
    let startVer = point.y-size/2
    if (startVer<=0){startHor=0}
    return {x:startHor,y:startVer}
}

const absoluteEndPointAroundPoint = function (matrix, point, size){
    let stopHor = point.x+size/2-1
    if (stopHor<matrix.length){startHor=matrix.length-1}
    let stopVer = point.y+size/2-1
    if (stopVer<matrix[0].length){startHor=matrix[0].length-1}
    return {x:stopHor,y:stopVer}
}

const createContrastMatrixAndAvg = function (matrix) {
    let avgGrayscale = 0
    let newMatrix = []
    for(row=0;row<matrix.length;row++){
        newMatrix.push([])
        for(col=0;col<matrix[0].length;col++){
            newMatrix[row][col] = getContrastNeighbors(matrix,col,row)
            avgGrayscale += matrix[row][col]
        }
    }
    avgGrayscale /= matrix.length*matrix[0].length
    return {matrix:newMatrix,avg:avgGrayscale}
}

const findMarker2 = function (matrix,contrastMatrix,value) {
    let listOfPoints = []
    let finalList = []
    let d = 6; //needs to be even
    //Step 1: go through image
    for(let row=d;row<matrix.length-d;row++){
        //remember pixel from transition
        let leftX = null
        for(let col=d;col<matrix[0].length-d;col++){
            //find contrast color
            if(contrastMatrix[row][col]>10){
                //finding first border
                //check if white before contrast and black after
                if((matrix[row][col-d/2]>value || matrix[row][col-d]>value) && (matrix[row][col+d/2]<value || matrix[row][col+d]<value)){
                    leftX = col
                    //listOfPoints.push({x:col,y:row})
                }
                //second border
                else {
                    //check if black before contrast and white after
                    if(leftX!=null && (matrix[row][col-d/2]<value || matrix[row][col-d]<value) && (matrix[row][col+d/2]>value || matrix[row][col+d]>value)){
                        let avgX = Math.round((col+leftX)/2)
                        listOfPoints.push({x:avgX,y:row,distance:col-leftX})
                        leftX = null
                    }
                }
            }
        }
    }
    //console.log(listOfPoints)
    //printOnImage2(img,listOfPoints)
    //check above and below contrast
    for(point of listOfPoints){
        //check below
        let belowY = null
        let col = point.x
        for(let row=point.y+1;row<matrix.length-d;row++){
            //find contrast color
            if(contrastMatrix[row][col]>10){
                //check if black before contrast and white after
                if((matrix[row-d/2][col]<value || matrix[row-d][col]<value) && (matrix[row+d/2][col]>value || matrix[row+d][col]>value)){
                    belowY = row
                    break;
                }
            }
        }
        if(belowY!=null){
            //check above
            for(let row=point.y-1;row>=d;row--){
                //find contrast color
                if(contrastMatrix[row][col]>10){
                    //check if black before contrast and white after
                    if((matrix[row+d/2][col]<value || matrix[row+d][col]<value) && (matrix[row-d/2][col]>value || matrix[row-d][col]>value)){
                        let distance = belowY - row
                        let avgY = Math.round((row+belowY)/2)
                        if(matrix[avgY][point.x]<value && distanceIsClose(distance,point.distance)){
                            finalList.push({x:point.x,y:avgY})
                        }
                        break;
                    }
                }
            }
        }
    }
    //avg point
    point = findCenter(finalList)
    return [point]
}

const distanceIsClose = function (d1,d2){
    return (d1<1.25*d2 && d2<1.25*d1 && d1>20 && d2>20 && d1<200 && d2<200)
}

//checkCenterColor
const findCenter = function (coord){
    let listX = []
    let listY = []
    for(let pixel of coord){
        listX.push(pixel.x)
        listY.push(pixel.y)
    }
    return {x:median(listX),y:median(listY)}
}

// modifies original list !!
// ref: https://stackoverflow.com/questions/45309447/calculating-median-javascript
function median(values){
    if(values.length ===0) return 0;

    values.sort(function(a,b){
      return a-b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
      return values[half];

    return (values[half - 1] + values[half]) / 2.0;
  }

//grayscale above value = white
//grayscale below value = black
const testfunction = function (matrix, contrastMatrix,value) {
    pointlist = []
    for(row=0;row<matrix.length;row++){
        for(col=0;col<matrix[0].length;col++){
            if(matrix[row][col]<value){
                pointlist.push({x:col,y:row})
            }
        }
    }
    return pointlist
}

const getContrastNeighbors = function (matrix,x,y) {
    let contrast = 0
    let d = 3
    const angles = [
		{x: 1, y: 0}, {x: 0, y: 1},
		{x: -1, y: 0}, {x: 0, y: -1}
    ]
    let count = 0
    for(i of angles){
        if(0<=y+i.y+d*4 && 0<=x+i.x+d*4 && y+i.y+d*4<matrix.length && x+i.x+d*4<matrix[0].length){
            contrast += Math.abs(matrix[y+i.y+d*2][x+i.x+d*2]-matrix[y][x])
            contrast += Math.abs(matrix[y+i.y+d*4][x+i.x+d*4]-matrix[y][x])
            count += 2
        }
    }
    contrast /= count
    return contrast
}

async function printOnImage(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 255;
            buff[pos+1] = 255;
            buff[pos+2] = 255;
        }
        output_meta = { raw: { width: meta.width, height: meta.height, channels: meta.channels } }
        sharp(buff,output_meta).toFile("resultImage.jpg")
    }
    ).catch(
    err => console.log(err.message)
    )
  }

  async function printOnImage2(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 255;
            buff[pos+1] = 0;
            buff[pos+2] = 0;
        }
        output_meta = { raw: { width: meta.width, height: meta.height, channels: meta.channels } }
        sharp(buff,output_meta).toFile("resultImage.jpg")
    }
    ).catch(
    err => console.log(err.message)
    )
  }
  async function printOnImage3(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 0;
            buff[pos+1] = 0;
            buff[pos+2] = 255;
        }
        output_meta = { raw: { width: meta.width, height: meta.height, channels: meta.channels } }
        sharp(buff,output_meta).toFile("resultImage.jpg")
    }
    ).catch(
    err => console.log(err.message)
    )
  }
