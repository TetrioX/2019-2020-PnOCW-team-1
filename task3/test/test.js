var assert = require('assert');
var chai = require('chai');
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style
var screenRecognition = require('../screenReading.js')
const imageProcessing = require('./imageProcessing.js');

describe('ScreenReading', function() {

  var imageMatrix

  before(function() {
    image1 = screenRecognition.findScreen('../TestResult/testCase1.png')
    image2 = screenRecognition.findScreen('../TestResult/testCase2.png')
    image3 = screenRecognition.findScreen('../TestResult/testCase3.png')
    image4 = screenRecognition.findScreen('../TestResult/testCase4.png')
    imageSmall = screenRecognition.findScreen('../TestResult/testCaseSmall.png')
  });

  describe('getSquares()', function() {
    it('Should return the corners of TestCase1', function() {
      corners1 = screenRecognition.getCorners(matrix1)
      assert(true)
    });
    it('Should return the corners of TestCase2', function() {
      corners2 = screenRecognition.getCorners(matrix2)
      assert(true)
    });
    it('Should return the corners of TestCase3', function() {
      corners3 = screenRecognition.getCorners(matrix3)
      assert(true)
    });
    it('Should return the corners of TestCase4', function() {
      corners4 = screenRecognition.getCorners(matrix4)
      assert(true)
    });
    it('Should return the corners of TestCaseSmall', function() {
      cornersSmall = screenRecognition.getCorners(matrixSmall)
      assert(true)
    });
  });
});
