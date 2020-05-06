const sharp = require('sharp')    // image processing

let ri = require("../screenProcessing/readImage.js");
let sc = require("../screenProcessing/screenReading");

main();

// 1,2, ,4, ,6,7, ,9, , , ,
async function main(){
    //Linksboven, Rechtsboven, Linksonder, Rechtsonder -> Locatie vorige foto
    lastFound = [{x:531,y:899},{x:3221,y:1107},{x:479,y:3053},{x:3249,y:3007}]
    size = 400
    // afb om op te tekenen
    img = "IMG_20200504_145407.jpg"
    imageMatrixes = await ri.getImagesHslMatrix([img]);
    imageMatrixesGray = await ri.getImagesGrayscaleMatrix([img]);
    
    /// [[[h,s,l],[h,s,l],...],
    //   [ ... ], ...        ],
    //   [  ...              ]]
    // mee werken maar gebruik maken van sc.defaultTresholds
    HslImageMatrix = imageMatrixes[0];
    let nbOfColors = Object.keys(sc.defaultTresholds).length;
    
    // [[1,..],[,,]...]
    // kleuren van 1->6 met 1 = rood
    // gebruiken? want je kan ook met hsl imagematrix werken
    colorValueMatrix = sc.joinMatrixes(imageMatrixes,sc.defaultTresholds,nbOfColors);

    //  [[0,100,...],
    //   [ ...     ],
    //   [ ...     ]]
    // mee werken maar gebruik maken van sc.defaultTresholds
    grayImageMatrix = imageMatrixesGray[0];
    contrastMatrix = createContrastMatrix(grayImageMatrix);

    // Hiermee teken je op u afb
    //listOfPoints = [{x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3}]
    points = findMarker2(grayImageMatrix,contrastMatrix)
    console.log(points)
    if(points == null){console.log("null als result")}
    //console.log(points)
    printOnImage(img,points); 
    printOnImage(img,testfunction(grayImageMatrix,contrastMatrix))
}

const creatSubMatrixAroundPoint = function (matrix,point,size){
    let subMatrix = []
    let startPoint = absoluteStartPointAroundPoint(matrix,point,size)
    let endPoint = absoluteEndPointAroundPoint(matrix,point,size)
    let horizontalSize = endPoint.x-startPoint.x
    let verticalSize = endPoint.y-startPoint.y
    for(row=0;row<=verticalSize;row++){
        subMatrix.push([])
        for(col=0;col<=horizontalSize;col++){
            subMatrix[row][col] = subMatrix[startPoint.y + row][startPoint.x + col]
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

const createContrastMatrix = function (matrix) {
    let newMatrix = []
    for(row=0;row<matrix.length;row++){
        newMatrix.push([])
        for(col=0;col<matrix[0].length;col++){
            newMatrix[row][col] = getContrastNeighbors(matrix,col,row)
        }
    }
    return newMatrix
}

const findMarker2 = function (matrix,contrastMatrix) {
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
                if((matrix[row][col-d/2]>50 || matrix[row][col-d]>50) && (matrix[row][col+d/2]<50 || matrix[row][col+d]<50)){
                    leftX = col
                    //listOfPoints.push({x:col,y:row})
                }  
                //second border
                else {
                    //check if black before contrast and white after
                    if(leftX!=null && (matrix[row][col-d/2]<50 || matrix[row][col-d]<50) && (matrix[row][col+d/2]>50 || matrix[row][col+d]>50)){
                        let avgX = Math.round((col+leftX)/2)          
                        listOfPoints.push({x:avgX,y:row,distance:col-leftX})
                        leftX = null
                    }  
                }
            }
        }
    }
    console.log(listOfPoints)
    console.log("/////////////////////")
    //check above and below contrast
    for(point of listOfPoints){
        //check below
        let belowY = null
        let col = point.y
        for(let row=point.y-1;row<matrix.length-d;row++){
            //find contrast color
            if(contrastMatrix[row][col]>10){
                //check if black before contrast and white after
                if((matrix[row-d/2][col]<50 || matrix[row-d][col]<50) && (matrix[row+d/2][col]>50 || matrix[row+d][col]>50)){
                    belowY = row
                    break;
                }
            }
        }
        if(belowY!=null){
            //check above
            for(let row=point.y+1;row>=d;row--){
                //find contrast color
                if(contrastMatrix[row][col]>10){
                    //check if black before contrast and white after
                    if((matrix[row+d/2][col]<50 || matrix[row+d][col]<50) && (matrix[row-d/2][col]>50 || matrix[row-d][col]>50)){
                        let distance = belowY - row
                        let avgY = Math.round((row+belowY)/2)
                        if(matrix[avgY][point.x]<50 && distanceIsClose(distance,point.distance)){
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
    return finalList
}

const distanceIsClose = function (d1,d2){
    return (d1<1.25*d2 && d2<1.25*d1 && d1>20 && d2>20 && d1<200 && d2<200)
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

//grayscale above 60 = white
//grayscale below 50 = black
const testfunction = function (matrix, contrastMatrix) {
    pointlist = []
    for(row=0;row<matrix.length;row++){
        for(col=0;col<matrix[0].length;col++){
            if(contrastMatrix[row][col]>10){
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

//const borderCheckNeighbors = function (border,color,nextToColor){

async function printOnImage(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 0;
            buff[pos+1] = 255;
            buff[pos+2] = 0;
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

