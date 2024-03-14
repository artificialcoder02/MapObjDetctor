var x = document.getElementById("demo");
var map;
let isLodind = false;
const progressBar = document.getElementById('prbar');
progressBar.style.display = 'none';
document.getElementById('popup').style.display = 'none';
const userLoginDivBtn = document.getElementById('userlogins');
const userLoginDivBtntwo = document.getElementById('dropdown');
const training = document.getElementById('training');
training.style.display = "none";
userLoginDivBtntwo.style.display = 'none';
document.getElementById('training_btn').style.display = 'none';
document.getElementById('userShape').style.display = 'none';
document.getElementById('userModel').style.display = 'none';
document.getElementById('userModelSeg').style.display = 'none';
document.getElementById('userShapeSeg').style.display = 'none';
document.getElementById('tainImage').style.display = 'none';
document.getElementById('valImage').style.display = 'none';
document.getElementById('xmlImage').style.display = 'none';
document.getElementById('newPopupUserModel').style.display = 'none';
document.getElementById('newPopupUserModelSeg').style.display = 'none';

document.getElementById('nononon').style.width = '20%';


// newPopupUserModel

let menubars = document.getElementById("menubar");
let loadingSpinner = document.getElementById("loadingSpinner");
loadingSpinner.style.display = 'none';
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

        // Fetch user information from the server using the token
        const response = await fetch('/api/v0.1/check-login-status', {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
                // Add any additional headers if needed
            },
            credentials: 'include', // This line sets withCredentials to true

        });

        if (!response.ok) {
            throw new Error();
        }

        const user = await response.json();
        if (user?.isLoggedIn === true) {
            document.getElementById('newPopupUserModel').style.display = 'block';
            document.getElementById('newPopupUserModelSeg').style.display = 'block';

            document.getElementById('nononon').style.width = '55%';
            return { isLoggedIn: true, user };
        }

    } catch (error) {
        localStorage.removeItem('user');
    }
};


// async function fetchData() {
//     const jsonDataString = JSON.parse(localStorage.getItem('user'));

//     const response = await fetch(`/files?userId=${jsonDataString ? jsonDataString?.user?._id : ''}`);
//     const resp = await response.json();

//     if (!resp.error) {
//         // Set the JSON response in session storage
//         sessionStorage.setItem('modelResponseData', JSON.stringify(resp));

//         // Clear existing content in the lists
//         clearModelList('userModelListPopup');
//         clearModelList('defaultModelListPopup');

//         // Retrieve the data from session storage
//         const storedDataNE = sessionStorage.getItem('modelResponseData');
//         const dataNew = JSON.parse(storedDataNE);

//         // Populate lists for the popup
//         createModelListItems(dataNew.userFiles, 'userModelListPopup');
//         createModelListItems(dataNew.defaultFiles, 'defaultModelListPopup');

//         // Set the JSON response in session storage
//         sessionStorage.setItem('responseData', JSON.stringify(resp));

//         // Clear existing content in the lists
//         clearList('defaultList');
//         clearList('userList');

//         // Retrieve the data from session storage
//         const storedData = sessionStorage.getItem('responseData');
//         const data = JSON.parse(storedData);

//         // You can use the 'data' variable as needed in your script
//         // For example, populate lists using the createListItems function
//         createListItems(data.defaultFiles, 'defaultList');
//         createListItems(data.userFiles, 'userList');

//         function createListItems(files, listId) {
//             const list = document.getElementById(listId);

//             // Check if the files array is empty
//             if (files?.length === 0) {
//                 const listItem = document.createElement('li');
//                 const anchor = document.createElement('a');
//                 anchor.href = '#';  // You can set the href as needed
//                 anchor.textContent = 'No user models available';
//                 listItem.appendChild(anchor);
//                 list.appendChild(listItem);
//                 return;
//             }

//             const items = files?.map(file => {
//                 const listItem = document.createElement('li');
//                 const anchor = document.createElement('a');
//                 anchor.href = '#';  // You can set the href as needed
//                 anchor.textContent = file.filename;
//                 anchor.onclick = () => handleClick(listId === 'userList' ? file.path + '/weights/best.pt' : file.path);
//                 listItem.appendChild(anchor);
//                 return listItem;
//             });

//             list.append(...items);
//         }
//     }
// }
// function createModelListItems(files, listId) {
//     const list = document.getElementById(listId);

//     if (files?.length === 0) {
//         const listItem = document.createElement('li');
//         listItem.textContent = 'No models available';
//         listItem.className = 'model-list-item'; // Apply CSS class
//         applyStylesToListItem(listItem); // Apply CSS styles
//         list.appendChild(listItem);
//         return;
//     }

//     const items = files?.map(file => {
//         const listItem = document.createElement('li');
//         applyStylesToListItem(listItem); // Apply CSS styles to li
//         listItem.className = 'model-list-item'; // Apply CSS class

//         const anchor = document.createElement('a');
//         anchor.href = '#';
//         anchor.textContent = file.filename;
//         anchor.style.color = 'black'
//         anchor.style.textDecoration = 'none'; // Remove text decoration
//         anchor.onclick = () => handleModelClick(listId === 'userModelListPopup' ? file.path + '/weights/best.pt' : file.path);

//         listItem.appendChild(anchor);
//         return listItem;
//     });

//     list.append(...items);
// }

// function applyStylesToListItem(listItem) {
//     listItem.style.listStyleType = 'none'; // Set list style type to none
//     listItem.style.margin = '5px'; // Example: Set margin
//     listItem.style.padding = '3px'; // Example: Set padding
// }

// function clearModelList(listId) {
//     const list = document.getElementById(listId);
//     while (list.firstChild) {
//         list.removeChild(list.firstChild);
//     }
// }

// // Function to clear list content
// function clearList(listId) {
//     const list = document.getElementById(listId);
//     while (list.firstChild) {
//         list.removeChild(list.firstChild);
//     }
// }



async function fetchData() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    const response = await fetch(`/files?userId=${jsonDataString ? jsonDataString?.user?._id : ''}`);
    const resp = await response.json();

    if (!resp.error) {
        // Set the JSON response in session storage
        sessionStorage.setItem('modelResponseData', JSON.stringify(resp));

        // Clear existing content in the lists
        clearModelList('userModelListPopup');
        clearModelList('defaultModelListPopup');

        clearModelList('userModelListSegPopup');
        clearModelList('defaultModelListSegPopup');

        clearList('defaultList');
        clearList('userList');

        clearList('defaultListSeg');
        clearList('userListSeg');

        // Retrieve the data from session storage
        const data = JSON.parse(sessionStorage.getItem('modelResponseData'));

        // Populate lists for the popup and the main lists
        createModelListItems(data.dection.defaultFiles, 'defaultModelListPopup');
        createModelListItems(data.dection.userFiles, 'userModelListPopup');

        createModelListItems(data.segment.defaultFiles, 'defaultModelListSegPopup');
        createModelListItems(data.segment.userFiles, 'userModelListSegPopup');

        createListItems(data.dection.defaultFiles, 'defaultList');
        createListItems(data.dection.userFiles, 'userList');

        createListItems(data.segment.defaultFiles, 'defaultListSeg');
        createListItems(data.segment.userFiles, 'userListSeg');
    }
}

function createModelListItems(files, listId) {
    const list = document.getElementById(listId);

    if (!files || files.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No models available';
        listItem.className = 'model-list-item';
        applyStylesToListItem(listItem);
        list.appendChild(listItem);
        return;
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        applyStylesToListItem(listItem);
        listItem.className = 'model-list-item';

        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.textContent = file.filename;
        anchor.style.color = 'black';
        anchor.style.textDecoration = 'none';
        anchor.onclick = () => handleModelClick(listId === 'userModelListPopup' || listId === 'userModelListSegPopup' ? file.path + '/weights/best.pt' : file.path);

        listItem.appendChild(anchor);
        list.appendChild(listItem);
    });
}

function createListItems(files, listId) {
    const list = document.getElementById(listId);

    if (!files || files.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No files available';
        list.appendChild(listItem);
        return;
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.textContent = file.filename;
        anchor.onclick = () => handleClick(listId === 'userList' || listId === 'userListSeg' ? file.path + '/weights/best.pt' : file.path);
        listItem.appendChild(anchor);
        list.appendChild(listItem);
    });
}

function applyStylesToListItem(listItem) {
    listItem.style.listStyleType = 'none';
    listItem.style.margin = '5px';
    listItem.style.padding = '3px';
}

function clearModelList(listId) {
    const list = document.getElementById(listId);
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function clearList(listId) {
    const list = document.getElementById(listId);
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

// // Function to handle click events
function handleClick(url) {
    if (!url) {
        alert('You dont have any model stored!');
        return;
    } else {
        urlTest = url;
        downloadMap();
    }

}


// Function to check login status and update local storage every 3 seconds
const checkAndUpdateLoginStatus = async () => {
    const loginStatus = await checkLoginStatus();

    if (!loginStatus) {
        fetchData();

        const userNameElement = document.getElementById('userNames');
        userNameElement.textContent = 'Login / Register';
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
    } else {
        fetchData(loginStatus.user._id);
        document.getElementById('userShape').style.display = 'block';
        document.getElementById('userModel').style.display = 'block';

        document.getElementById('userShapeSeg').style.display = 'block';
        document.getElementById('userModelSeg').style.display = 'block';

        // Get references to the userName and userImage elements
        const userNameElement = document.getElementById('userNames');
        userLoginDivBtntwo.style.display = 'block';
        training.style.display = "inline";

        // Set the text content of the userName element to the user's name
        userNameElement.textContent = loginStatus?.user?.user?.name;
        // Update user details in local storage
        localStorage.setItem('user', JSON.stringify(loginStatus.user));
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
async function logout() {
    try {
        // Clear token from sessionStorage
        sessionStorage.removeItem('token');

        // Clear user data from localStorage
        localStorage.removeItem('user');

        // Make a server-side logout request
        const response = await fetch('/api/v0.1/logout', {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                // Add any additional headers if needed
            },
            credentials: 'include', // This line sets withCredentials to true
        });

        if (!response.ok) {
            // Handle server-side logout failure if needed
            console.error('Server-side logout failed:', response.statusText);
        }
        // Show success message and update login status after a delay
        setTimeout(() => {
            showSuccess('Logout successfully');
            checkAndUpdateLoginStatus();
        }, 1000);

        // Optionally, redirect to the login page or any other page after logout
        window.location.href = '/login'; // Change '/login' to your desired logout redirect page
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var instructionButton = document.querySelector('.instruction-button');
    var instructionTooltip = document.querySelector('.instruction-tooltip');

    instructionButton.addEventListener('click', function () {
        instructionTooltip.classList.toggle('active');
    });
});


var centerPoint = [22.589659435441984, 88.41788365584796]; // Indian coordinates

//var centerPoint = [51.509865, -0.118092]; // English coordinates

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



// Create and add the tile layer
// const tileLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
//     crs: L.CRS.EPSG4326,
//     maxZoom: 20,
//     subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
// }).addTo(map);

// var baselayers = {
//     "Tile Layer 1": L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
//         crs: L.CRS.EPSG4326,
//         maxZoom: 20,
//         subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
//     }),
//     "Tile Layer 2": L.esri.basemapLayer('Imagery'),
//     "Tile Layer 3": L.esri.basemapLayer('ImageryLabels')
// };

// var overlays = {};

// L.control.layers(baselayers, overlays).addTo(map);

// baselayers["Tile Layer 1"].addTo(map);

// const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',{ zIndex: -1,
// maxZoom:19 }).addTo(map);

var layer2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png').addTo(map);
var layer1 = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            crs: L.CRS.EPSG4326,
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);

        
        
        var layerControl = L.Control.extend({
            options: {
                position: 'topright'
            },
        
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                var select = L.DomUtil.create('select', 'layer-select', container);
        
                var option1 = L.DomUtil.create('option', '', select);
                option1.value = 'layer1';
                option1.innerHTML = 'GOOGLE MAPS SATELITE';
        
                var option2 = L.DomUtil.create('option', '', select);
                option2.value = 'layer2';
                option2.innerHTML = 'ESRI ARGIS LAYER';
        
                // Add more options for more layers
        
                select.onchange = function(e){
                    map.eachLayer(function(layer){
                        if(layer instanceof L.TileLayer){
                            map.removeLayer(layer);
                        }
                    });
        
                    switch (e.target.value) {
                        case 'layer1':
                            map.addLayer(layer1);
                            break;
                        case 'layer2':
                            map.addLayer(layer2);
                            break;
                        // Add more cases for more layers
                    }
                }
        
                return container;
            }
        });
        
        map.addControl(new layerControl());
        
        


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



let urlTest = ''

// ...

// Create a custom control for displaying latitude and longitude
const coordinatesControl = L.control({ position: 'bottomright' });

// Define the onAdd method for the control
coordinatesControl.onAdd = function () {
    // Create a container element for the coordinates
    const container = L.DomUtil.create('div', 'leaflet-control-coordinates');
    container.innerHTML = 'Click on the map';

    // Return the container
    return container;
};

// Add the control to the map
coordinatesControl.addTo(map);

// Attach the 'click' event listener to the map
map.on('click', handleMapClick);



function handleMapClick(e) {
    const { lat, lng } = e.latlng;

    // Update the content of the coordinates control
    const coordinatesContainer = document.querySelector('.leaflet-control-coordinates');
    coordinatesContainer.innerHTML = `Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`;
}

function handleDrawCreated(e) {
    const layer = e.layer;

    // Add the drawn layer to the map
    layer.addTo(map);

    // Calculate the surface area using Leaflet Area plugin
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    console.log('Surface Area:', area);

    // Get the bounds of the drawn layer
    const bounds = layer.getBounds();

    // Define the zoom level to fetch tiles for
    const zoom = 18; // Replace with the desired zoom level

    // Fetch tiles for the specified area and zoom level
    const tiles = getTilesForBounds(bounds, zoom);

    // Download tiles one by one with a delay
    downloadTilesWithDelay(tiles, 500); // Adjust the delay (in milliseconds) as needed

    // Optional: Clear the drawn layer if needed
    // map.removeLayer(layer);
}


var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: true
    }
});
map.addControl(drawControl);



// map.on('draw:created', function (event) {
//     var layer = event.layer;
//     drawnItems.addLayer(layer);

//     if (layer instanceof L.Polygon) {
//         var bounds = layer.getBounds();
//         map.fitBounds(bounds, { maxZoom: 18 });

//         getTileUrls(bounds, 18); // Fetch tiles for zoom level 19
//     }
// });

// function getTileUrls(bounds, zoom) {

//     var northWestTile = map.project(bounds.getNorthWest(), zoom).divideBy(256).floor();
//     var southEastTile = map.project(bounds.getSouthEast(), zoom).divideBy(256).ceil();

//     var tiles = [];

//     for (var i = northWestTile.x; i <= southEastTile.x; i++) {
//         for (var j = northWestTile.y; j <= southEastTile.y; j++) {
//             var tileUrl = 'http://mt2.google.com/vt/lyrs=s&x=' + i + '&y=' + j + '&z=' + zoom;
//             tiles.push(tileUrl);
//         }
//     }

//     console.log("Tile URLs:", tiles);


var tiles = [];  // Global variable

// Function to close the new popup
function closeModelPopup() {
    document.getElementById('newPopup').style.display = 'none';
    loadingSpinner.style.display = 'none';
    menubars.style.display = 'flex';
    tiles = [];  // Global variable
    document.getElementById('ObjectDiction').style.display = 'none';
    document.getElementById('InstanceSegmentObject').style.display = 'none';
    // Reset the background color of both buttons to 'inherit'
    document.querySelector('.tablinks:nth-child(1)').style.backgroundColor = 'inherit';
    document.querySelector('.tablinks:nth-child(2)').style.backgroundColor = 'inherit';
}

var polygonGeoJSON; // Global variable to store the drawn polygon's GeoJSON
var lastDrawnPolygon = null; // Variable to keep track of the last drawn polygon
// Function to clear the icons
function clearIcons() {
    const iconBar = document.getElementById('iconBar');
    iconBar.innerHTML = ''; // Clear existing icons
}

map.on('draw:created', function (event) {
    if (lastDrawnPolygon) {
        removeLastDrawnPolygon();
        clearIcons();
    }

    var layer = event.layer;
    drawnItems.addLayer(layer);

    if (layer instanceof L.Polygon) {
        var bounds = layer.getBounds();
        map.fitBounds(bounds, { maxZoom: 19 });

        var latlngs = layer.getLatLngs()[0]; // Assuming it's a simple polygon
        // Convert Leaflet LatLngs to GeoJSON Polygon
        var coordinates = latlngs.map(function (latlng) {
            return [latlng.lng, latlng.lat];
        });
        coordinates.push(coordinates[0]); // Close the polygon

        polygonGeoJSON = turf.polygon([coordinates]);
        getTileUrls(bounds, 19, polygonGeoJSON);
        lastDrawnPolygon = layer;

    }
});

function removeLastDrawnPolygon() {
    if (lastDrawnPolygon) {
        drawnItems.removeLayer(lastDrawnPolygon);
        lastDrawnPolygon = null; // Reset the reference
    } else {
        alert('No last drawn polygon to remove.');
    }
}

function getTileUrls(bounds, zoom, polygonGeoJSON) {

    var northWestTile = map.project(bounds.getNorthWest(), zoom).divideBy(256).floor();
    var southEastTile = map.project(bounds.getSouthEast(), zoom).divideBy(256).ceil();

    for (var i = northWestTile.x; i <= southEastTile.x; i++) {
        for (var j = northWestTile.y; j <= southEastTile.y; j++) {
            var tileBounds = L.bounds([i * 256, j * 256], [(i + 1) * 256, (j + 1) * 256]);
            var sw = map.unproject(tileBounds.getBottomLeft(), zoom);
            var ne = map.unproject(tileBounds.getTopRight(), zoom);

            var tilePolygon = turf.polygon([[
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat] // Closing the polygon
            ]]);

            if (turf.intersect(polygonGeoJSON, tilePolygon)) {
                var tileUrl = 'http://mt2.google.com/vt/lyrs=s&x=' + i + '&y=' + j + '&z=' + zoom;
                tiles.push(tileUrl);
            }
        }
    }

    document.getElementById('newPopup').style.display = 'flex';
}

function filterObjectsWithinPolygon(detectedGeoJSON, polygonGeoJSON) {
    var filteredFeatures = detectedGeoJSON.features.filter(function (feature) {
        // Ensure the feature has a geometry
        if (feature.geometry) {
            // Using turf.booleanWithin to check if the feature is entirely within the polygon
            var isWithin = turf.booleanWithin(feature, polygonGeoJSON);

            // Alternatively, using turf.intersects to check for any overlap
            // var intersects = turf.intersects(feature, polygonGeoJSON);
            // var isWithin = intersects !== null;

            return isWithin;
        } else {
            console.error('Feature does not have a valid geometry:', feature);
            return false;
        }
    });

    return {
        type: "FeatureCollection",
        features: filteredFeatures
    };
}

function handleModelClick(filePath) {
    loadingSpinner.style.display = 'block';
    menubars.style.display = 'none';
    // Clear existing layers
    map.eachLayer(l => {
        if (l instanceof L.GeoJSON) {
            map.removeLayer(l);
        }
    });


    var element = document.querySelector('.leaflet-draw-draw-polygon');
    if (element) {
        element.style.display = 'none';
    }


    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    document.getElementById('newPopup').style.display = 'none';

    fetch(`/download-tiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tiles: tiles, userId: jsonDataString ? jsonDataString.user._id : '', modelPath: filePath }),
    })
        .then(response => response.json())
        .then(data => {
            // Filter the received GeoJSON data to include only objects within the polygon
            var filteredGeoJSON = filterObjectsWithinPolygon(data.geojson, polygonGeoJSON);

            // Create the GeoJSON layer with popups for each filtered feature and add it to the map
            var myLayer = L.geoJSON(filteredGeoJSON, {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.name);
                    }
                },
                style: function (feature) {
                    return {
                        color: feature.properties.color ? feature.properties.color : '#000000', // Default to black if color is not specified
                        weight: 2,
                        opacity: 1
                    };
                }
            }).addTo(map);

            const classes = extractDetectedClasses(filteredGeoJSON.features);
            const color = extractDetectedColor(filteredGeoJSON.features);
            const objectsPerClass = calculateObjectsPerClass(filteredGeoJSON.features);
            const totalClasses = filteredGeoJSON.features.length;

            updateIconContentOnPage(classes, color, objectsPerClass, totalClasses);
            loadingSpinner.style.display = 'none';
            menubars.style.display = 'flex';
            tiles = [];
            var element = document.querySelector('.leaflet-draw-draw-polygon');
            if (element) {
                element.style.display = 'block';
            }


        })
        .catch(error => {

            loadingSpinner.style.display = 'none';
            menubars.style.display = 'flex';
            var element = document.querySelector('.leaflet-draw-draw-polygon');
            if (element) {
                element.style.display = 'block';
            }
            console.error('Error:', error)
        });
}


function uploadFile() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));
    const form = document.getElementById('uploadForm');
    var selectedModel = document.getElementById("models").value;
    const formData = new FormData(form);
    // Append the selectedModel as modelPath to the formData
    formData.append('modelPath', selectedModel);
      // Clear existing layers
      map.eachLayer(l => {
        if (l instanceof L.GeoJSON) {
            map.removeLayer(l);
        }
    });


    loadingSpinner.style.display = 'block';
    menubars.style.display = 'none';

    document.getElementById('customPopup').style.display = 'none';
    fetch(`/upload-tif?userId=${jsonDataString ? jsonDataString.user._id : ''}`, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            
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
               crs: L.CRS.EPSG4326,
               //crs:L.CRS.EPSG3857,
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
           menubars.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function downloadMap() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    // Clear existing layers
    map.eachLayer(l => {
        if (l instanceof L.GeoJSON) {
            map.removeLayer(l);
        }
    });


    loadingSpinner.style.display = 'block';
    menubars.style.display = 'none';

    var downloadOptions = {
        container: map._container,
        caption: {
            text: '',
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
            body: JSON.stringify({ image: result, northWest: northWest, southEast: southEast, userId: jsonDataString ? jsonDataString.user._id : '', modelPath: urlTest }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    loadingSpinner.style.display = 'none';
                    menubar.style.display = 'none';

                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            })
            .then((data) => {
                // Handle the received data
                console.log(data.geojson);
                var myLayer = L.geoJSON(data.geojson, {
                    //crs: L.CRS.EPSG4326,
                    //crs:L.CRS.EPSG3857,
                    style: function (feature) {
                        return {
                            color: feature.properties.color ? feature.properties.color : '#000000',  // Default to black if color is not specified
                            weight: 2,
                            opacity: 1
                        };
                    }
                }).addTo(map);

                var myLayer = L.geoJSON(data.geojson, {
                    crs: L.CRS.EPSG4326,
                    //crs:L.CRS.EPSG3857,
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
                menubars.style.display = 'flex';
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch request or JSON parsing
                console.error('Error:', error);
                loadingSpinner.style.display = 'none';
                menubars.style.display = 'flex';
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
                    crs: L.CRS.EPSG4326,
                    //crs:L.CRS.EPSG3857,
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
                    <div class="label" id="label${i}"><p>Show All</p></div>
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

async function saveImageSkipTest() {
    document.getElementById('training_btn').style.display = 'none';

    document.getElementById('tainImage').style.display = 'block';
    document.getElementById('valImage').style.display = 'none';
    document.getElementById('testImage').style.display = 'none';
}

async function saveImageUploadTest() {
    await CreateFolder();
    const imageFiles = Array.from(document.getElementById('imageUploadTest').files);
    const labelFiles = Array.from(document.getElementById('labelUploadTest').files);

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
    const progressText = document.getElementById('progressText');
    progressBar.style.width = '0%';

    try {
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

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.innerText = percentComplete + '%';
                }
            });

            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (i === filePairs.length - 1) {
                        document.getElementById('training_btn').style.display = 'none';
                        // document.getElementById('training_btns').style.display = 'none';
                        progress.style.display = 'none';
                        document.getElementById('tainImage').style.display = 'block';
                        document.getElementById('valImage').style.display = 'none';
                        document.getElementById('testImage').style.display = 'none';
                    }
                } else {
                    alert('Failed to save files on the server.');
                    progress.style.display = 'none';
                }
            };

            const imageFileExtension = imageFile.name.match(/\.[^/.]+$/)[0];
            xhr.open('POST', `/upload?imageName=${imageFileExtension}&type=test&userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
        progress.style.display = 'none';
        alert('An error occurred while saving files on the server.');
    }
}

async function CreateFolder() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));

    const response = await fetch(`/folder?userId=${jsonDataString ? jsonDataString?.user?._id : ''}`);
    const resp = await response.json();

}

async function saveImageUploadTrain() {



    const imageFiles = Array.from(document.getElementById('imageUploadTrain').files);
    const labelFiles = Array.from(document.getElementById('labelUploadTrain').files);

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
    const progressText = document.getElementById('progressText');
    progressBar.style.width = '0%';

    try {
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

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.innerText = percentComplete + '%';
                }
            });

            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (i === filePairs.length - 1) {
                        document.getElementById('training_btn').style.display = 'none';
                        // document.getElementById('training_btns').style.display = 'none';
                        progress.style.display = 'none';
                        document.getElementById('tainImage').style.display = 'none';
                        document.getElementById('valImage').style.display = 'block';
                        document.getElementById('testImage').style.display = 'none';
                    }
                } else {
                    alert('Failed to save files on the server.');
                    progress.style.display = 'none';
                }
            };

            const imageFileExtension = imageFile.name.match(/\.[^/.]+$/)[0];
            xhr.open('POST', `/upload?imageName=${imageFileExtension}&type=train&userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
        progress.style.display = 'none';
        alert('An error occurred while saving files on the server.');
    }
}

async function saveImageUploadVal() {
    const imageFiles = Array.from(document.getElementById('imageUploadVal').files);
    const labelFiles = Array.from(document.getElementById('labelUploadVal').files);

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
    const progressText = document.getElementById('progressText');
    progressBar.style.width = '0%';

    try {
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

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.innerText = percentComplete + '%';
                }
            });

            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (i === filePairs.length - 1) {
                        document.getElementById('training_btn').style.display = 'none';
                        // document.getElementById('training_btns').style.display = 'none';
                        progress.style.display = 'none';
                        document.getElementById('tainImage').style.display = 'none';
                        document.getElementById('valImage').style.display = 'none';
                        document.getElementById('testImage').style.display = 'none';
                        document.getElementById('xmlImage').style.display = 'block';

                    }
                } else {
                    alert('Failed to save files on the server.');
                    progress.style.display = 'none';
                }
            };

            const imageFileExtension = imageFile.name.match(/\.[^/.]+$/)[0];
            xhr.open('POST', `/upload?imageName=${imageFileExtension}&type=val&userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
        progress.style.display = 'none';
        alert('An error occurred while saving files on the server.');
    }
}

async function saveYAML() {
    const progress = document.getElementById('prbar');
    progress.style.display = 'block';

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = '0%';

    try {
        const jsonDataString = JSON.parse(localStorage.getItem('user'));

        // Get the YAML file input element by ID
        const yamlFileInput = document.getElementById('yamlUploadfiles');

        if (!yamlFileInput.files || yamlFileInput.files.length === 0) {
            alert('Please select a YAML file.');
            progress.style.display = 'none';
            return;
        }

        const yamlFile = yamlFileInput.files[0];
        const yamlNameWithoutExtension = yamlFile.name.replace(/\.[^/.]+$/, '');
        const yamlBase64 = await fileToBase64(yamlFile);

        const data = {
            yamlFileName: yamlNameWithoutExtension,
            yamlBase64,
        };

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressText.innerText = percentComplete + '%';
            }
        });

        xhr.onload = function () {
            if (xhr.status === 200) {
                document.getElementById('training_btn').style.display = 'block';
                // document.getElementById('training_btns').style.display = 'block';
                progress.style.display = 'none';
            } else {
                alert('Failed to save the file on the server.');
                progress.style.display = 'none';
            }
        };

        const yamlFileExtension = yamlFile.name.match(/\.[^/.]+$/)[0];
        xhr.open('POST', `/upload?yamlName=${yamlFileExtension}&type=yaml&userId=${jsonDataString ? jsonDataString.user._id : ''}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));

    } catch (error) {
        console.error('Error:', error);
        progress.style.display = 'none';
        alert('An error occurred while saving the file on the server.');
    }
}


function updateYamlFile() {
    var fileInput = document.getElementById('yamlUploadfiles');
    var label = document.getElementById('labelyaml');
    label.textContent = 'Selected file: ' + fileInput.files[0].name;
}



function updateImageLabelTest() {
    const input = document.getElementById('imageUploadTest');
    const label = document.getElementById('imageLabelTest');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select image files`;
        }
    }
}

function updateLabelLabelTest() {
    const input = document.getElementById('labelUploadTest');
    const label = document.getElementById('labelLabelTest');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select label files`;
        }
    }
}


function updateImageLabelTrain() {
    const input = document.getElementById('imageUploadTrain');
    const label = document.getElementById('imageLabelTrain');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select image files`;
        }
    }
}

function updateLabelLabelTrain() {
    const input = document.getElementById('labelUploadTrain');
    const label = document.getElementById('labelLabelTrain');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select label files`;
        }
    }
}

function updateImageLabelVal() {
    const input = document.getElementById('imageUploadVal');
    const label = document.getElementById('imageLabelVal');

    if (input && label) {
        if (input.files.length > 0) {
            label.textContent = `Selected files: ${input.files.length}`;
        } else {
            label.textContent = `Select image files`;
        }
    }
}

function updateLabelLabelVal() {
    const input = document.getElementById('labelUploadVal');
    const label = document.getElementById('labelLabelVal');

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




function downloadShapefile() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));
    // Send an HTTP request to the server to generate the shapefile.
    fetch(`/generate-shapefile?userId=${jsonDataString ? jsonDataString.user._id : ''}`, {
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

// function downloadSample() {
//     const jsonDataString = JSON.parse(localStorage.getItem('user'));
//     // Send an HTTP request to the server to generate the shapefile.
//     fetch(`/generate-samplefile?userId=${jsonDataString ? jsonDataString.user._id : ''}`, {
//         method: 'POST',
//     })
//         .then(response => {
//             if (response.ok) {
//                 // The server successfully generated the shapefile.
//                 return response.blob(); // Convert response to a Blob
//             } else {
//                 // Handle errors.
//                 console.error('Failed to download sample dataset');
//                 throw new Error('Failed to download sample dataset.'); // Propagate the error
//             }
//         })
//         .then(blob => {
//             // Create a download link
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = 'sample.zip'; // Set the desired file name
//             document.body.appendChild(a); // Append the link to the document
//             a.click(); // Simulate a click on the link to trigger the download
//             document.body.removeChild(a); // Remove the link from the document
//             console.log('Download initiated successfully.');
//         })
//         .catch(error => {
//             // Handle network or other errors.
//             console.error('Request error:', error);
//         });
// }

function downloadSample() {
    const jsonDataString = JSON.parse(localStorage.getItem('user'));
    console.log('Starting download...');

    fetch(`/generate-samplefile?userId=${jsonDataString ? jsonDataString.user._id : ''}`, {
        method: 'POST',
    })
        .then(response => {
            if (response.ok) {
                return response.blob(); // Convert response to a Blob
            } else {
                console.error('Failed to download sample dataset');
                throw new Error('Failed to download sample dataset.'); // Propagate the error
            }
        })
        .then(blob => {
            if (blob.size > 0) {
                // Create a download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample.zip'; // Set the desired file name
                document.body.appendChild(a); // Append the link to the document
                a.click(); // Simulate a click on the link to trigger the download
                document.body.removeChild(a); // Remove the link from the document
                URL.revokeObjectURL(url); // Clean up the Blob URL
                console.log('Download initiated successfully.');
            } else {
                console.error('Received an empty file.');
                // Handle the case of an empty file here
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        })
        .finally(() => {
            console.log('Download process completed.'); // End loading indicator
        });
}


async function labelStodio() {
    await fetch('/runcmd')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                alert("Success: " + data.message);
            }
        })
        .catch((error) => {
            alert("An error occurred: " + error.message);
        });
}