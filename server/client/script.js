var x = document.getElementById("demo");
var map;
let isLodind = false;
const progressBar = document.getElementById('prbar');
progressBar.style.display = 'none';

document.getElementById('popup').style.display = 'none';
const userLoginDivBtn = document.getElementById('userlogins');
const userLoginDivBtntwo = document.getElementById('userloginss');

// userLoginDivBtntwo.style.display = 'none';
// userLoginDivBtn.style.display = 'none';

document.getElementById('training_btn').style.display = 'none';
document.getElementById('training_btns').style.display = 'none';

var loadingSpinner = document.getElementById("loadingSpinner");
var detectButton = document.getElementById("exportBtn");


function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/';
        } else {
            window.location.href = '/';
        }
    });
}

// Function to check user login status
const checkLoginStatus = async () => {
    try {
        const token = sessionStorage.getItem('token');

        if (!token) {
            return { isLoggedIn: false };
        }

        // Fetch user information from the server using the token
        const response = await fetch('/api/v0.1/check-login-status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
                // Add any additional headers if needed
            }
        });

        if (!response.ok) {
            throw new Error();
        }

        const user = await response.json();

        return { isLoggedIn: true, user };
    } catch (error) {
        localStorage.removeItem('user');
        return { isLoggedIn: false };
    }
};

// Function to check login status and update local storage every 3 seconds
const checkAndUpdateLoginStatus = async () => {
    const loginStatus = await checkLoginStatus();

    // Check if the user is logged in
    if (loginStatus.isLoggedIn) {
        // Get references to the userName and userImage elements
        const userNameElement = document.getElementById('userName');
        const userImageElement = document.getElementById('userImage');
        const usenot = document.getElementById('usernotlogin');
        const userLoginDiv = document.getElementById('userlogin');
        userLoginDivBtntwo.style.display = 'block';
        userLoginDivBtn.style.display = 'block';

        // Set the text content of the userName element to the user's name
        userNameElement.textContent = loginStatus.user.user.name;

        // Set the src attribute of the userImage element to the user's profile image
        userImageElement.src = loginStatus.user.user.profileimage;

        // Show the userlogin div
        userLoginDiv.style.display = 'flex';
        usenot.style.display = 'none';

        // Update user details in local storage
        localStorage.setItem('user', JSON.stringify(loginStatus.user));
    } else {
        // Hide the userlogin div
        userLoginDiv.style.display = 'none';
        usenot.style.display = 'block';
        // Clear user details from local storage if not logged in (optional)
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// Initial check when the page loads
checkAndUpdateLoginStatus();

// Periodically check and update every 3 seconds
setInterval(checkAndUpdateLoginStatus, 3000);

// Function to toggle dropdown visibility
function toggleDropdown() {
    var dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.style.display = (dropdownMenu.style.display === "block") ? "none" : "block";
}

// Function to handle logout
function logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
        showSuccess('Logout successfully');
        checkAndUpdateLoginStatus();
    }, 1000);
}

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
// Define a custom icon
var customIcon = L.icon({
    iconUrl: 'https://res.cloudinary.com/diyncva2v/image/upload/v1693944002/location-pin_hcqk7n.png',  // Replace with the URL to your custom icon
    iconSize: [50, 50],  // Adjust the size of the icon as needed
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

// Variable to store the marker
var marker;

// Add the geocoding control
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
}).on('markgeocode', function (e) {
    var latlng = e.geocode.center;

    // Remove the previous marker if it exists
    if (marker) {
        map.removeLayer(marker);
    }

    // Move the map to the searched location
    map.setView(latlng, map.getZoom());

    // Add a marker at the searched location with the custom icon
    marker = L.marker(latlng, { icon: customIcon }).addTo(map);
}).addTo(map);


function downloadMap(caption) {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

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
            body: JSON.stringify({ image: result, northWest: northWest, southEast: southEast, userId: jsonDataString ? jsonDataString.user._id : '' }),
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
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    await fetch(`/get-recent-geojson?userId=${jsonDataString ? jsonDataString.user._id : ''}`)
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
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    await fetch(`/get-recent-geojson?userId=${jsonDataString ? jsonDataString.user._id : ''}`)
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
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    await fetch(`/get-geojson-by-class?classNames=${encodeURIComponent(className)}&userId=${jsonDataString ? jsonDataString.user._id : ''}`)
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


// async function save() {
//     const imageFile = document.getElementById('imageUpload').files[0];
//     const labelFile = document.getElementById('labelUpload').files[0];

//     if (!imageFile || !labelFile) {
//         alert('Please select both an image and a label file.');
//         return;
//     }

//     const imageNameWithoutExtension = imageFile.name.replace(/\.[^/.]+$/, '');
//     const labelNameWithoutExtension = labelFile.name.replace(/\.[^/.]+$/, '');

//     if (imageNameWithoutExtension !== labelNameWithoutExtension) {
//         alert('File names (excluding extensions) must match.');
//         return;
//     }

//     // Function to convert a file to Base64
//     function fileToBase64(file) {
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data
//             reader.onerror = (error) => reject(error);
//             reader.readAsDataURL(file);
//         });
//     }

//     // Convert image and label files to Base64
//     const imageBase64 = await fileToBase64(imageFile);
//     const labelBase64 = await fileToBase64(labelFile);

//     const data = {
//         imageFileName: imageNameWithoutExtension,
//         labelFileName: labelNameWithoutExtension,
//         imageBase64,
//         labelBase64,
//     };

//     try {
//         const response = await fetch('/upload', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json', // Set the content type to JSON
//             },
//             body: JSON.stringify(data),
//         });

//         if (response.ok) {
//             alert('Files saved successfully on the server.');
//             document.getElementById('training_btn').style.display = 'block';
//             document.getElementById('training_btns').style.display = 'block';

//         } else {
//             alert('Failed to save files on the server.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while saving files on the server.');
//     }
// }
// function updateImageLabel() {
//     const input = document.getElementById('imageUpload');
//     const label = document.getElementById('imageLabel');

//     if (input && label) {
//         if (input.files.length > 0) {
//             label.textContent = `Selected file: ${input.files[0].name}`;
//         } else {
//             label.textContent = `Select an image file`;
//         }
//     }
// }

// function updateLabelLabel() {
//     const input = document.getElementById('labelUpload');
//     const label = document.getElementById('labelLabel');

//     if (input && label) {
//         if (input.files.length > 0) {
//             label.textContent = `Selected file: ${input.files[0].name}`;
//         } else {
//             label.textContent = `Select a label file`;
//         }
//     }
// }

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

async function save() {
    const imageFiles = Array.from(document.getElementById('imageUpload').files);
    const labelFiles = Array.from(document.getElementById('labelUpload').files);
    const progress = document.getElementById('prbar');
    progress.style.display = 'block';

    if (imageFiles.length !== labelFiles.length) {
        alert('Please select the same number of image and label files.');
        progress.style.display = 'none';
        return;
    }

    const filePairs = imageFiles.map((imageFile, index) => ({
        imageFile,
        labelFile: labelFiles[index],
    }));

    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0%';

    for (let i = 0; i < filePairs.length; i++) {
        const jsonDataString = JSON.parse(localStorage.getItem('user'));

        const { imageFile, labelFile } = filePairs[i];

        const imageNameWithoutExtension = imageFile.name.replace(/\.[^/.]+$/, '');
        const labelNameWithoutExtension = labelFile.name.replace(/\.[^/.]+$/, '');

        if (imageNameWithoutExtension !== labelNameWithoutExtension) {
            alert('File names (excluding extensions) must match.');
            progress.style.display = 'none';
            return;
        }

        const imageBase64 = await fileToBase64(imageFile);
        const labelBase64 = await fileToBase64(labelFile);

        const data = {
            imageFileName: imageNameWithoutExtension,
            labelFileName: labelNameWithoutExtension,
            imageBase64,
            labelBase64,
        };

        try {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.innerText = percentComplete + '%';
                }
            });

            // Handle successful upload
            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (i === filePairs.length - 1) {
                        // All files uploaded
                        document.getElementById('training_btn').style.display = 'block';
                        document.getElementById('training_btns').style.display = 'block';
                        progress.style.display = 'none';
                    }
                } else {
                    alert('Failed to save files on the server.');
                    progress.style.display = 'none';

                }
            };

            xhr.open('POST', `/upload?userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));

        } catch (error) {
            console.error('Error:', error);
            progress.style.display = 'none';

            alert('An error occurred while saving files on the server.');
        }
    }
}

function updateImageLabel() {
    const input = document.getElementById('imageUpload');
    const label = document.getElementById('imageLabel');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select image files`;
        }
    }
}

function updateLabelLabel() {
    const input = document.getElementById('labelUpload');
    const label = document.getElementById('labelLabel');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select label files`;
        }
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


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
