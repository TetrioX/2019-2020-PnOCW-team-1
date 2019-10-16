

const screenReading = function(buff, dimensions) {
	endWhite = 0
	startWhite = 0
	onWhite = true
	result = []
	
	for(let i = 0; i < buff.length; i++) {
		
		if (buff[i] > 100) if (!onWhite) { 
		result.push(i - endWhite)
		startWhite = i; 
		onWhite = true
		}
		if (buff[i] <= 100) if (onWhite) { 
		result.push(i - startWhite)
		endWhite = i
		onWhite = false
		}
	}

	console.log(" ", result)
	
}	

// To make the function accesible in other .js files
module.exports = {
	screenReading: screenReading
};