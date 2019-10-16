//
// Accept a number of image files on the command line
// do a pair-wise pixel based "difference" calculation
// save the outputs as image files diff-1, diff-2, ...
//
// Example code for doing command line calculations on images
// using Node.js and sharp.
// This example demonstrates how to handle multiple images
// from disk. Loading an image from disk happens asynchronous.
// That means that your JavaScript code will either register
// a 'call back' function which is called when the loading has
// completed, or returns a 'promise' which can attach an
// action to do when the loading has completed by using
// '.then()'. Using promises makes the code more straightforward.
// Since we are loading multiple images we will use a 'barrier'.
// A barrier is a point in the code which will yield execution
// to other events until all promises have been resolved.
//
// @see https://promisesaplus.com        The Promises/A+ standard
// @see https://github.com/lovell/sharp
// @see https://sharp.pixelplumbing.com
//
// (C) 2019 Dirk Nuyens
//


const fs = require('fs')          // file system operations
const sharp = require('sharp')    // image processing
const { argv } = require('yargs') // command line arguments
               .count('verbose')
               .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions
const imgread = require('./imageReading.js');


let verbose = argv.verbose;

if(argv._.length < 2) {
    console.log(`Usage: node ${argv.$0} [--same-size] [--verbose] FILE1 FILE2 ...`)
    console.log('Output pixel difference of FILE(k) and FILE(k+1) in diff-k.png.')
    console.log('If --same-size is present then all inputs must have the same size.')
} else {
    // Note: we are calling an 'async' function, so we need to catch errors by
    // attaching an error handler to the promise:
    let result = doImgDiff(argv._, argv['same-size']).catch(console.error)
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
 * @return  {Promise

  []}              Returns array of promises for
 *                                          saving the differences to files.
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
async function doImgDiff(imgs, demand_same_size=false) {
	
    assert(imgs.length > 0)

    // For every image in imgs we want to know width-by-height.
    const imgs_metas_data_promises = imgs.map( img => {
        let sharp_img = sharp(img)
        return sharp_img
                 .metadata()
                 .then( meta => { return { meta: meta, sharp_data: sharp_img } } )
    })
    // Printing this we see an array of pending promises; they run in parallel by sharp.
    if(verbose) console.log('1. imgs_metas_data_promises =', imgs_metas_data_promises)

    // Barrier: the 'await' will make sure that after this line the promises in imgs_meta
    // have all been resolved, and will give the chance to other code to run.
    const imgs_metas_data = await Promise.all(imgs_metas_data_promises)

    // Printing now will show the promises as been resolved.
    if(verbose > 1) console.log('2. imgs_metas_data_promises =', imgs_metas_data_promises)
    // Extract only the meta data:
    const imgs_metas = imgs_metas_data.map( ({meta, sharp_data}) => { return meta } )
    if(verbose > 1) console.log('3. imgs_metas =', imgs_metas)
    //for(let i = 0; i < imgs_metas_data_promises.length; ++i) {
    //    imgs_metas_data_promises[i].then( ({meta, sharp_data}) => {
    //          console.log('meta =', meta)
    //          console.log('data =', sharp_data)
    //    })
    //}

    // Figure out if all images are all the same size and prepare to rescale them.
    const extend = 100 //The number of pixels we want in the largest dimension.
    // We know there is at least one image because of the assert above...
    const w_orig = imgs_metas[0].width
    const h_orig = imgs_metas[0].height
	const channel = imgs_metas[0].channels
    for(let i = 0; demand_same_size && (i < imgs_metas.length); ++i) {
        if((imgs_metas[i].width != w_orig) || (imgs_metas[i].height != h_orig)) {
            throw(Error('Images should all have the same dimensions'))
        }
    }
    const new_size = { width: extend, height: extend }
    // 'x | 0' is a hack to obtain the integer part by bitwise operator |.
    if(w_orig > h_orig) new_size.height = (extend * h_orig / w_orig) | 0
    else                new_size.width  = (extend * w_orig / h_orig) | 0
    // Maybe you would want the minimum dimension to be 'extend' instead of the maximum...

    // Extract the sharp objects:
    const imgs_data = imgs_metas_data.map( ({meta, sharp_data}) => { return sharp_data } )
    // Return buffers of pixel data (single channel gray scale, rescaled, apply filters).
    const imgs_buffs_promises = imgs_data.map( sharp_img => {
        return sharp_img
                 .toColorspace('lab')
                 .resize(new_size)
                 .normalize()
                 .blur() // note: blur after resize...
                 .raw()
                 .toBuffer()
    })

    // Printing shows an array of pending promises; they run in parallel by sharp.
    if(verbose) console.log('4. imgs_buffs_promises =', imgs_buffs_promises)

    // Barrier: 'await' will make sure all the promises have been resolved, and so all
    // pixels are available now.
    // Other code can run while sharp is dealing with the I/O to external code.
    const imgs_buffs = await Promise.all(imgs_buffs_promises)

    // The promises will show as resolved:
    if(verbose > 1) console.log('5. imgs_buffs_promises =', imgs_buffs_promises)
	if(verbose > 1) console.log('6. imgs_buffs =', imgs_buffs)

    // At this point we finally have all the pixel data in our buffers and so we can
    // finally call our algorithm to calculate pixel differences:
    let tempResult = [] // Buffer list on which our output buffers will be printed
	let to_file_promises = []
    let output_meta = { raw: { width: new_size.width, height: new_size.height, channels: 1 } }
    for(let i = 0; i < imgs_buffs.length - 1; ++i) {
		tempResult.push( Buffer.alloc(new_size.width * new_size.height))
		// We store the output in the array of the first image.
        // We could create a new Buffer by doing 'let new_buffer = Buffer.alloc(n)'.
        assert(imgs_buffs[i].length == new_size.width * new_size.height * channel)
		imgread.imageReading(imgs_buffs[0], imgs_buffs[i+1], tempResult[i], channel)
		assert(tempResult[i].length == new_size.width * new_size.height)
		if(verbose > 2) console.log(`7.${i+1} result buffer =`, tempResult[i])
        // Now save this to file asynchronously, and keep the promise such that we can
        // return an array of promises.
        to_file_promises.push( sharp(tempResult[i], output_meta).toFile(`./Result/diff-${i+1}.png`) )
		
    }
	
    if(verbose) console.log('8. to_file_promises =', to_file_promises)

    // If we put an await here, then the first console.log in the main code will still
    // print a promise... Can you figure out why?
    const to_files = await Promise.all(to_file_promises) // .then(result => {return result})
    if(verbose > 2) console.log('9. to_files = ', to_files) // Prints file names and sizes etc...
	
	return {
		buffers: tempResult, 
		dimensions: { width: new_size.width, height: new_size.height }
	}
}	


// To make the function accesible in other .js files
module.exports = {
	doImgDiff: doImgDiff
};