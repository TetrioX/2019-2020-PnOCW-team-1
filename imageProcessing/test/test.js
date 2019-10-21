var assert = require('assert');
var chai = require('chai');
var assert = chai.assert;    // Using Assert style
// var expect = chai.expect;    // Using Expect style
// var should = chai.should();  // Using Should style
var screenRecognition = require('../screenRecognition.js')
const screenReading = require('../screenReading.js');

describe('findScreen', function() {

  // set timeout to 3 seconds
  this.timeout(3000)

  // allowed pixel distance
  delta = 3

  before(async function() {

    image1 = await screenRecognition.findScreen(['./TestResults/TestCase1.png'], false, true)
    image2 = await screenRecognition.findScreen(['./TestResults/TestCase2.png'], false, true)
    image3 = await screenRecognition.findScreen(['./TestResults/TestCase3.png'], false, true)
    image4 = await screenRecognition.findScreen(['./TestResults/TestCase4.png'], false, true)
    imageSmall = await screenRecognition.findScreen(['./TestResults/TestCaseSmall.png'], false, true)
    imageMoreScreens = await screenRecognition.findScreen(['./TestResults/TestCaseMoreScreens.png'],  false, true)
    imageMoreScreens2 = await screenRecognition.findScreen(['./TestResults/TestCaseMoreScreens.png'], false, true)
    matrix1 = screenReading.createMatrix(image1.buffers[0], image1.dimension)
    matrix2 = screenReading.createMatrix(image2.buffers[0], image2.dimension)
    matrix3 = screenReading.createMatrix(image3.buffers[0], image3.dimension)
    matrix4 = screenReading.createMatrix(image4.buffers[0], image4.dimension)
    matrixSmall = screenReading.createMatrix(imageSmall.buffers[0], imageSmall.dimension)
    matrixMoreScreens = screenReading.createMatrix(imageMoreScreens.buffers[0], imageMoreScreens.dimension)
    matrixMoreScreens2 = screenReading.createMatrix(imageMoreScreens2.buffers[0], imageMoreScreens2.dimension)
  });

  function checkIfCordListContainsOtherCordList(corners1, corners2){
    for (var c2 of corners2){
      var contained = false;
      for (var c1 of corners1) {
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

  describe('getSquares()', function() {

    it('Should return the corners of TestCase1', function() {
      corners1 = screenReading.getSquares(matrix1)
      assert.lengthOf(corners1[0], 4, 'number of corners is 4');
      assert.isTrue(checkIfCordListContainsOtherCordList(
          [
            { x: 77, y: 24 },
            { x: 24, y: 60 },
            { x: 24, y: 24 },
            { x: 77, y: 59 }
          ],
          corners1[0]),
        'Corners are withing margen of correction.'
      );
    });

    it('Should return the corners of TestCase2', function() {
      corners2 = screenReading.getSquares(matrix2)
      assert.lengthOf(corners2[0], 4, 'number of corners is 4')
      assert.isTrue(checkIfCordListContainsOtherCordList(
          [
            { x: 71, y: 39 },
            { x: 48, y: 60 },
            { x: 30, y: 43 },
            { x: 48, y: 25 }
          ],
          corners2[0]),
        'Corners are withing margen of correction.'
      );
    });

    it('Should return the corners of TestCase3', function() {
      corners3 = screenReading.getSquares(matrix3)
      assert.lengthOf(corners3[0], 4, 'number of corners is 4');
      assert.isTrue(checkIfCordListContainsOtherCordList(
          [
            { x: 50, y: 37 },
            { x: 6, y: 69 },
            { x: 34, y: 75 },
            { x: 19, y: 41 }
          ],
          corners3[0]),
        'Corners are withing margen of correction.'
      );
    });

    it('Should return the corners of TestCaseSmall', function() {
      cornersSmall = screenReading.getSquares(matrixSmall)
      assert.lengthOf(cornersSmall[0], 4, 'number of corners is 4');
      assert.isTrue(checkIfCordListContainsOtherCordList(
          [
            { x: 67, y: 32 },
            { x: 67, y: 65 },
            { x: 33, y: 65 },
            { x: 33, y: 32 }
          ],
          cornersSmall[0]),
        'Corners are withing margen of correction.'
      );
    });
  });
});
