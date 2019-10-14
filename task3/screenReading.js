

const screenReading = function(buff) {
	endWhite = 0
	startWhite = 0
	onWhite = true
	
	for(let i = 0; i < buff.length; i++) {
		if (buff[i] > 50) if (!onWhite) { 
		startWhite = i; 
		onWhite = true
		}
		if (buff[i] <= 50) if (onWhite) { 
		endWhite = i
		onWhite = false
		}
		
		if (onWhite && startWhite) break;
	}

	// console.log(screennr, " ", position)
	
}	

// To make the function accesible in other .js files
module.exports = {
	screenReading: screenReading
};