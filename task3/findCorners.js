function getCorners(rand){

  function getRand(i){
    if (i<0){
      i += rand.length;
    }
    return rand[i%rand.length];
  }

  function getSqrDist(a, b){
    return (a.x - b.x)**2 + (a.y - b.y)**2;
  }

  function getCornerWithMinimumAngle(angles){
    // Retuns index of minimum of angles
    var indexOfMinAngle = angles.reduce((minI, angle, i, angles) => angle < angles[minI] ? i : minI, 0);
    // Set values next to minimum angle to infinity so that they don't show up next time.
    for (v = -5; v <= 5; v++){
      angles[v] = Infinity;
    }
    return getRand(indexOfMinAngle);
  }

  var angles = [];

  for (i = 0; i < rand.length; i++){
    var avgAngle = 0;
    for (j = 2; j <= 5; j++) {
      // Law of Cosinus a**2 = b**2 + c**2 -2*b*c*cos(angle)
        var aSqrt = getSqrDist(getRand(i + j), getRand(i - j));
        var bSqrt = getSqrDist(getRand(i), getRand(i + j));
        var cSqrt = getSqrDist(getRand(i), getRand(i - j));
        var b = Math.sqrt(bSqrt);
        var c = Math.sqrt(cSqrt);

        // We don't need to do Math.acos() since if a < b then acos(a) > acos(b)
        // and we'll be comparing them relative to each other
        avgAngle += (bSqrt + cSqrt - aSqrt)/(2 * b * c);
    }
    // We don't have to devide the average since we'll only be comparing them
    // to each other

    angles.push(avgAngle);
  }
  console.log(angles)

  var corners = []

  for (c = 0; c < 4; c++){
    corners.push(getCornerWithMinimumAngle(angles));
  }

  console.log(corners);
  return corners;
}

module.exports = {
  getCorners: getCorners,
}
