var assert = require('assert');
var chai = require('chai');
var fs = require('fs');
var assert = chai.assert;    // Using Assert style
// var expect = chai.expect;    // Using Expect style
// var should = chai.should();  // Using Should style
const screenReading = require('../screenReading.js');
const imgprcssrgb = require('../../ImageProcessingHSL/imageProcessingHSL.js')

describe('findscreen', function() {

  // set timeout to 3 seconds
  this.timeout(5000)

  // allowed pixel distance
  bwdelta = 3
  rgbDelta = 22

  function parseJsonFile(path){
    var contents = fs.readFileSync(path);
    return JSON.parse(contents);
  }

  before(async function() {
    var rgbCasesPath = __dirname + '/rgbTestCases'
    matrixes1 = parseJsonFile(rgbCasesPath + '/case1/matrixes.json')
    colorCombs1 = parseJsonFile(rgbCasesPath + '/case1/colorCombs.json')
    screens1 = parseJsonFile(rgbCasesPath + '/case1/screens.json')
    matrixes2 = parseJsonFile(rgbCasesPath + '/case2/matrixes.json')
    colorCombs2 = parseJsonFile(rgbCasesPath + '/case2/colorCombs.json')
    screens2 = parseJsonFile(rgbCasesPath + '/case2/screens.json')
    matrixes3 = parseJsonFile(rgbCasesPath + '/case3/matrixes.json')
    colorCombs3 = parseJsonFile(rgbCasesPath + '/case3/colorCombs.json')
    screens3 = parseJsonFile(rgbCasesPath + '/case3/screens.json')
    screens4 = parseJsonFile(rgbCasesPath + '/case4/screens.json')
    matrixes4 = await imgprcssrgb.doImgDiff([rgbCasesPath + '/case4/image-0.png', rgbCasesPath + '/case4/image-1.png'], false, false)
    matrixes4 = matrixes4.matrix
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
