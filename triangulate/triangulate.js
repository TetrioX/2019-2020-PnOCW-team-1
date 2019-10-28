//
var myList = [[1,2], [1,1], [2,3], [2,4], [6,1], [7,2], [3,5], [3,1]];


function sortPoints(points) {
    points.sort(function(item1, item2) {
        if (item1[0] !== item2[0]) {
            return item1[0] - item2[0];
        }
        else
            return item1[1] - item2[1];
    });
}

