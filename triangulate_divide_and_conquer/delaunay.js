const geometry = require('./geometry');
const triangulate = require('./triangulate')
const merge = require('./Merge')

function sortPoints(points) {
    points.sort(function (item1, item2) {
        if (item1[0] !== item2[0]) {
            return item1[0] - item2[0];
        } else
            return item1[1] - item2[1];
    });
}



function getAngles(slaves){
    var result = {}
    var coords = []
    var temp = {}


    for(var id in slaves){
        var X = slaves[id].x
        var Y = slaves[id].y

        var point = [X,Y]

        coords.push(point)
        temp[point] = id

    }

    /*
    slaves.forEach(function (id){
        var X = slaves[id].center.x
        var Y = slaves[id].center.y
        var point = [X,Y]
        coords.push(point)
    }) */
    var triangulation = Delaunay(coords)
    coords.forEach(function (pt){
        var angles = []
        var currentId = temp[pt]
        var connections = triangulation[pt].toArray()
        for(var ind=0;ind < connections.length; ind++){


            var angleBetween = geometry.angleBetweenPoints(pt, connections[ind])

            angles.push(angleBetween)
            console.log(currentId)
            result[currentId] = angles
        }

    })
    return result

}

function getConnections(slaves){
    var result = {}
    var coords = []

    for(var id in slaves){
        var X = slaves[id].x
        var Y = slaves[id].y

        var point = [X,Y]

        coords.push(point)
    }

    var triangulation = Delaunay(coords)
    for (var i in coords) {
        result[Object.keys(slaves)[i]] = triangulation[pt].toArray()
    })
    console.log(result)
    return result
}

function Delaunay(pts){
    adj = {}
    geometry.sortPoints(pts)
    if(geometry.pointsOnLine(pts) && pts.length > 3){
        for(let i=1; i < pts.length; i++){
            triangulate.triangulate2(adj, pts[i-1], pts[i])

        }


        return adj
    }

    delaunay(pts, adj, 0, pts.length -1)
    return adj
}

function delaunay(pts, adj, l, r){
    const diff = r - l;

    if(pts.length < 1){
        return
    }
    if(diff === 1){
        return triangulate.triangulate2(adj, pts[l], pts[r])
    }
    if(diff === 2){
        return triangulate.triangulate3(adj, pts[l], pts[l+1], pts[r])
    }

    const m = l + ((r-l) >>> 1)
    const m2 = m+1


    delaunay(pts, adj, l, m)
    delaunay(pts, adj, m2, r)


    const [L,R] = geometry.findLowerCommonTangent(adj, pts[m], pts[m2])
    merge.merge(adj, L, R)

}

// var testpts = [[1,1], [2,1], [3,0], [2,3]]
// var res2 = Delaunay(testpts)
// var result = getConnections(testpts)
//
// console.log(result)

/*
var point = function(x,y){
    return {
        x : x,
        y : y
    }
}
var slave = function(id, rotation, x, y){
    return {
        id : id,
        center: new point(x,y),
        rotation: rotation
    }
}

var slav = new slave('1', 0, 1,1 )

var slave1 = new slave('1', 10, 1, 2)
var slave2 = new slave('2', 0, 2, 1)
var slave3 = new slave('3', 0, 3, 2)
const testArray = [slave1, slave2, slave3]

console.log(getAngles(testArray))


function removeDuplicates(pts){

}
*/

module.exports = {
    Delaunay: Delaunay,
    getAngles: getAngles,
    getConnections: getConnections
}
