//Classes for our network's prediction
var champs = ["Henry Cejudo", "Israel Adesanya", "Jon Jones", "Khabib Nurmagomedov", "Conor McGregor",
             "Stipe Miocic", "Amanda Nunes", "Valentina Shevchenko", "Kamaru Usman", "Alexander Volkanovski",
             "Weili Zhang"];
var imgData;

window.onload = function(){
    var imageSelect = document.getElementById("file");
    var button = document.getElementById("button");
    var canvas = document.getElementById("boxes");
    var context = canvas.getContext('2d');
    var canvas2 = document.getElementById("boxes2");
    var context2 = canvas2.getContext('2d');
    var image1 = document.getElementById("PicBox1");
    var image2 = document.getElementById("PicBox2");
    context.drawImage(image1, 0, 0);
    context2.drawImage(image2, 40, 0);
    button.onclick = function(){
        imageSelect.click();
    };
};

//Function for detecting face in user image, and displaying it on screen
function showImage(src, target, callback){
    var image1 = document.getElementById("PicBox1");
    var canvas = document.getElementById("boxes");
    var context = canvas.getContext('2d');
    var header = document.getElementById("description");
    var croppedImgData;
    //Check to see if valid file is selected
    if(src.files[0] == null){
        return;
    }
    header.innerHTML = "Analyzing...";
    var degrees = 0;
    var fr = new FileReader();
    var valid = null;
    fr.onload = function(){
        target.src = fr.result;
    };
    //Update user image source
    fr.readAsDataURL(src.files[0]);
    //Retrieve EXIF orientation value if it exists
    EXIF.getData(src.files[0], function(){
       var value = EXIF.getTag(this, "Orientation"); 
       if(value){
            degrees = rotation[value];
        }
    });
    
    image1.onload = function(){
        context.clearRect(0,0,322,380);
        drawBestFit(context, degrees * Math.PI / 180, image1);
        var tracker = new tracking.ObjectTracker('face');
        var canData = canvas.toDataURL("image/jpeg");
        tracker.setStepSize(1);
        tracker.setEdgesDensity(.1);
        var newIm = document.createElement("img");
        newIm.src = canData;
        newIm.width = 322;
        newIm.height = 380;
        newIm.style.display = "none";
        //Being face detection
        tracking.track(newIm, tracker);
        //Event triggered after faces are detected
        tracker.on('track', function(event) {
            valid = event.data;
            if (event.data.length === 0) {
                header.innerHTML = "Error: No Face Detected";
                return;
            } else {
                    var newX = event.data[0].x - (event.data[0].width * .2);
                    var newY = event.data[0].y - (event.data[0].height * .2);
                    if(newX < 0)
                        newX = 0;
                    if(newY < 0)
                        newY = 0;
                    var newWidth = event.data[0].width + (event.data[0].width * .4);
                    var newHeight = event.data[0].height + (event.data[0].height * .4);
                    if(newWidth > (canvas.width-40))
                        newWidth = canvas.width-40;
                    if(newHeight > (canvas.height-40))
                        newHeight = canvas.height-40;
                    image1.src = imgData;
                    image1.onload = function(){
                       context.clearRect(0,0,322,380);
                       context.drawImage(image1, newX , newY, newWidth, newHeight, 0, 0, 322, 380);
                       croppedImgData = canvas.toDataURL("image/jpeg");
                       callback(valid, croppedImgData);

                    };

                }
        });
    }
}

//Display image on canvas based on provided orientation
function drawBestFit(ctx, angle, image) {
    
    var canvas = document.getElementById("boxes");
    var dist = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
    var diagAngle = Math.asin(canvas.height / dist);

    var a1 = ((angle % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2);
    if (a1 > Math.PI)
      a1 -= Math.PI;
    if (a1 > Math.PI / 2 && a1 <= Math.PI)
      a1 = (Math.PI / 2) - (a1 - (Math.PI / 2));
  
    var ang1 = Math.PI / 2 - diagAngle - Math.abs(a1);
    var ang2 = Math.abs(diagAngle - Math.abs(a1));
    
    var scale1 = Math.cos(ang1) * dist / image.height;
    var scale2 = Math.cos(ang2) * dist / image.width;
    
    var scale = Math.max(scale1, scale2);
    
    var dx = Math.cos(angle) * scale;
    var dy = Math.sin(angle) * scale;
    ctx.setTransform(dx, dy, -dy, dx, canvas.width / 2, canvas.height / 2);
    
    ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    imgData = canvas.toDataURL("image/jpeg");
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);

  }

function getPrediction(valid, croppedImgData){
    //Check if face was detected earlier, and return if not
    if(valid == null){
        return;
    }

    //Load CNN model
    tf.loadLayersModel('https://ufcface.com/models/model.json').then(model => {
        var netData = document.getElementById("netData");
        //Create new image with proper dimensions/normalization for CNN input
        netData.src = croppedImgData;
        netData.onload = function(){
            netData.width = 64;
            netData.height = 64;
            document.body.appendChild(netData);
            var faceData = tf.browser.fromPixels(netData);
            var rescale = tf.scalar(255);
            faceData = faceData.div(rescale)
            faceData = faceData.reshape([-1, faceData.shape[0],faceData.shape[1],faceData.shape[2]]);
            var preds = model.predict(faceData);
            var max = getMaxPred(preds.dataSync());
            var head = document.getElementById("description");
            //Update header with network's predicted class
            head.innerHTML = champs[max];
            var canvas = document.getElementById("boxes2");
            var context = canvas.getContext('2d');
            var image2 = document.getElementById("PicBox2");
            image2.src = "Classes/" + champs[max] + ".jpg";
            //Display proper class image on screen
            image2.onload = function(){
                context.clearRect(0,0,362,380);
                context.drawImage(image2, 40, 0, 322, 380);
            };
        }
    });
}

//Function for finding array index with largest softmax value from network's output
function getMaxPred(preds){
    var max = 0;
    for(var i = 1; i < preds.length; i++){
        if(preds[i] > preds[max]){
            max = i;
        }
    }
    return max;
}

//Begin loading user selected image
function loadFile(){
    var image = document.getElementById("PicBox1");
    var imageSelect = document.getElementById("file");
    showImage(imageSelect, image, getPrediction);
}

var rotation = {
  1: 0,
  3: 180,
  6: 90,
  8: 270
};