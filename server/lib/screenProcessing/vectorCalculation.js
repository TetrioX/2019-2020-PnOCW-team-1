const testCase = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,0,0,0],[0,0,0,0,0,0,0,0,0,0]]

const vectorCalc = function(matrix) {
	console.log("Matrix: ", matrix)

	startPixel = firstWhite(matrix)
	if (startPixel == undefined) return 0

	calcPixelHor = startPixel // startWhiteHor(matrix, startPixel)

	console.log("Starting pixel value: ", startPixel, " ", calcPixelHor)
	check = false
	angle = 0

	while (true) {
		x = calcPixelHor.x
		y = calcPixelHor.y

		while (Math.sqrt( x**2 + y**2) < matrix[0].length) {
			x += 1
			y = Math.round((x - calcPixelHor.x) * Math.tan(angle) + calcPixelHor.y)
			console.log("X en Y values: ", x, " ", y, " -> ", matrix[y][x], ". Under: ", matrix[y+1][x])
			if(matrix[y][x] != 1) {
				console.log(x - calcPixelHor.x)
				if (matrix[y+1][x] == 1 && x - calcPixelHor.x > 2) angle += Math.atan(1/(x - calcPixelHor.x))
				else if (matrix[y+1][x] == 1 && x - calcPixelHor.x <= 2) { angle += Math.PI / 8; console.log("hallo")}
				else check = true
				break
			}
		}

		console.log(angle)

		if (check) break
	}

	return { startPixel: startPixel, horAngle: angle }
}

const firstWhite = function(matrix) {
	for (let j = 0; j < matrix.length; j++) {
        for (let i = 0; i < matrix[0].length; i++) {
            if (matrix[j][i] == 1) {
                return { x: i, y: j }
            }
        }
    }
}

function updateScreen(currentCorners, vectors, outlierRatio=0.5, maxIters=10000, stepSize=0.01) {
	nbOfNonOutliers = Math.max(4, vectors.length*(1-outlierRatio))
	// x' = a*x + b*y + c
	// y' = d*x + e*y + f
	let a = 1
	let b = 0
	let c = 0
	let d = 0
	let e = 1
	let f = 0
	let i = 0
	while (i < maxIters){
		// calculate log(cosh(a*x + b*y + c - x')) gradient
		let ga = []
		let gb = []
		let gc = []
		let gd = []
		let ge = []
		let gf = []
		for (vec of vectors){
			val1 = Math.tanh(a*vec[0].x + b*vec[0].y + c - vec[1].x)
			val2 = Math.tanh(d*vec[0].x + e*vec[0].y + f - vec[1].y)
			ga.push(vec[0].x*val1)
			gb.push(vec[0].y*val1)
			gc.push(val1)
			gd.push(vec[0].x*val2)
			ge.push(vec[0].y*val2)
			gf.push(val2)
			// console.log(ga, gb, gc, gd, ge, gf)
		}
		if (i > maxIters/2){
			// remove outliers
			ga.sort()
			gb.sort()
			gc.sort()
			gd.sort()
			ge.sort()
			gf.sort()
			ga = ga.slice(0, nbOfNonOutliers)
			gb = gb.slice(0, nbOfNonOutliers)
			gc = gc.slice(0, nbOfNonOutliers)
			gd = gd.slice(0, nbOfNonOutliers)
			ge = ge.slice(0, nbOfNonOutliers)
			gf = gf.slice(0, nbOfNonOutliers)
		}
		ga = ga.reduce((a, b) => a + b, 0) // sum
		gb = gb.reduce((a, b) => a + b, 0)
		gc = gc.reduce((a, b) => a + b, 0)
		gd = gd.reduce((a, b) => a + b, 0)
		ge = ge.reduce((a, b) => a + b, 0)
		gf = gf.reduce((a, b) => a + b, 0)
		let step = stepSize
		// update values
		a -= ga*step
		b -= gb*step
		c -= gc*step
		d -= gd*step
		e -= ge*step
		f -= gf*step
		i++
	}
	console.log(a, b, c, d, e, f)
	return currentCorners.map((corn) => {return {x: a*corn.x + b*corn.y + c, y: d*corn.x + e*corn.y + f}})
}



const startWhiteHor = function(matrix, coordinate) {
	// assert(coordinate.length == 2)

	for (let i = 0; i < matrix[0].length / 25; i++)
		if (matrix[coordinate.y][coordinate.x + i] == 0) return { x: coordinate.x + Math.ceil(i/2), y: coordinate.y }
	return { x: coordinate.x + Math.ceil(4), y: coordinate.y }
}

// let result = vectorCalc(testCase)
// console.log(result)


// tests
/*
currentCorners = [{x:5, y:5}, {x:10, y:10}, {x:10, y:5}, {x:5, y:10}]
vectors = [[{x:1, y:1}, {x:2, y:2}], [{x:3, y:4}, {x:4, y:5}], [{x:10, y:1}, {x:11, y:2}]]
console.log(updateScreen(currentCorners, vectors))
*/


module.exports = {
	vectorCalc: vectorCalc,
	updateScreen: updateScreen
};
