window.onload = function(){
    var imageSelect = document.getElementById("file");
    var button = document.getElementById("button");
    button.onclick = function(){
        imageSelect.click();
    };
};

function showImage(src, target){
    var fr = new FileReader();
    fr.onload = function(){
        target.src = fr.result;
    };
    fr.readAsDataURL(src.files[0]);
}
function loadFile(){
    var image = document.getElementById("PicBox1");
    var imageSelect = document.getElementById("file");
    showImage(imageSelect, image);
}
