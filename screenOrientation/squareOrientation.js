
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions

const getSquareOrientation = function(corners) {
	assert(corners.length == 4)
	
}

const getCornerPositions = function(corners) {
	dict = {}
	dict.A = corners.reduce((A, corner) => corner.y < A.y || corner.y == A.y && corner.x < A.x ? corner : A);
	dict.B = corners.reduce((B, corner) => getCos(dict.A, corner) > getCos(dict.A, B) ? corner : B);
	dict.D = corners.reduce((D, corner) => getCos(dict.A, corner) < getCos(dict.A, D) ? corner : D);
	dict.C = corners.reduce((C, corner, corners) => ! Object.values(dict).includes(corner) ? corner : C);
	return dict
}

const getCos = function(pos1, pos2) {
	return (pos2.x - pos1.x)/Math.sqrt((pos2.x - pos1.x)**2 + (pos2.y - pos1.y)**2)
}


testCorners = [{x:3,y:4},{x:7,y:2},{x:1,y:9},{x:5,y:6}]

result = getCornerPositions(testCorners)
console.log(result)
