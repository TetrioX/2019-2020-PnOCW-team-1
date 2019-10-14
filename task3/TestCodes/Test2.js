const tests = require('./Test.js')
const fs = require('fs')          // file system operations
const sharp = require('sharp')    // image processing
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions

let verbose = argv.verbose;





const testMaster = function(){
	tests.testSlave()
	console.log(tests.testSlave().testInteger)
	return 0
}

let result = testMaster()
	// The following line will not print first, but almost... This is what you should
    // understand if you have studied how call backs, promises and async/await work.
    // Alternatively we pass in buffers of image data directly:
    //let imgs = argv._.map( f => { return fs.readFileSync(f) } )
    //doImgDiff(imgs, argv['same-size']).catch(console.error)