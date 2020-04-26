let sharp = require('sharp')

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

console.log(homo3x3.data);

function tCorners(M, w, h) {
    var pt = [{'x': 0, 'y': 0}, {'x': w, 'y': 0}, {'x': w, 'y': h}, {'x': 0, 'y': h}];
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

function render_pattern_shape(ctx, shift) {
    // get the projected pattern corners
    var shape_pts = tCorners(homo3x3.data, colsObject, rowsObject);

    ctx.strokeStyle = "rgb(0,255,0)";
    ctx.beginPath();

    ctx.moveTo(shape_pts[0].x + shift, shape_pts[0].y);
    ctx.lineTo(shape_pts[1].x + shift, shape_pts[1].y);
    ctx.lineTo(shape_pts[2].x + shift, shape_pts[2].y);
    ctx.lineTo(shape_pts[3].x + shift, shape_pts[3].y);
    ctx.lineTo(shape_pts[0].x + shift, shape_pts[0].y);

    ctx.lineWidth = 4;
    ctx.stroke();
}

function transformScreenCorners(M) {
    // Punten handmatig toevoegen in volgorde: Linksonder, Rechtsonder, Rechtsboven, Linksboven
    // test 7
    //var pt = [{'x': 203, 'y': 256}, {'x': 517, 'y': 255}, {'x': 517, 'y': 58}, {'x': 200, 'y': 59}];
    // test 8
    var pt = [{'x': 165, 'y': 260}, {'x': 496, 'y': 255}, {'x': 492, 'y': 58}, {'x': 176, 'y': 56}];
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

function render_screen_shape(ctx, shiftx) {
    // get the projected pattern corners
    var shape_pts = transformScreenCorners(homo3x3.data);

    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.beginPath();

    ctx.moveTo(shape_pts[0].x + shiftx, shape_pts[0].y);
    ctx.lineTo(shape_pts[1].x + shiftx, shape_pts[1].y);
    ctx.lineTo(shape_pts[2].x + shiftx, shape_pts[2].y);
    ctx.lineTo(shape_pts[3].x + shiftx, shape_pts[3].y);
    ctx.lineTo(shape_pts[0].x + shiftx, shape_pts[0].y);

    ctx.lineWidth = 4;
    ctx.stroke();
}
function findVectors(imageObject,imageScene, AllScreenPositions) {
  imageObject = imageObjects[0]
  imageScene = imageObjects[1]
  colsObject = imageObject.width;
  rowsObject = imageObject.height;

  colsScene = imageScene.width;
  rowsScene = imageScene.height;

  canvas.width = colsObject + colsScene;
  canvas.height = Math.max(rowsObject, rowsScene);
  var context = canvas.getContext('2d');
  context.drawImage(imageObject, 0, 0, imageObject.width, imageObject.height, 0, 0, colsObject, rowsObject);
  context.drawImage(imageScene, 0, 0, imageScene.width, imageScene.height, colsObject, 0, colsScene, rowsScene);

  var descriptorLength = 512;
  var matchesShown = 30;
  var blurRadius = 3;
  tracking.Fast.THRESHOLD = 30;
  tracking.Brief.N = descriptorLength;
  var imageDataObject = context.getImageData(0, 0, colsObject, rowsObject);
  var imageDataScene = context.getImageData(colsObject, 0, colsScene, rowsScene);

  var grayObject = tracking.Image.grayscale(tracking.Image.blur(imageDataObject.data, colsObject, rowsObject, blurRadius), colsObject, rowsObject);
  var grayScene = tracking.Image.grayscale(tracking.Image.blur(imageDataScene.data, colsScene, rowsScene, blurRadius), colsScene, rowsScene);

  var cornersObject = tracking.Fast.findCorners(grayObject, colsObject, rowsObject);
  var cornersScene = tracking.Fast.findCorners(grayScene, colsScene, rowsScene);

  var descriptorsObject = tracking.Brief.getDescriptors(grayObject, colsObject, cornersObject);
  var descriptorsScene = tracking.Brief.getDescriptors(grayScene, colsScene, cornersScene);

  var matches = tracking.Brief.reciprocalMatch(cornersObject, descriptorsObject, cornersScene, descriptorsScene);
  matches.sort(function (a, b) {
      return b.confidence - a.confidence;
  });

  for (var i = 0; i < Math.min(matchesShown, matches.length); i++) {
      var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      context.fillStyle = color;
      context.strokeStyle = color;
      context.fillRect(matches[i].keypoint1[0], matches[i].keypoint1[1], 5, 5);
      context.fillRect(matches[i].keypoint2[0] + colsObject, matches[i].keypoint2[1], 5, 5);
      context.beginPath();
      context.lineWidth = 3;
      context.moveTo(matches[i].keypoint1[0], matches[i].keypoint1[1]);
      context.lineTo(matches[i].keypoint2[0] + colsObject, matches[i].keypoint2[1]);
      context.stroke();
  }

  find_transform(matches, matches.length);
}

module.exports = {
  findVectors: findVectors
}
