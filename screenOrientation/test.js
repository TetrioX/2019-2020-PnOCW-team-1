const Point3 = function(x, y, z) {
	return { x: x, y: y, z: z }
};

const Point2 = function(x, y) {
	return { x: x, y: y }
};


// Known 2D coordinates of our rectangle
i0 = Point2(318, 247);
i1 = Point2(326, 312);
i2 = Point2(418, 241);
i3 = Point2(452, 303);

// 3D coordinates corresponding to i0, i1, i2, i3
r0 = Point3(0, 0, 0);
r1 = Point3(0, 0, 1);
r2 = Point3(1, 0, 0);
r3 = Point3(1, 0, 1);

matx = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
];

console.log(i0, " ", i1, " ",i2, " ",i3);
console.log(r0, " ", r1, " ",r2, " ",r3);


const project = function (p, mat) {
    // console.log(" --> ", mat)
    const x = mat[0][0] * p.x + mat[0][1] * p.y + mat[0][2] * p.z + mat[0][3] * 1,
        y = mat[1][0] * p.x + mat[1][1] * p.y + mat[1][2] * p.z + mat[1][3] * 1,
        w = mat[3][0] * p.x + mat[3][1] * p.y + mat[3][2] * p.z + mat[3][3] * 1;
    return Point2(720 * (x / w + 1) / 2., 576 - 576 * (y / w + 1) / 2.)
};

// The squared distance between two points a and b
const norm2 = function (a, b) {
    // console.log(a, " ", b)
    const dx = b.x - a.x,
        dy = b.y - a.y;
    return dx * dx + dy * dy
};

const evaluate = function (mat) {
    const c0 = project(r0, mat),
        c1 = project(r1, mat),
        c2 = project(r2, mat),
        c3 = project(r3, mat);
    return norm2(i0, c0) + norm2(i1, c1) + norm2(i2, c2) + norm2(i3, c3)
};

const perturb = function (mat, amount) {
    // console.log("perturb")
    let mat2 = mat.map(function (arr) {
        return arr.slice()
    });
    mat2[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] += (2 * Math.random() - 1) * amount;
    return mat2
};

const approximate = function (mat, amount, n = 100000) {
    let est = evaluate(mat);

    for (let i = 0; i < n; ++i) {

        let mat2 = perturb(mat, amount);
        let est2 = evaluate(mat2);

        if (est2 < est) {
            mat = mat2;
            est = est2;
        }
    }
    return [mat, est]
};
	
for (let i = 0; i < 1000; ++i) {
    console.log(i, ".");
	matx = approximate(matx, 1)[0];
    matx = approximate(matx, .1)[0];
}

console.log(matx);