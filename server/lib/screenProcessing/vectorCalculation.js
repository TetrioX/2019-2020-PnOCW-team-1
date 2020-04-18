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

function updateScreen(currentCorners, vectors, maxIters=10000, stepSize=0.01) {
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
		// calculate log(cosh) gradient
		let ga = 0
		let gb = 0
		let gc = 0
		let gd = 0
		let ge = 0
		let gf = 0
		for (vec of vectors){
			val1 = Math.tanh(a*vec[0].x + b*vec[0].y + c - vec[1].x)
			val2 = Math.tanh(d*vec[0].x + e*vec[0].y + f - vec[1].y)
			ga += vec[0].x*val1
			gb += vec[0].y*val1
			gc += val1
			gd += vec[0].x*val2
			ge += vec[0].y*val2
			gf += val2
			// console.log(ga, gb, gc, gd, ge, gf)
		}
		let norm = Math.sqrt(ga**2 + gb**2 + gc**2 + gd**2 + ge**2 + gf**2)
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
