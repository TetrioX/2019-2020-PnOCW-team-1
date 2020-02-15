const VC = require('./CircularDoublyLinkedList')
const geometry = require('./geometry')
var myList = [[1,2], [1,1], [2,3], [2,4], [6,1], [7,2], [3,5], [3,1]];


function sortPoints(points) {
    points.sort(function(item1, item2) {
        if (item1[0] !== item2[0]) {
            return item1[0] - item2[0];
        }
        else
            return item1[1] - item2[1];
    });
}
sortPoints(myList)
//console.log(myList)
function getBottomMostL(points){
    points.sort(function(item1, item2){
        if (item1[1] !== item2[1]){
            return item1[1] - item2[1];
        }
        else
            return item2[0] - item1[0]
    })
    return points[0]
}


function getBottomMostR(points){
    points.sort(function(item1, item2){
        if (item1[1] !== item2[1]){
            return item1[1] - item2[1];
        }
        else
            return item1[0] - item2[0]
    })
    return points[0]
}
function findAngle(point, {baseline}){
    function getSquareDistance(point1, point2){
        return (point1.x - point2.x)**2 + (point1.y - point2.y)**2
    }
    var c = getSquareDistance(point, baseline.point1)
    var b = getSquareDistance(point, baseline.point2)
    var a = baseline
    angle = Math.acos((c**2 - b**2 - a**2)/ (2*a*b))
    return angle/ 180 * Math.PI


}



function triangulate2(adj, A, B){
    const cycleA = new VC.VertexCycle(A)
    cycleA.insertP(B)

    const cycleB = new VC.VertexCycle(B)
    cycleB.insertP(A)

    adj[A] = cycleA
    adj[B] = cycleB

}

function triangulate3(adj, A, B, C){
    const cycleA = new VC.VertexCycle(A)
    const cycleB = new VC.VertexCycle(B)
    const cycleC = new VC.VertexCycle(C)

    if (geometry.rightOf(C, [A, B])) {
        cycleA.insertP(C)
        cycleA.insertP(B)

        cycleB.insertP(A)
        cycleB.insertP(C)

        cycleC.insertP(B)
        cycleC.insertP(A)
    } else {
        cycleA.insertP(B)
        cycleA.insertP(C)

        cycleB.insertP(C)
        cycleB.insertP(A)

        cycleC.insertP(A)
        cycleC.insertP(B)
    }

    adj[A] = cycleA
    adj[B] = cycleB
    adj[C] = cycleC

}
/*
const A = [1,2]
const B = [2,3]
const C = [3,1]
const D = [4,3]
const E = [5,1]
const F = [6,2]


var adje = {}
triangulate3(adje, A, B, C)
triangulate3(adje, D, E, F)
const L = new VC.VertexCycle(C)
const R = new VC.VertexCycle(D)
L.insertP(A)
L.insertP(B)
R.insertP(E)
R.insertP(F)


adje[C] = L
adje[D] = R

var res = geometry.findLowerCommonTangent(adje, C, D)
console.log(res)
*/
module.exports = {
    triangulate2: triangulate2,
    triangulate3: triangulate3

}