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
    const extend = 1000 //The number of pixels we want in the largest dimension.
    // We know there is at least one image because of the assert above...
    const w_orig = imgs_metas[0].width
    const h_orig = imgs_metas[0].height
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

    // Return buffers of pixel data (single channel gray scale, rescaled, apply filters).
    const tempResult_promises = imgs_data.map( sharp_img => {
        return sharp_img
                 .grayscale()
                 .toColorspace('b-w')
                 .resize(new_size)
                 .normalize()
                 .blur() // note: blur after resize...
                 .raw()
                 .toBuffer()
    })

    // Printing shows an array of pending promises; they run in parallel by sharp.
    if(verbose) console.log('4. imgs_buffs_promises =', imgs_buffs_promises)
	if(verbose) console.log('4. imgs_buffs_promises =', tempResult_promises)

    // Barrier: 'await' will make sure all the promises have been resolved, and so all
    // pixels are available now.
    // Other code can run while sharp is dealing with the I/O to external code.
    const imgs_buffs = await Promise.all(imgs_buffs_promises)
	const tempResult = await Promise.all(tempResult_promises)

    // The promises will show as resolved:
    if(verbose > 1) console.log('5. imgs_buffs_promises =', imgs_buffs_promises)
    if(verbose > 1) console.log('6. imgs_buffs =', imgs_buffs)
	if(verbose > 1) console.log('5. imgs_buffs_promises =', tempResult_promises)
    if(verbose > 1) console.log('6. imgs_buffs =', tempResult)

    // At this point we finally have all the pixel data in our buffers and so we can
    // finally call our algorithm to calculate pixel differences:
    let to_file_promises = []
    let output_meta = { raw: { width: new_size.width, height: new_size.height, channels: 1 } }
    for(let i = 0; i < imgs_buffs.length - 1; ++i) {
		// We store the output in the array of the first image.
        // We could create a new Buffer by doing 'let new_buffer = Buffer.alloc(n)'.
        image_xor(imgs_buffs[i], imgs_buffs[i+1], tempResult[i])
        assert(imgs_buffs[i].length == new_size.width * new_size.height * 3)
		assert(tempResult[i].length == new_size.width * new_size.height)
        if(verbose > 2) console.log(`7.${i+1} result buffer =`, imgs_buffs[i])
		if(verbose > 2) console.log(`7.${i+1} result buffer =`, tempResult[i])
        // Now save this to file asynchronously, and keep the promise such that we can
        // return an array of promises.
        to_file_promises.push( sharp(tempResult[i], output_meta).toFile(`diff-${i+1}.png`) )
    }
    if(verbose) console.log('8. to_file_promises =', to_file_promises)

    // If we put an await here, then the first console.log in the main code will still
    // print a promise... Can you figure out why?
    //const to_files = await Promise.all(to_file_promises)
    //console.log('9. to_files = ', to_files) // Prints file names and sizes etc...

    return to_file_promises
}

// The following function should actually be in some separate file...
/**
 * Calculate some pixel based difference between the input arrays-of-integers.
 *
 * @param {Buffer} buff1 Input buffer 1.
 * @param {Buffer} buff2 Input buffer 2.
 * @param {Buffer} buff3 Output buffer.
 *
 * @pre buff1.length == buff2.length == buff3.length
 *
 * @note All arguments are allowed to alias each other since we never reuse data in the
 * for loop below.
 *
 * @see https://nodejs.org/api/buffer.html
 */
function image_xor(buff1, buff2, buff3) {
    assert(buff1.length == buff2.length)
    assert(buff1.length == 3 * buff3.length)
	for(let i = 0; i < buff1.length; i += 3) {
		lab1 = new Array(buff1[i], buff1[i+1], buff1[i+2])
		lab2 = new Array(buff2[i], buff2[i+1], buff2[i+2])

		// console.log(i, " ", lab1, " ", lab2, " ", colorDistance(lab1,lab2))

		precision = 15
        buff3[i/3] = precisionRound(colorDistance2000(lab1,lab2), precision) * 2.56
    }
}

function precisionRound(number, precision) {
	return Math.round(number / precision) * precision
}
	

function colorDistance(color1, color2) {
	kl = kc = kh = 1
	k1 = 0.045
	k2 = 0.015

	dl = color1[0] - color2[0]
	c1 = Math.sqrt(color1[1]**2 + color1[2]**2)
	c2 = Math.sqrt(color2[1]**2 + color2[2]**2)
	dc = c1 - c2
	da = color1[1] - color2[1]
	db = color1[2] - color2[2]
	dh = Math.sqrt(Math.abs(da**2 + db**2 - dc**2))
	sl = 1
	sc = 1 + k1 * c1
	sh = 1 + k2 * c1

	return Math.sqrt( (dl/(kl*sl))**2 + (dc/(kc*sc))**2 + (dh/(kh*sh))**2)


}

// returns positive modulo
function mod(n, m) {
  return ((n % m) + m) % m;
}

function colorDistance2000(color1, color2) {
  kl = kc = kh = 1

  ddifl = color1[0] - color2[0]
  l_ = (color1[0] + color2[0])/2
  c1 = Math.sqrt(color1[1]**2 + color1[2]**2)
  c2 = Math.sqrt(color2[1]**2 + color2[2]**2)
  c_ = (c1 + c2)/2
  difa1 = color1[1] + color1[1]/2*(1 - Math.sqrt(c_**2/(c_**2 + 25**7)))
  difa2 = color2[1] + color2[1]/2*(1 - Math.sqrt(c_**2/(c_**2 + 25**7)))
  difc1 = Math.sqrt(difa1**2 + color1[2]**2)
  difc2 = Math.sqrt(difa2**2 + color2[2]**2)
  difc_ = (difc1 + difc2)/2
  ddifc = difc2 - difc1
  difh1 = mod(Math.atan2(color1[2],difa1), Math.PI*2)
  difh2 = mod(Math.atan2(color2[2],difa2), Math.PI*2)
  ddifh = difh2 - difh1
  difH_ = (difh1 + difh2)/2
  
  if(Math.abs(ddifh) > Math.PI) {
    if(difh2 <= difh1) ddifh += 2 * Math.PI
    else ddifh -= 2 * Math.PI
    if (difh1 + difh2 < Math.PI*2) difH_ += Math.Pi
    else difH_ -= Math.PI
  }
  
  ddifH = 2 * Math.sqrt(difc1 * difc2) * Math.sin(ddifh/2)
  T = 1 - 0.17 * Math.cos(difH_ - Math.PI/6) + 0.24 * Math.cos(2 * difH_) + 0.32 * Math.cos(3 * difH_ + Math.PI/30) - 0.20 * Math.cos(4 * difH_ - 7/20*Math.PI)
  Sl = 1 + 0.015 * (l_ - 50)**2/Math.sqrt(20 + (l_ - 50)**2)
  Sc = 1 + 0.045 * difc_
  Sh = 1 + 0.015 * difc_ * T
  Rt = -2 * Math.sqrt(difc_**2/(difc_**2 + 25**7)) * Math.sin(Math.PI/3 * Math.exp(0-((difH_ - 55/36*Math.PI)/(5/36*Math.PI))**2))

  return Math.sqrt((ddifl/(kl*Sl))**2 + (ddifc/(kc*Sc))**2 + (ddifH/(kh*Sh))**2 + Rt*ddifc/(kc*Sc)*ddifH/(kh*Sh))
}
