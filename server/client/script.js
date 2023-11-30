var x = document.getElementById("demo");
var map;
let isLodind = false;

document.getElementById('popup').style.display = 'none';


document.getElementById('training_btn').style.display = 'none';
document.getElementById('training_btns').style.display = 'none';

var loadingSpinner = document.getElementById("loadingSpinner");
var detectButton = document.getElementById("exportBtn");



var centerPoint = [22.589659435441984, 88.41788365584796]; // Indian coordinates

// Global variable to store GeoJSON layers
const geoJsonLayers = {};
var geoJsonLayersAll = false;

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

L.control.scale().addTo(map);

// Create custom measure tools instances.
var measure = L.measureBase(map, {});

var mimeTypes = map.supportedCanvasMimeTypes();
var mimeArray = [];
for (var type in mimeTypes) {
    mimeArray.push(mimeTypes[type]);
}

function downloadMap(caption) {
    loadingSpinner.style.display = 'block';
    detectButton.style.display = 'none';
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
        var northEast = bounds.getNorthEast();
        var southWest = bounds.getSouthWest();

        console.log('Northwest Coordinates:', northWest.lat, northWest.lng);
        console.log('Southeast Coordinates:', southEast.lat, southEast.lng);
        console.log('Northeast Coordinates:', northEast.lat, northEast.lng);
        console.log('Southwest Coordinates:', southWest.lat, southWest.lng);

        // Send the base64Data to the server using an HTTP POST request
        fetch('/save-captured-image', {
            method: 'POST',
            body: JSON.stringify({ image: result, northWest: northWest, southEast: southEast }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    loadingSpinner.style.display = 'none';
                    detectButton.style.display = 'block';
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            })
            .then((data) => {
                // Handle the received data
                console.log(data.geojson);
                var myLayer = L.geoJSON(data.geojson, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);

                var myLayer = L.geoJSON(data.geojson, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);

                const classes = extractDetectedClasses(data.geojson.features); // Use data.features
                const color = extractDetectedColor(data.geojson.features); // Use data.features
                const objectsPerClass = calculateObjectsPerClass(data.geojson.features);
                const totalClasses = data.geojson.features.length;

                // Update the content of the icons based on the detected classes
                updateIconContentOnPage(classes, color, objectsPerClass, totalClasses);
                loadingSpinner.style.display = 'none';
                detectButton.style.display = 'block';
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch request or JSON parsing
                console.error('Error:', error);
                loadingSpinner.style.display = 'none';
                detectButton.style.display = 'block';
            });
        return result;
    });
}


//   async function updateIconContent() {
//     try {
//         const response = await fetch('/get-recent-geojson');

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data =  await response.json();
//         const detectedClasses = extractDetectedClasses(data.features); // Use data.features

//         // Update the content of the icons based on the detected classes
//         updateIconContentOnPage(detectedClasses);
//     } catch (error) {
//         console.error('Error fetching detected classes:', error);
//     }
// }

function extractDetectedClasses(features) {
    if (!features || !Array.isArray(features)) {
        console.error('Invalid GeoJSON structure:', features);
        return [];
    }
    const classes = features.map(feature => feature.properties.name);
    return [...new Set(classes)];
}


function extractDetectedColor(features) {
    if (!features || !Array.isArray(features)) {
        console.error('Invalid GeoJSON structure:', features);
        return [];
    }
    const color = features.map(feature => feature.properties.color);
    return [...new Set(color)];
}

function calculateObjectsPerClass(features) {
    if (!features || !Array.isArray(features)) {
        console.error('Invalid GeoJSON structure:', features);
        return [];
    }

    const classCounts = {};

    features.forEach(feature => {
        const className = feature.properties.name;

        if (className) {
            if (classCounts[className]) {
                classCounts[className]++;
            } else {
                classCounts[className] = 1;
            }
        }
    });

    return Object.values(classCounts);
}


// Function to toggle the visibility of a GeoJSON layer
async function toggleLayerVisibilityAll() {

    if (geoJsonLayersAll === true) {
        // Clear existing layers
        map.eachLayer(l => {
            if (l instanceof L.GeoJSON) {
                map.removeLayer(l);
            }
        });

        // Empty geoJsonLayers object
        geoJsonLayersAll = false;
    } else {
        // If the layer doesn't exist, fetch and add it
        await fetchRecentGeoJSONAll();
    }
}

// Function to toggle the visibility of a GeoJSON layer
async function toggleLayerVisibility(className) {
    const layer = geoJsonLayers[className];

    console.log(layer);
    if (layer) {
        await fetchRecentGeoJSON();
    } else {
        // If the layer doesn't exist, fetch and add it
        await updateGeoJSONLayer(className);
    }
}

// Function to fetch recent GeoJSON data and add it to the map
async function fetchRecentGeoJSON() {
    await fetch('/get-recent-geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // // Ensure the GeoJSON structure is properly handled
            if (data) {
                // Clear existing layers
                map.eachLayer(l => {
                    if (l instanceof L.GeoJSON) {
                        map.removeLayer(l);
                    }
                });

                // Add new data to the map
                const newLayer = L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);

                // Empty geoJsonLayers object
                Object.keys(geoJsonLayers).forEach(key => delete geoJsonLayers[key]);
            } else {
                console.error('Invalid GeoJSON structure:', data.geojson);
            }
        })
        .catch(error => {
            console.error('Error fetching recent GeoJSON:', error);
        });
}

async function fetchRecentGeoJSONAll() {
    await fetch('/get-recent-geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // // Ensure the GeoJSON structure is properly handled
            if (data) {
                // Clear existing layers
                map.eachLayer(l => {
                    if (l instanceof L.GeoJSON) {
                        map.removeLayer(l);
                    }
                });

                // Add new data to the map
                const newLayer = L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);

                if (newLayer) {
                    geoJsonLayersAll = true;
                }


            } else {
                console.error('Invalid GeoJSON structure:', data.geojson);
            }
        })
        .catch(error => {
            console.error('Error fetching recent GeoJSON:', error);
        });
}

// Function to update GeoJSON layer for a specific class
async function updateGeoJSONLayer(className) {
    await fetch(`/get-geojson-by-class?classNames=${encodeURIComponent(className)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Ensure the GeoJSON structure is properly handled
            if (data.geojson && data.geojson.features && Array.isArray(data.geojson.features)) {
                // Clear existing layers
                map.eachLayer(l => {
                    if (l instanceof L.GeoJSON) {
                        map.removeLayer(l);
                    }
                });

                // Add new data
                const newLayer = L.geoJSON(data.geojson, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);
                geoJsonLayers[className] = newLayer;
            } else {
                console.error('Invalid GeoJSON structure:', data.geojson);
            }
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });
}


function updateIconContentOnPage(detectedClasses, detectedColor, number, totalClass) {
    const iconBar = document.getElementById('iconBar');

    // Log the detected classes to the console
    // console.log('Detected Classes (updateIconContentOnPage):', detectedClasses);

    // Remove existing icons
    iconBar.innerHTML = '';

    for (let i = 0; i < detectedClasses.length; i++) {

        // Assuming detectedClasses is an array of objects with 'name' and 'color' properties
        const detectedClass = detectedClasses[i];

        // Use the provided HTML structure
        const iconHTML = `
              <div class="icon" onmouseover="showLabel('label${i}')" onmouseout="hideLabel('label${i}')">
                  <a href="#${detectedClass}" onclick="toggleLayerVisibility('${detectedClass}')" style="background: ${detectedColor[i] || '#000000'};" ><i class="hoverss"> <p>${number[i]}</p></i></a>
                  <div class="label" style="background: ${detectedColor[i] || '#000000'};   border-color: transparent ${detectedColor[i] || '#000000'} transparent transparent;
                  " id="label${i}"><p>${detectedClass}</p></div>
              </div>
          `;

        // Append the HTML to the icon bar
        iconBar.innerHTML += iconHTML;

        if (!geoJsonLayers[detectedClass.name]) {
            geoJsonLayers[detectedClass.name] = L.geoJSON([], {
                style: function (feature) {
                    return {
                        color: feature.properties.color || '#000000',
                        weight: 2,
                        opacity: 1
                    };
                }
            }).addTo(map);
        }

        // Check if it's the last iteration
        if (i === detectedClasses.length - 1) {
            // Add the additional div for the last element
            const lastIconHTML = `
                <div class="icon" onmouseover="showLabel('label2')" onmouseout="hideLabel('label2')">
                    <a href="#" onclick="toggleLayerVisibilityAll()"><i class="hoverss"> <p>${totalClass}</p></i></a>
                    <div class="label" id="label${i}"><p>Toggle all</p></div>
                </div>
            `;

            iconBar.innerHTML += lastIconHTML;
        }
    }
}


// document.getElementById('exportBtn').addEventListener('click', function () {
//     updateIconContent();
// });

function showLabel(labelId) {
    const label = document.getElementById(labelId);
    if (label) {
        label.style.display = "block";
        label.style.opacity = "1";
    }
}

function hideLabel(labelId) {
    const label = document.getElementById(labelId);
    if (label) {
        label.style.display = "none";
        label.style.opacity = "0";
    }
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

// function downloadShapefile() {
//     // Send an HTTP request to the server to generate the shapefile.
//     fetch('/generate-shapefile', {
//         method: 'POST',
//     })
//     .then(response => {
//         if (response.ok) {
//             // The server successfully generated the shapefile.
//             console.log('The server successfully generated the shapefile.')
//         } else {
//             // Handle errors.
//             console.error('Failed to generate shapefile.');
//         }
//     })
//     .catch(error => {
//         // Handle network or other errors.
//         console.error('Request error:', error);
//     });
// }

function downloadShapefile() {
    // Send an HTTP request to the server to generate the shapefile.
    fetch('/generate-shapefile', {
        method: 'POST',
    })
        .then(response => {
            if (response.ok) {
                // The server successfully generated the shapefile.
                return response.blob(); // Convert response to a Blob
            } else {
                // Handle errors.
                console.error('Failed to generate shapefile.');
                throw new Error('Failed to generate shapefile.'); // Propagate the error
            }
        })
        .then(blob => {
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shapefile.zip'; // Set the desired file name
            document.body.appendChild(a); // Append the link to the document
            a.click(); // Simulate a click on the link to trigger the download
            document.body.removeChild(a); // Remove the link from the document
            console.log('Download initiated successfully.');
        })
        .catch(error => {
            // Handle network or other errors.
            console.error('Request error:', error);
        });
}
