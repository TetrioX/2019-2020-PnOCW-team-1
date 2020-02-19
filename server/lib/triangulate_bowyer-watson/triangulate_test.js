var delaunay = require('./bowyer_watson');

const list1 = [[1,3], [5,0], [5,3], [3,3], [0,1], [4,2], [1,2], [1,0], [5,1], [2,1]];
const list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0], [0, 1]];
const pointsoneline = [[0,0], [1,1], [3,3], [2,2]];

//Genereert random lijst van vertices
function randomVertices(n) {
    let vertices = [];
    for (var i=0; i < n; i++) {
        vertices.push([Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)])
    }
    return vertices;
}

var triangles1 = delaunay.triangulate(list1);
var triangles2 = delaunay.triangulate(list2);
var triangles_pol = delaunay.triangulate(pointsoneline);

//tests voor punten op één lijn
//console.log(delaunay.pointsOnLine(delaunay.makeVertices(pointsoneline)));
//console.log(triangles_pol);
//var vertices_pol = delaunay.getAllVertices(triangles_pol);
//console.log(vertices_pol);

//triangulatie
//console.log(triangles1);
var vertices1 = delaunay.getAllVertices(triangles1);
console.log(vertices1);
console.log(delaunay.getAngles(vertices1[0]));
//console.log(triangles2);
//console.log(triangles_pol);

//Performantietests(tijd)
/*var randList1 = randomVertices(100);
//console.log(randList1)
console.time();
delaunay.triangulate(randList1);
console.timeEnd();*/


/*console.time();
var randList2 = randomVertices(100);
var randvertices2 = makeVertices(randList2);
delaunay.triangulate_divide_and_conquer(randvertices2);
console.timeEnd();*/