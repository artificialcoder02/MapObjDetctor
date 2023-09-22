// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add a tile layer using OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add a satellite imagery (aerial imagery) layer
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

satelliteLayer.addTo(map);

// Initialize the search control
const searchControl = L.Control.geocoder({
    defaultMarkGeocode: false,
    collapsed: true,
    position: 'topright'
}).on('markgeocode', function (e) {
    map.setView(e.geocode.center, 15);
    // You can do something with the geocode result here if needed
}).addTo(map);

function captureMapSnapshot() {
    console.log('Button clicked!');  // Log a message when the button is clicked

    const mapElement = document.getElementById('map');
    
    html2canvas(mapElement, {
        scrollX: 0,
        scrollY: 0,
        width: mapElement.offsetWidth,
        height: mapElement.offsetHeight,
        logging: false,
        onclone: (doc) => {
            // You can customize the cloned document if needed
        }
    }).then((canvas) => {
        const snapshotData = canvas.toDataURL('image/jpeg');

        // Send the snapshot data to the server for object detection
        sendSnapshotForDetection(snapshotData);
    });
}

function sendSnapshotForDetection(snapshotData) {
    fetch('/detect-objects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            snapshot: snapshotData
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Detected objects:', data.detected_objects);

        // Call a function to display detected objects on the map
        displayDetectedObjects(data.detected_objects);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to display detected objects on the map
// Function to display detected objects on the map
function displayDetectedObjects(detectedObjects) {
    // Clear any previous displayed rectangles
    map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) {
            map.removeLayer(layer);
        }
    });

    // Loop through detected objects and display rectangles
    detectedObjects.forEach(object => {
        const bounds = object.bbox; // Assuming object.bbox contains [minX, minY, maxX, maxY]

        const rectangle = L.rectangle([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], {
            color: 'blue',
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.1
        });

        rectangle.addTo(map);
    });
}
const detectButton = document.getElementById('detectButton');
detectButton.addEventListener('click', () => {
    captureMapSnapshot();
});
