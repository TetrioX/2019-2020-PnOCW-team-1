fs = require('fs');
delaunay = require('./delaunay.js');

function visualize(points) {
    fs.writeFileSync('connections.json', JSON.stringify(delaunay.getConnections(points)));
    const exec = require('child_process').exec;
    const child = exec('python visualizeTriangulate.py');
}

const list1 = [[1, 3], [5, 0], [5, 3], [3, 3], [0, 1], [4, 2], [1, 2], [1, 0], [5, 1], [2, 1]];

/**
 * Put your list as argument of visualize() and run the file
 */
visualize(list1);