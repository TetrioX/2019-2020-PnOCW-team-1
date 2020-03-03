
const Gaussianb = require('gaussian-blur');




async function filter(buff, toBuff, channel) {
  const blur = new GaussianBlur();
  await blur.setImage('./foo.jpg');
  blur.changeBlurRadius(5);
}



module.export = {
  filter:filter
}
