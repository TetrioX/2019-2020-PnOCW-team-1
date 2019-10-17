const fs = require('fs')          // file system operations
const { argv } = require('yargs') // command line arguments
    .count('verbose')
    .alias('v', 'verbose')
const assert = require('assert')  // asserting pre-conditions



 scrread = require('./screenReading.js')// Importeer exporte functies uit screenReading.js



let verbose = argv.verbose;

const testCasesImageProcessing = function () {
    console.log("Hallo")
    buffer = Buffer.alloc()
	dimensions = {}
	scrread.screenReading(buffer, dimensions) // gebruik van de geimporteerde functie

}



let result = testCasesImageProcessing()
