var x = document.getElementById("demo");
var map;
let isLodind = false;

document.getElementById('popup').style.display = 'none';

document.getElementById('training_btn').style.display = 'none';
document.getElementById('training_btns').style.display = 'none';


var centerPoint = [22.589659435441984, 88.41788365584796]; // Indian coordinates

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


// Create custom measure tools instances.
var measure = L.measureBase(map, {});

var mimeTypes = map.supportedCanvasMimeTypes();
var mimeArray = [];
for (var type in mimeTypes) {
    mimeArray.push(mimeTypes[type]);
}

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
                console.log(data.geoJSON);
                var myLayer = L.geoJSON(data.geojson, {
                    style: function (feature) {
                        return {
                            color: feature.properties.color || '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch request or JSON parsing
                console.error('Error:', error);
            });
        return result;
    });
}

/* Function to open the sidebar */
function openNav(icon) {
    let sidebar = document.getElementById("sidebar");
    let sidebarContent = sidebar.querySelector('p');
    if (sidebarContent) {
      sidebarContent.innerText = `Content for ${icon}`;
    } else {
      sidebar.innerHTML = `<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a><p>Content for ${icon}</p>`;
    }
    sidebar.style.width = "250px";
  }
  
  /* Function to close the sidebar */
  function closeNav() {
    document.getElementById("sidebar").style.width = "0";
  }

  async function updateIconContent() {
    try {
        const response = await fetch('/get-recent-geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const detectedClasses = extractDetectedClasses(data.features); // Use data.features

        // Update the content of the icons based on the detected classes
        updateIconContentOnPage(detectedClasses);
    } catch (error) {
        console.error('Error fetching detected classes:', error);
    }
}

function extractDetectedClasses(features) {
    if (!features || !Array.isArray(features)) {
        console.error('Invalid GeoJSON structure:', features);
        return [];
    }

    const classes = features.map(feature => feature.properties.name);
    return [...new Set(classes)];
}

function updateIconContentOnPage(detectedClasses) {
    const iconBar = document.getElementById('iconBar');
    
    // Log the detected classes to the console
    console.log('Detected Classes (updateIconContentOnPage):', detectedClasses);

    // Remove existing icons
    iconBar.innerHTML = '';

    // Create new icons based on detected classes
    for (let i = 1; i <= detectedClasses.length; i++) {
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.onmouseover = () => showLabel(`label${i}`);
        icon.onmouseout = () => hideLabel(`label${i}`);
        
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.onclick = () => openNav(`icon${i}`);
        
        const iconElement = document.createElement('i');
        iconElement.className = 'fas fa-chart-bar hoverss';

        anchor.appendChild(iconElement);

        const label = document.createElement('div');
        label.className = 'label';
        label.id = `label${i}`;
        
        const paragraph = document.createElement('p');
        paragraph.id = `content${i}`;
        paragraph.textContent = detectedClasses[i - 1];
        
        label.appendChild(paragraph);
        
        icon.appendChild(anchor);
        icon.appendChild(label);
        
        iconBar.appendChild(icon);
    }
}

document.getElementById('exportBtn').addEventListener('click', function () {
    updateIconContent();
});

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

function downloadShapefile() {
    // Send an HTTP request to the server to generate the shapefile.
    fetch('/generate-shapefile', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            // The server successfully generated the shapefile.
            console.log('The server successfully generated the shapefile.')
        } else {
            // Handle errors.
            console.error('Failed to generate shapefile.');
        }
    })
    .catch(error => {
        // Handle network or other errors.
        console.error('Request error:', error);
    });
}