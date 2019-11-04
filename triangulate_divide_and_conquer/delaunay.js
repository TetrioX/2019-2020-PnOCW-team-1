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

function Delaunay(pts){
    adj = {}
    geometry.sortPoints(pts)
    delaunay(pts, adj, 0, pts.length -1)
    return adj
}

function delaunay(pts, adj, l, r){
    const diff = r - l;

    if(diff < 1){
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

module.exports = {
    Delaunay: Delaunay
}