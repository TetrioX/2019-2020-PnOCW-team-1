const { argv } = require('yargs')
                .count('verbose')
                .alias('v', 'verbose')
                .boolean('get-screen')
const fs = require('fs')
const screenReading = require('../screenReading.js');
const imgprcssrgb = require('../../ImageProcessingHSL/imageProcessingHSL.js')

let verbose = argv.verbose;
let getScreen = argv['get-screen']
let useImages = argv['use-images']

if (require.main === module) {
  if(argv._.length < 1) {
      console.log(`Usage: node ${argv.$0} PATH1 PATH2 ...`)
      console.log('runs the screen recognition test case in a given paths')
      console.log('test cases are run after each other.')
  } else {
      let result = runTestCase(argv._, argv['same-size'])
  }
}


function parseJsonFile(path){
  var contents = fs.readFileSync(path);
  return JSON.parse(contents);
}

async function runTestCase(paths) {
  for (let path of paths){
    if(verbose > 1) console.log("---starting test case---")
    if (useImages){
      images = []
      for (let i = 0; i < useImages; i++){
        images.push(path+`/image-${i}.png`)
      }
      matrixes = await imgprcssrgb.doImgDiff(images, false, false)
      matrixes = matrixes.matrix
    } else matrixes = parseJsonFile(path + '/matrixes.json')
    colorCombs = parseJsonFile(path + '/colorCombs.json')
    screens = parseJsonFile(path + '/screens.json')
    let squares = screenReading.getScreens(matrixes, screens, colorCombs, 6)
    if(verbose >= 1) console.log("squares:", squares)
    if (getScreen){
      let screenPositions = screenReading.getScreenFromSquares(squares, screens)
      if(verbose >= 1) console.log("squares:", screenPositions)
    }
  }
  return
}
