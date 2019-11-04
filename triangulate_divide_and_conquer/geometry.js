
function getLeftMost(points){
    let max = points[0]
    for(let i=0; i< points.length; i++){
        if(points[i][0] > max[0]){
            max = points[i];
        }
    }
    return max
}
function getRightMost(points){
    let min = points[0]
    for(let i=0; i< points.length; i++){
        if(points[i][0] < min[0]){
            min = points[i];
        }
    }
    return min
}

function sortPoints(points) {
    points.sort(function(item1, item2) {
        if (item1[0] !== item2[0]) {
            return item1[0] - item2[0];
        }
        else
            return item1[1] - item2[1];
    });
}
function pseudoAngle([dx, dy]) {
    const p = dx / (Math.abs(dx) + Math.abs(dy))
    return dy > 0 ? 3 + p : 1 - p
}

function ptSub(pt, sub) {
    return [
        pt[0] - sub[0],
        pt[1] - sub[1],
    ]
}

function rightOf(pt, line){
    const [x,y] = line
    const a = pt[0] - x[0]
    const b = y[0] - x[0]
    const c = pt[1] - x[1]
    const d = y[1] - x[1]

    return 0 >= (a * d) - (b * c)
}
function cross(a, b, o) {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

/**
 * @param points An array of [X, Y] coordinates
 */
function convexHull(points) {
    points.sort(function(a, b) {
        return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
    });

    var lower = [];
    for (var i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }

    var upper = [];
    for (var i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

//https://stackoverflow.com/questions/39984709/how-can-i-check-wether-a-point-is-inside-the-circumcircle-of-3-points
function circumscribed(A, B, C, D){
    const [Ax, Ay] = A
    const [Bx, By] = B
    const [Cx, Cy] = C
    const [Dx, Dy] = D

    const Ax_ = Ax - Dx
    const Ay_ = Ay - Dy
    const Bx_ = Bx - Dx
    const By_ = By - Dy
    const Cx_ = Cx - Dx
    const Cy_ = Cy - Dy

    return (
        (Ax_*Ax_ + Ay_*Ay_) * (Bx_*Cy_-Cx_*By_) -
        (Bx_*Bx_ + By_*By_) * (Ax_*Cy_-Cx_*Ay_) +
        (Cx_*Cx_ + Cy_*Cy_) * (Ax_*By_-Bx_*Ay_)
    ) > 0;



}
function pointsOnLine(pts) {
    const a = pts[1][1] - pts[0][1];
    const b = pts[0][0] - pts[1][0];
    const c = a*pts[0][0] + b*pts[0][1];

    for(var i=2; i < pts.length; i++) {

        if ((a*pts[i][0] + b*pts[i][1]) !== c) {
            return false;
        }
    }
    return true;
};

var testPts = [[1,1], [1,2], [1,3], [2,2], [3,3],[4,4]]
//console.log(pointsOnLine(testPts))


function findLowerCommonTangent(adj, X, Y) {
    let Z = adj[Y].get(0)
    let Z$$ = adj[X].get(0);

   // console.log("Z =", Z)
    //console.log("Z$$ =", Z$$)

    while(true){

        if(!rightOf(Z, [X,Y])){
           //console.log('zzz', Z)
           // console.log(adj[X].toArray(),"–––––––––––––", adj[Y].toArray())
            let Y$ = adj[Z].getNext(Y)
            Y = Z;
            Z = Y$;
        } else if(!rightOf(Z$$, [X,Y])){
           // console.log('www')
            let X$ = adj[X].getNext(Z$$)
            //console.log(X$)
            X = Z$$
            Z$$ = X$;
        } else {
            return [X,Y]
        }
    }
}


/*
var pointsOnLine = function(points) {
   const a = points[1][1] - points[0][1];
   const b = points[0][0] - points[1][0];
   const c = a*points[0][0] + b*points[0][1];

   for(var i=2; i < points.length; i++) {
       if (a*points[i][0] + b*points[i][1] === c) {
           return true;
       }
   }
   return false;
};
*/

module.exports = {
    pseudoAngle: pseudoAngle,
    ptSub: ptSub,
    findLowerCommonTangent: findLowerCommonTangent,
    rightOf: rightOf,
    sortPoints: sortPoints,
    convexHull: convexHull,
    circumscribed: circumscribed,
    pointsOnLine: pointsOnLine,
    getLeftMost: getLeftMost,
    getRightMost: getRightMost
};

