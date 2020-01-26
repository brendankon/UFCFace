//Classes for our network's prediction
var champs = ["Henry Cejudo", "Israel Adesanya", "Jon Jones", "Khabib Nurmagomedov", "Conor McGregor",
             "Stipe Miocic", "Amanda Nunes", "Valentina Shevchenko", "Kamaru Usman", "Alexander Volkanovski",
             "Weili Zhang"];

window.onload = function(){
    var imageSelect = document.getElementById("file");
    var button = document.getElementById("button");
    var canvas = document.getElementById("boxes");
    var context = canvas.getContext('2d');
    var image1 = document.getElementById("PicBox1");
    var image2 = document.getElementById("PicBox2");
    context.drawImage(image1, 0, 0);
    context.drawImage(image2, 380, 0);
    button.onclick = function(){
        imageSelect.click();
    };
};

//Function for detecting face in user image, and displaying it on screen
function showImage(src, target, callback){
    var image1 = document.getElementById("PicBox1");
    var fr = new FileReader();
    var valid = null;
    fr.onload = function(){
        target.src = fr.result;
    };
    //Update user image source
    fr.readAsDataURL(src.files[0]);
    image1.onload = function(){
        var canvas = document.getElementById("boxes");
        var context = canvas.getContext('2d');
        var header = document.getElementById("description");
        //Detect face in user image, return if no face is found
        $('#PicBox1').faceDetection({
            complete: function (faces) {
                valid = faces[0];
                if(faces[0] == null){
                    header.innerHTML = "Error: No Face Detected";
                    return;
                }
                //Properly crop face from original image and display
                var newX = faces[0].x - (faces[0].width * .4);
                var newY = faces[0].y - (faces[0].height * .4);
                var newWidth = faces[0].width + (faces[0].width * .8);
                var newHeight = faces[0].height + (faces[0].height * .8);
                context.clearRect(0,0,322,380);
                context.drawImage(image1, newX , newY, newWidth, newHeight, 0, 0, 322, 380);
            }
        });
        callback(valid);
    };
}

function getPrediction(valid){
    //Check if face was detected earlier, and return if not
    if(valid == null){
        return;
    }
    var image = document.getElementById("PicBox1");
    //Load CNN model
    tf.loadLayersModel('https://ufcface.com/models/model.json').then(model => {
        var netData = document.getElementById("netData");
        //Create new image with proper dimensions/normalization for CNN input
        netData.src = image.src;
        netData.style.visibility = "hidden";
        netData.width = 64;
        netData.height = 64;
        var faceData = tf.browser.fromPixels(netData);
        var rescale = tf.scalar(255);
        faceData = faceData.div(rescale)
        faceData = faceData.reshape([-1, faceData.shape[0],faceData.shape[1],faceData.shape[2]]);
        var preds = model.predict(faceData);
        var max = getMaxPred(preds.dataSync());
        var head = document.getElementById("description");
        //Update header with network's predicted class
        head.innerHTML = champs[max];
        var canvas = document.getElementById("boxes");
        var context = canvas.getContext('2d');
        var image2 = document.getElementById("PicBox2");
        image2.src = "Classes/" + champs[max] + ".jpg";
        //Display proper class image on screen
        image2.onload = function(){
            context.clearRect(380,0,322,380);
            context.drawImage(image2, 380, 0, 322, 380);
        };
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
