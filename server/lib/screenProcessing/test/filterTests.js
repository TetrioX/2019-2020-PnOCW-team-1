const { argv } = require('yargs')
    .count('verbose')
    .alias('v', 'verbose')
    .boolean('get-screen')
const fs = require('fs')
const screenReading = require('../screenReading.js');
const readImage = require('../readImage.js')




let verbose = argv.verbose;
let getScreen = argv['get-screen']
let useImages = argv['use-images']
let useFilters = argv['use-filter']

const filters = ['','/gauss', '/median', '/mean', '/scaled_0.75', '/scaled_0.50','/scaled_0.25' ,'/scaled_0.10']

console.log(argv)
console.log(useFilters)

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
        for (let fil of filters){
            if(verbose > 1) console.log("---starting test case---")
            if (useImages){
                images = []
                for (let i = 0; i < useImages; i++){
                    images.push(path + fil +`/image-${i}.png`)
                }
                matrixes = await readImage.getImagesHslMatrix(images)
            } else matrixes = parseJsonFile(path + '/matrixes.json')
            colorCombs = parseJsonFile(path + '/colorCombs.json')
            screens = parseJsonFile(path + '/screens.json')
            let squares = screenReading.getScreens(matrixes, screens, colorCombs)
            if(verbose >= 1) {
               // console.log("squares:", squares)
                console.log('Filter used: ', fil)
                console.log('nb squares found: ', squares.length)
            }
            if (getScreen){
                let screenPositions = screenReading.getScreenFromSquares(squares, screens)
                if(verbose >= 1) console.log("screens found: ", screenPositions)
            }
        }
    }
    return
}
