

var x = document.getElementById("demo");
var map;
let isLodind = false;

document.getElementById('popup').style.display = 'none';

document.getElementById('training_btn').style.display = 'none';
document.getElementById('training_btns').style.display = 'none';


var centerPoint = [22.589659435441984, 88.41788365584796]; // Indian coordinates

var geojsonFeature = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            88.41788365584796,
                            22.589659435441984
                        ],
                        [
                            88.41828946176449,
                            22.589659435441984
                        ],
                        [
                            88.41828946176449,
                            22.588996751455213
                        ],
                        [
                            88.41788365584796,
                            22.588996751455213
                        ],
                        [
                            88.41788365584796,
                            22.589659435441984
                        ]
                    ]
                ]
            },
            "properties": {
                "name": "ground track field",
                "class": 6,
                "confidence": 0.6387652158737183
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            88.41792196466704,
                            22.589584151184205
                        ],
                        [
                            88.41828856238381,
                            22.589584151184205
                        ],
                        [
                            88.41828856238381,
                            22.58907491170476
                        ],
                        [
                            88.41792196466704,
                            22.58907491170476
                        ],
                        [
                            88.41792196466704,
                            22.589584151184205
                        ]
                    ]
                ]
            },
            "properties": {
                "name": "ground track field",
                "class": 6,
                "confidence": 0.5804085731506348
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            88.4179338140077,
                            22.589586225070175
                        ],
                        [
                            88.41828031892908,
                            22.589586225070175
                        ],
                        [
                            88.41828031892908,
                            22.589099663614213
                        ],
                        [
                            88.4179338140077,
                            22.589099663614213
                        ],
                        [
                            88.4179338140077,
                            22.589586225070175
                        ]
                    ]
                ]
            },
            "properties": {
                "name": "soccer ball field",
                "class": 13,
                "confidence": 0.47526705265045166
            }
        }
    ]
};



// Create leaflet map.
var baseExportOptions = {
    caption: {
        text: 'India',
        font: '30px Poppins',
        fillStyle: 'black',
        position: [100, 200]
    }
};
var map = L.map('map', {
    editable: true,
    printable: true,
    downloadable: true,
}).setView(centerPoint, 18);

// Add OSM layer.
// Create and add the tile layer
const tileLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    crossOrigin: true,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);
// Create custom measure tools instances.
var measure = L.measureBase(map, {});

var mimeTypes = map.supportedCanvasMimeTypes();
var mimeArray = [];
for (var type in mimeTypes) {
    mimeArray.push(mimeTypes[type]);
}
// document.getElementById('supportedMimeTypes').innerHTML = mimeArray.join(', ');
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);

function downloadMap(caption) {

    var downloadOptions = {
        container: map._container,
        caption: {
            text: caption,
            font: '30px Poppins',
            fillStyle: 'black',
            position: [100, 200]
        },
        exclude: ['.leaflet-control-zoom', '.leaflet-control-attribution'],
        format: 'image/png',
        fileName: 'Map.png',
        afterRender: afterRender,
        afterExport: afterExport
    };
    var promise = map.downloadExport(downloadOptions);
    var data = promise.then(function (result) {
        var bounds = map.getBounds();
        var northWest = bounds.getNorthWest();
        var southEast = bounds.getSouthEast();

        console.log('Northwest Coordinates:', northWest.lat, northWest.lng);
        console.log('Southeast Coordinates:', southEast.lat, southEast.lng);
        
        // Send the base64Data to the server using an HTTP POST request
        fetch('/save-captured-image', {
            method: 'POST',
            body: JSON.stringify({ image: result, northWest: northWest, southEast: southEast }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {

            if (!response.ok) {
                loadingSpinner.style.display = 'none';
                detectButton.style.display = 'block';
                throw new Error('Network response was not ok');
            }

            return response.json(); // Parse the response body as JSON
        })
        return result;
    });
}
function showPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function afterRender(result) {
    return result;
}

function afterExport(result) {
    return result;
}
// // Add click event listener to the capture button
// document.querySelector('.pop-button').addEventListener('click', function () {
//     showPopup();
// });

// // Add click event listener to the capture button
// document.querySelector('.close-button').addEventListener('click', function () {
//     showPopup();
// });




// function findBoundsCoordinates() {
//   var bounds = map.getBounds();
//   var northWest = bounds.getNorthWest();
//   var southEast = bounds.getSouthEast();
//   console.log('Northwest Coordinates:', northWest.lat, northWest.lng);
//   console.log('Southeast Coordinates:', southEast.lat, southEast.lng);
// }


async function save() {
    const imageFile = document.getElementById('imageUpload').files[0];
    const labelFile = document.getElementById('labelUpload').files[0];

    if (!imageFile || !labelFile) {
        alert('Please select both an image and a label file.');
        return;
    }

    const imageNameWithoutExtension = imageFile.name.replace(/\.[^/.]+$/, '');
    const labelNameWithoutExtension = labelFile.name.replace(/\.[^/.]+$/, '');

    if (imageNameWithoutExtension !== labelNameWithoutExtension) {
        alert('File names (excluding extensions) must match.');
        return;
    }

    // Function to convert a file to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Convert image and label files to Base64
    const imageBase64 = await fileToBase64(imageFile);
    const labelBase64 = await fileToBase64(labelFile);

    const data = {
        imageFileName: imageNameWithoutExtension,
        labelFileName: labelNameWithoutExtension,
        imageBase64,
        labelBase64,
    };

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Files saved successfully on the server.');
            document.getElementById('training_btn').style.display = 'block';
            document.getElementById('training_btns').style.display = 'block';

        } else {
            alert('Failed to save files on the server.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving files on the server.');
    }
}
function updateImageLabel() {
    const input = document.getElementById('imageUpload');
    const label = document.getElementById('imageLabel');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected file: ${input.files[0].name}`;
        } else {
            label.textContent = `Select an image file`;
        }
    }
}

function updateLabelLabel() {
    const input = document.getElementById('labelUpload');
    const label = document.getElementById('labelLabel');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected file: ${input.files[0].name}`;
        } else {
            label.textContent = `Select a label file`;
        }
    }
}

// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         x.innerHTML = "Geolocation is not supported by this browser.";
//     }
// }

// function showPosition(position) {
//     mapboxgl.accessToken = 'pk.eyJ1IjoiYXNoaXNoMDYxMyIsImEiOiJjbG51NndoZnYwYnN3MnFucDkwNHFkYms4In0.KfM4hlN5C1-aCEe8JVfEoQ';
//     map = new mapboxgl.Map({
//         container: 'map',
//         style: 'mapbox://styles/ashish0613/cln332wie038l01qx0shq9ees',
//         center: [-0.454295, 51.470020],
//         zoom: 18
//     });

//     new mapboxgl.Marker().setLngLat([2.349014, 48.864716]).addTo(map);

//     // Add click event listener to the capture button
//     document.querySelector('.capture-button').addEventListener('click', function () {
//         captureMapAndSave();
//     });
// }


// function captureMapAndSave() {
//     // Show the loading spinner and hide the button
//     const loadingSpinner = document.getElementById('loadingSpinner');
//     const detectButton = document.getElementById('detectButton');
//     loadingSpinner.style.display = 'block';
//     detectButton.style.display = 'none';
//     // Use Mapbox's screenshot functionality
//     map.once('render', function () {
//         map.getCanvas().toBlob(function (blob) {
//             // Convert the blob to a base64 data URL
//             const reader = new FileReader();
//             reader.readAsDataURL(blob);
//             reader.onloadend = function () {
//                 const base64Data = reader.result;

//                 // Create a download link for the captured image
//                 const url = URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = 'map_capture.png';
//                 document.body.appendChild(a);

//                 // Send the base64Data to the server using an HTTP POST request
//                 fetch('/save-captured-image', {
//                     method: 'POST',
//                     body: JSON.stringify({ image: base64Data }),
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 }).then((response) => {
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     return response.json(); // Parse the response body as JSON
//                 })
//                     .then((data) => {
//                         // Hide the loading spinner and show the button again
//                         loadingSpinner.style.display = 'none';
//                         detectButton.style.display = 'block';
//                         // Now, "data" should contain the processedImage as a base64 string
//                         map.getContainer().style.display = 'none';
//                         // Create the imgElement within the "upper_box" div
//                         // Create the imgElement within the "image" div
//                         const imgElement = document.createElement('img');
//                         imgElement.src = 'data:image/png;base64,' + data.processedImage;

//                         // Get the "image" div by its id and append the imgElement to it
//                         const imageDiv = document.getElementById('image');
//                         imageDiv.style.display = 'block';
//                         imageDiv.appendChild(imgElement);

//                     })
//                     .catch((error) => {
//                         console.error('Error:', error);
//                         alert('Failed to save files on the server.');
//                         loadingSpinner.style.display = 'none';
//                         detectButton.style.display = 'block';
//                     });
//             };
//         }, 'image/png');
//     });

//     const imageDiv = document.getElementById('image');

//     imageDiv.addEventListener('dblclick', function () {
//         // Check if there is an <img> element within the "image" div
//         const imgElement = imageDiv.querySelector('img');

//         if (imgElement) {
//             // If an <img> element exists, remove it
//             imgElement.remove();
//         }

//         // Always show the map container after double-click
//         map.getContainer().style.display = 'block';

//         // Hide the "image" div
//         imageDiv.style.display = 'none';
//     });
//     map.triggerRepaint();
// }