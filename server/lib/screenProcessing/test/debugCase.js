const { argv } = require('yargs')
                .count('verbose')
                .alias('v', 'verbose')
                .boolean('get-screen')
const fs = require('fs')
const screenReading = require('../screenReading.js');
const readImage = require('../readImage.js')

let verbose = argv.verbose;
let getScreen = argv['get-screen']
let useMatrix = argv['use-matrix']
let iters = argv['iters']

if (require.main === module) {
  if(argv._.length < 1) {
      console.log(`Usage: node ${argv.$0} PATH1 PATH2 ...`)
      console.log('runs the screen recognition test case in a given paths')
      console.log('test cases are run after each other.')
  } else {
      let result = runTestCase(argv._, getScreen=getScreen)
  }
}


function parseJsonFile(path){
  var contents = fs.readFileSync(path);
  return JSON.parse(contents);
}

async function runTestCase(paths, getScreen=false) {
  let result = {};
  for (let path of paths){
    if(verbose > 1) console.log("---starting test case---")
    if(!iters){
      iters = 0
    }
    if (!useMatrix){
      images = []
      let i = 0
      for (let file of fs.readdirSync(path)){
        if (file.startsWith('image-')){
          images.push(path+`/image-${i}.png`)
          i++
        }
      }
      matrixes = await readImage.getImagesHslMatrix(images)
    } else matrixes = parseJsonFile(path + '/matrixes.json')
    colorCombs = parseJsonFile(path + '/colorCombs.json')
    screens = parseJsonFile(path + '/screens.json')
    let squares = screenReading.getScreens(matrixes, screens, colorCombs, iters)
    result.squares = squares;
    if(verbose > 1) console.log("squares:", squares)
    else if (verbose) console.log("found " + squares.length/(iters + 1) + " squares")
    if (getScreen){
      let screenPositions = screenReading.getScreenFromSquares(squares, screens)
      result.screens = screenPositions;
      if(verbose) console.log("screens:", screenPositions)
    }
  }
  return result
}
