const express = require('express');
const app = express();
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');
const path = require('path');
const cors = require("cors");
const dotenv = require('dotenv').config();
const sizeOf = require('image-size');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const archiver = require('archiver');
app.use(bodyParser.json({ limit: '10000mb' }));
const multer = require('multer');
const connectMongo = require("./config/db/config.js");
const userRouter = require('./router/userRoute.js')
const util = require('util');
const { $where } = require('./config/models/user.js');
const readdirAsync = util.promisify(fs.readdir);
const User = require('./config/models/user');
const { log } = require('console');
process.env.PROJ_LIB = "C:\\ProgramData\\anaconda3\\pkgs\\proj-6.2.1-h3758d61_0\\Library\\share\\proj";

// app.use(express.json());
connectMongo();
app.use(cors({
    origin: '*',
    credentials: true
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { userId } = req.query;
        const directory = userId ?
            path.join(__dirname, 'userData', userId, 'detection', 'geot') :
            path.join(__dirname, 'geot');

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        cb(null, directory);
    },
    filename: function (req, file, cb) {
        const { userId } = req.query;
        const directory = userId ?
            path.join(__dirname, 'userData', userId, 'detection', 'geot') :
            path.join(__dirname, 'geot');

        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Failed to read directory:', err);
                return cb(err);
            }

            // Filter relevant files and extract numbers
            const numbers = files
                .filter(f => f.startsWith('uploaded-tif-') && f.endsWith('.tiff'))
                .map(f => parseInt(f.replace('uploaded-tif-', '').replace('.tiff', ''), 10))
                .filter(n => !isNaN(n));

            const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
            const newFileName = `uploaded-tif-${maxNumber + 1}.tiff`;

            cb(null, newFileName);
        });
    }
});

const upload = multer({ storage: storage });




const runsFolder = path.join(__dirname, 'runs');
// Check if the directory exists
if (!fs.existsSync(runsFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(runsFolder);
}

const detectFolder = path.join(__dirname, 'runs', 'detect');
// Check if the directory exists
if (!fs.existsSync(detectFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(detectFolder);
}

const geotFolder = path.join(__dirname, 'geot');
// Check if the directory exists
if (!fs.existsSync(geotFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(geotFolder);
}

const geojFolder = path.join(__dirname, 'geoj');
// Check if the directory exists
if (!fs.existsSync(geojFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(geojFolder);
}


const modelSegFolder = path.join(__dirname, 'model-seg');
// Check if the directory exists
if (!fs.existsSync(modelSegFolder)) {
    // If it doesn't exist, create it
    fs.mkdirSync(modelSegFolder);
}



const fileSystem = require('fs').promises; // Use a different variable name for the fs module

// Scheduled task to check and clear old user folders
cron.schedule('0 */12 * * *', async () => { // Runs every 12 hours
    try {
        const users = await User.find();
        const currentDate = new Date();

        for (const user of users) {
            const folderDate = new Date(user.folderCreatedeDated);
            const diffTime = Math.abs(currentDate - folderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(diffDays > 7);
            if (diffDays > 7) { // Check if folderCreatedeDated is older than one day
                const userFolderPath = path.join(__dirname, 'userData', user._id.toString());
                const subFolders = ['detection', 'training'];

                for (const subFolder of subFolders) {
                    const subFolderPath = path.join(userFolderPath, subFolder);

                    // Use the renamed variable to remove the folder and its contents
                    await fileSystem.rmdir(subFolderPath, { recursive: true });

                    console.log(`Cleared contents of folder: ${subFolderPath}`);
                }

                // Create new folders and subdirectories
                const detectionDir = path.join(userFolderPath, 'detection');
                const trainingDir = path.join(userFolderPath, 'training');

                const detectionSubDirs = ['shaper', 'geot', 'geoj', 'image'];
                const trainingSubDirs = ['annotations1', 'model', 'data'];

                await fileSystem.mkdir(detectionDir);
                await fileSystem.mkdir(trainingDir);

                for (const subDir of detectionSubDirs) {
                    await fileSystem.mkdir(path.join(detectionDir, subDir));
                }

                for (const subDir of trainingSubDirs) {
                    await fileSystem.mkdir(path.join(trainingDir, subDir));
                }

                // Format the current date as "YYYY-MM-DD"
                const formattedDate = currentDate.toISOString().split('T')[0];

                // Update the user's folderCreatedeDated to the formatted date
                user.folderCreatedeDated = formattedDate;
                await user.save(); // Save the updated user object
            }
        }
    } catch (error) {
        console.error('Error processing user folders:', error);
    }
});

// Use the cookie-parser middleware
app.use(cookieParser());

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
app.get("/training-loger", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training.html"));
})
app.get("/training", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training_landing.html"));
})

app.get("/tr-scratch", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training_scratch.html"));
})

app.use(express.static("client"));
app.get("/ptr-retrained", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "training_pretrained.html"));
});


app.get('/files', async (req, res) => {
    try {
        const userId = req.query.userId;
        const baseFolderPath = path.join(__dirname, 'userData');
        const defaultModelFolderPath = path.join(__dirname, 'model');
        const defaultModelSegFolderPath = path.join(__dirname, 'model-seg');

        // Read default files
        const defaultFiles = await readdirAsync(defaultModelFolderPath);
        const defaultSegFiles = await readdirAsync(defaultModelSegFolderPath);

        let userFolderPath, userSegFolderPath, userFiles, userSegFiles;
        if (userId) {
            userFolderPath = path.join(baseFolderPath, `${userId}`, 'training', 'runs', 'detect');
            userSegFolderPath = path.join(baseFolderPath, `${userId}`, 'training', 'runs', 'segment');

            // Create directories for user files
            try {
                fs.mkdirSync(userFolderPath, { recursive: true });
                fs.mkdirSync(userSegFolderPath, { recursive: true });
            } catch (err) {
                console.error(`Error creating directory: ${err}`);
            }

            // Read user files
            userFiles = await readdirAsync(userFolderPath);
            userSegFiles = await readdirAsync(userSegFolderPath);
        }

        // Function to construct file objects
        const constructFileObject = (folderPath, file) => {
            const filePath = path.join(folderPath, file);
            const fileName = path.parse(file).name;

            return {
                filename: fileName,
                path: filePath,
            };
        };

        // Construct file objects for default and user files
        const defaultFileObjects = defaultFiles.map(file => constructFileObject(defaultModelFolderPath, file));
        const defaultSegFileObjects = defaultSegFiles.map(file => constructFileObject(defaultModelSegFolderPath, file));
        const userFileObjects = userId ? userFiles.map(file => constructFileObject(userFolderPath, file)) : [];
        const userSegFileObjects = userId ? userSegFiles.map(file => constructFileObject(userSegFolderPath, file)) : [];

        // Form and send the response
        res.json({
            dection: {
                defaultFiles: defaultFileObjects,
                userFiles: userFileObjects,
            },
            segment: {
                defaultFiles: defaultSegFileObjects,
                userFiles: userSegFileObjects,
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/upload-tif', upload.single('geotiff'), (req, res) => {
    const geoTiffFilePath = req.file.path;
    const userId = req.query.userId;
    const modelPath = req.body.modelPath;
    const directoryPath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj') : path.join(__dirname, 'geoj');

    //console.log(path.join(__dirname));
    if (geoTiffFilePath) {
        const modelPathNew = path.join(__dirname, 'scripts', 'tiffer.py');
        const userPath = path.join(__dirname, 'userData', `${userId}`);

        if (userId) {
            // Check if user directory exists
            if (fs.existsSync(userPath)) {
                process.chdir(userPath); // Change the current working directory to userPath
            }
        }
     

        console.log(`python ${modelPathNew} --model ${modelPath} --source ${geoTiffFilePath} ${userId ? `--userId ${userId}` : ''}`);
        exec(`python ${modelPathNew} --model ${modelPath} --source ${geoTiffFilePath} ${userId ? `--userId ${userId}` : ''}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script: ${stderr}`);
                return res.status(500).json({ error: 'Error performing latlong conversion' }); ˀ
            }
            
            // console.log(directoryPath);
            // Read the directory
            fs.readdir(directoryPath, (err, files) => {
                
                console.log(err);
                if (err) {
                    console.error('Error reading directory:', err);
                    return res.status(500).json({ error: 'Error reading directory' });
                } else {
                    // Filter the files with the pattern "output_<number>.geojson"
                    const geojsonFiles = files.filter(file => file.match(/^output_\d+\.geojson$/));
                    console.log(geojsonFiles);

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

        const scriptNew = `yolo detect predict model=${modelPath} source=${imagePath}`;

        console.log(scriptNew);

        if (userId) {
            // Check if user directory exists
            if (fs.existsSync(userPath)) {
                process.chdir(userPath); // Change the current working directory to userPath
                // console.log(`Changed working directory to: ${userPath}`);
            }
        }

        const imageProcess = exec(scriptNew, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            // If you changed the directory, you might want to change it back to the original directory
            if (fs.existsSync(userPath)) {
                process.chdir(__dirname);
                // console.log(`Changed working directory back to: ${__dirname}`);
            }
        });


        //Enable this block of code to save the object detection output for debugging
        // exec(`yolo detect predict model='${modelPath}' source='${imagePath}'`, (error, stdout, stderr) => {
        //     if (error) {
        //         return console.log({ error: 'Error performing object detection' });
        //     }
        //     console.log(stderr);

        //     const processedImageData = fs.readFileSync(imagePer, 'base64');
        //     // Send the processed image as base64 in the response
        //     // return res.json({ processedImage: processedImageData });

        //     // If you changed the directory, you might want to change it back to the original directory
        //     if (fs.existsSync(userPath)) {
        //         process.chdir(__dirname);
        //         // console.log(`Changed working directory back to: ${__dirname}`);
        //     }
        // });


        imageProcess.on('exit', (code) => {
            console.log(`Tensorboard process exited with code ${code}`);
        });

        const geoTiffFileName = `${path.basename(imagePath, path.extname(imagePath))}.tif`; // Construct the GeoTIFF file name

        // console.log(geoTiffFileName);
        const geoTiffFilePath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geot', geoTiffFileName) : path.join(__dirname, 'geot', geoTiffFileName); // Set the path for the GeoTIFF file

        exec(`gdal_translate -of GTiff -a_srs EPSG:4326 -a_ullr ${northWest.lng} ${northWest.lat} ${southEast.lng} ${southEast.lat} ${imagePath} ${geoTiffFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Script GDAL: ${error}`);
                return res.status(500).json({ error: 'Error constructing tif file' });
            }
            console.log(stdout);
            console.log("Geotiff was created successfully!")
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
    const userId = req.query.userId;

    const geojsonFolderPath = path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj');
    const outputFolderPath = path.join(__dirname, 'userData', `${userId}`, 'detection', 'shaper');

    // Function to find the most recent 'shaper' folder
    const findMostRecentShaperFolder = () => {
        const shaperFolders = fs.readdirSync(outputFolderPath)
            .filter(folder => folder.startsWith('shaper'))
            .map(folder => parseInt(folder.replace('shaper', ''), 10))
            .filter(folderNum => !isNaN(folderNum))
            .sort((a, b) => b - a);

        return shaperFolders.length > 0 ? shaperFolders[0] : 0;
    };

    const mostRecentShaperFolder = findMostRecentShaperFolder();
    const newShaperFolder = `shaper${mostRecentShaperFolder + 1}`;


    const newShaperFolderPath = path.join(outputFolderPath, newShaperFolder);

    // Create the new 'shaper' folder if it doesn't exist
    if (!fs.existsSync(newShaperFolderPath)) {
        fs.mkdirSync(newShaperFolderPath);
    }

    // Execute your Python script here to generate the shapefile.
    const modelPathNew = path.join(__dirname, 'scripts', 'geotoshapconvertor.py');

    exec(`python ${modelPathNew} --geojson_folder ${geojsonFolderPath} --output_folder ${outputFolderPath} --folder_name ${newShaperFolder}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${stderr}`);
            res.status(500).json({ error: 'Error generating shapefile' });
        } else {
            console.log(stdout);

            // Create a zip file from the 'shaper' folder
            const archive = archiver('zip');
            res.attachment(`${newShaperFolder}.zip`);
            archive.pipe(res);

            archive.directory(newShaperFolderPath, false);
            archive.finalize();

            // Clean up: Remove the generated 'shaper' folder
            // fs.rmdirSync(newShaperFolderPath, { recursive: true });
        }
    });
});

app.post('/generate-samplefile', (req, res) => {
    // const userId = req.query.userId; // Uncomment if user-specific logic is needed

    const zipFilePath = path.join(__dirname, 'sampledata', 'sample.zip');

    if (fs.existsSync(zipFilePath)) {
        const fileSize = fs.statSync(zipFilePath).size;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', fileSize);

        const filestream = fs.createReadStream(zipFilePath);
        filestream.on('error', function (err) {
            console.error('Stream error:', err);
            res.status(500).send('Internal Server Error');
        });
        filestream.pipe(res);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
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

app.get('/folder', (req, res) => {
    const folderId = req.query.userId;

    const baseFolderPath = path.join(__dirname, 'userData', folderId, 'training');

    const existingFolders = fs.readdirSync(baseFolderPath);

    const annotationFolders = existingFolders.filter(folder => /^annotations\d+$/.test(folder));

    let latestFolderNumber = 0;
    if (annotationFolders.length > 0) {
        annotationFolders.forEach(folder => {
            const match = folder.match(/^annotations(\d+)$/);
            if (match) {
                const folderNumber = parseInt(match[1], 10);
                if (folderNumber > latestFolderNumber) {
                    latestFolderNumber = folderNumber;
                }
            }
        });
    }

    const newFolderNumber = latestFolderNumber + 1;
    const newFolderPath = path.join(baseFolderPath, `annotations${newFolderNumber}`);
    fs.mkdirSync(newFolderPath);

    const subfolders = ['train/images', 'train/labels', 'test/images', 'test/labels', 'val/images', 'val/labels'];
    subfolders.forEach(subfolder => {
        const subfolderPath = path.join(newFolderPath, subfolder);
        fs.mkdirSync(subfolderPath, { recursive: true });
    });

    res.json({ newFolderPath: newFolderPath });
});

app.post('/upload', (req, res) => {
    const data = req.body; // Access JSON data from the request body
    let userId = req.query.userId;
    let imageName = req.query.imageName;
    let type = req.query.type;

    const folderId = req.query.userId;
    const baseFolderPath = path.join(__dirname, 'userData', folderId, 'training');
    const existingFolders = fs.readdirSync(baseFolderPath);
    const annotationFolders = existingFolders.filter(folder => /^annotations\d+$/.test(folder));

    let latestFolderNumber = 0;
    if (annotationFolders.length > 0) {
        annotationFolders.forEach(folder => {
            const match = folder.match(/^annotations(\d+)$/);
            if (match) {
                const folderNumber = parseInt(match[1], 10);
                if (folderNumber > latestFolderNumber) {
                    latestFolderNumber = folderNumber;
                }
            }
        });
    }

    if (type === 'yaml') {
        const yamlBase64 = data.yamlBase64;
        const yamlFileName = `${data.yamlFileName}.yaml`; // Set the YAML file name with the '.yaml' extension

        // Function to convert Base64 to a file and save it
        function base64ToFile(base64Data, filePath) {
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, buffer);
        }

        // Generate file paths for YAML
        const yamlFilePath = path.join(baseFolderPath, `annotations${latestFolderNumber}`, yamlFileName);

        // Convert Base64 to file and save it
        base64ToFile(yamlBase64, yamlFilePath);
    } else {
        // Process non-YAML data as before
        const imageBase64 = data.imageBase64;
        const labelBase64 = data.labelBase64;
        const imageFileName = `${data.imageFileName}${imageName}`; // Set the image file name with the '.png' extension
        const labelFileName = `${data.labelFileName}.txt`; // Set the label file name with the '.txt' extension

        // Function to convert Base64 to a file and save it
        function base64ToFile(base64Data, filePath) {
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, buffer);
        }

        // Generate file paths for non-YAML
        const imageFilePath = path.join(baseFolderPath, `annotations${latestFolderNumber}`, `${type}`, 'images', imageFileName)
        const labelFilePath = path.join(baseFolderPath, `annotations${latestFolderNumber}`, `${type}`, 'labels', labelFileName)

        // Convert Base64 to files and save them
        base64ToFile(imageBase64, imageFilePath);
        base64ToFile(labelBase64, labelFilePath);
    }
    res.send('Files saved successfully on the server.');
});

app.get('/training-from-scratch', (req, res) => {
    // Extract userId and script from query parameters
    const userId = req.query.userId;
    const script = req.query.script;
    const folderId = req.query.userId;
    const baseFolderPath = path.join(__dirname, 'userData', folderId, 'training');
    const existingFolders = fs.readdirSync(baseFolderPath);
    const annotationFolders = existingFolders.filter(folder => /^annotations\d+$/.test(folder));

    let latestFolderNumber = 0;
    if (annotationFolders.length > 0) {
        annotationFolders.forEach(folder => {
            const match = folder.match(/^annotations(\d+)$/);
            if (match) {
                const folderNumber = parseInt(match[1], 10);
                if (folderNumber > latestFolderNumber) {
                    latestFolderNumber = folderNumber;
                }
            }
        });
    }

    const yamlFilePath = path.join(baseFolderPath, `annotations${latestFolderNumber}`, 'data.yaml');

    // Decode the script parameter
    const decodedScript = decodeURIComponent(script);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    // Save the current working directory
    const originalDirectory = process.cwd();

    // Define the target directory
    const targetDirectory = path.join(__dirname, 'userData', `${userId}`, 'training');

    // Change the working directory to the target directory
    process.chdir(targetDirectory);

    // Get the current working directory after the change
    const newWorkingDirectory = process.cwd();

    // Check if the working directory has changed
    if (originalDirectory !== newWorkingDirectory) {
        console.log('Working directory changed.');
        console.log('Initial working directory:', originalDirectory);
        console.log('New working directory:', newWorkingDirectory);
    } else {
        console.log('Working directory did not change.');
        console.log('Current working directory:', newWorkingDirectory);
    }
    // Command to start TensorBoard
    const tensorboardCmd = `tensorboard --logdir ${path.join(__dirname, 'runs')}`;
    const tensorboardProcess = exec(tensorboardCmd);

    // Event handlers for TensorBoard process
    tensorboardProcess.stdout.on('data', (data) => {
        console.log(`${data}`);
        res.write(`${data}\n\n`);
        res.flushHeaders();
    });

    tensorboardProcess.stderr.on('data', (data) => {
        console.error(`${data}`);
        res.write(`${data}\n\n`);
        res.flushHeaders();
    });

    tensorboardProcess.on('exit', (code) => {
        console.log(`TensorBoard process exited with code ${code}`);
        res.write(`data: TensorBoard process exited with code ${code}\n\n`);
        res.flushHeaders();
    });

    // Error handling for TensorBoard process
    tensorboardProcess.on('error', (error) => {
        console.error(`Error executing TensorBoard: ${error}`);
        res.status(500).end(`data: Error starting TensorBoard\n\n`);
    });

    // Command to start YOLO training
    // const yoloCmd = `yolo detect train model='' data=coco128.yaml epochs=1 val=True userId=${userId} script="${decodedScript}"`;
    const yoloProcess = exec(`${decodedScript} data=${yamlFilePath}`);

    // Event handlers for YOLO process
    yoloProcess.stdout.on('data', (data) => {
        console.log(`${data}`);
        res.write(`${data}\n\n`);
        res.flushHeaders();
    });

    yoloProcess.stderr.on('data', (data) => {
        console.error(`${data}`);
        res.write(`${data}\n\n`);
        res.flushHeaders();
    });

    yoloProcess.on('exit', (code) => {
        console.log(`YOLO process exited with code ${code}`);
        res.end(`data: YOLO process exited with code ${code}\n\n`);
    });

    // Error handling for YOLO process
    yoloProcess.on('error', (error) => {
        console.error(`Error executing YOLO: ${error}`);
        res.status(500).end(`data: Error performing YOLO training\n\n`);
    });

    // Revert to the original working directory after the processes are done
    process.chdir(originalDirectory);

});

// Function to calculate tile bounds
function calculateBounds(x, y, zoom) {
    const tile2long = (x, z) => (x / Math.pow(2, z)) * 360 - 180;
    const tile2lat = (y, z) => {
        const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
        return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    };

    return {
        west: tile2long(x, zoom),
        north: tile2lat(y, zoom),
        east: tile2long(x + 1, zoom),
        south: tile2lat(y + 1, zoom)
    };
}

// Function to convert PNG to GeoTIFF using GDAL
function convertToGeoTIFF(inputFile, outputFile, bounds) {
    const { west, north, east, south } = bounds;
    const command = `gdal_translate -of GTiff -a_srs EPSG:4326 -a_ullr ${west} ${north} ${east} ${south} ${inputFile} ${outputFile}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

app.post('/download-tiles', async (req, res) => {
    const tiles = req.body.tiles;
    const modelPath = req.body.modelPath;
    const userId = req.body.userId;

    if (!Array.isArray(tiles) || tiles.length === 0) {
        return res.status(400).send({ message: 'No tiles provided' });
    }

    const downloadPath = path.join(__dirname, 'downloaded_tiles');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    try {
        for (let i = 0; i < tiles.length; i++) {
            const tileUrl = tiles[i];
            const tilePath = path.join(downloadPath, `tile_${i}.png`);
            const geotiffPath = path.join(downloadPath, `tile_${i}.tif`);

            // Download tile using axios
            const response = await axios.get(tileUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(tilePath, response.data);

            // Extract x, y, and z from the URL
            const match = /x=(\d+)&y=(\d+)&z=(\d+)/.exec(tileUrl);
            if (!match) {
                console.error('Failed to extract tile coordinates from URL');
                continue; // Skip this tile if coordinates cannot be extracted
            }
            const [_, x, y, z] = match.map(Number);
            const bounds = calculateBounds(x, y, z);

            // Convert to GeoTIFF
            convertToGeoTIFF(tilePath, geotiffPath, bounds);
        }
        //     res.send({ message: 'Tiles downloaded and converted successfully' });
        // } catch (error) {
        //     console.error(error);
        //     res.status(500).send({ message: 'Error processing tiles' });
        // }
        const directoryPath = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj') : path.join(__dirname, 'geoj');

        console.log(directoryPath);
        runObjectDetection(downloadPath, modelPath, directoryPath, () => {
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
                                fs.rm(downloadPath, { recursive: true, force: true }, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log('Directory deleted!');
                                });
                                return res.status(200).json({ geojson: jsonData });
                            } catch (error) {
                                console.error('Error parsing JSON data:', error);
                                return res.status(500).json({ error: 'Error parsing JSON data' });
                            }
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error processing tiles' });
    }
});

function runObjectDetection(geoTiffDirectory, modelPath, outputFolder, callback) {
    const pythonScriptPath = path.join(__dirname, 'scripts', 'bulk_tiffer.py');
    //const modelPath = path.join(__dirname, 'model', 'DOTAV2_100_Epoch.pt');
    // const outputFolder = userId ? path.join(__dirname, 'userData', `${userId}`, 'detection', 'geoj') : path.join(__dirname, 'geoj');

    const command = `python ${pythonScriptPath} --model ${modelPath} --source ${geoTiffDirectory} --output ${outputFolder}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        callback();
    });
}

const batchScript = `@echo off
set HOST=http://localhost:9001
set PYTHONUTF8=1
label-studio start --port 9001
`;

const filePath = path.join(__dirname, 'run-label-studio.bat');

// Create batch file if it doesn't exist
if (fs.existsSync(filePath)) {
    // console.log('run-label-studio.bat already exists.');
} else {
    fs.writeFile(filePath, batchScript, (err) => {
        if (err) {
            console.error('Error creating batch script:', err);
        } else {
            // console.log('run-label-studio.bat has been created successfully.');
        }
    });
}

app.get('/runcmd', (req, res) => {
    const batchScriptPath = path.join(__dirname, 'run-label-studio.bat');

    exec(batchScriptPath, (error) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    });

    // Function to check if Label Studio is up
    function checkLabelStudio() {
        // console.log('Checking if Label Studio is up...');
        axios.get('http://127.0.0.1:9001')
            .then(response => {
                if (response.status === 200) {
                    res.status(200).json({ message: 'Label Studio started successfully.' });
                } else {
                    setTimeout(checkLabelStudio, 1000); // check again in 1 second
                }
            })
            .catch(err => {
                // console.log('Error or Label Studio is not ready yet:', err.message);
                setTimeout(checkLabelStudio, 1000); // check again in 1 second
            });
    }

    checkLabelStudio(); // Start checking after initiating batch file execution
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


