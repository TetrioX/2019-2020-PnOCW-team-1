const { argv } = require('yargs')
    .count('verbose')
    .alias('v', 'verbose')
    .boolean('get-screen')
const fs = require('fs')
const screenReading = require('../screenReading.js');
const readImage = require('../readImage.js')
const tresholdPath = './tresholds'
const resultPath = './results/results0.json'
const { performance } = require('perf_hooks');
let verbose = argv.verbose;
let getScreen = argv['get-screen']
let useMatrix = argv['use-matrix']
let iters = argv['iters']

let testcases = [];
let tresholdPaths = [];

async function main(){
    if (require.main === module) {
        if (argv._.length < 1) {
            console.log(`Usage: node ${argv.$0} PATH1 PATH2 ...`)
            console.log('runs the screen recognition test case in a given paths')
            console.log('test cases are run after each other.')
        } else {
            tresholdPaths = fs.readdirSync(tresholdPath)
            for (let j = 10; j < tresholdPaths.length; j++) {
                let tresholds = parseJsonFile(tresholdPath + '/' + tresholdPaths[j])
                getCasesPaths(argv._.toString())
                for (let i = 0; i < testcases.length; i++) {
                    var currentCase = argv._ + '/' + testcases[i]
                    console.log('current case: ', currentCase)
                    let result = await runTestCase(currentCase, tresholds, getScreen = getScreen, testcases[i], j)

                }
            }
        }
    }
}
function createNewRanges(){
    let n = fs.readdirSync(tresholdPath).length
    let tresholds = {
        1: [320, 30],
        2: [31, 77],
        3: [80, 174],
        4: [174, 200],
        5: [200, 270],
        6: [275, 320]
    }
    fs.writeFile(tresholdPath + '/tresholds' +  n.toString() + '.json', JSON.stringify(tresholds), (err) => {if (err) console.log(err)})
}

function writeToJson(tresh, cse, scr, sq, tme){
    fs.readFile(resultPath, function readFileCallback(err, data){
        if (err){
            console.log('Whoooops error, this is the data variable: ',data)
            console.log('aaaand this is the type of the data variable: ',typeof data)
            console.log('aaaaand this is the error it gives: ', err);
        } else{
            var dct = JSON.parse(data);
            if( !(tresh in  dct)){
                dct[tresh] = [];
            }
            var newElement = {
                "caseNB": cse,
                "screensFound": scr,
                "squaresFound": sq,
                "time":tme
            }
            if( dct[tresh].filter(csnb => csnb.caseNB === cse).length == 0) {
                dct[tresh].push(newElement);
                fs.writeFile(resultPath, JSON.stringify(dct), (err) => {
                    if (err) console.log(err)
                })
            }
        }
    })
}

function getCasesPaths(folder){
    testcases = fs.readdirSync(folder)
    removeElemFromArray(testcases, '.DS_Store')
}
function getTresholdPaths(folder){
    tresholdPaths = fs
}
function parseJsonFile(path){
    var contents = fs.readFileSync(path);
    return JSON.parse(contents);
}
function removeElemFromArray(arr, elem){
    for(var i = arr.length - 1; i >= 0; i--) {
        if(arr[i] === elem) {
            arr.splice(i, 1);
        }
    }
}
function runTestCase(paths, tresholds, getScreen=false, caseNb, treshNb) {
    let path = paths;
    //let results = paths.map(function (path) {
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
            let t0 = performance.now()
            let squares = screenReading.getScreens(matrixes, screens, colorCombs, iters, tresholds)
            result.squares = squares;
            if(verbose > 1){
                //console.log('nb squares found: ', squares.length)
                //console.log("squares:", squares)
            }
            else if (verbose) console.log("found " + squares.length/(iters + 1) + " squares")
            if (getScreen) {
                let screenPositions = screenReading.getScreenFromSquares(squares, screens)
                let t1 = performance.now()
                result.screenPositions = screenPositions;
                var endResults = {
                    'nb squares found': squares.length,
                    'nb screens found': Object.keys(screenPositions).length
                }
                writeToJson(treshNb, caseNb, Object.keys(screenPositions).length, squares.length,t1-t0)
                console.log('tresh number: ', treshNb)
                //console.log('results: ', endResults)
            }
            resolve(result)
        })
    return results
}

main()
//createNewRanges()