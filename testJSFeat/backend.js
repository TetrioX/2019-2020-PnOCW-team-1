let jsfeat = require('jsfeat')

var homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
var match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);

function find_transform(matches, count) {
    // motion kernel
    var mm_kernel = new jsfeat.motion_model.homography2d();
    // ransac params
    var num_model_points = 4;
    var reproj_threshold = 3;
    var ransac_param = new jsfeat.ransac_params_t(num_model_points,
        reproj_threshold, 0.5, 0.99);

    var pattern_xy = [];
    var screen_xy = [];

    // construct correspondences
    for (var i = 0; i < count; ++i) {
        var m = matches[i];
        pattern_xy[i] = {"x": m.keypoint1[0], "y": m.keypoint1[1]};
        screen_xy[i] = {"x": m.keypoint2[0], "y": m.keypoint2[1]};
    }

    // estimate motion
    var ok = false;
    ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
        pattern_xy, screen_xy, count, homo3x3, match_mask, 1000);

    var pattern_xy2 = [];
    var screen_xy2 = [];
    // extract good matches and re-estimate
    var good_cnt = 0;
    if (ok) {
        for (var i = 0; i < count; ++i) {
            if (match_mask.data[i]) {
                pattern_xy2[good_cnt] = {"x": pattern_xy[i].x, "y": pattern_xy[i].y};
                screen_xy2[good_cnt] = {"x": screen_xy[i].x, "y": screen_xy[i].y};
                good_cnt++;
            }
        }
        // run kernel directly with inliers only
        mm_kernel.run(pattern_xy2, screen_xy2, homo3x3, good_cnt);
    } else {
        jsfeat.matmath.identity_3x3(homo3x3, 1.0);
    }

    return good_cnt;
}

// console.log(homo3x3.data);

function transformCorners(M, oldCorners) {
    var pt = oldCorners;
    var z = 0.0, i = 0, px = 0.0, py = 0.0;

    for (; i < 4; ++i) {
        px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
        py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
        z = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
        pt[i].x = px / z;
        pt[i].y = py / z;
    }

    return pt;
}

function findVectors(image1, image2, AllScreenPositions) {
    width1 = image1.width;
    height1 = image1.height;

    width2 = image2.width;
    height2 = image2.height;

    canvas.width = width1 + width2;
    canvas.height = Math.max(height1, height2);
    var context = canvas.getContext('2d');
    context.drawImage(image1, 0, 0, image1.width, image1.height, 0, 0, width1, height1);
    context.drawImage(image2, 0, 0, image2.width, image2.height, width1, 0, width2, height2);

    var descriptorLength = 512;
    var matchesShown = 30;
    var blurRadius = 3;
    tracking.Fast.THRESHOLD = 30;
    tracking.Brief.N = descriptorLength;
    var imageData1 = context.getImageData(0, 0, width1, height1);
    var imageData2 = context.getImageData(width1, 0, width2, height2);

    var gray1 = tracking.Image.grayscale(tracking.Image.blur(imageData1.data, width1, height1, blurRadius), width1, height1);
    var gray2 = tracking.Image.grayscale(tracking.Image.blur(imageData2.data, width2, height2, blurRadius), width2, height2);

    var corners1 = tracking.Fast.findCorners(gray1, width1, height1);
    var corners2 = tracking.Fast.findCorners(gray2, width2, height2);

    var descriptors1 = tracking.Brief.getDescriptors(gray1, width1, corners1);
    var descriptors2 = tracking.Brief.getDescriptors(gray2, width2, corners2);

    var matches = tracking.Brief.reciprocalMatch(corners1, descriptors1, corners2, descriptors2);
    matches.sort(function (a, b) {
        return b.confidence - a.confidence;
    });

    for (var i = 0; i < Math.min(matchesShown, matches.length); i++) {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fillRect(matches[i].keypoint1[0], matches[i].keypoint1[1], 5, 5);
        context.fillRect(matches[i].keypoint2[0] + width1, matches[i].keypoint2[1], 5, 5);
        context.beginPath();
        context.lineWidth = 3;
        context.moveTo(matches[i].keypoint1[0], matches[i].keypoint1[1]);
        context.lineTo(matches[i].keypoint2[0] + width1, matches[i].keypoint2[1]);
        context.stroke();
    }

    find_transform(matches, matches.length);

    for (const [key, value] of Object.entries(AllScreenPositions)) {
        newCorners = transformCorners(homo3x3, AllScreenPositions[key]);
        AllScreenPositions[key] = newCorners;
    }
}

module.exports = {
  findVectors: findVectors
}
