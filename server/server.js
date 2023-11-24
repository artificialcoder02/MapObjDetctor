const express = require('express');
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require("cors");
const sizeOf = require('image-size');
app.use(cors({ origin: true, credentials: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10000mb' }));
const multer = require('multer');

// app.use(express.json());

// Directory where image files are stored
const imageFolder = '/Users/tuhinrc/Desktop/newnew/MapObjDetctor/server/image';

// Get a list of image files in the folder
const imageFiles = fs.readdirSync(imageFolder).filter(file => file.endsWith('.png'));

// Sort the list of image files by creation time (most recent first)
imageFiles.sort((fileA, fileB) => {
    return fs.statSync(path.join(imageFolder, fileB)).ctime.getTime() - fs.statSync(path.join(imageFolder, fileA)).ctime.getTime();
});

// Check if there are any image files in the folder
if (imageFiles.length === 0) {
    console.error('No image files found in the folder.');
    return res.status(500).json({ error: 'No image files found' });
}

// Choose the most recent image file
const mostRecentImage = path.join(imageFolder, imageFiles[0]);

// Get the image dimensions synchronously
const dimensions = sizeOf(mostRecentImage);

// Extract the width and height
const imageWidth = dimensions.width;
const imageHeight = dimensions.height;

// Serve the HTML file for the root URL
app.use(express.static("client"));
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

app.use(express.static("client"));
app.get("/training", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training.html"));
});

app.use(express.static("client"));
app.get("/pretrained", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "pretrained.html"));
});

app.post('/save-captured-image', (req, res) => {
    const { image, northWest, southEast } = req.body;
    console.log(northWest, southEast);
    const fs = require('fs');
    const path = require('path'); // Import the path module

    const directoryPath = '/Users/tuhinrc/Desktop/newnew/MapObjDetctor/geoj';

    // Remove the data URL prefix (e.g., 'data:image/png;base64,')
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    // Create a unique filename or use a timestamp-based name
    const fileName = `captured_${Date.now()}.png`;
    // Specify the path to the "image" folder
    const imagePath = path.join(__dirname, 'image', fileName);
    // Write the base64 data to a PNG file
    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ error: 'Error saving image' });
        }
        console.log('Image saved successfully');

        const detect = path.join(__dirname, 'yolov5', 'detect.py');
        // Find the highest existing experiment number in the "yolov5/runs/detect" directory
        const detectDir = path.join(__dirname, 'runs', 'detect');
        const existingExpFolders = fs.readdirSync(detectDir).filter(folder => folder.startsWith('predict'));
        const highestExp = existingExpFolders.reduce((max, folder) => {
            const number = parseInt(folder.replace('predict', ''), 10);
            return number > max ? number : max;
        }, 0);
        const newExpFolder = `predict${highestExp + 1}`; // Increment the folder name
        const imagePer = path.join(__dirname, 'runs', 'detect', newExpFolder, fileName);
        // erform object detection using YOLOv5 on the saved PNG file

        // !yolo detect predict model='/Users/tuhinrc/Desktop/best_models/dota_3epch/best.pt' source='/Users/tuhinrc/Desktop/yolov8_testing/Screenshot 2023-10-16 at 11.46.08 AM.png' 
        exec(`yolo detect predict model='/Users/tuhinrc/Desktop/newnew/MapObjDetctor/best.pt' source='${imagePath}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing YOLOv5: ${stderr}`);
                return res.status(500).json({ error: 'Error performing object detection' });
            }
            console.log(stderr);
            // Instead of reading the processed image from a file, you can directly convert it to base64
            const processedImageData = fs.readFileSync(imagePer, 'base64');
            // Send the processed image as base64 in the response

            // return res.json({ processedImage: processedImageData });
        });
        const geoTiffFileName = `${path.basename(imagePath, path.extname(imagePath))}.tif`; // Construct the GeoTIFF file name
        const geoTiffFilePath = path.join(__dirname, 'geot', geoTiffFileName); // Set the path for the GeoTIFF file

        exec(`gdal_translate -of GTiff -a_srs EPSG:4326 -a_ullr ${northWest.lng} ${northWest.lat} ${southEast.lng} ${southEast.lat} ${imagePath} ${geoTiffFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script: ${stderr}`);
                return res.status(500).json({ error: 'Error constructing tif file' });
            }
            console.log(stdout);
            // Instead of reading the processed image from a file, you can directly convert it to base64
        });
        


        // exec(`python3 /Users/tuhinrc/Desktop/newnew/MapObjDetctor/scripts/scripting.py --model /Users/tuhinrc/Desktop/newnew/MapObjDetctor/best.pt --source ${imagePath} --nw_lat ${northWest.lat} --nw_lng ${northWest.lng} --se_lat ${southEast.lat} --se_lng ${southEast.lng} --image_width 1440 --image_height 687`, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`Error executing Script: ${stderr}`);
        //         return res.status(500).json({ error: 'Error performing object detection' }); ˀ
        //     }
        //     console.log(stdout);
        //     // Instead of reading the processed image from a file, you can directly convert it to base64
        // });

        exec(`python3 /Users/tuhinrc/Desktop/newnew/MapObjDetctor/scripts/tiffer.py --model /Users/tuhinrc/Desktop/newnew/MapObjDetctor/best.pt --source ${geoTiffFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script: ${stderr}`);
                return res.status(500).json({ error: 'Error performing latlong conversion' }); ˀ
            }
            //console.log(geoTiffFilePath);
            console.log(stdout);
            // Instead of reading the processed image from a file, you can directly convert it to base64
        });

         // Read the directory
         fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return res.status(500).json({ error: 'Error reading directory' });
            } else {
                // Filter the files with the pattern "output_<number>.geojson"
                const geojsonFiles = files.filter(file => file.match(/^output_\d+\.geojson$/));

                // Sort the files by the creation time
                geojsonFiles.sort((fileA, fileB) => {
                    return fs.statSync(path.join(directoryPath, fileB)).ctime.getTime() - fs.statSync(path.join(directoryPath, fileA)).ctime.getTime();
                });

                // Get the latest file
                const latestFile = geojsonFiles[0];

                // Read the file and load the data into a variable
                fs.readFile(path.join(directoryPath, latestFile), 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return res.status(500).json({ error: 'Error reading file' });
                    } else {
                        try {
                            const jsonData = JSON.parse(data); // assuming the file contains JSON data
                            // Use the jsonData variable as required
                            console.log('Loaded data:', jsonData);
                            return res.json({ geojson: jsonData });
                        } catch (error) {
                            console.error('Error parsing JSON data:', error);
                            return res.status(500).json({ error: 'Error parsing JSON data' });
                        }
                    }
                });
            }
        });
    });
});

// Function to read and parse the most recent GeoJSON file
function getRecentGeoJSON() {
    const directoryPath = '/Users/tuhinrc/Desktop/newnew/MapObjDetctor/geoj';

    // Read the directory
    const files = fs.readdirSync(directoryPath);

    // Filter the files with the pattern "output_<number>.geojson"
    const geojsonFiles = files.filter(file => file.match(/^output_\d+\.geojson$/));

    // Sort the files by the creation time
    geojsonFiles.sort((fileA, fileB) => {
        return fs.statSync(path.join(directoryPath, fileB)).ctime.getTime() - fs.statSync(path.join(directoryPath, fileA)).ctime.getTime();
    });

    // Get the latest file
    const latestFile = geojsonFiles[0];

    // Read the file and load the data into a variable
    const jsonData = JSON.parse(fs.readFileSync(path.join(directoryPath, latestFile), 'utf8'));
    return jsonData;
}

app.get('/get-recent-geojson', (req, res) => {
    // Your logic to fetch the most recent GeoJSON data
    const recentGeoJSON = getRecentGeoJSON();
    res.json(recentGeoJSON);
});


app.post('/generate-shapefile', (req, res) => {
    // Execute your Python script here to generate the shapefile.
    exec('python3 /Users/tuhinrc/Desktop/newnew/MapObjDetctor/scripts/geotoshapconvertor.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${stderr}`);
            res.status(500).json({ error: 'Error generating shapefile' });
        } else {
            console.log('Shapefile generated successfully.');
            // Respond to the client indicating success.
            res.sendStatus(200);
        }
    });
});


app.get('/get-geojson-by-class', (req, res) => {
    const recentGeoJSON = getRecentGeoJSON();

    if (!recentGeoJSON || !recentGeoJSON.features || recentGeoJSON.features.length === 0) {
        return res.status(500).json({ error: 'No GeoJSON data available.' });
    }

    // Extract class names from the GeoJSON features
    const classNames = recentGeoJSON.features.map(feature => feature.properties.name);

    // Get class names from the request query
    let requestedClassNames = req.query.classNames;

    // Ensure requestedClassNames is always an array
    requestedClassNames = Array.isArray(requestedClassNames) ? requestedClassNames : [requestedClassNames];

    if (!requestedClassNames || requestedClassNames.length === 0) {
        return res.status(400).json({ error: 'Class names parameter is missing or invalid.' });
    }

    // Filter GeoJSON data by requested class names
    const filteredGeoJSON = filterGeoJSONByClass(recentGeoJSON, requestedClassNames);

    res.json({ geojson: filteredGeoJSON });
});

// Function to filter GeoJSON data by class name
function filterGeoJSONByClass(geoJSON, classNames) {
    const filteredFeatures = geoJSON.features.filter(feature => {
        const featureClass = feature.properties.name.toLowerCase();
        return classNames.includes(featureClass.toLowerCase());
    });

    return {
        type: 'FeatureCollection',
        features: filteredFeatures
    };
}

app.post('/upload', (req, res) => {
    const data = req.body; // Access JSON data from the request body

    // Process the data as needed
    const imageBase64 = data.imageBase64;
    const labelBase64 = data.labelBase64;
    const imageFileName = `${data.imageFileName}.png`; // Set the image file name with the '.png' extension
    const labelFileName = `${data.labelFileName}.txt`; // Set the label file name with the '.txt' extension

    // Function to convert Base64 to a file and save it
    function base64ToFile(base64Data, filePath) {
        const base64Image = base64Data.replace(/^data:image\/png;base64,/, ""); // Remove data URI prefix
        const buffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(filePath, buffer);
    }

    // Generate file paths
    const imageFilePath = path.join(__dirname, 'annotations', 'images', imageFileName);
    const labelFilePath = path.join(__dirname, 'annotations', 'labels', labelFileName);

    // Convert Base64 to files and save them
    base64ToFile(imageBase64, imageFilePath);
    base64ToFile(labelBase64, labelFilePath);

    res.send('Files saved successfully on the server.');
});


app.get('/training-from-scratch', (req, res) => {
    const train = path.join(__dirname, 'yolov5', 'train.py');

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const cmd = `python3 ${train} --data data.yaml --weights '' --cfg yolov5s.yaml --epochs 10`;

    const childProcess = exec(cmd);

    childProcess.stderr.on('data', (data) => {
        // Send stderr data as SSE messages
        res.write(`data: ${data}\n\n`);
    });

    childProcess.on('close', (code) => {
        // Close the SSE connection when the child process is done
        res.end(`data: Process exited with code ${code}\n\n`);
    });

    childProcess.on('error', (error) => {
        console.error(`Error executing YOLOv5: ${error}`);
        res.status(500).end(`data: Error performing training Model\n\n`);
    });
});


app.get('/training-from-pretrained', (req, res) => {
    const train = path.join(__dirname, 'yolov5', 'train.py');

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const cmd = `python3 ${train} --data data.yaml --weights yolov5x6.pt --epochs 10`;

    const childProcess = exec(cmd);

    childProcess.stderr.on('data', (data) => {
        // Send stderr data as SSE messages
        res.write(`data: ${data}\n\n`);
    });

    childProcess.on('close', (code) => {
        // Close the SSE connection when the child process is done
        res.end(`data: Process exited with code ${code}\n\n`);
    });

    childProcess.on('error', (error) => {
        console.error(`Error executing YOLOv5: ${error}`);
        res.status(500).end(`data: Error performing training Model\n\n`);
    });
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});