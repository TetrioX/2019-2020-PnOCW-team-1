const delaunay = require('./delaunay')
const geometry = require('./geometry')

const list1 = [[1,3], [5,0], [5,3], [3,3], [0,1], [4,2], [1,2], [1,0], [5,1], [2,1]];
var list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0], [0, 1]];

//Genereert random lijst van vertices
function randomVertices(n) {
    let vertices = [];
    for (var i=0; i < n; i++) {
        vertices.push([Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)])
    }
    return vertices;
}

const pointsonline = [[0,0], [1,1], [3,3], [2,2]];
//console.log(geometry.pointsOnLine(threepointsoneline));

const test_triangulate = function(points) {
    const n = 0;
    var pointz = randomVertices(n);
    var counter = 0;
    while(counter < 1) {
        console.log('____________________');
        console.time('test');
        const result = delaunay.Delaunay(points);
        console.timeEnd('test');
        var j = points[0];
        console.log(points);
        console.log(result);
        for (let i = 0; i < points.length; i++) {
            console.log(points[i], " || ", result[points[i]].toArray());
        }
        counter += 1
    }
};
//randomlist
//test_triangulate(100);

//list1
//test_triangulate(list1);

//list2
//test_triangulate(list2);
