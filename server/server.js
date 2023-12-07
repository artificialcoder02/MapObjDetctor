const express = require('express');
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require("cors");
const dotenv = require('dotenv').config();
const sizeOf = require('image-size');
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10000mb' }));
const multer = require('multer');
const connectMongo = require("./config/db/config.js");
const userRouter = require('./router/userRoute.js')
const util = require('util');
const readdirAsync = util.promisify(fs.readdir);
process.env.PROJ_LIB = "C:\\ProgramData\\anaconda3\\pkgs\\proj-6.2.1-h3758d61_0\\Library\\share\\proj";
// app.use(express.json());
connectMongo();
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use('/api/v0.1/', userRouter);

Set 

// Directory where image files are stored
const imageFolder = path.join(__dirname, 'image');
// Check if the directory exists
if (!fs.existsSync(imageFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(imageFolder);
}

// Get a list of image files in the folder
const imageFiles = fs.readdirSync(imageFolder).filter(file => file.endsWith('.png'));

// Directory where model files are stored
const modelFolder = path.join(__dirname, 'model');
// Check if the directory exists
if (!fs.existsSync(modelFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(modelFolder);
}

// // Sort the list of image files by creation time (most recent first)
// imageFiles.sort((fileA, fileB) => {
//     return fs.statSync(path.join(imageFolder, fileB)).ctime.getTime() - fs.statSync(path.join(imageFolder, fileA)).ctime.getTime();
// });

// // Check if there are any image files in the folder
// if (imageFiles.length === 0) {
//     console.error('No image files found in the folder.');
//     return res.status(500).json({ error: 'No image files found' });
// }

// // Choose the most recent image file
// const mostRecentImage = path.join(imageFolder, imageFiles[0]);

// // Get the image dimensions synchronously
// const dimensions = sizeOf(mostRecentImage);

// // Extract the width and height
// const imageWidth = dimensions.width;
// const imageHeight = dimensions.height;


// Serve the HTML file for the root URL
app.use(express.static("client"));
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "signup.html"));
});

app.get("/verify-user", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "verification.html"));
});

app.use(express.static("client"));
app.get("/training", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training.html"));
});

app.use(express.static("client"));
app.get("/pretrained", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "pretrained.html"));
});


app.get('/files', async (req, res) => {
    try {
        const baseFolderPath = path.join(__dirname, 'userData');
        const defaultModelFolderPath = path.join(__dirname, 'model');
        let userId = req.query.userId;

        const defaultFiles = await readdirAsync(defaultModelFolderPath);

        let userFiles = [];
        let userFolderPath
        if (userId) {
            userFolderPath = path.join(baseFolderPath, `${userId}`, 'training', 'model');
            // Read the files in the specified user folder

            userFiles = await readdirAsync(userFolderPath);
        }

        const constructFileObject = (folderPath, file) => {
            const filePath = path.join(folderPath, file);
            const fileName = path.parse(file).name;

            // Construct the file object
            return {
                filename: fileName,
                path: filePath,
            };
        };

        // Create an array to store the file objects
        const defaultFileObjects = defaultFiles.map(file => constructFileObject(defaultModelFolderPath, file));

        const userFileObjects = userFiles.map(file => constructFileObject(userFolderPath, file));

       // Send the arrays of file objects as separate JSON properties
       res.json({
        defaultFiles: defaultFileObjects,
        userFiles: userFileObjects,
    });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/save-captured-image', (req, res) => {
    const { image, northWest, southEast, userId, modelPath } = req.body;
    const fs = require('fs');
    const path = require('path'); // Import the path module

    const directoryPath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj') : path.join(__dirname, 'geoj');

    // Remove the data URL prefix (e.g., 'data:image/png;base64,')
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    // Create a unique filename or use a timestamp-based name
    const fileName = `captured_${Date.now()}.png`;
    // Specify the path to the "image" folder
    const imagePath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'image', fileName) : path.join(__dirname, 'image', fileName);

    // Write the base64 data to a PNG file
    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ error: 'Error saving image' });
        }
        console.log('Image saved successfully');

        // Find the highest existing experiment number in the "yolov5/runs/detect" directory
        const detectDir = userId ? path.join(__dirname, 'userData', `${userId}`, 'runs', 'detect') : path.join(__dirname, 'runs', 'detect');




        const existingExpFolders = fs.readdirSync(detectDir).filter(folder => folder.startsWith('predict'));
        const highestExp = existingExpFolders.reduce((max, folder) => {
            const number = parseInt(folder.replace('predict', ''), 10);
            return number > max ? number : max;
        }, 0);

        const newExpFolder = `predict${highestExp + 1}`; // Increment the folder name

        const imagePer = userId ? path.join(__dirname, 'userData', `${userId}`, 'runs', 'detect', newExpFolder, fileName) : path.join(__dirname, 'runs', 'detect', newExpFolder, fileName);
        // erform object detection using YOLOv5 on the saved PNG file

        // const modelPath = path.join(__dirname, 'best.pt');
        const userPath = path.join(__dirname, 'userData', `${userId}`);

        if (userId) {
            // Check if user directory exists
            if (fs.existsSync(userPath)) {
                process.chdir(userPath); // Change the current working directory to userPath
                // console.log(`Changed working directory to: ${userPath}`);
            }
        }

        exec(`yolo detect predict model='${modelPath}' source='${imagePath}'`, (error, stdout, stderr) => {
            if (error) {
                return console.log({ error: 'Error performing object detection' });
            }
            console.log(stderr);

            const processedImageData = fs.readFileSync(imagePer, 'base64');
            // Send the processed image as base64 in the response
            // return res.json({ processedImage: processedImageData });

            // If you changed the directory, you might want to change it back to the original directory
            if (fs.existsSync(userPath)) {
                process.chdir(__dirname);
                // console.log(`Changed working directory back to: ${__dirname}`);
            }
        });


        const geoTiffFileName = `${path.basename(imagePath, path.extname(imagePath))}.tif`; // Construct the GeoTIFF file name

        // console.log(geoTiffFileName);
        const geoTiffFilePath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geot', geoTiffFileName) : path.join(__dirname, 'geot', geoTiffFileName); // Set the path for the GeoTIFF file

        exec(`gdal_translate -of GTiff -a_srs EPSG:4326 -a_ullr ${northWest.lng} ${northWest.lat} ${southEast.lng} ${southEast.lat} ${imagePath} ${geoTiffFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script: ${stderr}`);
                return res.status(500).json({ error: 'Error constructing tif file' });
            }
            console.log(stdout);
            // Instead of reading the processed image from a file, you can directly convert it to base64
        });


        const modelPathNew = path.join(__dirname, 'scripts', 'tiffer.py');
        const modelDaynamic = path.join(__dirname, 'best.pt');


        exec(`python ${modelPathNew} --model ${modelPath} --source ${geoTiffFilePath} ${userId ? `--userId ${userId}` : ''}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script: ${stderr}`);
                return res.status(500).json({ error: 'Error performing latlong conversion' }); ˀ
            }
            //console.log(geoTiffFilePath);
            console.log(stdout);
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
                        console.log(err);
                        
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        } else {
                            try {
                                const jsonData = JSON.parse(data); // assuming the file contains JSON data
                                // Use the jsonData variable as required/
                                // console.log(jsonData);
                                console.log('Loaded data:', jsonData);
                                return res.status(200).json({ geojson: jsonData });
                            } catch (error) {
                                console.error('Error parsing JSON data:', error);
                                return res.status(500).json({ error: 'Error parsing JSON data' });
                            }
                        }
                    });
                }
            });
            // Instead of reading the processed image from a file, you can directly convert it to base64
        });


    });
});

// Function to read and parse the most recent GeoJSON file
function getRecentGeoJSON(userId) {

    const directoryPath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj') : path.join(__dirname, 'geoj');
    // const directoryPath = '/Users/ashish/Desktop/MapObjDetctor/server/geoj';

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
    let userId = req.query.userId;

    // Your logic to fetch the most recent GeoJSON data
    const recentGeoJSON = getRecentGeoJSON(userId);
    res.json(recentGeoJSON);
});


app.post('/generate-shapefile', (req, res) => {
    // Execute your Python script here to generate the shapefile.
    const modelPathNew = path.join(__dirname, 'scripts', 'geotoshapconvertor.py');

    exec(`python ${modelPathNew}`, (error, stdout, stderr) => {

        if (error) {
            console.error(`Error executing Python script: ${stderr}`);
            res.status(500).json({ error: 'Error generating shapefile' });
        } else {
            console.log(stdout);
            // Respond to the client indicating success.
            res.sendStatus(200);
        }
    });
});


app.get('/get-geojson-by-class', (req, res) => {
    let userId = req.query.userId;

    const recentGeoJSON = getRecentGeoJSON(userId);

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

    res.status(200).json({ geojson: filteredGeoJSON });
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
    let userId = req.query.userId;

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
    const imageFilePath = userId ? path.join(__dirname, 'userData', `${userId}`, 'training', 'annotations', 'images', imageFileName) : path.join(__dirname, 'annotations', 'images', imageFileName);
    const labelFilePath = userId ? path.join(__dirname, 'userData', `${userId}`, 'training', 'annotations', 'labels', labelFileName) : path.join(__dirname, 'annotations', 'labels', labelFileName);

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




