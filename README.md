# UFCFace
UFCFace is a web application designed to perform facial comparison with current UFC fighters. Through the use of the Tensorflow.js and Tracking.js libraries, the application is able to perform facial detection/recognition at the client-side. 

# Workflow
1.) The application first accepts user input in the form of a jpeg image

2.) Before proceeding, the image is checked for EXIF metadata, and orientated appropriately if found

3.) The tracking.js library is then utilized to detect the prescence of faces which may exist in the image

4.) If a face is detected, the image data associated with it is then normalized/scaled in order to be processed by the CNN

5.) The CNN model is loaded at the client-side through tensorflow.js, and a class prediction is provided by the network's output

6.) The prediction is displayed to the user, as the application waits for further input. 

# CNN Architecture
The convolutional neural network used for facial recognition consists of:
- Two convolutional layers, the first consisting of 8 3x3 kernels, and the second consisting of 16 3x3 kernels
- Two max pooling layers
- A fully connected artificial neural network with an initial 256 node layer, and an 11 node output layer
