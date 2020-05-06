

async function findNewPointsFromLocationLastPoints(lastFound,img){
    //Linksboven, Rechtsboven, Linksonder, Rechtsonder -> Locatie vorige foto
    size = 400
    imageMatrixesGray = await getImagesGrayscaleMatrix([img]);
    grayImageMatrix = imageMatrixesGray[0];
    let newPoints = {}
    for (screen of Object.keys(lastFound)){
      newPoints[screen] = []
      for (testPoint of lastFound[screen]){
          subMatrixGray = creatSubMatrixAroundPoint(grayImageMatrix,testPoint,size)

          let result = createContrastMatrixAndAvg(subMatrixGray);
          contrastMatrix = result.matrix;
          contrastValue = result.avg;

          point = findMarker2(subMatrixGray,contrastMatrix,contrastValue)
          if (point === null){
            // couldn't find new screen
            delete newPoints[screen]
            break
          }
          point = relativeToAbsolutePoint(grayImageMatrix,points,testPoint,size)
          newPoints[screen].append(point)
      }
    }
    printOnImage(img,showpoints);
    console.log(showpoints)
    //printOnImage(img,testfunction(grayImageMatrix,contrastMatrix,contrastValue))
    return showpoints
}
const relativeToAbsolutePoint = function (matrix,transfer,point,size){
    let startpoint= absoluteStartPointAroundPoint(matrix,point,size)
    return {x: (startpoint.x + transfer.x),y: (startpoint.y + transfer.y)}
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
        for(let row=point.y-1;row<matrix.length-d;row++){
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
            for(let row=point.y+1;row>=d;row--){
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
    return findCenter(finalList)
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
    if(values.length ===0) return null;

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

async function getImagesGrayscaleMatrix(img){
  let buff = img.data
  let matrix = []
  for (let j = 0; j < img.height; j++) {
    matrix.push([])
    for (let i = 0; i < img.width; i++) {
      let pos = 4*(i + j*img.width)
      matrix[j].push(rgb2grayscale(buff[pos], buff[pos + 1], buff[pos + 2]))
    }
  }
  return matrix
}

  // Y' =  0.2126R + 0.7152G + 0.0722B
  function rgb2grayscale(r1, g1, b1){
    r1 /= 255;
    g1 /= 255;
    b1 /= 255;
    return Math.round((r1*0.2126 + g1*0.7152 + b1*0.0722)*100)
  }
