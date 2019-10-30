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
  delta = 5

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
  function checkIfCordListContainsOtherCordList(corners1, corners2){
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
        if (checkIfCordListContainsOtherCordList(sq1, sq2)){
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

  describe('getSquares()', function() {

    it('Returns the corners of TestCase1', function() {
      corners1 = screenReading.getSquares(matrix1)
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
      corners2 = screenReading.getSquares(matrix2)
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
      corners3 = screenReading.getSquares(matrix3)
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
      corners4 = screenReading.getSquares(matrix4)
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
      cornersSmall = screenReading.getSquares(matrixSmall)
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
      cornersMoreScreens = screenReading.getSquares(matrixMoreScreens)
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
      cornersMoreScreens2 = screenReading.getSquares(matrixMoreScreens2)
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
  });
});
