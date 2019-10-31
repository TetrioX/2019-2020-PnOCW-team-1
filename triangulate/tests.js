const delaunay = require('./delaunay')

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


var counter = 0;
while(counter < 1) {
    console.log('____________________')
    console.time('test')
    const result = delaunay.Delaunay(pointz)
    console.timeEnd('test')
    var j = pointz[0]
    console.log(pointz)
    console.log(result[j].toArray())
    counter += 1
}