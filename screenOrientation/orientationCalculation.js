
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions

const sqor = require('./squareOrientation.js')
const rot = require('./rotationMatrixes.js')


const getScreens = function(screens) {
	var scrRes = {}
	for (var id in screens) 
		scrRes[id] = getOrientation(screens[id])
	return scrRes
}

const getOrientation = function(corners) {
	corners = sqor.getSquareOrientation(corners)
	console.log(corners)
	return {center: getCenter(corners), rotationMatrix : calcAngles(corners)}
}

const getCenter = function(corners) {
	values = Object.keys(corners).map(function(key){ return corners[key] })
	xValue = values.reduce((sum, element) => sum + element.x, 0)
	yValue = values.reduce((sum, element) => sum + element.y, 0)
	zValue = values.reduce((sum, element) => sum + element.z, 0)
	return { x: xValue / 4, y: yValue / 4, z: zValue / 4 }
}

const calcAngles = function(corners) {
	return rot.getRotationZ(corners)
}




testCornersXTilt = {A: {x:10,y:10,z:0}, C: {x:30,y:30,z:20}, D: {x:10,y:30,z:20}, B: {x:30,y:10,z:0}}
testCornersYTilt = {A: {x:10,y:10,z:0}, C: {x:20,y:30,z:20}, D: {x:10,y:30,z:0}, B: {x:20,y:10,z:20}}
testCornersZTilt = {A: {x:100,y:10,z:0}, C: {x:90,y:120,z:0}, D: {x:40,y:70,z:0}, B: {x:150,y:60,z:0}}

testCornersXYTilt = {A: {x:0,y:0,z:0}, C: {x:10,y:10,z:10}, D: {x:0,y:5,z:5}, B: {x:5,y:0,z:5}}

test_60 = [{x:1230,y:504},{x:1190,y:110},{x:137,y:110},{x:96,y:504}]
test40 = [{x:102,y:25},{x:1224,y:26},{x:132,y:630},{x:1195,y:630}]
test70 = [{x:95,y:204},{x:139,y:471},{x:1231,y:204},{x:1188,y:472}]
testReal = [{x:2653,y:1093},{x:2733,y:2185},{x:657,y:2313},{x:661,y:1129}]
testReal2 = [{x:1069,y:2273},{x:1089,y:1289},{x:2801,y:1268},{x:2857,y:2229}]
// testScreens = {0: test40, 1: test50}
// testCornersZTilt = [{x:100,y:10},{x:90,y:120},{x:40,y:70},{x:150,y:60}]

vectorTest = {x:4,y:0,z:0}

// console.log(getScreens(testScreens))

result = getOrientation(testReal2)
console.log(result)



// console.log(0<1<2)