// Vertex
var Vertex = function(x, y) {
    return {
        x: x,
        y: y,
        connections: []
    };
};

//Kijkt of gegeven vertices dezelfde zijn
const vertexIsEqual = function(vertex1, vertex2) {
    return (vertex1.x === vertex2.x && vertex1.y === vertex2.y);
};

// Edge
var Edge = function(v0, v1) {
    return {
        v0: v0,
        v1: v1,
    };
};

//Kijkt of gegeven edges dezelfde zijn
var edgeIsEqual = function(edge1, edge2) {
    return ((edge1.v0 === edge2.v0 && edge1.v1 === edge2.v1) ||
        (edge1.v0 === edge2.v1 && edge1.v1 === edge2.v0));
}

// Triangle
var Triangle = function(v0, v1, v2) {
    var triangle = {
        v0: v0,
        v1: v1,
        v2: v2,
        center: null,
        radius: null,
    };
    calcCircumcircle(triangle);
    return triangle;
};

//Omliggende cirkel berekenen
var calcCircumcircle = function(triangle) {
    var A = triangle.v1.x - triangle.v0.x;
    var B = triangle.v1.y - triangle.v0.y;
    var C = triangle.v2.x - triangle.v0.x;
    var D = triangle.v2.y - triangle.v0.y;

    var E = A * (triangle.v0.x + triangle.v1.x) + B * (triangle.v0.y + triangle.v1.y);
    var F = C * (triangle.v0.x + triangle.v2.x) + D * (triangle.v0.y + triangle.v2.y);

    var G = 2.0 * (A * (triangle.v2.y - triangle.v1.y) - B * (triangle.v2.x - triangle.v1.x));

    var dx, dy;

    //Punten op een lijn --> neem midden van lijn als center.
    if(Math.round(Math.abs(G)) === 0) {
        var minx = Math.min(triangle.v0.x, triangle.v1.x, triangle.v2.x);
        var miny = Math.min(triangle.v0.y, triangle.v1.y, triangle.v2.y);
        var maxx = Math.max(triangle.v0.x, triangle.v1.x, triangle.v2.x);
        var maxy = Math.max(triangle.v0.y, triangle.v1.y, triangle.v2.y);

        triangle.center = new Vertex((minx + maxx) / 2, (miny + maxy) / 2);

        dx = triangle.center.x - minx;
        dy = triangle.center.y - miny;
    } else {
        var cx = (D * E - B * F) / G;
        var cy = (A * F - C * E) / G;

        triangle.center = new Vertex(cx, cy);

        dx = triangle.center.x - triangle.v0.x;
        dy = triangle.center.y - triangle.v0.y;
    }
    triangle.radius = Math.sqrt(dx * dx + dy * dy);
};

//Checkt of vertex in omliggende cirkel van driehoek ligt
const inCircumcircle = function(triangle, vertex) {
    let dx = triangle.center.x - vertex.x;
    let dy = triangle.center.y - vertex.y;
    return Math.sqrt(dx * dx + dy * dy) <= triangle.radius;
};

//Maakt superTriangle
var superTriangle = function(vertices) {
    var minx = miny = Infinity,
        maxx = maxy = -Infinity;
    vertices.forEach(function(vertex) {
        minx = Math.min(minx, vertex.x);
        miny = Math.min(minx, vertex.y);
        maxx = Math.max(maxx, vertex.x);
        maxy = Math.max(maxx, vertex.y);
    });

    var dx = (maxx - minx) * 10,
        dy = (maxy - miny) * 10;

    var v0 = new Vertex(minx - dx, miny - dy * 3),
        v1 = new Vertex(minx - dx, maxy + dy),
        v2 = new Vertex(maxx + dx * 3, maxy + dy);

    return new Triangle(v0, v1, v2);
};

// Update triangle-array door nieuwe vertex toe te voegen
var addVertex = function(vertex, triangles) {
    var edges = [];

    // Verwijder de triangles met vertex in omliggende cirkel
    triangles = triangles.filter(function(triangle) {
        if(inCircumcircle(triangle, vertex)) {
            edges.push(new Edge(triangle.v0, triangle.v1));
            edges.push(new Edge(triangle.v1, triangle.v2));
            edges.push(new Edge(triangle.v2, triangle.v0));
            return false;
        }
        return true;
    });

    //Nieuwe edges
    edges = uniqueEdges(edges);

    //Nieuwe triangles
    edges.forEach(function(edge) {
        triangles.push(new Triangle(edge.v0, edge.v1, vertex));
    });

    return triangles;
};

//Verwijder dubbele edges
//Kan beter
var uniqueEdges = function(edges) {
    var uniqueEdges = [];
    for(var i=0;i<edges.length;++i) {
        var isUnique = true;

        for(var j=0;j<edges.length;++j) {
            if(i !== j && edgeIsEqual(edges[i], edges[j])) {
                isUnique = false;
                break;
            }
        }

        isUnique && uniqueEdges.push(edges[i]);
    }
    return uniqueEdges;
};

//hulpfuncties
//Kijkt of alle punten op één lijn liggen
var pointsOnLine = function(vertices) {
    const a = vertices[1].y - vertices[0].y;
    const b = vertices[0].x - vertices[1].x;
    const c = a*vertices[0].x + b*vertices[0].y;

    for(let i = 2; i < vertices.length; i++) {
        if (a*vertices[i].x + b*vertices[i].y !== c) {
            return false;
        }
    }
    return true;
};

//Maakt vertex-elementen van array
function makeVertices(list) {
    var vertices = [];
    for(let i = 0; i < list.length; i++) {
        vertices.push(
            new Vertex(
                list[i][0],
                list[i][1]
            )
        );
    }
    return vertices;
}

//check of pointToAdd in connections van point zit
const inConnections = function(point, pointToAdd) {
    for (let i=0; i < point.connections.length; i++){
        if (vertexIsEqual(point.connections[i], pointToAdd)){
            return true;
        }
    }
    return false;
};

//checkt of vertex in gegeven set is
const vertexInSet = function(set, vertex) {
    for (let i=0; i < set.length; i++){
        if (vertexIsEqual(set[i], vertex)){
            return true;
        }
    }
    return false;
};


//voer triangulatie uit op gegeven vertices
const triangulate = function (vertices) {

    if (vertices instanceof Array) {
        vertices = makeVertices(vertices);
    }

    if (pointsOnLine(vertices) === true) {
        let edges = [];
        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push(new Edge(vertices[i], vertices[i + 1]));
            vertices[i].connections.push(vertices[i+1]);
            vertices[i+1].connections.push(vertices[i]);
        }
        return edges;
    } else {
        var st = superTriangle(vertices);
        var triangles = [st];

        vertices.forEach(function (vertex) {
            triangles = addVertex(vertex, triangles);
        });

        // Verwijder triangles met met zijden van supertriangle
        triangles = triangles.filter(function (triangle) {
            return !(triangle.v0 === st.v0 || triangle.v0 === st.v1 || triangle.v0 === st.v2 ||
                triangle.v1 === st.v0 || triangle.v1 === st.v1 || triangle.v1 === st.v2 ||
                triangle.v2 === st.v0 || triangle.v2 === st.v1 || triangle.v2 === st.v2);
        });

        //voor elk punt in triangle andere punten toevoegen aan zijn connections
        //kan beter
        triangles.forEach(function (triangle) {
            if (!inConnections(triangle.v0, triangle.v1)){
                triangle.v0.connections.push(triangle.v1);
            }
            if (!inConnections(triangle.v0, triangle.v2)) {
                triangle.v0.connections.push(triangle.v2);
            }
            if (!inConnections(triangle.v1, triangle.v0)) {
                triangle.v1.connections.push(triangle.v0);
            }
            if (!inConnections(triangle.v1, triangle.v2)) {
                triangle.v1.connections.push(triangle.v2);
            }
            if (!inConnections(triangle.v2, triangle.v0)) {
                triangle.v2.connections.push(triangle.v0);
            }
            if (!inConnections(triangle.v2, triangle.v1)) {
                triangle.v2.connections.push(triangle.v1);
            }
        });
        return triangles;
    }
};

const getAllVertices = function(triangles) {
    let vertices = [];
    for (let i = 0; i < triangles.length; i++) {
        if (!vertexInSet(vertices, triangles[i].v0)){
            vertices.push(triangles[i].v0);
        }
        if (!vertexInSet(vertices, triangles[i].v1)){
            vertices.push(triangles[i].v1);
        }
        //als ze niet op 1 lijn liggen
        //mooier formuleren
        if (triangles[i].v2 != undefined){
            if (!vertexInSet(vertices, triangles[i].v2)) {
                vertices.push(triangles[i].v2);
            }
        }
    }
    return vertices;
};

//berekent hoek tussen twee punten en horizontale
const angleBetweenPoints = function (point1, point2) {
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0])*(180/Math.PI);
};

//returnt de hoeken tussen een punt en zijn connections met de horizontale
const getAngles = function(vertex) {
    let angles = [];
    vertex.connections.forEach( function (point) {
        angles.push(angleBetweenPoints([vertex.x, vertex.y], [point.x, point.y]))
    });
    return angles;
};

module.exports = {
    Vertex: Vertex,
    Edge: Edge,
    Triangle: Triangle,
    triangulate: triangulate,
    makeVertices: makeVertices,
    pointsOnLine: pointsOnLine,
    getAllVertices: getAllVertices,
    getAngles: getAngles
};
