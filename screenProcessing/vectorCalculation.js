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



const startWhiteHor = function(matrix, coordinate) {
	// assert(coordinate.length == 2)
	
	for (let i = 0; i < matrix[0].length / 25; i++)
		if (matrix[coordinate.y][coordinate.x + i] == 0) return { x: coordinate.x + Math.ceil(i/2), y: coordinate.y }
	return { x: coordinate.x + Math.ceil(4), y: coordinate.y }
}

// let result = vectorCalc(testCase)
// console.log(result)

module.exports = {
	vectorCalc: vectorCalc
};

