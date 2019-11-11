var assert = require('assert');
var chai = require('chai');
var fs = require('fs');
var assert = chai.assert;    // Using Assert style
// var expect = chai.expect;    // Using Expect style
// var should = chai.should();  // Using Should style
var screenRecognition = require('../screenRecognition.js')
const screenReading = require('../screenReading.js');
const imgprcssrgb = require('../../ImageProcessingRGB/imageProcessingRGB.js')

describe('findscreen', function() {

  // set timeout to 3 seconds
  this.timeout(3000)

  // allowed pixel distance
  bwdelta = 3
  rgbDelta = 22

  function parseJsonFile(path){
    var contents = fs.readFileSync(path);
    return JSON.parse(contents);
  }

  before(async function() {

    image1 = await screenRecognition.findScreen(['./TestResults/TestCase1.png'], false, true)
    image2 = await screenRecognition.findScreen(['./TestResults/TestCase2.png'], false, true)
    image3 = await screenRecognition.findScreen(['./TestResults/TestCase3.png'], false, true)
    image4 = await screenRecognition.findScreen(['./TestResults/TestCase4.png'], false, true)
    imageSmall = await screenRecognition.findScreen(['./TestResults/TestCaseSmall.png'], false, true)
    imageMoreScreens = await screenRecognition.findScreen(['./TestResults/TestCaseMoreScreens.png'],  false, true)
    imageMoreScreens2 = await screenRecognition.findScreen(['./TestResults/TestCaseMoreScreens2.png'], false, true)
    matrix1 = screenReading.createMatrix(image1.buffers[0], image1.dimension)
    matrix2 = screenReading.createMatrix(image2.buffers[0], image2.dimension)
    matrix3 = screenReading.createMatrix(image3.buffers[0], image3.dimension)
    matrix4 = screenReading.createMatrix(image4.buffers[0], image4.dimension)
    matrixSmall = screenReading.createMatrix(imageSmall.buffers[0], imageSmall.dimension)
    matrixMoreScreens = screenReading.createMatrix(imageMoreScreens.buffers[0], imageMoreScreens.dimension)
    matrixMoreScreens2 = screenReading.createMatrix(imageMoreScreens2.buffers[0], imageMoreScreens2.dimension)
    var rgbCasesPath = './test/rgbTestCases'
    matrixes1 = parseJsonFile(rgbCasesPath + '/case1/matrixes.json')
    colorCombs1 = parseJsonFile(rgbCasesPath + '/case1/colorCombs.json')
    screens1 = parseJsonFile(rgbCasesPath + '/case1/screens.json')
    matrixes2 = parseJsonFile(rgbCasesPath + '/case2/matrixes.json')
    colorCombs2 = parseJsonFile(rgbCasesPath + '/case2/colorCombs.json')
    screens2 = parseJsonFile(rgbCasesPath + '/case2/screens.json')
    matrixes3 = parseJsonFile(rgbCasesPath + '/case3/matrixes.json')
    colorCombs3 = parseJsonFile(rgbCasesPath + '/case3/colorCombs.json')
    screens3 = parseJsonFile(rgbCasesPath + '/case3/screens.json')
    colorCombs4 = parseJsonFile(rgbCasesPath + '/case4/colorCombs.json')
    screens4 = parseJsonFile(rgbCasesPath + '/case4/screens.json')
    matrixes4 = await imgprcssrgb.doImgDiff([rgbCasesPath + '/case4/image-0.png', rgbCasesPath + '/case4/image-1.png'], false, false)
    matrixes4 = matrixes4.matrix
    /*
      colorMatrix1 =
          [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]]
      colorMatrix2 =
          [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]]
        */
  });

  // checks if the length of all squares is 4
  function checkLenghtSquares(squares){
    for (let sq of squares){
      if (sq.length != 4){
        return false
      }
    }
    return true
  }

  // checks if 2 coordinates are less than delta away from each other
  function checkIfCordListContainsOtherCordList(corners1, corners2, delta){
    for (let c2 of corners2){
      let contained = false;
      for (let c1 of corners1) {
        if (Math.abs(c1.x - c2.x) <= delta && Math.abs(c1.y - c2.y) <= delta){
          contained = true
          break;
        }
      }
      if (contained == false){
        return false
      }
    }
    return true
  }

  // checks if all squares match
  function checkMultipleSquares(squares1, squares2){
    for (let sq1 of squares1){
      let contained = false
      for (let sq2 of squares2){
        if (checkIfCordListContainsOtherCordList(sq1, sq2, bwdelta)){
          contained = true
          break;
        }
      }
      if (contained == false){
        return false;
      }
    }
    return true;
  }

  function compareScreens(screen1, screen2){
    for (let i in screen1){
      if (Math.abs(screen1[i].x - screen2[i].x) > rgbDelta && Math.abs(screen1[i].y - screen2[i].y) > rgbDelta){
        return false
      }
    }
    return true
  }

  describe('getSquares()', function() {

      it('Returns the corners of TestCase1', function () {
      corners1 = screenReading.getSquares(matrix1,1)
      assert.isTrue(checkLenghtSquares(corners1), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 77, y: 24 },
              { x: 24, y: 60 },
              { x: 24, y: 24 },
              { x: 77, y: 59 }
            ]
          ],
          corners1),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCase2', function() {
      corners2 = screenReading.getSquares(matrix2,1)
      assert.isTrue(checkLenghtSquares(corners2), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 71, y: 39 },
              { x: 48, y: 60 },
              { x: 30, y: 43 },
              { x: 48, y: 25 }
            ],
          ],
          corners2),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCase3', function() {
      corners3 = screenReading.getSquares(matrix3,1)
      assert.isTrue(checkLenghtSquares(corners3), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 50, y: 37 },
              { x: 6, y: 69 },
              { x: 34, y: 75 },
              { x: 19, y: 41 }
            ],
          ],
          corners3),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCase4', function() {
      corners4 = screenReading.getSquares(matrix4,1)
      assert.isTrue(checkLenghtSquares(corners4), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 77, y: 24 },
              { x: 24, y: 60 },
              { x: 25, y: 24 },
              { x: 77, y: 59 }
            ],
          ],
          corners4),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCaseSmall', function() {
      cornersSmall = screenReading.getSquares(matrixSmall,1)
      assert.isTrue(checkLenghtSquares(cornersSmall), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 67, y: 32 },
              { x: 67, y: 65 },
              { x: 33, y: 65 },
              { x: 33, y: 32 }
            ],
          ],
          cornersSmall),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCaseMoreScreens', function() {
      cornersMoreScreens = screenReading.getSquares(matrixMoreScreens,1)
      assert.isTrue(checkLenghtSquares(cornersMoreScreens), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 57, y: 45 },
              { x: 58, y: 12 },
              { x: 19, y: 41 },
              { x: 19, y: 12 }
            ],
            [
              { x: 77, y: 56 },
              { x: 77, y: 82 },
              { x: 47, y: 64 },
              { x: 51, y: 81 }
            ],
            [
              { x: 29, y: 60 },
              { x: 29, y: 77 },
              { x: 9, y: 61 },
              { x: 11, y: 76 }
            ]
          ],
          cornersMoreScreens),
        'Corners are withing margen of correction.'
      );
    });

    it('Returns the corners of TestCaseMoreScreens2', function() {
      cornersMoreScreens2 = screenReading.getSquares(matrixMoreScreens2,1)
      assert.isTrue(checkLenghtSquares(cornersMoreScreens2), "length of squares is 4")
      assert.isTrue(checkMultipleSquares(
          [
            [
              { x: 40, y: 29 },
              { x: 11, y: 27 },
              { x: 14, y: 10 },
              { x: 37, y: 13 }
            ],
            [
              { x: 46, y: 47 },
              { x: 94, y: 28 },
              { x: 93, y: 48 },
              { x: 50, y: 27 }
            ],
            [
              { x: 48, y: 55 },
              { x: 14, y: 49 },
              { x: 33, y: 36 },
              { x: 28, y: 67 }
            ],
            [
              { x: 87, y: 88 },
              { x: 96, y: 72 },
              { x: 71, y: 75 },
              { x: 78, y: 62 }
            ],
            [
              { x: 41, y: 73 },
              { x: 37, y: 87 },
              { x: 25, y: 72 },
              { x: 25, y: 83 }
            ],
            [
              { x: 46, y: 93 },
              { x: 65, y: 92 },
              { x: 64, y: 76 },
              { x: 47, y: 77 }
            ]
          ],
          cornersMoreScreens2),
        'Corners are withing margen of correction.'
      );
      });
      /*
      it('Test diffrent colors', function () {
          var matrix = [colorMatrix1,colorMatrix2]
          var screens = [[[23, 31, 39],
                          [20, 25, 33],
                          [36, 47, 15]]]
          screens[0]['cornBorder'] = 34
          screens[0]['sideBorder'] = 27
          var colorComb = {
              23: {
                  screen: 0,
                     col: 0,
                     row: 0
              },
              31: {
                  screen: 0,
                     col: 1,
                     row: 0
              },
              39: {
                  screen: 0,
                     col: 2,
                     row: 0
              },
              20: {
                  screen: 0,
                     col: 0,
                     row: 1
              },
              25: {
                  screen: 0,
                     col: 1,
                     row: 1
              },
              33: {
                  screen: 0,
                     col: 2,
                     row: 1
              },
              36: {
                  screen: 0,
                     col: 0,
                     row: 2
              },
              47: {
                  screen: 0,
                     col: 1,
                     row: 2
              },
              15: {
                  screen: 0,
                     col: 2,
                     row: 2
              }
          }
          var result = screenReading.getScreens(matrix, screens, colorComb, 6)
          console.log(result)
          for (var i in result){
            console.log('square #'+i, result[i])
            console.log('screen from #'+i, screenReading.getScreenFromSquare(result[i], 3, 3))
          }
        });
          */
  });
  describe('findScreens', function() {

    it('Returns the corners of TestCase1', function() {
      var squares = screenReading.getScreens(matrixes1, screens1, colorCombs1, 6)
      console.log("found " + squares.length + " of the 6 squares")
      var solutionScreens = {1: [
        { x: 655, y: 220 },
        { x: 657, y: 428 },
        { x: 35, y: 427 },
        { x: 47, y: 185 }
      ]}
      for (sq of squares){
        assert.isTrue(compareScreens(screenReading.getScreenFromSquare(sq, screens1), solutionScreens[sq.square.screen]))
      }
    })
    it('Returns the corners of TestCase2', function() {
      var squares = screenReading.getScreens(matrixes2, screens2, colorCombs2, 6)
      console.log("found " + squares.length + " of the 36 squares")
      var solutionScreens = {1: [
        { x: 333, y: 202 },
        { x: 341, y: 297 },
        { x: 46, y: 291 },
        { x: 50, y: 196 }
      ], 3: [
        { x: 341, y: 334 },
        { x: 345, y: 425 },
        { x: 28, y: 431 },
        { x: 36, y: 328 }
      ], 4: [
        { x: 625, y: 334 },
        { x: 613, y: 417 },
        { x: 356, y: 417 },
        { x: 356, y: 334 }
      ]}
      for (let sq of squares){
        assert.isTrue(compareScreens(screenReading.getScreenFromSquare(sq, screens2), solutionScreens[sq.square.screen]))
      }
    })
    it('Returns the corners of TestCase3', function() {
      var squares = screenReading.getScreens(matrixes3, screens3, colorCombs3, 6)
      console.log("found " + squares.length + " of the 24 squares")
      var solutionScreens = {1: [
        { x: 345, y: 206 },
        { x: 345, y: 297 },
        { x: 36, y: 279 },
        { x: 46, y: 188 }
      ], 2: [
        { x: 611, y: 221 },
        { x: 603, y: 302 },
        { x: 372, y: 297 },
        { x: 370, y: 211 }
      ], 3: [
        { x: 339, y: 332 },
        { x: 335, y: 423 },
        { x: 36, y: 427 },
        { x: 40, y: 326 }
      ]}
      for (let sq of squares){
        assert.isTrue(compareScreens(screenReading.getScreenFromSquare(sq, screens2), solutionScreens[sq.square.screen]))
      }
    })
      it('Returns the corners of TestCase4', function () {
          var squares = screenReading.getScreens(matrixes4, screens4, colorCombs4, 6)
          console.log(squares)
    })
  })
});
