

const fs = require('fs')          // file system operations
const sharp = require('sharp')    // image processing
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
const scrread = require('./screenReading.js');
const imgproc = require('./imageProcessing.js');


let verbose = argv.verbose;

if(argv._.length < 2) {
    console.log(`Usage: node ${argv.$0} [--same-size] [--verbose] FILE1 FILE2 ...`)
    console.log('Output pixel difference of FILE(k) and FILE(k+1) in diff-k.png.')
    console.log('If --same-size is present then all inputs must have the same size.')
} else {
    // Note: we are calling an 'async' function, so we need to catch errors by
    // attaching an error handler to the promise:
    let result = findScreen(argv._, argv['same-size']).catch(console.error)
	// The following line will not print first, but almost... This is what you should
    // understand if you have studied how call backs, promises and async/await work.
    if(verbose) console.log('0. result =', result)
    // Alternatively we pass in buffers of image data directly:
    //let imgs = argv._.map( f => { return fs.readFileSync(f) } )
    //doImgDiff(imgs, argv['same-size']).catch(console.error)
}


/**
 * Load images from disk or buffer and save pair-wise differences to disk.
 *
 * @param   {(Buffer|String)[]}     imgs    Ordered list of file names of
 *                                          images or buffers containing image
 *                                          data.
 *
 * @return  
 *
 * @pre     imgs.length > 0
 *
 * Note that this function is declared 'async', therefore it will return a
 * promise and this makes it that inside this function we can use 'await' to
 * wait for promises.
 * This makes the code a bit more readable: whenever there is an 'await', we
 * know that the next line will only be executed once the promises we are
 * awaiting on have settled, at the same time we are giving the Node.js event
 * loop the time to do other things.
 */
async function findScreen(imgs, demand_same_size=false) {

    assert(imgs.length > 0)
	
	const diff = await imgproc.doImgDiff(imgs, demand_same_size)
	if (verbose) console.log("0. Resultaat image processing = ", diff)

    // At this point we finally have all the pixel data in our buffers and so we can
    // finally call our algorithm to calculate pixel differences:
	for(let i = 0; i < diff.buffers.length; ++i) {
		// We store the output in the array of the first image.
        // We could create a new Buffer by doing 'let new_buffer = Buffer.alloc(n)'.
		console.log("loop ", i)
		assert(buffers[i].length == diff.dimensions.width * diff.dimensions.height)
		scrread.screenReading(diff.buffers[i], diff.dimensions)
  
    }

    return 0
}