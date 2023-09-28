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

    // Capture the visible area of the map as an image using HTML2Canvas
    const mapElement = document.getElementById('map');
    const mapBounds = mapElement.getBoundingClientRect();

    html2canvas(mapElement, {
        scrollX: 0,
        scrollY: 0,
        width: mapBounds.width,
        height: mapBounds.height,
        logging: false,
        onclone: (doc) => {
            // You can customize the cloned document if needed
        }
    }).then((canvas) => {
        const snapshotData = canvas.toDataURL('image/jpeg');
        
        // Log the dimensions of the captured image
        console.log('Captured image dimensions:', canvas.width, 'x', canvas.height);

        if (!snapshotData || snapshotData === 'data:,') {
            alert('Error: Captured image is null or empty.');
            console.error('Error: Captured image is null or empty.');
            return;
        }

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

function displayDetectedObjects(detectedObjects) {
    // Loop through detected objects and display rectangles
    detectedObjects.forEach(object => {
        const bounds = object.bbox; // Assuming object.bbox contains [minX, minY, maxX, maxY]
        const label = object.label;
        const confidence = object.confidence;

        const rectangle = L.rectangle([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], {
            color: 'blue',
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.1,
            className: 'detected-object'
        });

        // Create a popup with object information
        const popupContent = `<b>Label:</b> ${label}<br><b>Confidence:</b> ${confidence.toFixed(2)}`;
        rectangle.bindPopup(popupContent);

        rectangle.addTo(map);
    });
}


const detectButton = document.getElementById('detectButton');
detectButton.addEventListener('click', () => {
    captureMapSnapshot();
});
