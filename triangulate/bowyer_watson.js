(function(exports) {

    // Vertex
    var Vertex = function(x, y) {
        return {
            x: x,
            y: y,
        };
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
    var inCircumcircle = function(triangle, vertex) {
        let dx = triangle.center.x - vertex.x;
        let dy = triangle.center.y - vertex.y;
        return Math.sqrt(dx * dx + dy * dy) <= triangle.radius;
    }

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

    exports.Vertex = Vertex;
    exports.Edge = Edge;
    exports.Triangle = Triangle;

    //voer triangulatie uit op gegeven vertices
    exports.triangulate = function(vertices) {
        var st = superTriangle(vertices);
        var triangles = [st];

        vertices.forEach(function(vertex) {
            triangles = addVertex(vertex, triangles);
        });

        // Verwijder triangles met met zijden van supertriangle
        triangles = triangles.filter(function(triangle) {
            return !(triangle.v0 === st.v0 || triangle.v0 === st.v1 || triangle.v0 === st.v2 ||
                triangle.v1 === st.v0 || triangle.v1 === st.v1 || triangle.v1 === st.v2 ||
                triangle.v2 === st.v0 || triangle.v2 === st.v1 || triangle.v2 === st.v2);
        });

        return triangles;
    };

})(typeof exports === 'undefined' ? this['delaunay'] = {} : exports);
