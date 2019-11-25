const delaunay = require('./delaunay')
const geometry = require('./geometry')
const merge = require('./Merge')
const triangulate = require('./triangulate')



var pointz = []
var pointsOnLine = [[1,1], [2,2], [3,3], [4,4], [0,1]]
var pointsCircle = [[0,1], [1,0], [-1, 0], [0,-1], [1,2]]
geometry.sortPoints(pointsOnLine)
geometry.sortPoints(pointsCircle)

/*
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
*/

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}
var i = 0
while(i< 100) {
    let x = randomInt(0, 1000)
    let y = randomInt(0, 1000)
    var p = [x, y]

    pointz.push(p)
    i += 1
}
    const list1 = [[1, 3], [5, 0], [5, 3], [3, 3], [0, 1], [4, 2], [1, 2], [1, 0], [5, 1], [2, 1]];
    var list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0], [0, 1]];

//Genereert random lijst van vertices
    function randomVertices(n) {
        let vertices = [];
        for (var i = 0; i < n; i++) {
            vertices.push([Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)])
        }
        return vertices;

    }

    const ptsLine = [[0,0], [1,1], [2,2], [3,3]]
    console.log("line")
    let li = ptsLine[1]
    console.log(delaunay.Delaunay(ptsLine)[li].toArray())


    var counter = 0;
    while(counter < 10) {
        console.log('____________________')
        console.time('test')
        const result = delaunay.Delaunay(pointz)
        console.timeEnd('test')
        //console.log(pointz)
        var j = pointz[4]
        //console.log(result)
        console.log(j, ' : ',result[j].toArray())
        //console.log(linepoints[j].toArray())
        counter += 1
    }



    const pointsonline = [[0, 0], [1, 1], [3, 3], [2, 2]];
//console.log(geometry.pointsOnLine(threepointsoneline));

    const test_triangulate = function (points) {
        const n = 0;
        var pointz = randomVertices(n);
        var counter = 0;
        while (counter < 1) {
            console.log('____________________');
            console.time('test');
            const result = delaunay.Delaunay(pointz);
            console.timeEnd('test');
            var j = pointz[0];
            console.log(pointz);
            console.log(result);
            for (let i = 0; i < points.length; i++) {
                console.log(pointz[i], " || ", result[pointz[i]].toArray());
            }
            counter += 1
        }
    }

//randomlist
//test_triangulate(100);

//list1
//test_triangulate(list1);

//list2
//test_triangulate(list2);
