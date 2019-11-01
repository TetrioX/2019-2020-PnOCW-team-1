const delaunay = require('./delaunay')
const geometry = require('./geometry')

const pointz = []
var i = 0
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}
while(i< 10){
    let x = randomInt(0, 10)
    let y = randomInt(0, 10)
    var p = [x,y]
    pointz.push(p)
    i += 1
}

const threepointsoneline = [[0,0], [1,1], [2,2], [3,3]];
console.log(geometry.pointsOnLine(threepointsoneline));

var counter = 0;
while(counter < 1) {
    console.log('____________________')
    console.time('test')
    const result = delaunay.Delaunay(threepointsoneline)
    console.timeEnd('test')
    var j = threepointsoneline[0]
    console.log(threepointsoneline)
    console.log(result[j].toArray())
    counter += 1
}