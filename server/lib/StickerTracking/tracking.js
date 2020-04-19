const sharp = require('sharp')    // image processing

let ri = require("../screenProcessing/readImage.js");
let sc = require("../screenProcessing/screenReading");

main();

async function main(){
    // afb om op te tekenen
    img = "testimage1.jpg"
    imageMatrixes = await ri.getImagesHslMatrix([img]);
    /// [[[h,s,l],[h,s,l],...],
    //   [ ... ],
    //     ...                 ]
    // mee werken maar gebruik maken van sc.defaultTresholds
    HslImageMatrix = imageMatrixes[0];
    let nbOfColors = Object.keys(sc.defaultTresholds).length;
    // [[1,..],[,,]...]
    // kleuren van 1->6 met 1 = rood
    // gebruiken? want je kan ook met hsl imagematrix werken
    colorValueMatrix = sc.joinMatrixes(imageMatrixes,sc.defaultTresholds,nbOfColors);

    // Hiermee teken je op u afb
    listOfPoints = [{x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3}]
    
    printOnImage(img,listOfPoints); 
}

async function printOnImage(img,listOfPoints){
    let sharpImage = sharp(img)
    return Promise.all([sharpImage.metadata(), sharpImage.withMetadata().raw().toBuffer()]).then(
    values => {
        let meta = values[0]
        let buff = values[1]
        for (point of listOfPoints) {
            let pos = meta.channels*(point.x + point.y*meta.width)
            buff[pos] = 0;
            buff[pos+1] = 0;
            buff[pos+2] = 0;
        }
        output_meta = { raw: { width: meta.width, height: meta.height, channels: meta.channels } }
        sharp(buff,output_meta).toFile("img2.jpg")
    }
    ).catch(
    err => console.log(err.message)
    )
  }

