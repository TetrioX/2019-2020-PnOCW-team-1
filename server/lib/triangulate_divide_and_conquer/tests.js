const delaunay = require('./delaunay');
const geometry = require('./geometry');
const merge = require('./Merge');
const triangulate = require('./triangulate');
const fs = require('fs');

var pointz = [];
var pointsOnLine = [[1,1], [2,2], [3,3], [4,4], [0,1]];
var pointsCircle = [[0,1], [1,0], [-1, 0], [0,-1], [1,2]];
geometry.sortPoints(pointsOnLine);
geometry.sortPoints(pointsCircle);

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}


const list1 = [[1, 3], [5, 0], [5, 3], [3, 3], [0, 1], [4, 2], [1, 2], [1, 0], [5, 1], [2, 1]];
const list2 = [[-1.5, 0], [0, 1], [0, 10], [1.5, 0], [0, 1]];

//Genereert random lijst van vertices
function randomPoints(n) {
    let randpoints = [];
    for (let i = 0; i < n; i++) {
        randpoints.push([Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)])
    }
    return randpoints;
}

//get every point in the list and all points connected to this point
console.log(delaunay.getConnections(list1));
