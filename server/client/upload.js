// async function save() {
//     const imageFilesTest = Array.from(document.getElementById('imageUploadTest').files);
//     const labelFilesTest = Array.from(document.getElementById('labelUploadTest').files);

//     const imageFilesTrain = Array.from(document.getElementById('imageUploadTrain').files);
//     const labelFilesTrain = Array.from(document.getElementById('labelUploadTrain').files);

//     const imageFilesVal = Array.from(document.getElementById('imageUploadVal').files);
//     const labelFilesVal = Array.from(document.getElementById('labelUploadVal').files);


//     const progress = document.getElementById('prbar');
//     progress.style.display = 'block';

//     if (imageFiles.length !== labelFiles.length) {
//         alert('Please select the same number of image and label files.');
//         progress.style.display = 'none';
//         return;
//     }

//     const filePairs = imageFiles.map((imageFile, index) => ({
//         imageFile,
//         labelFile: labelFiles[index],
//     }));

//     const progressBar = document.getElementById('progressBar');
//     progressBar.style.width = '0%';

//     for (let i = 0; i < filePairs.length; i++) {
//         const jsonDataString = JSON.parse(localStorage.getItem('user'));

//         const { imageFile, labelFile } = filePairs[i];

//         const imageNameWithoutExtension = imageFile.name.replace(/\.[^/.]+$/, '');
//         const labelNameWithoutExtension = labelFile.name.replace(/\.[^/.]+$/, '');

//         if (imageNameWithoutExtension !== labelNameWithoutExtension) {
//             alert('File names (excluding extensions) must match.');
//             progress.style.display = 'none';
//             return;
//         }

//         const imageBase64 = await fileToBase64(imageFile);
//         const labelBase64 = await fileToBase64(labelFile);

//         const data = {
//             imageFileName: imageNameWithoutExtension,
//             labelFileName: labelNameWithoutExtension,
//             imageBase64,
//             labelBase64,
//         };

//         try {
//             const xhr = new XMLHttpRequest();

//             // Track upload progress
//             xhr.upload.addEventListener('progress', (event) => {
//                 if (event.lengthComputable) {
//                     const percentComplete = Math.round((event.loaded / event.total) * 100);
//                     progressBar.style.width = percentComplete + '%';
//                     progressText.innerText = percentComplete + '%';
//                 }
//             });

//             // Handle successful upload
//             xhr.onload = function () {
//                 if (xhr.status === 200) {
//                     if (i === filePairs.length - 1) {
//                         // All files uploaded
//                         document.getElementById('training_btn').style.display = 'block';
//                         document.getElementById('training_btns').style.display = 'block';
//                         progress.style.display = 'none';
//                     }
//                 } else {
//                     alert('Failed to save files on the server.');
//                     progress.style.display = 'none';

//                 }
//             };

//             xhr.open('POST', `/upload?userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
//             xhr.setRequestHeader('Content-Type', 'application/json');
//             xhr.send(JSON.stringify(data));

//         } catch (error) {
//             console.error('Error:', error);
//             progress.style.display = 'none';

//             alert('An error occurred while saving files on the server.');
//         }
//     }
// }

<div id="popup">
<div class="popup">
    <span class="close" onclick="closePopup()">&times;</span>
    <div style="display: flex; align-items: center; justify-content: center;">
        <div style="margin: 20px;">
            <h3>Upload Images and Labels for Test</h3>
            <div class="center_input">
                <div class="input-wrapper">
                    <label for="imageUpload" id="imageLabelTest" class="file-label">Select Images (PNG
                        only):</label>
                    <input type="file" id="imageUploadTest" accept="image/png" onchange="updateImageLabelTest()"
                        multiple />
                </div>
                <div class="input-wrapper">
                    <label for="labelUpload" id="labelLabelTest" class="file-label">Select Labels (TXT
                        only):</label>
                    <input type="file" id="labelUploadTest" accept=".txt" onchange="updateLabelLabelTest()"
                        multiple />
                </div>
            </div>
        </div>

        <div style="margin: 20px;">
            <h3>Upload Images and Labels for Train</h3>
            <div class="center_input">
                <div class="input-wrapper">
                    <label for="imageUpload" id="imageLabelTrain" class="file-label">Select Images (PNG
                        only):</label>
                    <input type="file" id="imageUploadTrain" accept="image/png" onchange="updateImageLabelTrain()"
                        multiple />
                </div>
                <div class="input-wrapper">
                    <label for="labelUpload" id="labelLabelTrain" class="file-label">Select Labels (TXT
                        only):</label>
                    <input type="file" id="labelUploadTrain" accept=".txt" onchange="updateLabelLabelTrain()"
                        multiple />
                </div>
            </div>
        </div>

        <div style="margin: 20px;">
            <h3>Upload Images and Labels for Val</h3>
            <div class="center_input">
                <div class="input-wrapper">
                    <label for="imageUpload" id="imageLabelVal" class="file-label">Select Images (PNG
                        only):</label>
                    <input type="file" id="imageUploadVal" accept="image/png" onchange="updateImageLabelVal()"
                        multiple />
                </div>
                <div class="input-wrapper">
                    <label for="labelUpload" id="labelLabelVal" class="file-label">Select Labels (TXT
                        only):</label>
                    <input type="file" id="labelUploadVal" accept=".txt" onchange="updateLabelLabelVal()"
                        multiple />
                </div>
            </div>
        </div>

    </div>
    <div class="button_center">
        <button onclick="save()" class="save-button">Save Files</button>
    </div>

    <div class="progress-bar-container" id="prbar">
        <div id="progressBar"></div>
        <div id="progressText">0%</div>
    </div>
    <div class="traing_btn">
        <a href="/training" style="text-decoration: none;">
            <button id="training_btn" class="save-button">Training from Scratch</button>
        </a>
        <a href="/pretrained" style="text-decoration: none;">
            <button id="training_btns" class="save-button" style="margin-left: 20px;">Training from
                Pretrained</button>
        </a>
    </div>
</div>
</div>