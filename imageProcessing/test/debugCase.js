const { argv } = require('yargs')
                .count('verbose')
                .alias('v', 'verbose')
const fs = require('fs')
const screenReading = require('../screenReading.js');

let verbose = argv.verbose;

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

function runTestCase(paths) {
  for (let path of paths){
    if(verbose > 2) console.log("---starting test case---")
    matrixes = parseJsonFile(path + '/matrixes.json')
    colorCombs = parseJsonFile(path + '/colorCombs.json')
    screens = parseJsonFile(path + '/screens.json')
    let squares = screenReading.getScreens(matrixes, screens, colorCombs, 6)
    if(verbose > 1) console.log("squares:", squares)
  }
  return
}
