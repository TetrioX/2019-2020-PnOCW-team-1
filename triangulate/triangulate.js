var delaunay = require('./delaunay.js');

const list1ordered = [[0,1], [1,0], [1,2], [1,3], [2,1], [3,3], [4,2], [5,0], [5,1], [5,3]];
const list1unordered = [[1,3], [5,0], [5,3], [3,3], [0,1], [4,2], [1,2], [1,0], [5,1], [2,1]];
const list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0]];

function makeVertices(list) {
    var vertices = [];
    for(var i=0; i < list.length; i++) {
        vertices.push(
            new delaunay.Vertex(
                list[i][0],
                list[i][1]
            )
        );
    }
    return vertices;
}

var vertices1 = makeVertices(list1ordered);
var vertices1_ = makeVertices(list1unordered)
var vertices2 = makeVertices(list2);

var triangles1 = delaunay.triangulate(vertices1);
var triangles1_ = delaunay.triangulate(vertices1_);
var triangles2 = delaunay.triangulate(vertices2);

console.log(triangles1);
//console.log(triangles1_);
//console.log(triangles2);