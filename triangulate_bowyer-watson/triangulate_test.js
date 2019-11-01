var delaunay = require('./bowyer_watson');

const list1 = [[1,3], [5,0], [5,3], [3,3], [0,1], [4,2], [1,2], [1,0], [5,1], [2,1]];
const list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0], [0, 1]];
const pointsoneline = [[0,0], [1,1], [2,2], [3,3]];

//Genereert random lijst van vertices
function randomVertices(n) {
    let vertices = [];
    for (var i=0; i < n; i++) {
        vertices.push([Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)])
    }
    return vertices;
}

//Maakt vertex-elementen van array
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

var vertices1 = makeVertices(list1);
var vertices2 = makeVertices(list2);
var vertices_pol = makeVertices(pointsoneline);

var triangles1 = delaunay.triangulate(vertices1);
var triangles2 = delaunay.triangulate(vertices2);

//console.log(delaunay.pointsOnLine(vertices_pol));
//console.log(delaunay.pointsOnLine(vertices2));

//console.log(triangles1);
//console.log(triangles2);

/*console.time();
var randList1 = randomVertices(10000);
var randvertices1 = makeVertices(randList1);
delaunay.triangulate_divide_and_conquer(randvertices1);
console.timeEnd();*/


/*console.time();
var randList2 = randomVertices(100);
var randvertices2 = makeVertices(randList2);
delaunay.triangulate_divide_and_conquer(randvertices2);
console.timeEnd();*/