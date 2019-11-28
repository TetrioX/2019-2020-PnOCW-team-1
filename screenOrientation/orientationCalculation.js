const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions

const getScreenCenters = function(screens) {
  var scrRes = {}
	for (var id in screens)
		scrRes[id] = getCenter(screens[id])
  console.log(scrRes)
	return scrRes
}

const getCenter = function(corners) {
  values = corners
	xValue = values.reduce((sum, element) => sum + element.x, 0)
	yValue = values.reduce((sum, element) => sum + element.y, 0)
	return { x: xValue / 4, y: yValue / 4}
}

module.exports = {
  getScreenCenters: getScreenCenters
}
