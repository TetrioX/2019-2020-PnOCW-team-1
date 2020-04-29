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
    console.log(argv._)
    console.log(typeof  argv._)
      let result = runTestCase(argv._, getScreen=getScreen)
  }
}


function parseJsonFile(path){
  var contents = fs.readFileSync(path);
  return JSON.parse(contents);
}

async function runTestCase(paths, getScreen=false) {
  console.log('paths= ', paths)
  let results = paths.map(function (path) {
    console.log('path= ', path, typeof path)
    return new Promise(async function(resolve, reject){
      let result = {}
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
      result.matrixes = matrixes;
      colorCombs = parseJsonFile(path + '/colorCombs.json')
      result.colorCombs = colorCombs;
      screens = parseJsonFile(path + '/screens.json')
      result.screens = screens;
      let squares = screenReading.getScreens(matrixes, screens, colorCombs, iters)
      result.squares = squares;
      if(verbose > 1){
        console.log('nb squares found: ', squares.length)
        //console.log("squares:", squares)
      }
      else if (verbose) console.log("found " + squares.length/(iters + 1) + " squares")
      if (getScreen){
        let screenPositions = screenReading.getScreenFromSquares(squares, screens)
        result.screenPositions = screenPositions;
        if(verbose) console.log("screens:", screenPositions)
      }
      resolve(result)
    })
  })
  results =  await Promise.all(results)
  return results
}
