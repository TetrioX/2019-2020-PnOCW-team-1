//
// Accept a number of image files, calculate pixel distance,
// search for squares on the distances and return the location.
//
// (C) 2019 PnO Team 1
//
const fs = require('fs');      // file system operations
const sharp = require('sharp');    // image processing
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose');
const assert = require('assert');  // asserting pre-conditions
const scrread = require('./screenReading.js');
const imgproc = require('./imageProcessing.js');

let verbose = argv.verbose;

// only run when this is the main program, not when it is a dependency
if (require.main === module) {
  if(argv._.length < 2) {
      console.log(`Usage: node ${argv.$0} [--same-size] [--verbose] FILE1 FILE2 ...`);
      console.log('Output pixel difference of FILE(k) and FILE(k+1) in diff-k.png.');
      console.log('Input files need to be of type image-k.png, with k a valid number.');
      console.log('If --same-size is present then all inputs must have the same size.');
  } else {
      let result = findScreen(argv._, argv['same-size']).catch(console.error);
      if(verbose) console.log('0. result =', result)
  }
}

/**
 * Load images from disk or buffer and save pair-wise differences to disk.
 *
 * @param   {(Buffer|String)[]}     imgs    Ordered list of file names of
 *                                          images or buffers containing image
 *                                          data.
 *
 * @param demand_same_size
 * @return  {}
 *
 * @pre     imgs.length > 0
 *
 */
async function findScreen(imgs, demand_same_size=false) {

    assert(imgs.length > 0);

	// We require the input files of the end code to have the structure:
	// '.\Pictures\slave-k.png', k is a valid slave number. Therefore this
	// integer can be used to connect a picture to a slave.
	const screenIds = searchID(imgs);
	if (verbose) console.log("1. Available slave Id's = ", screenIds);

	// Here we calculate the differences between the reference picture and the
	// slave differences.
	const diff = await imgproc.doImgDiff(imgs, demand_same_size);
	if (verbose) console.log("2. Result image processing = ", diff);

	// Defining the result dictionary
	let dict = {};

	for(let i = 0; i < diff.buffers.length; ++i) {
		// This assertion should always return true
		assert(diff.buffers[i].length === diff.dimensions.width * diff.dimensions.height);
		dict[screenIds[i]] = scrread.screenReading(diff.buffers[i], diff.dimensions);
		if (verbose > 1) console.log(`3.${i+1} Screen Middle = `, screenMiddle)
    }

	if (verbose) console.log("4. Return values = ", dict);

	return dict
}

/**
 * Return a list of all IDs of slave screens.
 *
 * @param 	{String[]} 		imgs 	Input string of called pictures
 *
 * @return 	{Integer[]} 	arr 	An array composed of the present slave Ids
 *
 * @pre 	typeof imgs[i][7] == integer
 *				It is required for the input images to have 'image-k.png' as name with k a valid number.
 */
function searchID(imgs) {
	let arr = [];
	for (let elem of imgs) {
		if (elem[17] === 'm') continue;
		let temp = parseInt(elem[17]);
		// assert(! isNaN(temp))
		arr.push(temp)
	}
	return arr
}

module.exports = {
	findScreen: findScreen
};
