//make connection
var socket = io('/slave');

//listen for events from client
var masterButton = document.getElementById("masterButton");
var playerButton = document.getElementById("playerButton");
var socketID = null;
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
var video = document.getElementById("video");
var gridData = {
    grid: [],
    sideBorder: [],
    cornBorder: []
};
var entirePage = document.createElement('th');
var countdown = document.getElementById('countdown');
var countdownTimer = document.getElementById('timer');
var wrapper = document.getElementById("wrapper");
var renderdiv = document.getElementById('3dscenerender');
var length = 1000;
var gridElements = [];
let vidBufferCheck = null;
let vidDrawer = null;

function cleanHTML() {
    removeGrid();
    document.body.style.overflow = 'hidden';
    renderdiv.style.display = 'none'
    wrapper.style.display = "none";
    countdown.style.display = "none";
    countdownTimer.style.display = "none";
    entirePage.style.display = "none";
    canvas.style.display = "none";
    video.style.display = "none";
    clearInterval(vidBufferCheck);
    clearInterval(vidDrawer);
    video.src = "";
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//listen for events from server

socket.on('changeBackgroundColor', function (data) {
    cleanHTML()
    document.body.style.backgroundColor = data.colorValue;
});

// keep the latency between the server and slave
var latency = 0;
socket.on('pong', function (ms) {
    latency += Math.min(latency * 6 / 5 + 10, (ms - latency) / 5)
    socket.emit('update-latency', latency)
});

// Sending number to slave (also usefull for angle of arrow!)
socket.on('slaveID', function (id) {
    if (id == 1) {
        var text = "st "
    } else if (id == 2) {
        var text = "nd "
    } else {
        var text = "th "
    }
    document.getElementById("slaveID").innerHTML = id + text;
})


socket.on('drawLine', function (data) {
    draw(data.angle);
});

socket.on('getDim', function (data, callback) {
    cleanHTML()
    callback({height: window.innerHeight, width: window.innerWidth})
});

socket.on('changeBackgroundOfAllSlaves', function (data, callback) {
    cleanHTML()
    entirePage.setAttribute("id", "entirePage");
    document.body.appendChild(entirePage);
    saveGrid(data);
    createGrid();
    // callback after 300ms
    setTimeout(function () {
        callback()
    }, 300);
});

socket.on('refresh', function () {
    location.reload(true)
})

socket.on('changeGrid', function (data, callback) {
    updateGrid(data)
    // callback after 200ms
    setTimeout(function () {
        callback()
    }, 200);
});

function removeGrid() {
    document.body.style.backgroundColor = 'white'
    for (el of gridElements) {
        el.remove()
    }
    gridElements = []
    // show the start page again.
    wrapper.style.display = "block"
    // show scroll bar again
    document.body.style.overflow = 'visible';
}

socket.on('removeGrid', function (data) {
    removeGrid()
})

socket.on('connect', function () {
    socketID = socket.id;
    console.log(socketID);
});

socket.on('changeBackgroundColor', function (data) {
    document.body.style.backgroundColor = data.colorValue;
    document.getElementById('wrapper').setAttribute('class', 'hidden') //delete hidden to see everything
});

socket.on('SendingPicture', function (data) {
    console.log("picture recieved");
});

socket.on('drawStar', function (data) {
    drawStar();
});

socket.on('drawLine', function (data) {
    draw(data.angle);
});


socket.on('drawImage', function (data) {
    wrapper.style.display = "none";
    var imgcanvas = document.createElement('canvas');
    imgcanvas.setAttribute('id', 'imgcanvas');
    document.body.appendChild(imgcanvas);
    var slavecorners = data
})

//events on client side
masterButton.addEventListener('click', function () {
    window.location.href = "/master";
});


//3D scene functions

var animationorientation = 0

socket.on('animationorientation',function(data){
    console.log('test')
    console.log(data.orientation)
    animationorientation = data.orientation
    
})



var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderdiv.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var animate = function () {
    requestAnimationFrame( animate );
    console.log('animating')
    cube.rotation.x = 0;
    cube.rotation.y = animationorientation*3.1415/180;

    renderer.render( scene, camera );
};

animate();







//functions
function createGrid() {
    entirePage.style.display = ""
    // hide scrollbar
    document.body.style.overflow = 'hidden';
    var numberOfrows = gridData.grid.length;
    var numberOfColumns = gridData.grid[0].length;
    let width = window.innerWidth
    let height = window.innerHeight
    // this will make the border 50% of the size of the squares
    let spaceTop = (height / (2 * numberOfrows + 2)).toString() + "px"
    let spaceSide = (width / (2 * numberOfColumns + 2)).toString() + "px"
    entirePage.style.top = spaceTop
    entirePage.style.bottom = spaceTop
    entirePage.style.left = spaceSide
    entirePage.style.right = spaceSide
    for (i = 0; i < 4; i++) {
        var corner = document.createElement('div');
        corner.setAttribute("class", "corner");
        corner.setAttribute("id", "corner" + i.toString());
        corner.style.height = spaceTop
        corner.style.width = spaceSide
        document.body.appendChild(corner);
        corner.style.backgroundColor = gridData.cornBorder[0];
        gridElements.push(corner)
    }
    for (i = 0; i < numberOfrows; i++) {
        var row = document.createElement('div');
        row.setAttribute("class", "rowclass");
        row.setAttribute("id", i.toString());
        entirePage.appendChild(row);
        gridElements.push(row)

        for (j = 0; j < numberOfColumns; j++) {

            var grid = document.createElement('div');
            grid.setAttribute("id", "grid" + i.toString() + j.toString());
            grid.setAttribute("class", "grid");
            row.appendChild(grid);
            grid.style.backgroundColor = gridData.grid[i][j][0];
            gridElements.push(grid)
        }
    }
    document.body.style.backgroundColor = gridData.sideBorder[0];
}

function updateGrid(c) {
    var numberOfrows = gridData.grid.length;
    var numberOfColumns = gridData.grid[0].length;
    for (i = 0; i < 4; i++) {
        document.getElementById("corner" + i.toString()).style.backgroundColor = gridData.cornBorder[c];
    }
    for (i = 0; i < numberOfrows; i++) {
        for (j = 0; j < numberOfColumns; j++) {
            document.getElementById("grid" + i.toString() + j.toString()).style.backgroundColor = gridData.grid[i][j][c];
        }
    }
    document.body.style.backgroundColor = gridData.sideBorder[c];
}

function saveGrid(data) {
    // save the grid data in global variable
    gridData = data
}

function drawArrowHead(from, to, radius) {
    canvas.style.display = "block"

    var x_center = to.x;
    var y_center = to.y;

    var arrowAngle;
    var x;
    var y;

    context.beginPath();

    arrowAngle = Math.atan2(to.y - from.y, to.x - from.x)
    x = radius * Math.cos(arrowAngle) + x_center;
    y = radius * Math.sin(arrowAngle) + y_center;

    context.moveTo(x, y);

    arrowAngle += (1.0 / 3.0) * (2 * Math.PI)
    x = radius * Math.cos(arrowAngle) + x_center;
    y = radius * Math.sin(arrowAngle) + y_center;

    context.lineTo(x, y);

    arrowAngle += (1.0 / 3.0) * (2 * Math.PI)
    x = radius * Math.cos(arrowAngle) + x_center;
    y = radius * Math.sin(arrowAngle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
}


function draw(radianAngle) {
    canvas.style.display = "block"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var dx = length * Math.cos(radianAngle);
    var dy = length * Math.sin(radianAngle);
    var centreX = window.innerWidth / 2;
    var centreY = window.innerHeight / 2;
    var from = {
        x: centreX,
        y: centreY
    };
    var to = {
        x: centreX + dx,
        y: centreY + dy
    };

    // start point
    context.moveTo(from.x, from.y);
    // end point
    context.lineTo(to.x, to.y);

    context.lineWidth = 10;
    // Make the line visible

    context.stroke();

}

//BROADCASTING IMAGES AND VIDEOS

socket.on('broadcastingImage'), function (data) {
    console.log('willBroadcast')
    var slaveCorners = [data[3], data[0], data[1], data[2]];
    broadcast(slaveCorners);
}

//corners: LT,RT,RB,LB
//var slaveCorners = [[200,200],[600,200],[600,400],[200,400]]
//var slaveCorners = [[100,100],[300,200],[300,300],[100,200]];
//var slaveCorners = [[0,400],[400,0],[600,200],[200,600]];

//create a new image object
var img = new Image();


function broadcast(slaveCorners) {
    var angle = calculateAngle(slaveCorners)
    var slaveWidth = (slaveCorners[1][0] - slaveCorners[0][0]) / Math.cos(angle);
    var slaveHeigth = (slaveCorners[2][1] - slaveCorners[1][1]) / Math.cos(angle);

    //canvas for the real image
    var imgcanvas = document.getElementById('imgcanvas');
    var imgctx = imgcanvas.getContext('2d');
    imgcanvas.width = window.innerWidth;
    imgcanvas.height = window.innerHeight;

    //canvas fot testing purposes
    var tempcanvas = document.getElementById('tempcanvas');
    var tempctx = tempcanvas.getContext('2d');
    tempcanvas.height = window.innerHeight;
    tempcanvas.width = window.innerWidth;


    img.onload = async function () {
        //translation
        const widthMultiplier = imgcanvas.width / slaveWidth;
        const heightMultiplier = imgcanvas.height / slaveHeigth;
        imgctx.translate(-slaveCorners[0][0] * widthMultiplier, -slaveCorners[0][1] * heightMultiplier);
        var LeftTopcorner = [slaveCorners[0][0] * widthMultiplier, slaveCorners[0][1] * heightMultiplier]

        //rotation
        imgctx.translate(slaveCorners[0][0] * widthMultiplier, slaveCorners[0][1] * heightMultiplier)
        imgctx.rotate(angle)
        imgctx.translate(-slaveCorners[0][0] * widthMultiplier, -slaveCorners[0][1] * heightMultiplier)

        //skew werkt voorlopig nog niet helemaal

        //var LeftBottomCorner =[slaveCorners[3][0]*widthMultiplier, slaveCorners[3][1]*heightMultiplier]
        LeftBottomCorner = rotate_point(LeftTopcorner[0], LeftTopcorner[1], angle, LeftBottomCorner);
        var horizontalskew = -(LeftBottomCorner[0] - LeftTopcorner[0]) / (LeftBottomCorner[1] - LeftTopcorner[1]);
        imgctx.translate(slaveCorners[0][0] * widthMultiplier, slaveCorners[0][1] * heightMultiplier);
        imgctx.transform(1, 0, horizontalskew, 1, 0, 0)

        imgctx.translate(-slaveCorners[0][0] * widthMultiplier, -slaveCorners[0][1] * heightMultiplier);

        //now 3 of the 4 corners are perfect in place
        imgctx.drawImage(img, 0, 0, imgcanvas.width * widthMultiplier, imgcanvas.height * heightMultiplier);

        tempctx.beginPath();
        tempctx.moveTo(slaveCorners[0][0], slaveCorners[0][1]);
        for (let i = 1; i < slaveCorners.length; i++) {
            tempctx.lineTo(slaveCorners[i][0], slaveCorners[i][1]);
        }
        tempctx.lineTo(slaveCorners[0][0], slaveCorners[0][1]);
        tempctx.clip();
        tempctx.drawImage(img, 0, 0, tempcanvas.width, tempcanvas.height);
    }
}


function calculateAngle(corners) {
    let dx = corners[1][0] - corners[0][0];
    let dy = corners[0][1] - corners[1][1];
    let angle = Math.atan(dy / dx);
    return angle
}

function rotate_point(cx, cy, angle, p) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    //translate point back to origin:
    p[0] -= cx;
    p[1] -= cy;

    //rotate point:
    var xnew = p[0] * c - p[1] * s;
    var ynew = p[0] * s + p[1] * c;

    //translate point back:
    p[0] = xnew + cx;
    p[1] = ynew + cy;
    return p;
}

//callback, when the image is loaded

//start the image loading
img.src = '/static/Colorgrid.jpg';


socket.on('changeBackgroundColor', function (data) {
    cleanHTML()
    document.body.style.backgroundColor = data.colorValue;
});

socket.on('drawLine', function (data) {
    cleanHTML()
    draw(data.angle);
});

masterButton.addEventListener('click', function () {
    window.location.href = "/master";
});

playerButton.addEventListener('click', function () {
    window.location.href = "/player";
});

// Original version https://gist.github.com/LogIN-/e1e3feff907066a1b5ed
// Modified to work with socket.io and to be able to adjust the time from the server
(function () {
    // offset in ms of time difference between server en slave
    var offset = 0
    // start time
    var timer_start
    // pointer to the interval for finishing animation
    var finishAnimTimer = null
    socket.on('startCountdown', function (data) {
        cleanHTML()
        countdownTimer.style.display = 'block';
        start_countdown(data)
    })
    socket.on('updateCountdown', function (data) {
        offset += ((new Date() - timer_start - (data + latency)) - offset) / 5
    })

    function start_countdown(timeInSeconds) {
        timer_start = new Date()
        var main_container = document.getElementById('svg_download_countdown')
        var loader = document.getElementById('loader')
        var border = document.getElementById('border')
        countdown.style.display = 'block';
        // stop finishing animation if it's running
        stopfinishAnimation()
        var π = Math.PI
            , total_seconds = timeInSeconds
            , elipsed_seconds = 0
            , refresh_rate = 25 // (100 / total_seconds) * 100
            , α = 0
            , last_loop = false
            , scaleAnimation = 84;
        InitiateCountDownLoop();

        function InitiateCountDownLoop() {
            drawCountdown();
            if (Math.floor(elipsed_seconds) < total_seconds) {
                setTimeout(InitiateCountDownLoop, refresh_rate);
            } else if (last_loop === false) {
                last_loop = true;
                setTimeout(InitiateCountDownLoop, refresh_rate);
            } else {
                appendCountdownSeconds();
                countdown.innerHTML = "Done";
                adjustCountDownOffset();
                startfinishAnimation();
                return;
            }
        };

        function drawCountdown() {
            getElapsedSeconds();
            if (last_loop === false) {
                α = ((elipsed_seconds * (360 / (total_seconds * 1000))) * 1000);
                α %= 360;
                var r = (α * π / 180)
                    , x = Math.round((Math.sin(r) * 125) * 100) / 100
                    , y = Math.round((Math.cos(r) * -125) * 100) / 100
                    , mid = (α > 180) ? 1 : 0
                    , anim = 'M 0 0 v -125 A 125 125 1 '
                    + mid + ' 1 '
                    + x + ' '
                    + y + ' z';
            } else {
                var anim = 'M 0 0 v -125 A 125 125 1 1 1 -0.1 -125 z';
            }
            loader.setAttribute('d', anim);
            border.setAttribute('d', anim);
            appendCountdownSeconds();
        }; // drawCountdown END
        function getElapsedSeconds() {
            var timeDifference = (new Date() - timer_start - offset) / 1000;
            elipsed_seconds = timeDifference;
        }; // getElapsedSeconds END
        function appendCountdownSeconds() {
            countdown.textContent = (total_seconds - Math.floor(elipsed_seconds)).toString();
            adjustCountDownOffset();
        }; // appendCountdowSeconds END
        function adjustCountDownOffset() {
            var main_container_width = main_container.getAttribute("width");
            var main_container_height = main_container.getAttribute("height");
            var counter_width = countdown.getBBox().width;
            var counter_height = countdown.getBBox().height;
            var countdown_x = Math.round((main_container_width - counter_width) / 2);
            var countdown_y = Math.round((main_container_height - counter_height) - (counter_height / 2));
            countdown.setAttribute("x", countdown_x);
            countdown.setAttribute("y", countdown_y);
        };

        function startfinishAnimation() {
            if (finishAnimTimer == null) {
                finishAnimTimer = setInterval(finishAnimation, 100);
            }
        };

        function stopfinishAnimation() {
            if (finishAnimTimer != null) {
                clearInterval(finishAnimTimer);
                loader.setAttribute("transform", "translate(125, 125) scale(.84)");
                finishAnimTimer = null;
            }
        };

        function finishAnimation() {
            var x = loader.getAttribute("transform");
            if (scaleAnimation >= 84 & scaleAnimation < 95) {
                scaleAnimation = scaleAnimation + 1;
            } else if (scaleAnimation == 95) {
                scaleAnimation = 84;
            }
            var transform = "translate(125, 125) scale(." + scaleAnimation + ")";
            loader.setAttribute("transform", transform);
        };
    }; // start_countdown END
})();


/**********************************************
 * Transformation and broadcasting function *
 **********************************************/

(function () {
    //
    // This code was written by nickname MvG
    //
    // For the origin of the code see:
    // @see http://jsfiddle.net/dFrHS/1/
    //
    // No license was connected to the written code below,
    // but all credits belong to the rightful owner.

    /**
     * Return the adjugate of a given matrix.
     **/
    const adj = function (m) { // Compute the adjugate of m
        return [
            m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
            m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
            m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
        ];
    }

    /**
     * Compute the product of two given matrices.
     **/
    const multmm = function (a, b) { // multiply two matrices
        var c = Array(9);
        for (var i = 0; i != 3; ++i)
            for (var j = 0; j != 3; ++j) {
                var cij = 0;
                for (var k = 0; k != 3; ++k)
                    cij += a[3 * i + k] * b[3 * k + j];
                c[3 * i + j] = cij;
            }
        return c;
    }

    /**
     * Compute the product of a given matrix and a given vector.
     **/
    const multmv = function (m, v) { // multiply matrix and vector
        return [
            m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
            m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
            m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
        ];
    }

    /**
     * Compute the solution of the given system.
     **/
    const basisToPoints = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var m = [
            x1, x2, x3,
            y1, y2, y3,
            1, 1, 1
        ];
        var v = multmv(adj(m), [x4, y4, 1]);
        return multmm(m, [
            v[0], 0, 0,
            0, v[1], 0,
            0, 0, v[2]
        ]);
    }

    /**
     * Calculate the transformation matrix to transform given source points onto given destination points.
     **/
    const general2DProjection = function (x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d,
                                          x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
        var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
        var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
        return multmm(d, adj(s));
    }

    /**
     * Transform the given html element from a given point set to a rectangle.
     **/
    function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
        var w = window.innerWidth, h = window.innerHeight;
        var t = general2DProjection(x1, y1, 0, 0, x2, y2, w, 0, x3, y3, 0, h, x4, y4, w, h);
        for (i = 0; i != 9; ++i) t[i] = t[i] / t[8];
        t = [t[0], t[3], 0, t[6],
            t[1], t[4], 0, t[7],
            0, 0, 1, 0,
            t[2], t[5], 0, t[8]];
        t = "matrix3d(" + t.join(", ") + ")"; //setup the html 3D transformation.
        console.log(t)
        elt.style.transform = t;
    }

    function scaleCenter(center, refPicture, newPicture) {
        temp = {}
        temp.x = center.x * newPicture.x / refPicture.x;
        temp.y = center.y * newPicture.y / refPicture.y;
        return temp
    }

    function scalePoints(corners, refPicture, newPicture) {
        temp = [{}, {}, {}, {}]
        for (let i in corners) {
            temp[i].x = corners[i].x * newPicture.x / refPicture.x;
            temp[i].y = corners[i].y * newPicture.y / refPicture.y;
        }
        return temp
    }

    const transformSlave = function (elt, corners, refPictureLength) {
        corners = scalePoints(corners, refPictureLength, {x: elt.width, y: elt.height})
        transform2d(elt, corners[3].x, corners[3].y, corners[0].x, corners[0].y,
            corners[2].x, corners[2].y, corners[1].x, corners[1].y);
    };

    /********************
     * Image show-off *
     ********************/

        // Paste the given part of the given picture on the client canvas.
    const pastePicture = function (myCanvas, picture, corners, refPictureLength) {
            myCanvas.width = picture.width;
            myCanvas.height = picture.height;
            ctx = myCanvas.getContext('2d');

            ctx.drawImage(picture, 0, 0, myCanvas.width, myCanvas.height); // destination rectangle

            transformSlave(myCanvas, corners, refPictureLength);
        };

    socket.on('showPicture', async function (data) {
        cleanHTML()
        console.log('drawing picture', data)
        canvas.style.display = "block"
        document.body.style.backgroundColor = "black"; // This is for smoother picture monitoring. Else white borders are possible.
        var img = new Image()

        img.onload = function () {
            pastePicture(canvas, img, data.corners, {x: data.picDim[1], y: data.picDim[0]});
        }

        img.src = 'data:image/jpeg;base64,' + data.picture;
    });


    /********************
     * Video show-off *
     ********************/

        // Paste the given part of the given picture on the client canvas.
    const pasteVideo = function (myCanvas, video, corners, refPictureLength) {
            myCanvas.width = video.videoWidth;
            myCanvas.height = video.videoHeight;
            transformSlave(myCanvas, corners, refPictureLength);
        };

    // Draw the current frame of the video
    const drawVideo = function (myCanvas, video) {
        myCanvas.getContext('2d').drawImage(video, 0, 0, myCanvas.width, myCanvas.height);
    };

    socket.on('loadVideo', async function (data, callback) {
        cleanHTML();
        video.src = 'static/big_buck_bunny.mp4';
        video.onloadeddata = async function () {
            video.width = data.picDim[1];
            video.height = data.picDim[0];
            transformSlave(video, data.corners, {x: data.picDim[1], y: data.picDim[0]});
            await waitForBuffer(5)
            callback()
        };

        video.pause();
        video.preload = "auto";
        video.muted = true;
        video.currentTime = 0;
        video.style.display = "block";
    });

    socket.on('vidEnded', function (data, callback) {
        video.onended = function () {
            callback();
            clearInterval(vidBufferCheck);
            //clearInterval(vidDrawer);
        }
    });

    socket.on('playVideo', function (maxLat) {
        console.log("playing video");
        setTimeout(() => {
            video.play();
            /**vidDrawer = setInterval(function(){
				drawVideo(canvas, video)
			}, 100/6)
             */
        }, maxLat - latency)
    });

    /**socket.on('updateVideo', function(data){
		let cTime = (data + latency)/1000
		let lTime = video.currentTime
		let offset = lTime - cTime
		let newVidPBR = video.playbackRate + (1.0 - offset/5 - video.playbackRate)/3
		video.playbackRate = newVidPBR
	})*/

    socket.on('pauseAt', function (time) {
        console.log('pausing at ' + time);
        video.pause();
        video.currentTime = time
    })

    /*socket.on('waitForBuffer', async function(data, callback){
        await waitForBuffer(5)
        resolve()
    })*/

    // returns a promise that waits for a certain amount of seconds to be buffered (sBuffered)
    function waitForBuffer(sBuffered) {
        return new Promise(async function (resolve, reject) {
            while (true) {
                if (video.buffered.length >= 1) {
                    if (video.buffered.end(0) - video.currentTime >= sBuffered /**||
                     video.buffered.end(0) - video.duration <= 0.1*/) {
                        resolve();
                        break
                    }
                }
                await sleep(50)
            }
        })
    };

    function startBufferCheck() {
        const minBuffered = 1; // minimum number of seconds to buffer
        vidBufferCheck = setInterval(async function () {
            if (video.buffered.end(0) - video.currentTime < minBuffered ||
                video.buffered.end(0) - video.duration > 0.1) {
                socket.emit('waitForBuffer', video.currentTime)
            }
        }, 200)
    }


	/*****************************
	 * Triangulation functions *
	 *****************************/

	// Draw the given triangulation in the canvas
	function drawTriangulation(centers, connections, refPictureLength) {
		//Constants
		const outerRadius = 20,
			innerRadius = 7.5;
		var rot = Math.PI / 2 * 3,
			step = Math.PI / 5,
			x,
			y;

		context.fillStyle = 'black';
		context.lineWidth = 10;

		// Draw all centers
		for (let centerId in centers) {
			// Define center
			center = centers[centerId]
			center = scaleCenter(center, refPictureLength, {x: canvas.width, y: canvas.height})
			var cx = center.x;
			var cy = center.y;

			// Draw the star in the current center.
			context.beginPath();
			context.moveTo(cx, cy - outerRadius);
			for (let i = 0; i < 5; i++) {
				x = cx + Math.cos(rot) * outerRadius;
				y = cy + Math.sin(rot) * outerRadius;
				context.lineTo(x, y);
				rot += step;

				x = cx + Math.cos(rot) * innerRadius;
				y = cy + Math.sin(rot) * innerRadius;
				context.lineTo(x, y);
				rot += step
			}
			context.lineTo(cx, cy - outerRadius);
			context.closePath();
			context.fill();

			// Draw the lines between all connected centers.
			for(let cnctPoint of connections[centerId]){
				context.moveTo(cx, cy);	// start point
				context.lineTo(cnctPoint[0], cnctPoint[1]); // end point
				context.stroke(); // Make the line visible
			}
		}
	}

	socket.on('triangulate', function(data){
		cleanHTML()
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.style.display = "block"
		canvas.width = data.picDim[1]
		canvas.height = data.picDim[0]
		transformSlave(canvas, data.corners, {x: data.picDim[1], y: data.picDim[0]})
		drawTriangulation(data.centers, data.connections, {x: data.picDim[1], y: data.picDim[0]})
	});


	/*********************
	 * Snake functions *
	 *********************/

	// socket.on('createSnake', function(data){
	// 	cleanHTML()
	// 	canvas.style.display = "block";
	// 	context.clearRect(0, 0, canvas.width, canvas.height);
	// 	canvas.width = data.picDim[1];
	// 	canvas.height = data.picDim[0];
	// 	transformSlave(canvas, data.corners, {x: data.picDim[1], y: data.picDim[0]});
	// })

	// socket.on('updateSnake', function(data){
	// 	setTimeout(updateS, data.maxLat - latency, data.snake)
	// })

	// function updateS(snake) {
	//   context.clearRect(0, 0, canvas.width, canvas.height);
	//   drawSnake(snake);
	// }

	socket.on('updateWorld', function(data){
		setTimeout(updateW, data.maxLat - latency, data.world)
	})

	function updateW(world) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (let snakeId in world.objects)
			drawSnake(world.objects[snakeId]);
	}

	socket.on('clearAll', function(){
		cleanHTML()
		// show the start page again.
		wrapper.style.display = "block"
		// show scroll bar again
		document.body.style.overflow = 'visible';
		video.style.display = 'none';

		window.cancelAnimationFrame(animation);
	})

	/***********************
		* Animation showoff *
	 ***********************/

	// Socket reactie om animatie klaar te maken
	var maxFps, picDim, corners
	socket.on('prepareAnimation', function (data, callback) {
	    var clock = Date.now()
			corners = data.corners;
			picDim = data.picDim;
			setupCanvas()
			prepareAnimation(data.animation);
	    stop = false
	    frameCount = 0
	    callback({
	        lat: latency,
	        offset: clock - data.timeSent - latency,
	        maxFps: maxFps
	    })
	});

	function setupCanvas() {
		cleanHTML()
		canvas.style.display = "block";
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.width = picDim[1];
		canvas.height = picDim[0];
		transformSlave(canvas, corners, {x: picDim[1], y: picDim[0]});
	}

	// Socket reactie om animatie te starten
	var fps, fpsInterval, startTime, now, then, elapsed;
	socket.on('startAnimation', function(data) {
		console.log('Start')
	  fpsInterval = 1000 / data.fps;
	  then = data.startTime + data.offset
	  startTime = then;
	  frameCount = 0
	  console.log("Start", then, " ", Date.now())
	  animation = requestAnimationFrame(animate)
	});

	// Socket reaction on control of server side.
	var framesToCorrect = 0
	socket.on('atFrame', function (data) {
	    framesToCorrect = Math.round((data.dt + latency) / fpsInterval) - frameCount
	})

	// initialize the timer variables and start the animation
	function prepareAnimation(animation) {
	    createObjects(animation);
	    w1 = new Date()
	    draw(0)
	    w2 = new Date()
	    workload = w2 - w1
	    maxFps = 1000 / workload
	}

	var world;
	function createObjects(animation) {
		if (animation.type === "snake"){
 			world = new Snake(animation.length, picDim[0] / 25, animation.path[0].pos, {light: "#008000", dark: "#004000"})
			world.cachePath(animation.path)
		}
		else alert('Niet genoeg info')
	}

	// the animation loop calculates time elapsed since the last loop
	// and only draws if your specified fps interval is achieved
	var frameCount = 0;
	var animation
	function animate() {

	    // request another frame
	    if (!stop) animation = requestAnimationFrame(animate);

	    // calc elapsed time since last loop
	    now = Date.now();
	    elapsed = now - then;

	    // if enough time has elapsed, draw the next frame
	    if (elapsed > fpsInterval) {
	        // Get ready for next frame by setting then=now, but also adjust for your
	        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
	        then = now - (elapsed % fpsInterval);

	        draw(fpsInterval);

	    }
	}

	var scaling = 1
	function draw(dt, ctx = context) {
	    context.clearRect(0, 0, canvas.width, canvas.height);

	    if (framesToCorrect) {
	        var correctionFactor = framesToCorrect // > 0 ? 1 * scaling : -1 * scaling;
	        frameCount += correctionFactor
	        framesToCorrect -= correctionFactor
	    } else var correction = 0

	    // console.log("correction: ", framesToCorrect)

			world.draw(context)
      world.update(dt);
			for (let i = 0; i < correctionFactor; i++) world.update(dt);

	    frameCount++
	}

})()



