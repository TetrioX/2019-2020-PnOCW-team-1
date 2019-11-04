const delaunay = require('./delaunay')
const geometry = require('./geometry')
const merge = require('./Merge')
const triangulate = require('./triangulate')



var pointz = []
var pointsOnLine = [[1,1], [2,2], [3,3], [4,4], [0,1]]
var pointsCircle = [[0,1], [1,0], [-1, 0], [0,-1], [1,2]]
geometry.sortPoints(pointsOnLine)
geometry.sortPoints(pointsCircle)

console.log("____________")
var res1 = delaunay.Delaunay(pointsOnLine)
for(let ind1=0; ind1 < pointsOnLine.length; ind1++){
    var pt1 = pointsOnLine[ind1]
    console.log(pt1, ":", res1[pt1].toArray())
}
console.log("____________")
console.log("____________")
var res = delaunay.Delaunay(pointsCircle)
for(let ind=0; ind < pointsCircle.length; ind++){
    var pt = pointsCircle[ind]
    console.log(pt, ":", res[pt].toArray())
}
console.log("____________")


function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}
var i = 0
while(i< 6){
    let x = randomInt(0, 5)
    let y = randomInt(0, 5)
    var p = [x,y]

    pointz.push(p)
    i += 1

}
/*


var counter = 0;
while(counter < 1) {
    console.log('____________________')
    console.time('test')
    const result = delaunay.Delaunay(pointsOnLine)
    console.timeEnd('test')
    console.log(pointsOnLine)
    var j = pointsOnLine[4]
    //console.log(result)
    console.log(j, ' : ',result[j].toArray())
    //console.log(linepoints[j].toArray())
    counter += 1
}

*/