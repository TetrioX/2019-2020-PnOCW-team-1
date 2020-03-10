//https://courses.cs.washington.edu/courses/cse457/15wi/lectures/images.pdf

var Jimp = require('jimp');

const int = 0.1;

function gauss(image, r){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .gaussian(r)
        .write('gauss.jpg'); // save
  });
}

function edge_detect(image) {
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .convolute([[0, 1, 0], [1, -4, 1], [0, 1, 0]])
        .write('edges.jpg'); // save
  });
}

function conv(image) {
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .convolute([[int, int, int], [int, 0.2, int], [int, int, int]])
        .write('conv.jpg'); // save
  });
}

function pixelate(image, amount){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .pixelate(amount)
        .write('image_pixelate.jpg'); // save
  });
}

function posterize(image, amount){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .posterize(amount)
        .write('image_posterize.jpg'); // save
  });
}

function color(image){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .color([
          { apply: 'red', params: [255] },
          { apply: 'green', params: [0] },
          { apply: 'blue', params: [0] }
        ])
        .write('image_color.jpg'); // save
  });
}

function filter(image, amount){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .posterize(amount)
        .write('image_posterize.jpg'); // save
  });
}

function dither(image, amount){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .dither565()
        .write('image_dither.jpg'); // save
  });
}

function blur(image, amount){
  Jimp.read(image, (err, image) => {
    if (err) throw err;
    image
        .blur(amount)
        .write('image_blur.jpg'); // save
  });
}

blur('image-0.png', 5)


module.export = {
  filter:filter,
  edge_detect: edge_detect,
  gauss: gauss,
  conv: conv,
  pixelate: pixelate,
  posterize: posterize,
  color: color
}
