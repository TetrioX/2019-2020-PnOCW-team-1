const geometry = require('./geometry');
const triangulate = require('./triangulate');
const merge = require('./Merge');

function getAngles(slaves) {
    let result = {};
    let coords = [];
    let temp = {};

    for (let id in slaves) {
        const X = slaves[id].x;
        const Y = slaves[id].y;

        const point = [X, Y];

        coords.push(point);
        temp[point] = id
    }

    const triangulation = Delaunay(coords);

    coords.forEach(function (pt) {
        let angles = [];
        let currentId = temp[pt];
        const connections = triangulation[pt].toArray();
        for (let ind = 0; ind < connections.length; ind++) {
            const angleBetween = geometry.angleBetweenPoints(pt, connections[ind]);
            angles.push(angleBetween);
            result[currentId] = angles
        }
    });

    return result
}

function getConnections(slaves){
    var result = {}
    var coords = []
    let temp = {};

    for(var id in slaves){
        var X = slaves[id].x
        var Y = slaves[id].y

        var point = [X,Y]
        temp[point] = id
        coords.push(point)
    }

    console.log("coords:", coords)

    const triangulation = Delaunay(coords)

    coords.forEach(function(pt){
        let currentId = temp[pt];
        result[currentId] = triangulation[pt].toArray();
    })
    /*
    for (var i in coords) {

        result[Object.keys(slaves)[i]] = triangulation[coords[i]].toArray()
    }
*/
    return result
}

function Delaunay(pts){
    let adj = {};
    geometry.sortPoints(pts);

    if (geometry.pointsOnLine(pts) && pts.length > 3) {
        for (let i = 1; i < pts.length; i++) {
            triangulate.triangulate2(adj, pts[i - 1], pts[i])
        }
        return adj;
    }
    delaunay(pts, adj, 0, pts.length -1);
    return adj
}

function delaunay(pts, adj, l, r) {

    const diff = r - l;

    if (pts.length < 1) {
        return
    }
    if (diff === 1) {
        return triangulate.triangulate2(adj, pts[l], pts[r])
    }
    if (diff === 2) {
        return triangulate.triangulate3(adj, pts[l], pts[l + 1], pts[r])
    }

    const m = l + ((r - l) >>> 1);
    const m2 = m + 1;

    delaunay(pts, adj, l, m);
    delaunay(pts, adj, m2, r);

    const [L, R] = geometry.findLowerCommonTangent(adj, pts[m], pts[m2]);
    merge.merge(adj, L, R)
}

module.exports = {
    Delaunay: Delaunay,
    getAngles: getAngles,
    getConnections: getConnections
};
