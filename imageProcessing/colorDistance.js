const assert = require('assert');  // asserting pre-conditions

/**
 * Calculate the difference between two colors.
 *
 * @param {Array} color1 Input color 1
 * @param {Array} color2 Input color 2
 *
 * @pre color1.length == color1.length == 3
 *
 * @note The used algorithm is based upon the CIE94 algorithm.
 * @see https://en.wikipedia.org/wiki/Color_difference
 */
const colorDistance = function (color1, color2) {
    assert(color1.length === 3);
    assert(color2.length === 3);

    const kl = 1,
        kc = 1,
        kh = 1,
        k1 = 0.045,
        k2 = 0.015,

        dl = color1[0] - color2[0],
        c1 = Math.sqrt(color1[1] ** 2 + color1[2] ** 2),
        c2 = Math.sqrt(color2[1] ** 2 + color2[2] ** 2),
        dc = c1 - c2,
        da = color1[1] - color2[1],
        db = color1[2] - color2[2],
        dh = Math.sqrt(Math.abs(da ** 2 + db ** 2 - dc ** 2)),
        sl = 1,
        sc = 1 + k1 * c1,
        sh = 1 + k2 * c1;

    return Math.sqrt((dl / (kl * sl)) ** 2 + (dc / (kc * sc)) ** 2 + (dh / (kh * sh)) ** 2)
};

/**
 * Calculate the difference between two colors.
 *
 * @param {Array} color1 Input color 1
 * @param {Array} color2 Input color 2
 *
 * @pre color1.length == color1.length == 3
 *
 * @note The used algorithm is based upon the CIEDE2000 algorithm.
 * @see https://en.wikipedia.org/wiki/Color_difference
 */
const colorDistance2000 = function (color1, color2) {
    assert(color1.length === 3);
    assert(color2.length === 3);

    const kl = 1,
        kc = 1,
        kh = 1,

        ddifl = color1[0] - color2[0],
        l_ = (color1[0] + color2[0]) / 2,
        c1 = Math.sqrt(color1[1] ** 2 + color1[2] ** 2),
        c2 = Math.sqrt(color2[1] ** 2 + color2[2] ** 2),
        c_ = (c1 + c2) / 2,
        difa1 = color1[1] + color1[1] / 2 * (1 - Math.sqrt(c_ ** 2 / (c_ ** 2 + 25 ** 7))),
        difa2 = color2[1] + color2[1] / 2 * (1 - Math.sqrt(c_ ** 2 / (c_ ** 2 + 25 ** 7))),
        difc1 = Math.sqrt(difa1 ** 2 + color1[2] ** 2),
        difc2 = Math.sqrt(difa2 ** 2 + color2[2] ** 2),
        difc_ = (difc1 + difc2) / 2,
        ddifc = difc2 - difc1,
        difh1 = mod(Math.atan2(color1[2], difa1), Math.PI * 2),
        difh2 = mod(Math.atan2(color2[2], difa2), Math.PI * 2);
    let difH_ = (difh1 + difh2) / 2,
        ddifh = difh2 - difh1;

    if (Math.abs(ddifh) > Math.PI) {
        if (difh2 <= difh1) ddifh += 2 * Math.PI;
        else ddifh -= 2 * Math.PI;
        if (difh1 + difh2 < Math.PI * 2) difH_ += Math.Pi;
        else difH_ -= Math.PI
    }

    const ddifH = 2 * Math.sqrt(difc1 * difc2) * Math.sin(ddifh / 2),
        T = 1 - 0.17 * Math.cos(difH_ - Math.PI / 6) + 0.24 * Math.cos(2 * difH_) + 0.32 * Math.cos(3 * difH_ + Math.PI / 30) - 0.20 * Math.cos(4 * difH_ - 7 / 20 * Math.PI),
        Sl = 1 + 0.015 * (l_ - 50) ** 2 / Math.sqrt(20 + (l_ - 50) ** 2),
        Sc = 1 + 0.045 * difc_,
        Sh = 1 + 0.015 * difc_ * T,
        Rt = -2 * Math.sqrt(difc_ ** 2 / (difc_ ** 2 + 25 ** 7)) * Math.sin(Math.PI / 3 * Math.exp(0 - ((difH_ - 55 / 36 * Math.PI) / (5 / 36 * Math.PI)) ** 2));

    return Math.sqrt((ddifl / (kl * Sl)) ** 2 + (ddifc / (kc * Sc)) ** 2 + (ddifH / (kh * Sh)) ** 2 + Rt * ddifc / (kc * Sc) * ddifH / (kh * Sh))
};

// returns positive modulo
function mod(n, m) {
    return ((n % m) + m) % m;
}

// To make the function accessible in other .js files
module.exports = {
	colorDistance: colorDistance,
	colorDistance2000: colorDistance2000
};
	